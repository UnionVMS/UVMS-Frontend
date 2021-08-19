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
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,
        controller: 'vesselDetailsCtrl',
        scope: {
            vessel : '=',
            disableForm : '=',
            createNewMode: '=',
            vesselForm : '=',
            submitAttempted : '=',
            spin: '=',
            existingValues: '=',
            hasLinkedTerminal: '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope, locale, configurationService, vesselValidationService, globalSettingsService, mdrCacheService, componentUtilsService){

        //Dropdown values
        $scope.vesselFlagState = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
        $scope.vesselLicensTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','LICENSE_TYPE'),'LICENSE_TYPE','VESSEL', true);
        $scope.vesselLengthTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_LENGTH'),'LENGTH','VESSEL', true);
        $scope.vesselGrossTonnageUnits = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_TONNAGE'), 'TONNAGE','VESSEL', true);
        loadGearTypes();
        
        function loadGearTypes (){
            $scope.vesselGearTypes = [];
            mdrCacheService.getCodeList('GEAR_TYPE').then(function(response){
                var originalCodeList = angular.copy(response);
                $scope.vesselGearTypes = componentUtilsService.convertCodelistToCombolist(originalCodeList, true, false, undefined, 'category');
                // sort alphabetically by category and text
                $scope.vesselGearTypes.sort(function(a, b) {
                    return a.category.localeCompare(b.category) || a.text.localeCompare(b.text);
                 });
            }, function(error){
                $scope.actServ.setAlert(true, 'activity.activity_error_getting_code_lists');
                $scope.visibleCombos.gearType = false;
            });
        };

        //Validation
        $scope.ircsValidationMessages = {
            'required' : locale.getString('vessel.vessel_details_terminal_linked_required_validation_message')
        };

        $scope.cfrRegExp = vesselValidationService.getCFRPattern();
        $scope.cfrValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_cfr_pattern_validation_message'),
            'required' : locale.getString('vessel.vessel_details_terminal_linked_required_validation_message')
        };

        $scope.mmsiRegExp = vesselValidationService.getMMSIPattern();
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };

        $scope.imoRegExp = vesselValidationService.getIMOPattern();
        $scope.imoValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_imo_pattern_validation_message')
        };

        $scope.uviRegExp = vesselValidationService.getUVIPattern();
        $scope.uviValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_uvi_pattern_validation_message')
        };        
        
        $scope.iccatRegExp = vesselValidationService.getICCATPattern();
        $scope.iccatValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_iccat_pattern_validation_message')
        };
        
        $scope.maxTwoDecimalsRegExp = vesselValidationService.getMaxTwoDecimalsPattern();
        $scope.maxTwoDecimalsValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_max_decimals_pattern_validation_message', "2")
        };

        $scope.getlengthOverAllRegExp = vesselValidationService.getlengthOverAllPattern();
        $scope.lengthOverAllValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_get_length_over_all_pattern_validation_message')
        };

        $scope.producerCodePattern = vesselValidationService.getProducerCodePattern();
        $scope.producerCodeValidationMessages = {
            'pattern' : locale.getString('common.validation_invalid_numeric')
        };

        $scope.lengthUnit = globalSettingsService.getLengthUnit();
        $scope.getMaxLengthMessage = function(length) {
            return {
                maxlength: locale.getString('vessel.warn_max_length', length)
            };
        };
    }
);
