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
            submitAttempted : '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope, locale, configurationService){
        
        $scope.vesselFlagState = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL');
        $scope.vesselLicensTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','LICENSE_TYPE'),'LICENSE_TYPE','VESSEL');
        $scope.vesselCarrierType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','CARRIER_TYPE'), 'CARRIER_TYPE','VESSEL');
        $scope.vesseloveralltypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','LENGTH'),'LENGTH','VESSEL');
        $scope.vesselUnitOfMessures = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','TONNAGE'), 'TONNAGE','VESSEL');

        //TODO: FIX support for strings instead of true/false
        //$scope.vesselHasIrcTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','HAS_IRCS'),'HAS_IRCS','VESSEL');
        //$scope.vesselHasLicenseTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL','HAS_LICENSE'),'HAS_LICENSE','VESSEL');
        $scope.vesselHasIrcTypes =[{'text':'Yes','code':true},{'text':'No','code':false}];
        $scope.vesselHasLicenseTypes =[{'text':'Yes','code':true},{'text':'No','code':false}];
        $scope.vesselEffectTypes =[{'text':'hp','code':'HP'},{'text':'kW','code':'KW'}];

        //TODO: This values does not exists in the vesselObject.
        //$scope.vesselUnitOfMessure = "";
        //$scope.vesselEffect = "";
        //$scope.searchFlagState = "";
        //$scope.lenght = "";
        //$scope.licensetype="";

        //Reset IRCS on hasIrcs select
        $scope.onHasIrcsSelect = function(item){
            if(item.code === false){
                $scope.vessel.ircs = "";
            }
        };        

        //Reset licenseType on hasIrcs select
        $scope.onHasLicenseSelect = function(item){
            if(item.code === false){
                $scope.vessel.licenseType = undefined;
            }
        };

        //Validation messages
        $scope.cfrValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_cfr_pattern_validation_message')
        };


    }
);
