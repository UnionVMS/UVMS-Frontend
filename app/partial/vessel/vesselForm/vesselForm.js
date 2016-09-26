/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('VesselFormCtrl',function($scope, $log, $modal, Vessel, vesselRestService, alertService, locale, mobileTerminalRestService, confirmationModal, GetListRequest, userService, configurationService, assetCsvService, MobileTerminalHistoryModal, $q) {

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    $scope.existingValues = {};

    //Keep track of visibility statuses
    $scope.isVisible = {
        showCompleteVesselHistoryLink : false,
    };

    //Watch for changes to the vesselObj
    //$scope.$watch(function () { return $scope.vesselObj;}, function (newVal, oldVal) {
    $scope.$watch('getVesselObj()', function(newVal) {
        $scope.vesselObj = $scope.getVesselObj();
        $scope.vesselForm.$setPristine();
        $scope.submitAttempted = false;
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

    //Has form submit been atempted?
    $scope.submitAttempted = false;
    $scope.waitingForCreateResponse = false;
    $scope.waitingForHistoryResponse = false;
    $scope.waitingForMobileTerminalsResponse = false;

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
        $scope.mobileTerminals = undefined;
        $scope.mobileTerminalsError = undefined;
        var request = new GetListRequest(1, 1000, false, []);
        request.addSearchCriteria("CONNECT_ID", $scope.vesselObj.vesselId.guid);

        $scope.waitingForMobileTerminalsResponse = true;
        mobileTerminalRestService.getMobileTerminalList(request).then(function(page) {
            $scope.mobileTerminals = page.items.filter(isConnectedToAsset);

            $scope.nonUniqueActiveTerminalTypes = $scope.getNonUniqueActiveTerminalTypes($scope.mobileTerminals);
			if ($scope.hasNonUniqueActiveTerminalTypes()) {
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

        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.add_new_alert_message_on_success'));
        $scope.vesselObj = createdVessel;
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

    //Clear the form
    $scope.clearForm = function(){
        $scope.vesselObj = new Vessel();
        $scope.setDefaultCountryCode();
    };

    //Update the Vessel
    $scope.updateVessel = function(){
        $scope.submitAttempted = true;

        console.log('sandra');
        console.log($scope.vesselObj.contact.[0].source);

        if($scope.vesselForm.$valid) {
            //MobileTerminals remove them cuz they do not exist in backend yet.
            delete $scope.vesselObj.mobileTerminals;

            //Update Vessel and take care of the response(eg. the promise) when the update is done.
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();
            var updateResponse = vesselRestService.updateVessel($scope.vesselObj)
                .then(updateVesselSuccess, updateVesselError);
        }else{
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_form_validation_error'));
        }
    };

    //Is the name of the vessel set?
    $scope.isVesselNameSet = function(){
        return angular.isDefined($scope.vesselObj) && angular.isDefined($scope.vesselObj.name) && $scope.vesselObj.name.trim().length > 0;
    };

    //Vessel was successfully updated
    var updateVesselSuccess = function(updatedVessel){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.update_alert_message_on_success'));
        $scope.vesselObj = updatedVessel;
        $scope.mergeCurrentVesselIntoSearchResults();
        getVesselHistory();
    };
    //Error updating vessel
    var updateVesselError = function(error){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('vessel.update_alert_message_on_error'));
    };

    //Get all history events for the vessel
    $scope.viewCompleteVesselHistory = function() {
        $scope.isVisible.showCompleteVesselHistoryLink = false;
        $scope.waitingForHistoryResponse = true;
        $scope.vesselHistoryError = undefined;
        vesselRestService.getVesselHistoryListByVesselId($scope.vesselObj.vesselId.value)
            .then(onCompleteVesselHistoryListSuccess, onVesselHistoryListError);
    };

    //Get first 5 history events for the vessel
    var vesselHistorySize = 5;
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
            $scope.isVisible.showCompleteVesselHistoryLink = true;
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

    $scope.viewMobileTerminalHistory = function(mobileTerminal) {
        MobileTerminalHistoryModal.show(mobileTerminal);
    };

    $scope.exportAssetToCsv = function() {
        assetCsvService.download($scope.vesselObj);
    };

    $scope.addNewContact = function() {
        console.log('Add contact');
    };

    $scope.menuBarFunctions = {
        addMobileTerminal: function() {
            console.log("Add terminal!");
        },
        saveCallback: $scope.createNewVessel,
        updateCallback: $scope.updateVessel,
        cancelCallback: $scope.toggleViewVessel,
        exportToCsvCallback: $scope.exportAssetToCsv,
        showExport: function(vessel) {
            if (vessel) {
                return angular.isDefined(vessel.vesselId) && vessel.vesselId != null;
            }
            return false;
        },
        archiveCallback: $scope.archiveVessel,
        showArchive: function(vessel) {
            if (vessel) {
                return angular.isDefined(vessel.vesselId) && vessel.vesselId != null && vessel.active;
            }
            return false;
        },
        historyCallback: function() {
            console.log("Show history!");
        },
        showHistory: function(vessel) {
            if (vessel) {
                return angular.isDefined(vessel.vesselId) && vessel.vesselId != null;
            }
            return false;
        }
    };

    $scope.vesselDetailsFunctions = {
        addNewContactCallback: $scope.addNewContact
    };

    $scope.vesselDetailsFunctions = {
        addNewContactCallback: $scope.addNewContact
    };

    $scope.vesselDetailsFunctions = {
        addNewContactCallback: $scope.addNewContact
    };

    $scope.vesselDetailsFunctions = {
        addNewContactCallback: $scope.addNewContact
    };
});
