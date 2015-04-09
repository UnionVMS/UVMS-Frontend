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
                $scope.setValuesInDropDowns();
            }
        });   

        // DROPDOWNS DUMMIES - Needs to have some sort of connection to database... and needs to be refatoried when settingsfile is correct or present.
        $scope.vesselCountry = "Country";
        $scope.vesselActivity = "Activity";
        $scope.vesselHasIrc = "No";
        $scope.vesselOverall = "LOA";
        $scope.vesselHasLicense = "No";
        $scope.vesselLicenseType = "Choose license type";
        $scope.vesselUnitOfMessure = "London";
        $scope.vesselEffect = "Effect";
        $scope.searchFlagState = "Flag state";
        $scope.searchLicenseType = "License type";
        $scope.searchActive = "Active";
        $scope.searchVesselType = "Type";

        //Dummy values for dropdowns
        $scope.vesseloveralltypes =[{'name':'LOA','code':'1'},{'name':'LBP','code':'0'}];
        $scope.vesselUnitOfMessures =[{'name':'London','code':'London'}];
        $scope.vesselEffectTypes =[{'name':'hp','code':'133'},{'name':'kW','code':'99'}];
        $scope.terminalsatellitetypes =[{'name':'Inmarsat-B','code':'133'},{'name':'Inmarsat-C','code':'998'}];
        $scope.terminaloceanstypes =[{'name':'Skagerack','code':'3'},{'name':'Kattegatt','code':'99'},{'name':'Östersjön','code':'929'}];
        $scope.vesselCountries =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
        $scope.vesselActivitytTypes =[{'name':'Fishing Vessel','code':'Fishing Vessel'},{'name':'Pilot Vessel','code':'Pilot Vessel'},{'name':'Trawling Vessel','code':'Trawling Vessel'}];
        $scope.vesselHasIrcTypes =[{'name':'Yes','code':'true'},{'name':'No','code':'false'}];
        $scope.vesselLicensTypes =[{'name':'Fishing license','code':'Fishing license'},{'name':'Trawling license','code':'Trawling license'}];
        $scope.searchFlagStates =[{'name':'SWE','code':'SWE'},{'name':'DNK','code':'DNK'},{'name':'NOR','code':'NOR'}];
        $scope.vesselVesselTypes =[{'name':'Fishing Vessel','code':'Fishing Vessel'},{'name':'Pilot Vessel','code':'Pilot Vessel'},{'name':'Trawling Vessel','code':'Trawling Vessel'}];
        $scope.searchLicensTypes =[{'name':'Fishing license','code':'Fishing license'},{'name':'Trawling license','code':'Trawling license'}];
        $scope.searchActiveTypes = [{'name':'Yes','code':'true'},{'name':'No','code':'false'}];


        $scope.setValuesInDropDowns = function(){

            //set values in dropdowns if values in selected vessel corresponds to our dropdowns
            if( !! $scope.vessel.countryCode ){
                $scope.vesselCountry = $scope.vessel.countryCode;
            }

            if(!! $scope.vessel.vesselType )
            {
                $scope.vesselActivity = $scope.vessel.vesselType;
            }

            if(!! $scope.vessel.hasIrcs )
            {
                if($scope.vessel.hasIrcs ="true")
                { $scope.vesselHasIrc = "Yes";}
                else
                { $scope.vesselHasIrc = "No";}
            }

            if(!! $scope.vessel.licenseSelected )
            {
                if($scope.vessel.licenseSelected ="true")
                { $scope.vesselHasLicense = "Yes";}
                else
                { $scope.vesselHasLicense = "No";}
            }

            if(!! $scope.vessel.licenseTypeSelected )
            {
                $scope.vesselLicenseType = $scope.vessel.licenseTypeSelected;
            }
        };


        $scope.countrySelected = function(item){
            if(item === undefined){
                $scope.vesselCountry = "Country";
            } else {
                $scope.vesselCountry = item.name;
                $scope.vessel.countryCode = item.name;
            }
        };

        $scope.activitySelected = function(item){
            if(item === undefined){
                $scope.vesselActivity = "Activity";
            } else {
                $scope.vesselActivity = item.name;
                $scope.vessel.vesselType = item.name;
            }
        };

        $scope.ircSelected = function(item){
            if(item === undefined){
                $scope.vesselHasIrc = "No";
            } else {
                $scope.vesselHasIrc = item.name;
                $scope.vessel.hasIrcs = item.code;
            }
        };

        $scope.licenseSelected = function(item){
            if(item === undefined){
                $scope.vesselHasLicense = "No";
            } else {
                $scope.vesselHasLicense = item.name;
                $scope.vessel.hasLicense = item.code;
            }
        };

        $scope.licenseTypeSelected = function(item){
            if(item === undefined){
                $scope.vesselLicenseType = "Choose license type";
            } else {
                $scope.vesselLicenseType = item.name;
               // $scope.vessel.licenseTypeSelected = item.name;
            }
        };

        $scope.overallSelected = function(item){
            if(item === undefined){
                $scope.vesselOverall = "LOA";
            } else {
                $scope.vesselOverall = item.name;
            }
        };

        $scope.unitOfMessureSelected = function(item){
            if(item === undefined){
                $scope.vesselUnitOfMessure= "London";
            } else {
                $scope.vesselUnitOfMessure = item.name;
            }
        };

        $scope.effectSelected = function(item){
            if(item === undefined){
                $scope.vesselEffect= "Effect";
            } else {
                $scope.vesselEffect = item.name;
            }
        };        

    }
);
