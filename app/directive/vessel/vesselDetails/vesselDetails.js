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
            spin: '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope, locale, configurationService){

        //Dropdown values
        $scope.vesselFlagState = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
        $scope.vesselLicensTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','LICENSE_TYPE'),'LICENSE_TYPE','VESSEL', true);
        $scope.vesselGearTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','GEAR_TYPE'), 'GEAR_TYPE','VESSEL', true);
        $scope.vesselLengthTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_LENGTH'),'LENGTH','VESSEL', true);
        $scope.vesselGrossTonnageUnits = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','UNIT_TONNAGE'), 'TONNAGE','VESSEL', true);

        //Validation
        $scope.cfrValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_cfr_pattern_validation_message')
        };
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };
        $scope.maxTwoDecimalsRegexp = new RegExp(/^[0-9]+(\.[0-9]{0,2}?)?$/);
        $scope.maxTwoDecimalsValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_max_decimals_pattern_validation_message', "2")
        };
    }
);
