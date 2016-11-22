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
angular.module('unionvmsWeb')
    .directive('mobileTerminalDetails', function() {
	return {
		restrict: 'E',
		replace: true,
        controller: 'mobileTerminalDetailsCtrl',
        require: "^ngModel",
        scope: {
            ngModel : '=',
            mobileTerminal : '=',
            transporderSystems : '=', 
            modeltype: '='
        },
		templateUrl: 'directive/mobileTerminal/mobileTerminalDetails/mobileTerminalDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('mobileTerminalDetailsCtrl', function($scope, $location, $filter, locale, SystemTypeAndPlugin, configurationService, MobileTerminalHistoryModal, mobileTerminalRestService, alertService, modalComment, mobileTerminalCsvService){

        $scope.transponderSystems = [];

        var init = function(){
             //Get list transponder systems
            if(angular.isDefined(configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS'))){
                $scope.transpondersConfig = configurationService.getConfig('MOBILE_TERMINAL_TRANSPONDERS');
                $scope.createTransponderSystemDropdownOptions();
            }else{
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
            }

            if(angular.isDefined($scope.mobileTerminal) && angular.isDefined($scope.mobileTerminal.plugin)){
                $scope.typeAndPlugin = $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin($scope.mobileTerminal.type, $scope.mobileTerminal.plugin.labelName, $scope.mobileTerminal.plugin.serviceName);
            }
        };

        //Disable form (Temporary solution)
        $scope.disableForm = function() {
            if ($scope.modeltype === 'VESSEL') {
                return false;
            }
            return false;
        }

        //Get terminal config for the selected terminal type
        $scope.getTerminalConfig = function(){
            if(angular.isDefined($scope.mobileTerminal)){
                var systemName = $scope.mobileTerminal.type;
                return $scope.transpondersConfig.getTerminalConfigBySystemName(systemName);
            }
        };

        //Get model value for the transponder system dropdown by system type and plugin
        $scope.getModelValueForTransponderSystemBySystemTypeAndPlugin = function(type, labelName, serviceName){
            var value, tmp;
            $.each($scope.transponderSystems, function(index, system){
                var systemAndTypeAndPluginItem = system.typeAndPlugin;
                tmp = new SystemTypeAndPlugin(type, labelName, serviceName);
                if(systemAndTypeAndPluginItem.equals(tmp)){
                    value = systemAndTypeAndPluginItem;
                    return false;
                }
            });
            return value;
        };

        //Create dropdown for transponder system
        $scope.createTransponderSystemDropdownOptions = function(){
            //Create dropdown values
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

        //Is multiple channels allowed for the terminal?
        $scope.isMultipleChannelsAllowed = function(){
            if(angular.isDefined($scope.mobileTerminal) && angular.isDefined($scope.getTerminalConfig())){
                return $scope.getTerminalConfig().capabilities.SUPPORT_MULTIPLE_CHANNEL;
            }
            return false;
        };

        //Add a new channel to the end of the list of channels
        $scope.addNewChannel = function(){
            var newChannel = $scope.mobileTerminal.addNewChannel();
            //Set LES for new channel
            if(angular.isDefined($scope.mobileTerminal.plugin.labelName)){
                //Set LES_DESCRIPTION if attribute is used for the channel
                if($scope.getTerminalConfig().channelFields.LES_DESCRIPTION){
                    newChannel.setLESDescription($scope.mobileTerminal.plugin.labelName);
                }
            }
        };

        //Remove a channel from the list of channels
        $scope.removeChannel = function(channelIndex){
            $scope.mobileTerminal.removeChannel(channelIndex);
        };

        // Update mobile terminal, add comment
        $scope.updateMobileTerminal = function() {
            modalComment.open($scope.updateMobileTerminalWithComment, {
                titleLabel: locale.getString("mobileTerminal.updating"),
                saveLabel: locale.getString("common.update")
            });
        };

        //Update the mobile terminal
        $scope.updateMobileTerminalWithComment = function(comment){
            $scope.waitingForCreateResponse = true;
            alertService.hideMessage();
            mobileTerminalRestService.updateMobileTerminal($scope.mobileTerminal, comment)
                    .then(updateMobileTerminalSuccess, updateMobileTerminalError);
        };

        // Success createing the mobile terminal
        var updateMobileTerminalSuccess = function(updatedMobileTerminal){
            $scope.waitingForCreateResponse = false;
            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.update_alert_message_on_success'));
        };

        //Error creating the new mobile terminal
        var updateMobileTerminalError = function(error){
            $scope.waitingForCreateResponse = false;
            alertService.showErrorMessage(locale.getString('mobileTerminal.update_alert_message_on_error'));
        };

        $scope.createNewMobileTerminal = function() {
            console.log('Create a new Mobile Terminal');
        };

        //Open history modal
        $scope.onMobileTerminalHistoryClick = function(){
            MobileTerminalHistoryModal.show($scope.mobileTerminal);
        };

        //Export single mobile terminal
        $scope.exportTerminalCSV = function() {
            mobileTerminalCsvService.download($scope.mobileTerminal);
        };

        // Menu bar functions
        $scope.menuBarFunctions = {
            saveCallback: $scope.createNewMobileTerminal,
            updateCallback: $scope.updateMobileTerminal,
            historyCallback: $scope.onMobileTerminalHistoryClick,
            showHistory: function(mobileTerminal) {
                return true;
            }, 
            exportToCsvCallback: $scope.exportTerminalCSV,
            showExport: function(mobileTerminal) {
                return true;
            }
        };

        init();
    }
);