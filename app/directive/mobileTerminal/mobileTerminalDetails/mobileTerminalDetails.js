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
    .controller('mobileTerminalDetailsCtrl', function($scope, $location, $filter, locale, SystemTypeAndPlugin, configurationService, MobileTerminalHistoryModal){

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

        //Disable form
        $scope.disableForm = function() {
            if ($scope.modeltype === 'VESSEL') {
                return true;
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

        //Open history modal
        $scope.onMobileTerminalHistoryClick = function(){
            MobileTerminalHistoryModal.show($scope.mobileTerminal);
        };

        //Edit current mobile terminal
        $scope.editMobileTerminalDetails = function(){
            $location.path('/communication/' + $scope.mobileTerminal.guid);
        };    

        $scope.menuBarFunctions = {
            historyCallback: $scope.onMobileTerminalHistoryClick,
            showHistory: function(mobileTerminal) {
                return true;
            },
            editCallback: $scope.editMobileTerminalDetails,
            showEdit: function(mobileTerminal) {
                return true;
            }
        };

        init();
    }
);