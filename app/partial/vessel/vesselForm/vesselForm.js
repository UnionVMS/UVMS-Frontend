angular.module('unionvmsWeb').controller('VesselFormCtrl',function($scope, $log, $modal, Vessel, vesselRestService, alertService, locale, mobileTerminalRestService, confirmationModal, GetListRequest, userService, configurationService) {

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

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
        var countryCode  = configurationService.getValue('VESSEL_PARAMETERS', 'vessel.default.flagstate');
        if(angular.isDefined(countryCode)){
            $scope.vesselObj.countryCode = countryCode;
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

    var getMobileTerminals = function() {
        $scope.mobileTerminals = undefined;
        $scope.mobileTerminalsError = undefined;
        var request = new GetListRequest(1, 1000, false, []);
        request.addSearchCriteria("CONNECT_ID", $scope.vesselObj.vesselId.guid);

        $scope.waitingForMobileTerminalsResponse = true;
        mobileTerminalRestService.getMobileTerminalList(request).then(function(page) {
            $scope.mobileTerminals = page.items;

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

    //Archive the vessel
    $scope.archiveVessel = function(){

        var options = {
            textLabel : locale.getString("vessel.archive_confirm_text")
        };
        confirmationModal.open(function(){
            $scope.vesselObj = $scope.getOriginalVessel();
            //When you have just created a vessel the getOriginalVessel will return undefined
            if(angular.isUndefined($scope.vesselObj)){
                $scope.vesselObj = $scope.getVesselObj();
            }
            //Set active to false, meaning archived
            $scope.vesselObj.active = false;
            vesselRestService.updateVessel($scope.vesselObj).then(function(inactivatedVessel) {
                // Inactivate mobile terminals too
                return mobileTerminalRestService.inactivateMobileTerminalsWithConnectId(inactivatedVessel.vesselId.guid);
            }).then(function() {
                // Success
                alertService.showSuccessMessageWithTimeout(locale.getString('vessel.archive_message_on_success'));
                $scope.removeCurrentVesselFromSearchResults();
                $scope.toggleViewVessel(undefined, true);
            }, function(error) {
                // Some error
                alertService.showErrorMessage(locale.getString('vessel.archive_message_on_error'));
            });

        }, options);

    };

    //Create a new vessel
    $scope.createNewVessel = function(){
        $scope.submitAttempted = true;
        if($scope.vesselForm.$valid) {
            //Create new Vessel
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();
            vesselRestService.createNewVessel($scope.vesselObj)
                .then(createVesselSuccess, createVesselError);
        }else{
            alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_form_validation_error'));
        }
    };

    //Success creating the new vessel
    var createVesselSuccess = function(createdVessel){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('vessel.add_new_alert_message_on_success'));
        $scope.vesselObj = createdVessel;
        $scope.setVesselObj(createdVessel.copy());
        $scope.setCreateMode(false);
        getVesselHistory();
    };

    //Error creating the new vessel
    var createVesselError = function(error){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('vessel.add_new_alert_message_on_error'));
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.vesselObj = new Vessel();
        $scope.setDefaultCountryCode();
    };

    //Update the Vessel
    $scope.updateVessel = function(){
        $scope.submitAttempted = true;
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

});