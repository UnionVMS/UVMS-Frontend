/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('VesselFormCtrl',function($scope, $log, $modal, $filter, Vessel, vesselRestService, alertService, locale, mobileTerminalRestService, confirmationModal, GetListRequest, userService, configurationService, assetCsvService, MobileTerminalHistoryModal, MobileTerminal, $q) {

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    $scope.existingValues = {};
    $scope.vesselNotesObj = {};

    //Keep track of visibility statuses
    $scope.isThisVisible = {
        showCompleteVesselHistoryLink : false
    };

    //Watch for changes to the vesselObj
    $scope.$watch('getVesselObj()', function(newVal) {
        $scope.vesselObj = $scope.getVesselObj();
        $scope.vesselForm.$setPristine();
        $scope.submitAttempted = false;
        $scope.vesselNotesObj = {};
        $scope.vesselObjOriginal = angular.copy($scope.vesselObj);

        if (typeof newVal !== 'undefined') {
            if($scope.isCreateNewMode()){
                //Set default country code when creating new vessel
                $scope.setDefaultCountryCode();
            }else{
                getVesselHistory();
                getMobileTerminals();
            }
        }
    });

    //Watch for changes to the Vessel object compared to the initial object, maily to enable save button if changes has been made
    $scope.$watch('vesselObj', function(newValue, oldValue) {
        if (angular.isDefined($scope.vesselObjOriginal)) {
            if (angular.equals(angular.copy(newValue).toJson(), $scope.vesselObjOriginal.toJson())) {
                $scope.setVesselDetailsDirtyStatus(false);
            } else {
                $scope.setVesselDetailsDirtyStatus(true);
            }
        }
    }, true);

    //Check if vessel obj has been modified
    $scope.setVesselDetailsDirtyStatus = function(status) {
        if (angular.isDefined(status)) {
            $scope.isVesselDetailsDirty = status;
        }
    };

    //Check if vessel notes obj has been modified
    $scope.setVesselNotesDirtyStatus = function(status) {
        if (angular.isDefined(status)) {
            $scope.isVesselNotesDirtyStatus = status;
        }
    };

    //Check if mobile terminal obj has been modified
    $scope.setMobileTerminalDetailsDirtyStatus = function(status) {
        if (angular.isDefined(status)) {
            $scope.isMobileTerminalDetailsDirtyStatus = status;
        }
    };

    //Has form submit been atempted?
    $scope.submitAttempted = false;
    $scope.waitingForCreateResponse = false;
    $scope.waitingForHistoryResponse = false;
    $scope.waitingForMobileTerminalsResponse = false;
    $scope.isVesselDetailsDirty = false;
    $scope.isMobileTerminalDetailsDirtyStatus = false;
    $scope.isVesselNotesDirtyStatus = false;

    //Set default country code
    $scope.setDefaultCountryCode = function(){
        $scope.countryCode  = configurationService.getValue('VESSEL_PARAMETERS', 'asset.default.flagstate');
        if(angular.isDefined($scope.countryCode)){
            $scope.vesselObj.countryCode = $scope.countryCode;
        }
    };

    //Disable form
    $scope.disableForm = function(){
        if(angular.isDefined($scope.vesselObj)){
            //Vessel is archived?
            if(!$scope.vesselObj.active){
                return true;
            }
            //User is allowed to edit/create?
            if(!checkAccessToFeature('manageVessels')){
                return true;
            }
            //Only assets with local source can be edited
            if(!$scope.vesselObj.isLocalSource()){
                return true;
            }

            return false;
        }
        return true;
    };

    function isConnectedToAsset(mobileTerminal) {
        return angular.isDefined(mobileTerminal.connectId) && mobileTerminal.connectId !== null;
    }

    var getMobileTerminals = function() {
        $scope.mobileTerminalsError = undefined;
        var request = new GetListRequest(1, 1000, false, []);
        request.addSearchCriteria("CONNECT_ID", $scope.vesselObj.vesselId.guid);

        $scope.waitingForMobileTerminalsResponse = true;
        mobileTerminalRestService.getMobileTerminalList(request).then(function(page) {
            $scope.mobileTerminals = page.items.filter(isConnectedToAsset);

            $scope.nonUniqueActiveTerminalTypes = $scope.getNonUniqueActiveTerminalTypes($scope.mobileTerminals);
            if ($scope.hasNonUniqueActiveTerminalTypes()) {
                alertService.hideMessage();
                alertService.showWarningMessage(locale.getString("vessel.warning_multiple_terminals"));
            }
            $scope.waitingForMobileTerminalsResponse = false;
        },
        function() {
            $scope.mobileTerminalsError = locale.getString('vessel.connected_mobile_terminals_error');
            $scope.mobileTerminals = [];
            $scope.waitingForMobileTerminalsResponse = false;
        });
    };

    $scope.isNonUniqueActiveTerminalType = function(type) {
        return $scope.nonUniqueActiveTerminalTypes[type];
    };

    $scope.hasNonUniqueActiveTerminalTypes = function() {
        for (var key in $scope.nonUniqueActiveTerminalTypes) {
            if ($scope.nonUniqueActiveTerminalTypes.hasOwnProperty(key) && $scope.nonUniqueActiveTerminalTypes[key]) {
                return true;
            }
        }

        return false;
    };

    $scope.getNonUniqueActiveTerminalTypes = function(terminals) {
        var activeTerminalsByType = {};
        var nonUniqueActiveTerminalTypes = {};
        if(angular.isDefined(terminals)){
            for (var i = 0; i < terminals.length; i++) {
                var terminal = terminals[i];
                if (!terminal.active) {
                    continue;
                }

                if (activeTerminalsByType[terminal.type]) {
                    nonUniqueActiveTerminalTypes[terminal.type] = true;
                }
                else {
                    activeTerminalsByType[terminal.type] = true;
                }
            }
        }

        return nonUniqueActiveTerminalTypes;
    };

    // Add new Mobile Terminal to Vessel
    $scope.toggleAddNewMobileTerminalForm = function(){
        toggleMobileTerminalForm(new MobileTerminal());
    };

    var toggleMobileTerminalForm = function(newMobileTerminal){
        newMobileTerminal.isCreateNewMode = true;
        $scope.mobileTerminals.push(newMobileTerminal);
    };

    // Check if asset has any connected terminals
    $scope.hasLinkedMobileTerminals = function(){
        if (angular.isDefined($scope.mobileTerminals) && $scope.mobileTerminals.length > 0) {
            return true;
        }
    };

    function performArchiveVessel(comment) {
        // When you have just created a vessel the getOriginalVessel will return undefined.
        $scope.vesselObj = $scope.getOriginalVessel() || $scope.getVesselObj();
        $scope.vesselObj.active = false;

        function getMobileTerminals(archivedVessel) {
            // Fetch all mobile terminals connected to the archived vessel.
            return mobileTerminalRestService.getAllMobileTerminalsWithConnectId(archivedVessel.vesselId.guid);
        }

        function inactivateAndUnassignMobileTerminals(mobileTerminals) {
            return $q.all(mobileTerminals.map(function(mobileTerminal) {
                return $q.all([
                    // Inactivate AND unassign from vessel.
                   mobileTerminalRestService.inactivateMobileTerminal(mobileTerminal, comment),
                   mobileTerminalRestService.unassignMobileTerminal(mobileTerminal, comment)
                ]);
            }));
        }

        return vesselRestService
            .archiveVessel($scope.vesselObj, comment)
            .then(getMobileTerminals)
            .then(inactivateAndUnassignMobileTerminals);
    }

    //Archive the vessel
    $scope.archiveVessel = function() {

        function onSuccess() {
            alertService.showSuccessMessageWithTimeout(locale.getString('vessel.archive_message_on_success'));
            $scope.removeCurrentVesselFromSearchResults();
            $scope.toggleViewVessel(undefined, true);
        }

        function onReject() {
            alertService.showErrorMessage(locale.getString('vessel.archive_message_on_error'));
        }

        var modalOptions = {
            textLabel: locale.getString("vessel.archive_confirm_text"),
            commentsEnabled: true
        };

        confirmationModal
            .openInstance(modalOptions).result
            .then(performArchiveVessel)
            .then(onSuccess, onReject);
    };

    //Create a new vessel
    $scope.createNewVessel = function(){
        $scope.submitAttempted = true;

        if($scope.vesselForm.$valid) {
            $scope.updateContactItems();
            $scope.addNotes();

            //Create new Vessel
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();

            vesselRestService.createNewVessel($scope.vesselObj)
                .then(createVesselSuccess, createVesselError($scope.vesselObj));
        }else{
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_form_validation_error'));
        }
    };

    //Success creating the new vessel
    var createVesselSuccess = function(createdVessel){
        // Reset existing values
        $scope.existingValues.cfr = undefined;
        $scope.existingValues.imo = undefined;
        $scope.existingValues.mmsi = undefined;

        $scope.clearNotes();
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.add_new_alert_message_on_success'));
        $scope.vesselObj = createdVessel;
        $scope.vesselObjOriginal = angular.copy($scope.vesselObj);
        $scope.setVesselObj(createdVessel.copy());
        $scope.setCreateMode(false);
        getVesselHistory();
    };

    //Error creating the new vessel
    var createVesselError = function(vesselObj) {
        // Attempted to create values
        if (vesselObj !== undefined) {
            var cfr = vesselObj.cfr;
            var imo = vesselObj.imo;
            var mmsi = vesselObj.mmsiNo;
        }

        return function(error) {
            $scope.waitingForCreateResponse = false;
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_error'));

            if (error) {
                // Set existing values on scope
                $scope.existingValues.cfr = error.match(/An asset with this CFR value already exists\./) ? cfr : undefined;
                $scope.existingValues.imo = error.match(/An asset with this IMO value already exists\./) ? imo : undefined;
                $scope.existingValues.mmsi = error.match(/An asset with this MMSI value already exists\./) ? mmsi : undefined;
            }
            // Update validity, because model did not change here.
            $scope.vesselForm.cfr.$setValidity('unique', $scope.existingValues.cfr === undefined);
            $scope.vesselForm.imo.$setValidity('unique', $scope.existingValues.imo === undefined);
            $scope.vesselForm.mmsi.$setValidity('unique', $scope.existingValues.mmsi === undefined);
        };
    };

    //Add notes to Vessel object
    $scope.addNotes = function(){
        if ($scope.vesselNotesObj.date && $scope.vesselNotesObj.activity) {
            $scope.vesselObj.notes.push({
                date: $scope.vesselNotesObj.date,
                activity: $scope.vesselNotesObj.activity,
                user: $scope.vesselNotesObj.user,
                readyDate: $scope.vesselNotesObj.readyDate,
                licenseHolder: $scope.vesselNotesObj.licenseHolder,
                contact: $scope.vesselNotesObj.contact,
                sheetNumber: $scope.vesselNotesObj.sheetNumber,
                notes: $scope.vesselNotesObj.notes,
                source: 'INTERNAL'
            });
        } else {
            return false;
        }
    };

    //Clear notes form to be able to submit new ones
    $scope.clearNotes = function(){
        if (angular.isDefined($scope.vesselNotesObj.date)) {
            for (var key in $scope.vesselNotesObj) {
                $scope.vesselNotesObj[key] = "";
            }
        }
    };

    //Update the Vessel
    $scope.updateVessel = function(){
        $scope.submitAttempted = true;

        if($scope.vesselForm.$valid && ($scope.isVesselDetailsDirty || $scope.isVesselNotesDirtyStatus)) {
            //MobileTerminals remove them cuz they do not exist in backend yet.
            delete $scope.vesselObj.mobileTerminals;
            $scope.updateContactItems();
            $scope.addNotes();

            //Update Vessel and take care of the response(eg. the promise) when the update is done.
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();

            var updateResponse = vesselRestService.updateVessel($scope.vesselObj)
                .then(updateVesselSuccess, updateVesselError);
        }
    };

    //Vessel was successfully updated
    var updateVesselSuccess = function(updatedVessel){
        $scope.clearNotes();
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.update_alert_message_on_success'));
        $scope.vesselObj = updatedVessel;
        $scope.vesselObjOriginal = angular.copy($scope.vesselObj);
        $scope.mergeCurrentVesselIntoSearchResults($scope.vesselObj);
        getVesselHistory();
    };
    //Error updating vessel
    var updateVesselError = function(error){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('vessel.update_alert_message_on_error'));
    };

    //Get all history events for the vessel
    $scope.viewCompleteVesselHistory = function() {
        $scope.isThisVisible.showCompleteVesselHistoryLink = false;
        $scope.waitingForHistoryResponse = true;
        $scope.vesselHistoryError = undefined;
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value)
            .then(onCompleteVesselHistoryListSuccess, onVesselHistoryListError);
    };

    //Get first 5 history events for the vessel
    var vesselHistorySize = 15;
    var getVesselHistory = function() {
        $scope.waitingForHistoryResponse = true;
        $scope.vesselHistoryError = undefined;
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value, vesselHistorySize)
            .then(onVesselHistoryListSuccess, onVesselHistoryListError);
    };

    //Success getting vessel history
    var onVesselHistoryListSuccess = function(vesselHistory) {
        $scope.vesselHistory = vesselHistory;
        if($scope.vesselHistory.length === vesselHistorySize){
            $scope.isThisVisible.showCompleteVesselHistoryLink = true;
        }
        $scope.waitingForHistoryResponse = false;
    };

    //Success getting complete vessel history
    var onCompleteVesselHistoryListSuccess = function(vesselHistory){
        $scope.vesselHistory = vesselHistory;
        $scope.waitingForHistoryResponse = false;
    };

    //Error getting vessel history
    var onVesselHistoryListError = function(error) {
        $log.error("Error getting vessel history");
        $scope.waitingForHistoryResponse = false;
        $scope.vesselHistoryError = locale.getString('vessel.event_history_error');
    };

    //View history details
    $scope.viewHistoryDetails = function(vesselHistory) {
        $scope.currentVesselHistory = vesselHistory;
        openVesselHistoryModal();
    };

    //Open modal for viewing history details
    var openVesselHistoryModal = function(){
        var modalInstance = $modal.open({
          templateUrl: 'partial/vessel/vesselHistory/vesselHistoryModal/vesselHistoryModal.html',
          controller: 'VesselhistorymodalCtrl',
          size: "small",
          resolve: {
            vesselHistory: function() {
                return $scope.currentVesselHistory;
            }
          }
        });
    };

    // Display list of vessel notes
    $scope.vesselNotesSize = 10;
    $scope.showVesselNotesList = function() {
        var vesselNotesSizeAll = $scope.vesselObj.notes.length;
        $scope.vesselNotesSize += vesselNotesSizeAll;
    };

    //View notes details
    $scope.viewVesselNotesDetails = function(vesselNotes) {
        $scope.vesselNotes = vesselNotes;
        openVesselNotesModal();
    };

    //Open modal for viewing vessel notes
    var openVesselNotesModal = function(){
        var modalInstance = $modal.open({
          templateUrl: 'partial/vessel/vesselNotes/vesselNotesModal/vesselNotesModal.html',
          controller: 'vesselNotesModalCtrl',
          size: "small",
          resolve: {
            vesselNotes: function() {
                return $scope.vesselNotes;
            },
            vesselName: function() {
                return $scope.vesselObj.name;
            }
          }
        });
    };

    $scope.viewMobileTerminalHistory = function(mobileTerminal) {
        MobileTerminalHistoryModal.show(mobileTerminal);
    };

    // Add new row with contact item
    $scope.addContactItem = function(vesselContact) {
        if (vesselContact.length === 0) {
            vesselContact.push({}, {});
        } else {
            vesselContact.push({});
        }
    };

    // Remove row with contact item
    $scope.removeContactItem = function(vesselContact, index){
        vesselContact.splice(index, 1);
    };

    // Update submitted contacts with default values or remove empty contact item rows
    $scope.updateContactItems = function() {
        $scope.vesselObj.contact.slice(0).forEach(function (vesselContact) {
            if (vesselContact.name || vesselContact.email || vesselContact.number) {
                Object.assign(vesselContact, { source: 'INTERNAL' });
                // ToDo: Fix this in BE?
                if (!vesselContact.name){
                    Object.assign(vesselContact, { name: '' });
                }
            } else {
                $scope.vesselObj.contact.splice($scope.vesselObj.contact.indexOf(vesselContact), 1);
            }
        });
    };

    // Clear form on Cancel
    $scope.clearForm = function() {
        $scope.mobileTerminals = [];

        // Remove form errors
        angular.forEach($scope.vesselForm, function(ctrl, name) {
            if (name.indexOf('$') !== 0) {
                angular.forEach(ctrl.$error, function(value, name) {
                    ctrl.$setValidity(name, null);
                });
            }
        });
    };

    // Set menu bar header
    $scope.getMenuBarHeader = function(vessel) {
        if ($scope.isCreateNewMode()) {
            return $filter('i18n')('vessel.create_new_vessel');
        } else if (angular.isDefined($scope.vesselObjOriginal)) {
            return $scope.vesselObjOriginal.name;
        }
    };

    $scope.menuBarFunctions = {
        saveCallback: $scope.createNewVessel,
        updateCallback: $scope.updateVessel,
        showSave: function() {
            return true;
        },
        disableSave: function() {
            if ((!$scope.isVesselDetailsDirty && !$scope.isMobileTerminalDetailsDirtyStatus && !$scope.isVesselNotesDirtyStatus) || $scope.vesselForm.$invalid) {
                return true;
            }
            return false;
        },
        cancelCallback: function() {
            $scope.clearForm();
            $scope.cancelFormView();
        },
        showCancel: function() {
            return true;
        },
        exportToCsvCallback: function(vessel) {
            assetCsvService.download($scope.vesselObj);
        },
        showExport: function(vessel) {
            if (vessel) {
                return angular.isDefined(vessel.vesselId) && vessel.vesselId != null;
            }
            return false;
        },
        archiveCallback: $scope.archiveVessel,
        showArchive: function(vessel) {
            if (vessel && $scope.vesselObj.isLocalSource()) {
                return angular.isDefined(vessel.vesselId) && vessel.vesselId != null && vessel.active;
            }
            return false;
        },
        disableAddMobileTerminal: function(vessel) {
            if (angular.isDefined($scope.vesselForm.cfr && $scope.vesselForm.ircs && vessel)) {
                return $scope.vesselForm.cfr.$invalid || $scope.vesselForm.ircs.$invalid || !vessel.ircs || !vessel.cfr || $scope.isCreateNewMode();
            }
            return false;
        },
    };

    $scope.vesselContactsFunctions = {
        addContactItemCallback: $scope.addContactItem,
        removeContactItemCallback: $scope.removeContactItem
    };

    $scope.mobileTerminalFunctions = {
        setSubmitStatus: function(status) {
            if (angular.isDefined(status)) {
                $scope.submitAttempted = status;
            }
        },
        updateMobileTerminals: function() {
            getMobileTerminals();
        },
        removeMobileTerminal: function(mobileTerminal) {
            $scope.mobileTerminals.splice($scope.mobileTerminals.indexOf(mobileTerminal), 1);
        }
    };

    $scope.contentTabsFunctions = {
        setTabs: function() {
            return [
                {
                    'tab': 'MOBILE_TERMINALS',
                    'title': $filter('i18n')('header.menu_communication')
                },
                {
                    'tab': 'CONTACTS',
                    'title': $filter('i18n')('vessel.vessel_details_contacts')
                },
                {
                    'tab': 'NOTES',
                    'title': $filter('i18n')('vessel.notes')
                },
                {
                    'tab': 'HISTORY',
                    'title': $filter('i18n')('vessel.event_history')
                },
            ];
        }
    };
});
