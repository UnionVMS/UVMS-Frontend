angular.module('unionvmsWeb')
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,
        controller: 'vesselDetailsCtrl',
        scope: {
            vessel : '=',
            disableForm : '@',
            vesselForm : '=',
            submitAttempted : '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope, locale){
        // DROPDOWNS DUMMIES - Needs to have some sort of connection to database... and needs to be refactored when settingsfile is correct or present.
        $scope.vesselCountries =[{'text':'SWE','code':'SWE'},{'text': 'DNK','code':'DNK'},{'text':'NOR','code':'NOR'}];
        $scope.vesselActivitytTypes =[{'text':'Fishing Vessel','code':'FISHING'},{'text':'Pilot Vessel','code':'PILOT'},{'text':'Trawling Vessel','code':'TRAWLING'}];
        $scope.vesselHasIrcTypes =[{'text':'Yes','code':true},{'text':'No','code':false}];
        $scope.vesselHasLicenseTypes =[{'text':'Yes','code':true},{'text':'No','code':false}];
        $scope.vesselLicensTypes =[{'text':'Fishing license','code':'FISHING'},{'text':'Trawling license','code':'TRAWLING'}];
        $scope.vesseloveralltypes =[{'text':'LOA','code':'LOA'},{'text':'LBP','code':'LBP'}];
        $scope.vesselUnitOfMessures =[{'text':'London','code':'LONDOND'}, {'text':'Oslo','code':'OSLO'}];
        $scope.vesselEffectTypes =[{'text':'hp','code':'HP'},{'text':'kW','code':'KW'}];

        //TODO: This values does not exists in the vesselObject.
        $scope.vesselUnitOfMessure = "";
        $scope.vesselEffect = "";
        $scope.searchFlagState = "";
        $scope.lenght = "";
        $scope.licensetype="";


        $scope.terminalsatellitetypes =[{'name':'Inmarsat-B','code':'133'},{'name':'Inmarsat-C','code':'998'}];
        $scope.terminaloceanstypes =[{'name':'Skagerack','code':'3'},{'name':'Kattegatt','code':'99'},{'name':'Östersjön','code':'929'}];
        $scope.searchFlagStates =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
        $scope.searchLicensTypes =[{'name':'Fishing license','code':'Fishing license'},{'name':'Trawling license','code':'Trawling license'}];
        $scope.searchActiveTypes = [{'name':'Yes','code':'true'},{'name':'No','code':'false'}];

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
