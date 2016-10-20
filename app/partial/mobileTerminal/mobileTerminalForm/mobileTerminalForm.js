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
angular.module('unionvmsWeb').controller('mobileTerminalFormCtrl',function($filter, $scope, locale, MobileTerminal, alertService, userService, mobileTerminalRestService, modalComment, MobileTerminalHistoryModal, mobileTerminalCsvService){

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    //Visibility statuses
    $scope.isVisible = {
        assignVessel : false,
        vesselForm  : false
    };

    $scope.typeAndPlugin = undefined;
    //Watch changes to the currentMobileTerminal model (set in the parent scope)
    $scope.$watch('getCurrentMobileTerminal()', function(newValue) {
        $scope.currentMobileTerminal = $scope.getCurrentMobileTerminal();
        if(angular.isDefined($scope.mobileTerminalForm)){
            $scope.mobileTerminalForm.$setPristine();
        }
        $scope.submitAttempted = false;

        if(angular.isDefined($scope.currentMobileTerminal)){
            //Update the value for typeAndLES in order for the dropdown to show the correct value
            if(angular.isDefined($scope.currentMobileTerminal) && angular.isDefined($scope.currentMobileTerminal.plugin)){
                $scope.typeAndPlugin = $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin($scope.currentMobileTerminal.type, $scope.currentMobileTerminal.plugin.labelName, $scope.currentMobileTerminal.plugin.serviceName);
            }

            //Show warning message if plugin is inactivated
            if(!$scope.isCreateNewMode() && $scope.currentMobileTerminal.pluginIsInactive()) {
                alertService.showWarningMessage(locale.getString("mobileTerminal.warning_plugin_inactive"));
            }
        }
    });

    //Has form submit been atempted?
    $scope.submitAttempted = false;
    $scope.waitingForCreateResponse = false;


    //Disable form
    $scope.disableForm = function(){
        if(angular.isDefined($scope.currentMobileTerminal)){
            //User is allowed to edit/create/assign...?
            if(!checkAccessToFeature('manageMobileTerminals')){
                return true;
            }
            return false;
        }
        return true;
    };

    //Get terminal config for the selected terminal type
    $scope.getTerminalConfig = function(){
        if(angular.isDefined($scope.currentMobileTerminal)){
            var systemName = $scope.currentMobileTerminal.type;
            return $scope.transpondersConfig.getTerminalConfigBySystemName(systemName);
        }
    };

    //Selected terminal type
    $scope.onTerminalSystemSelect = function(selectedItem){
        if(angular.isDefined(selectedItem) && angular.isDefined(selectedItem.typeAndPlugin)){
            $scope.currentMobileTerminal.type = selectedItem.typeAndPlugin.type;

            //Reset channels
            $scope.currentMobileTerminal.resetChannels();

            var selectedLabelName = selectedItem.typeAndPlugin.plugin.labelName;
            var selectedServiceName = selectedItem.typeAndPlugin.plugin.serviceName;
            if(angular.isDefined(selectedLabelName) && angular.isDefined(selectedServiceName)){
                $scope.currentMobileTerminal.plugin.labelName = selectedLabelName;
                $scope.currentMobileTerminal.plugin.serviceName = selectedServiceName;
                //Set LES_DESCRIPTION if attribute is used for the channel, otherwise set to undefined
                $.each($scope.currentMobileTerminal.channels, function(index, channel){
                    if($scope.getTerminalConfig().channelFields.LES_DESCRIPTION){
                        channel.setLESDescription(selectedLabelName);
                    }else{
                        channel.setLESDescription(undefined);
                    }
                });
            }else{
                delete $scope.currentMobileTerminal.plugin.labelName;
                delete $scope.currentMobileTerminal.plugin.serviceName;
            }
        }else{
            $scope.currentMobileTerminal.type = undefined;
            delete $scope.currentMobileTerminal.plugin.labelName;
            delete $scope.currentMobileTerminal.plugin.serviceName;
        }
    };

    $scope.isDirty = function() {
        var isDirty = !$scope.currentMobileTerminal.isEqualAttributesAndChannels($scope.getOriginalMobileTerminal());
        return isDirty;
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.currentMobileTerminal = new MobileTerminal();
    };

    //Create the mobile terminal
    $scope.createNewMobileTerminal = function(){
        $scope.submitAttempted = true;        

        //Validate form
        if(!$scope.mobileTerminalForm.$valid){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_form_validation_error'));
            return false;
        }

        //Validate at least one channel
        if($scope.currentMobileTerminal.channels.length === 0){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_channels_missing_validation_error'));
            return false;
        }

        //Create
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        mobileTerminalRestService.createNewMobileTerminal($scope.currentMobileTerminal)
                .then(createNewMobileTerminalSuccess, createNewMobileTerminalError);
    };

    //Success creating the new mobile terminal
    var createNewMobileTerminalSuccess = function(mobileTerminal) {
        if ($scope.$parent.vesselObj) {
            $scope.isVisible.vesselForm = true;
            mobileTerminalRestService.assignMobileTerminal(mobileTerminal, $scope.$parent.vesselObj.getGuid(), "-")
            .then(function() {
                alertService.showSuccessMessage(locale.getString('mobileTerminal.add_new_alert_message_on_success'));
            });
        } else {
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.add_new_alert_message_on_success'));
        }
            $scope.waitingForCreateResponse = false;
            $scope.existingChannels = [];
            $scope.existingSerialNumber = undefined;
            $scope.currentMobileTerminal = mobileTerminal;
            $scope.setCreateMode(false, true);
    };

    //Error creating the new mobile terminal
    var createNewMobileTerminalError = function(error) {
        $scope.waitingForCreateResponse = false;

        if (error.code !== 2806) {
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
        }
        else {
            $scope.existingSerialNumber = error.serialNumber;
            $scope.mobileTerminalForm.serialNumber.$setValidity('unique', error.serialNumber === undefined);
            $scope.existingChannels = error.existingChannels;
            alertService.showErrorMessage(locale.getString('mobileTerminal.mobile_terminal_already_exists'));
        }
    };

    //Update
    $scope.updateMobileTerminal = function() {
        $scope.submitAttempted = true;

        //Validate form
        if(!$scope.mobileTerminalForm.$valid){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_form_validation_error'));
            return false;
        }

        //Validate at least one channel
        if($scope.currentMobileTerminal.channels.length === 0){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_channels_missing_validation_error'));
            return false;
        }

        modalComment.open($scope.updateMobileTerminalWithComment, {
            titleLabel: locale.getString("mobileTerminal.updating", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString("common.update")
        });
    };

    //Update the mobile terminal
    $scope.updateMobileTerminalWithComment = function(comment){
        //Send update request
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        mobileTerminalRestService.updateMobileTerminal($scope.currentMobileTerminal, comment)
                .then(updateMobileTerminalSuccess, updateMobileTerminalError);
    };

    var updateMobileTerminalSuccess = function(updatedMobileTerminal){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));

        $scope.existingChannels = [];
        $scope.existingSerialNumber = undefined;

        //Update values in the currentMobileTerminal object
        $scope.currentMobileTerminal.setAttributes(updatedMobileTerminal.attributes);
        $scope.currentMobileTerminal.setChannels(updatedMobileTerminal.channels);
        $scope.currentMobileTerminal.guid = updatedMobileTerminal.guid;
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    };

    //Error creating the new mobile terminal
    var updateMobileTerminalError = function(error){
        $scope.waitingForCreateResponse = false;

        if (error.code !== 2806) {
            alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_error'));
        }
        else {
            $scope.existingSerialNumber = error.serialNumber;
            $scope.mobileTerminalForm.serialNumber.$setValidity('unique', error.serialNumber === undefined);
            $scope.existingChannels = error.existingChannels;
            alertService.showErrorMessage(locale.getString('mobileTerminal.mobile_terminal_already_exists'));
        }
    };

    //Handle click event on inactive link
    $scope.setStatusToInactiveWithComment = function(comment){
        mobileTerminalRestService.inactivateMobileTerminal($scope.currentMobileTerminal, comment).then(setStatusToInactiveSuccess, setStatusToInactiveError);
    };

    $scope.setStatusToInactive = function() {
        modalComment.open($scope.setStatusToInactiveWithComment, {
            titleLabel: locale.getString("mobileTerminal.set_inactive", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString('mobileTerminal.inactivate_link')
        });
    };

    //Inactivate status success
    function setStatusToInactiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.inactivate_message_on_success'));

        //Update active status in the currentMobileTerminal object
        $scope.currentMobileTerminal.setActive(updatedMobileTerminal.active);
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    }

    function setStatusToInactiveError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.inactivate_message_on_error'));
    }

    //Handle click event on activate link
    $scope.setStatusToActiveWithComment = function(comment){
        mobileTerminalRestService.activateMobileTerminal($scope.currentMobileTerminal, comment).then(setStatusToActiveSuccess, setStatusToActiveError);
    };

    $scope.setStatusToActive = function() {
        modalComment.open($scope.setStatusToActiveWithComment, {
            titleLabel: locale.getString("mobileTerminal.set_active", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString('mobileTerminal.activate_link')
        });
    };

    //Activate status success
    function setStatusToActiveSuccess(updatedMobileTerminal) {
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.activate_message_on_success'));

        //Update active status in the currentMobileTerminal object
        $scope.currentMobileTerminal.setActive(updatedMobileTerminal.active);
        $scope.mergeCurrentMobileTerminalIntoSearchResults();
    }

    function setStatusToActiveError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.activate_message_on_error'));
    }


    //Archive mobile terminals
    $scope.archiveMobileTerminal = function() {
        modalComment.open($scope.archiveMobileTerminaWithComment, {
            titleLabel: locale.getString("mobileTerminal.archive_modal_title", [$scope.currentMobileTerminal.getSerialNumber()]),
            saveLabel: locale.getString('common.archive')
        });
    };

    $scope.archiveMobileTerminaWithComment = function(comment){
        mobileTerminalRestService.removeMobileTerminal($scope.currentMobileTerminal, comment).then(archiveMobileTerminalSuccess, archiveMobileTerminalError);
    };

    function archiveMobileTerminalSuccess(archivedMobileTerminal) {
        alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.archive_message_on_success'));

        //Remove mobile terminal from search results
        $scope.removeCurrentMobileTerminalFromSearchResults();
        $scope.toggleMobileTerminalDetails(undefined, true);
    }

    function archiveMobileTerminalError() {
        alertService.showErrorMessage(locale.getString('mobileTerminal.archive_message_on_error'));
    }

    $scope.exportTerminalCSV = function() {
        mobileTerminalCsvService.download($scope.currentMobileTerminal);
    };

    //Open history modal
    $scope.onMobileTerminalHistoryClick = function(){
        MobileTerminalHistoryModal.show($scope.currentMobileTerminal);
    };

    //Is multipel channels allowed for the terminal?
    $scope.isMultipleChannelsAllowed = function(){
        if(angular.isDefined($scope.currentMobileTerminal) && angular.isDefined($scope.getTerminalConfig())){
            return $scope.getTerminalConfig().capabilities.SUPPORT_MULTIPLE_CHANNEL;
        }
        return false;
    };

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        var newChannel = $scope.currentMobileTerminal.addNewChannel();
        //Set LES for new channel
        if(angular.isDefined($scope.currentMobileTerminal.plugin.labelName)){
            //Set LES_DESCRIPTION if attribute is used for the channel
            if($scope.getTerminalConfig().channelFields.LES_DESCRIPTION){
                newChannel.setLESDescription($scope.currentMobileTerminal.plugin.labelName);
            }
        }
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.currentMobileTerminal.removeChannel(channelIndex);
    };

    $scope.selectChannel = function(capability, selected) {
        for (var i = 0; i < $scope.currentMobileTerminal.channels.length; i++) {
            if (selected !== undefined) {
                $scope.currentMobileTerminal.channels[i].capabilities[capability] = selected === i;
            }
            else {
                if ($scope.currentMobileTerminal.channels[i].capabilities[capability]) {
                    return i;
                }
            }
        }
    };

    $scope.selectedConfigChannel = function(selected) {
        return $scope.selectChannel("CONFIGURABLE", selected);
    };

    $scope.selectedDefaultChannel = function(selected) {
        return $scope.selectChannel("DEFAULT_REPORTING", selected);
    };

    $scope.selectedPollingChannel = function(selected) {
        return $scope.selectChannel("POLLABLE", selected);
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.currentMobileTerminal.channels.splice(newIndex, 0, $scope.currentMobileTerminal.channels.splice(oldIndex, 1)[0]);
    };

    $scope.unassignVessel = function() {
        var vesselName = "";
        if(angular.isDefined($scope.currentMobileTerminal.associatedVessel)){
            vesselName = $scope.currentMobileTerminal.associatedVessel.name;
        }
        modalComment.open($scope.unassignVesselWithComment, {
            titleLabel: locale.getString("mobileTerminal.unassigning_from_vessel", [$scope.currentMobileTerminal.getSerialNumber(), vesselName]),
            saveLabel: locale.getString("mobileTerminal.unassign")
        });
    };

    $scope.unassignVesselWithComment = function(comment) {
        mobileTerminalRestService.unassignMobileTerminal($scope.currentMobileTerminal, comment).then(function(res) {
            // Success
            $scope.currentMobileTerminal.unassign();
            $scope.mergeCurrentMobileTerminalIntoSearchResults();
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.unassign_vessel_message_on_success'));
        },
        function(res) {
            // Error
            alertService.showErrorMessage(locale.getString('mobileTerminal.unassign_vessel_message_on_error'));
        });
    };

    //Show/hide assign vessel
    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };

    $scope.getMenuHeader = function() {
        if ($scope.createNewMode) {
            return $filter('i18n')('mobileTerminal.add_new_form_mobile_terminal_label'); 
        }
        return $filter('transponderName')($scope.currentMobileTerminal.type);
    }

    $scope.menuBarFunctions = {
        saveCallback: $scope.createNewMobileTerminal,
        updateCallback: $scope.updateMobileTerminal,
        cancelCallback: $scope.toggleMobileTerminalDetails,
        showCancel: function() {
            if (!$scope.createMobileTerminalWithVessel.visible) {
                return true;
            } 
            return false;
        },
        exportToCsvCallback: $scope.exportTerminalCSV,
        showExport: function(mobileTerminal) {
            if (mobileTerminal) {
                return angular.isDefined(mobileTerminal.guid) && mobileTerminal.guid != null;
            }
            return false;
        },
        archiveCallback: $scope.archiveMobileTerminal,
        showArchive: function(mobileTerminal) {
            if (mobileTerminal) {
                return angular.isDefined(mobileTerminal.guid) && mobileTerminal.guid != null && !mobileTerminal.archived;
            }
            return false;
        },
        unlinkCallback: $scope.unassignVessel,
        showUnlink: function(mobileTerminal) {
            if (mobileTerminal) {
                return angular.isDefined(mobileTerminal.connectId) && mobileTerminal.connectId != null;
            }
            return false;
        },
        historyCallback: $scope.onMobileTerminalHistoryClick,
        showHistory: function(mobileTerminal) {
            if (mobileTerminal) {
                return angular.isDefined(mobileTerminal.guid) && mobileTerminal.guid != null;
            }
            return false;
        }
    };
});
