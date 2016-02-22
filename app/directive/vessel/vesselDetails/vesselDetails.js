angular.module('unionvmsWeb')
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,
        controller: 'vesselDetailsCtrl',
        scope: {
            vessel : '=',
            disableForm : '=',
            vesselForm : '=',
            submitAttempted : '=',
            spin: '=',
            existingValues: '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope, locale, configurationService, vesselValidationService, globalSettingsService){

        //Dropdown values
        $scope.vesselFlagState = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
        $scope.vesselLicensTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','LICENSE_TYPE'),'LICENSE_TYPE','VESSEL', true);
        $scope.vesselGearTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','GEAR_TYPE'), 'GEAR_TYPE','VESSEL', true);
        $scope.vesselLengthTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_LENGTH'),'LENGTH','VESSEL', true);
        $scope.vesselGrossTonnageUnits = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_TONNAGE'), 'TONNAGE','VESSEL', true);

        //Validation
        $scope.imoRegExp = vesselValidationService.getIMOPattern();
        $scope.cfrRegExp = vesselValidationService.getCFRPattern();
        $scope.cfrValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_cfr_pattern_validation_message')
        };
        $scope.mmsiRegExp = vesselValidationService.getMMSIPattern();
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };
        $scope.imoValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_imo_pattern_validation_message')
        };
        $scope.maxTwoDecimalsRegExp = vesselValidationService.getMaxTwoDecimalsPattern();
        $scope.maxTwoDecimalsValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_max_decimals_pattern_validation_message', "2")
        };

        $scope.producerCodePattern = vesselValidationService.getProducerCodePattern();
        $scope.producerCodeValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_producer_code_pattern_validation_message')
        };

        $scope.lengthUnit = globalSettingsService.getLengthUnit();
    }
);
