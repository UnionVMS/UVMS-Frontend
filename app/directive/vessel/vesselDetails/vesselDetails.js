angular.module('unionvmsWeb')
    .directive('vesselDetails', function() {
	return {
		restrict: 'E',
		replace: false,
        controller: 'vesselDetailsCtrl',
        scope: {
            vessel : '='
        },
		templateUrl: 'directive/vessel/vesselDetails/vesselDetails.html',
		link: function(scope, element, attrs, fn) {

		}
	};
});

angular.module('unionvmsWeb')
    .controller('vesselDetailsCtrl', function($scope){

        //Watch for changes to the vessel object
        $scope.$watch(function () { return $scope.vessel;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                console.log("vessel details updated");
                //$scope.setValuesInDropDowns();
            }
        });

        // DROPDOWNS DUMMIES - Needs to have some sort of connection to database... and needs to be refactored when settingsfile is correct or present.
        $scope.vesselCountries =[{'text':'SWE','code':'SWE'},{'text': 'DNK','code':'DNK'},{'text':'NOR','code':'NOR'}];
        $scope.vesselActivitytTypes =[{'text':'Fishing Vessel','code':'Fishing Vessel'},{'text':'Pilot Vessel','code':'Pilot Vessel'},{'text':'Trawling Vessel','code':'Trawling Vessel'}];
        $scope.vesselHasIrcTypes =[{'text':'Yes','code':"true"},{'text':'No','code':"false"}];
        $scope.vesselHasLicenseTypes =[{'text':'Yes','code':"true"},{'text':'No','code':"false"}];
        $scope.vesselLicensTypes =[{'text':'Fishing license','code':'Fishing license'},{'text':'Trawling license','code':'Trawling license'}];
        $scope.vesseloveralltypes =[{'text':'LOA','code':'LOA'},{'text':'LBP','code':'LBP'}];
        $scope.vesselUnitOfMessures =[{'text':'London','code':'London'}];
        $scope.vesselEffectTypes =[{'text':'hp','code':'hp'},{'text':'kW','code':'kW'}];

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

    }
);
