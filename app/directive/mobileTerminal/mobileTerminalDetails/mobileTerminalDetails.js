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
angular.module('unionvmsWeb')
    .directive('mobileTerminalDetails', function() {
	return {
		restrict: 'E',
		replace: true,
        controller: 'mobileTerminalDetailsCtrl',
        scope: {
            mobileTerminal : '=',
            transporderSystems : '=',
            modeltype : '=',
            createNew : '=',
            vesselId : '=',
            ngDisabled : '=',
            functions : '=',
            dirtyStatus : '=',
            submitAttemptedWatcher : '=',
            listIndex : '='
        },
		templateUrl: 'directive/mobileTerminal/mobileTerminalDetails/mobileTerminalDetails.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});

angular.module('unionvmsWeb')
    .controller('mobileTerminalDetailsCtrl', function($scope, $location, $filter, locale, SystemTypeAndPlugin, configurationService, MobileTerminalHistoryModal, mobileTerminalRestService, alertService, modalComment, mobileTerminalCsvService, MobileTerminal, userService){

        $scope.transponderSystems = [];
        $scope.typeAndPlugin = undefined;
        $scope.formScope = undefined;
        $scope.isFormDirty = false;

        //Check if user is allowed to edit Mobile Terminals
        var checkAccessToFeature = function(feature) {
            return userService.isAllowed(feature, 'Union-VMS', true);
        };

        //Init function
        var init = function(){

            //Detect initial values of the Mobile Terminal object
            $scope.originalMobileTerminalValue = angular.copy($scope.mobileTerminal);

             //Get list transponder systems
            if(angular.isDefined(configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS'))){
                $scope.transpondersConfig = configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS');
                $scope.createTransponderSystemDropdownOptions();
            }else{
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
            }

            if(angular.isDefined($scope.mobileTerminal) && angular.isDefined($scope.mobileTerminal.plugin)){
                $scope.typeAndPlugin = $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin($scope.mobileTerminal.mobileTerminalType, $scope.mobileTerminal.plugin.name, $scope.mobileTerminal.plugin.pluginServiceName);
            }
        };

        //Watch for changes to the Mobile Terminal object compared to the initial object, maily to enable save button if changes has been made
        $scope.$watch('mobileTerminal', function(newValue, oldValue){
            if(angular.isDefined($scope.originalMobileTerminalValue)){
                if (angular.equals(newValue.toJson(), $scope.originalMobileTerminalValue.toJson())) {
                    $scope.setFormDirtyStatus(false);
                } else {
                    $scope.setFormDirtyStatus(true);
                }
            }
        }, true);

        //Check if parent form is submitted and update or create mobile terminal
        $scope.$watch('submitAttemptedWatcher', function(newValue, oldValue) {
            if (angular.isDefined($scope.submitAttemptedWatcher) && newValue && $scope.isFormDirty) {
                if (angular.isDefined($scope.mobileTerminal.guid)) {
                    $scope.updateMobileTerminalWithComment('updated from Asset page');
                } else {
                    $scope.createNewMobileTerminal();
                }
            }
        }, true);

        //Check if form has been modified
        $scope.setFormDirtyStatus = function(status) {
            if (angular.isDefined(status)) {
                $scope.isFormDirty = status;

                // Updated parent form with new status
                if (angular.isDefined($scope.dirtyStatus)) {
                    $scope.dirtyStatus(status);
                }
            }
        };

        //Set form submit attempted status
        $scope.setSubmitStatus = function(status) {
            if (angular.isDefined($scope.functions.setSubmitStatus)) {
                $scope.functions.setSubmitStatus(status);
            }
        };

        //Set form scope - To be able to validate form in FE
        $scope.setFormScope = function(scope){
           $scope.formScope = scope;
        };

        //Set status - Disabled
        $scope.disableForm = function(){
            if(angular.isDefined($scope.mobileTerminal) && !$scope.ngDisabled && checkAccessToFeature('manageMobileTerminals')){
                return false;
            }
            return true;
        };

        //Set status - Visible
        $scope.displayMobileTerminalForm = function(){
            if($scope.modeltype === 'VESSEL' && !$scope.isCreateNewMode()){
                if(!$scope.mobileTerminal.associatedVessel || $scope.mobileTerminal.archived) {
                    return false;
                }
            }
            return true;
        };

        //Set status - Create New
        $scope.isCreateNewMode = function(){
            if($scope.mobileTerminal.id) {
                return false;
            }
            return true;
        };

        //Set header text on menu bar
        $scope.getMenuHeader = function(){
            if($scope.isCreateNewMode()){
                return $filter('i18n')('mobileTerminal.add_new_form_mobile_terminal_label');
            }
            return $filter('transponderName')($scope.mobileTerminal.mobileTerminalType);
        };

        //Get model value for the transponder system dropdown by system type and plugin
        $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin = function(type, name, pluginServiceName){
            var value, tmp;
            $.each($scope.transponderSystems, function(index, system){
                var systemAndTypeAndPluginItem = system.typeAndPlugin;
                tmp = new SystemTypeAndPlugin(type, name, pluginServiceName);
                if(systemAndTypeAndPluginItem.equals(tmp)){
                    value = systemAndTypeAndPluginItem;
                    return false;
                }
            });
            return value;
        };

        //Create dropdown for transponder system
        $scope.createTransponderSystemDropdownOptions = function(){
            $.each($scope.transpondersConfig.terminalConfigs, function(key, config){
                //LES capability
                if(config.capabilities["PLUGIN"] && _.isArray(config.capabilities["PLUGIN"])){
                    $.each(config.capabilities["PLUGIN"], function(key2, pluginOption){
                        $scope.transponderSystems.push({text : config.viewName +" : " +pluginOption.text, typeAndPlugin : new SystemTypeAndPlugin(config.systemType, pluginOption.attributes['LABELNAME'], pluginOption.attributes['SERVICENAME'])});
                    });
                }else{
                    $scope.transponderSystems.push({text : config.viewName, typeAndPlugin : new SystemTypeAndPlugin(config.systemType, undefined)});
                }
            });
        };

        //Get terminal config for the selected terminal type
        $scope.getTerminalConfig = function(){
            if(angular.isDefined($scope.mobileTerminal)){
                var systemName = $scope.mobileTerminal.mobileTerminalType;
                return $scope.transpondersConfig.getTerminalConfigBySystemName(systemName);
            }
        };

        //Selected terminal type
        $scope.onTerminalSystemSelect = function(selectedItem){
            if(angular.isDefined(selectedItem) && angular.isDefined(selectedItem.typeAndPlugin)){
                $scope.mobileTerminal.mobileTerminalType = selectedItem.typeAndPlugin.type;

                //Reset channels
                $scope.mobileTerminal.resetChannels();

                var selectedLabelName = selectedItem.typeAndPlugin.plugin.name;
                var selectedServiceName = selectedItem.typeAndPlugin.plugin.pluginServiceName;
                if(angular.isDefined(selectedLabelName) && angular.isDefined(selectedServiceName)){
                    $scope.mobileTerminal.plugin.name = selectedLabelName;
                    $scope.mobileTerminal.plugin.pluginServiceName = selectedServiceName;

                    //Set LES_DESCRIPTION if attribute is used for the channel, otherwise set to undefined
                    $.each($scope.mobileTerminal.channels, function(index, channel){
                        if($scope.getTerminalConfig().channelFields.LES_DESCRIPTION){
                            channel.setLESDescription(selectedLabelName);
                        }else{
                            channel.setLESDescription(undefined);
                        }
                    });
                }else{
                    delete $scope.mobileTerminal.plugin.name;
                    delete $scope.mobileTerminal.plugin.pluginServiceName;
                }
            }else{
                $scope.mobileTerminal.mobileTerminalType = undefined;
                delete $scope.mobileTerminal.plugin.name;
                delete $scope.mobileTerminal.plugin.pluginServiceName;
            }
        };

        //Channels - Check if multiple channels is allowed
        $scope.isMultipleChannelsAllowed = function(){
            if(angular.isDefined($scope.mobileTerminal) && angular.isDefined($scope.getTerminalConfig())){
                return $scope.getTerminalConfig().capabilities.SUPPORT_MULTIPLE_CHANNEL;
            }
            return false;
        };

        //Create new Mobile Terminal - Request
        $scope.createNewMobileTerminal = function(){
            if($scope.formScope.mobileTerminalForm.$valid){
                mobileTerminalRestService.createNewMobileTerminal($scope.mobileTerminal)
                        .then(createNewMobileTerminalSuccess, createNewMobileTerminalError);
            }
        };

        //Create new Mobile Terminal - Success
        var createNewMobileTerminalSuccess = function(newMobileTerminal){
            if($scope.vesselId){
                mobileTerminalRestService.assignMobileTerminal(newMobileTerminal, $scope.vesselId, "-")
                    .then(createNewMobileTerminalWithVesselSuccess, createNewMobileTerminalError);
            } else {
                alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.add_new_alert_message_on_success'));
                $scope.mobileTerminal = newMobileTerminal;
                $scope.setSubmitStatus(false);
            }
        };

        //Create new Mobile Terminal - Error
        var createNewMobileTerminalError = function(error){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
            $scope.setSubmitStatus(false);
        };

        //Create new Mobile Terminal With Vessel - Success
        var createNewMobileTerminalWithVesselSuccess = function(){
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.add_new_alert_message_on_success'));
            $scope.functions.updateMobileTerminals();
            $scope.setSubmitStatus(false);

            if (angular.isDefined($scope.functions.updateMobileTerminals)) {
                $scope.functions.updateMobileTerminals();
            }
        };

        //Update Mobile Terminal - Add Comment
        $scope.updateMobileTerminal = function() {
            if($scope.formScope.mobileTerminalForm.$valid){
                modalComment.open($scope.updateMobileTerminalWithComment, {
                    titleLabel: locale.getString("mobileTerminal.updating", [$scope.mobileTerminal.getSerialNumber()]),
                    saveLabel: locale.getString("common.update")
                });
            }
        };

        //Update Mobile Terminal - Request
        $scope.updateMobileTerminalWithComment = function(comment){
            alertService.hideMessage();
            mobileTerminalRestService.updateMobileTerminal($scope.mobileTerminal, comment)
                    .then(updateMobileTerminalSuccess, updateMobileTerminalError);
        };

        //Update Mobile Terminal - Success
        var updateMobileTerminalSuccess = function(updatedMobileTerminal){
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));
            $scope.setFormDirtyStatus(false);
            $scope.setSubmitStatus(false);
            $scope.originalMobileTerminalValue = angular.copy($scope.mobileTerminal);

            if (angular.isDefined($scope.functions.updateMobileTerminals)) {
                $scope.functions.updateMobileTerminals();
            }
        };

        //Update Mobile Terminal - Error
        var updateMobileTerminalError = function(error){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
            $scope.setSubmitStatus(false);
        };

        //Archive Mobile Terminal - Add Comment
        $scope.archiveMobileTerminal = function() {
            modalComment.open($scope.archiveMobileTerminaWithComment, {
                titleLabel: locale.getString("mobileTerminal.archive_modal_title", [$scope.mobileTerminal.getSerialNumber()]),
                saveLabel: locale.getString('common.archive')
            });
        };

        //Archive Mobile Terminal - Request
        $scope.archiveMobileTerminaWithComment = function(comment){
            mobileTerminalRestService.removeMobileTerminal($scope.mobileTerminal, comment)
                .then(archiveMobileTerminalSuccess, archiveMobileTerminalError);
        };

        //Archive Mobile Terminal - Success
        var archiveMobileTerminalSuccess = function(archivedMobileTerminal){
            $scope.mobileTerminal.archived = true;
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.archive_message_on_success'));
            if($scope.modeltype === 'VESSEL') {
                $scope.functions.updateMobileTerminals();
            }

            if($scope.modeltype === 'MOBILE_TERMINAL') {
                $scope.functions.displayMobileTerminalList();
            }
        };

        //Archive Mobile Terminal - Error
        var archiveMobileTerminalError = function(archivedMobileTerminal){
            alertService.showErrorMessage(locale.getString('mobileTerminal.archive_message_on_error'));
        };

        //Unassign Mobile Terminal - Add Comment
        $scope.unassignVessel = function(){
            var vesselName = "";
            if(angular.isDefined($scope.mobileTerminal.associatedVessel)){
                vesselName = $scope.mobileTerminal.associatedVessel.name;
            }
            modalComment.open($scope.unassignVesselWithComment, {
                titleLabel: locale.getString("mobileTerminal.unassigning_from_vessel", [$scope.mobileTerminal.getSerialNumber(), vesselName]),
                saveLabel: locale.getString("mobileTerminal.unassign")
            });
        };

        //Unassign Mobile Terminal - Request
        $scope.unassignVesselWithComment = function(comment){
            mobileTerminalRestService.unassignMobileTerminal($scope.mobileTerminal, $scope.vesselId, comment)
                .then(unassignMobileTerminalSuccess, unassignMobileTerminalError);
        };

        //Unassign Mobile Terminal - Success
        var unassignMobileTerminalSuccess = function(){
            $scope.mobileTerminal.unassign();
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.unassign_vessel_message_on_success'));

            if($scope.modeltype === 'VESSEL') {
                $scope.functions.updateMobileTerminals();
            }
        };

        //Unassign Mobile Terminal - Error
        var unassignMobileTerminalError = function(){
            alertService.showErrorMessage(locale.getString('mobileTerminal.unassign_vessel_message_on_error'));
        };

        //Open history modal
        $scope.onMobileTerminalHistoryClick = function(){
            MobileTerminalHistoryModal.show($scope.mobileTerminal);
        };

        //Export Mobile Terminal
        $scope.exportTerminalCSV = function(){
            mobileTerminalCsvService.download($scope.mobileTerminal);
        };

        //Close Mobile Terminal form
        $scope.closeMobileTerminalForm = function(){
            if ($scope.modeltype === 'MOBILE_TERMINAL') {
                $scope.functions.displayMobileTerminalList();
            }
        };

        //Channels - Add a new channel
        $scope.addNewChannel = function(){
            var newChannel = $scope.mobileTerminal.addNewChannel();
            //Set LES for new channel
            if(angular.isDefined($scope.mobileTerminal.plugin.name)){
                //Set LES_DESCRIPTION if attribute is used for the channel
                if($scope.getTerminalConfig().channelFields.LES_DESCRIPTION){
                    newChannel.setLESDescription($scope.mobileTerminal.plugin.name);
                }
            }
        };

        //Channels - Remove a channel
        $scope.removeChannel = function(communicationChannel){
           $scope.mobileTerminal.removeChannel($scope.mobileTerminal.channels.indexOf(communicationChannel));
        };

        //Channels - Get help text
        var disabledMessage = locale.getString('mobileTerminal.form_inmarsatc_communication_disabledchannel_message');
        $scope.getRadioButtonHelpText = {
            pollable: function(communicationChannel) {
                if ($scope.disableChannels.pollable(communicationChannel)) {
                    return disabledMessage;
                }
                return locale.getString('mobileTerminal.form_inmarsatc_communication_selectedchannel_poll_label');
            },
            configurable: function(communicationChannel) {
                if ($scope.disableChannels.configurable(communicationChannel)) {
                    return disabledMessage;
                }
                return locale.getString('mobileTerminal.form_inmarsatc_communication_selectedchannel_con_label');
            },
            defaultReporting: function(communicationChannel) {
                if ($scope.disableChannels.defaultReporting(communicationChannel)) {
                    return disabledMessage;
                }
                return locale.getString('mobileTerminal.form_inmarsatc_communication_selectedchannel_def_label');
            }
        };

        //Channels - Disable channels
        $scope.disableChannels = {
            pollable: function(communicationChannel) {
                for (var i = 0; i < $scope.mobileTerminal.channels.length; i++) {
                    if ($scope.mobileTerminal.channels[i].pollChannel === true) {
                        if ($scope.mobileTerminal.channels[i] === communicationChannel) {
                            return false;
                        }
                        return true;
                    }
                }
            },
            configurable: function(communicationChannel) {
                for (var i = 0; i < $scope.mobileTerminal.channels.length; i++) {
                    if ($scope.mobileTerminal.channels[i].configChannel === true) {
                        if ($scope.mobileTerminal.channels[i] === communicationChannel) {
                            return false;
                        }
                        return true;
                    }
                }
            },
            defaultReporting: function(communicationChannel) {
                for (var i = 0; i < $scope.mobileTerminal.channels.length; i++) {
                    if ($scope.mobileTerminal.channels[i].defaultChannel === true) {
                        if ($scope.mobileTerminal.channels[i] === communicationChannel) {
                            return false;
                        }
                        return true;
                    }
                }
            }
        };

        //Menu bar functions
        $scope.menuBarFunctions = {
            saveCallback: $scope.createNewMobileTerminal,
            updateCallback: $scope.updateMobileTerminal,
            showSave: function(mobileTerminal) {
                if ($scope.modeltype === 'MOBILE_TERMINAL') {
                    return true;
                }
                return false;
            },
            disableSave: function(mobileTerminal) {
                if (mobileTerminal) {
                    return !$scope.isFormDirty;
                }
            },
            cancelCallback: $scope.closeMobileTerminalForm,
            showCancel: function() {
                if ($scope.modeltype === 'MOBILE_TERMINAL') {
                    return true;
                }
                return false;
            },
            exportToCsvCallback: $scope.exportTerminalCSV,
            archiveCallback: $scope.archiveMobileTerminal,
            showArchive: function(mobileTerminal) {
                if (mobileTerminal && checkAccessToFeature('manageMobileTerminals')) {
                    return angular.isDefined(mobileTerminal.guid) && mobileTerminal.guid != null && !mobileTerminal.archived;
                }
                return false;
            },
            unlinkCallback: $scope.unassignVessel,
            showUnlink: function(mobileTerminal) {
                if (mobileTerminal && checkAccessToFeature('manageMobileTerminals')) {
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
            },
            isNotAllowed: function(mobileTerminal) {
                if (mobileTerminal && checkAccessToFeature('manageMobileTerminals')) {
                    return false;
                }
                return true;
            },
            removeCallback: function(mobileTerminal) {
                if (mobileTerminal) {
                    $scope.functions.removeMobileTerminal(mobileTerminal);
                }
            },
            showRemove: function(mobileTerminal) {
                if ($scope.modeltype === 'VESSEL' && $scope.isCreateNewMode()) {
                    return true;
                }
                return false;
            }
        };

        init();
    }
);
