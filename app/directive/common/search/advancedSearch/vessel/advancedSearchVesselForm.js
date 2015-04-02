angular.module('unionvmsWeb')
    .controller('AdvancedSearchVesselFormCtrl', function($scope, $modal, searchService){

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

        //Watch for changes to the searchService criterias
        $scope.$watch(function () { return searchService.getSearchCriterias();}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                if($scope.advancedsearchvisible){
                    $scope.updateFormToCurrentSearchData();
                }
            }
        });

        var resetSearch = function(){
            $scope.searchActiveSelected();
            $scope.searchAddCFR();
            $scope.searchAddExternalMarking();
            $scope.searchFlagStateSelected();
            $scope.searchAddHomePort();
            $scope.searchAddIRCS();
            $scope.searchLicenseTypeSelected();
            $scope.searchAddMMSI();
            $scope.searchAddName();
            $scope.searchVesselTypeSelected();
        };

        $scope.updateFormToCurrentSearchData = function(){
            resetSearch();

            $.each(searchService.getSearchCriterias(), function(index, searchField){
                var selectItem = {"name" : searchField.value, "code" : searchField.value};
                switch (searchField.key){
                    case "ACTIVE":
                        $scope.searchActiveSelected(selectItem);
                        break;
                    case "CFR":
                        $scope.searchAddCFR(selectItem.name);
                        break;
                    case "EXTERNAL_MARKING":
                        $scope.searchAddExternalMarking(selectItem.name);
                        break;
                    case "FLAG_STATE":
                        $scope.searchFlagStateSelected(selectItem);
                        break;
                    case "HOMEPORT":
                        $scope.searchAddHomePort(selectItem);
                        break;
                    case "IRCS":
                        $scope.searchAddIRCS(selectItem.name);
                        break;
                    case "LICENSE":
                        $scope.searchLicenseTypeSelected(selectItem);
                        break;
                    case "MMSI":
                        $scope.searchAddMMSI(selectItem);
                        break;
                    case "NAME":
                        $scope.searchAddName(selectItem.name);
                        break;
                    case "TYPE":
                        $scope.searchVesselTypeSelected(selectItem);
                        break;
                    default:
                        break;
                }
            });        
        };

        $scope.searchFlagStateSelected = function (item) {
            if (item === undefined) {
                $scope.searchFlagState = "Flag state";
                delete $scope.advancedSearchObject.FLAG_STATE;
            } else {
                $scope.searchFlagState = item.name;
                $scope.advancedSearchObject.FLAG_STATE = item.code;
            }
        };

        $scope.searchVesselTypeSelected = function(item){
            if(item === undefined){
                $scope.searchVesselType = "Type";
                delete $scope.advancedSearchObject.TYPE;
            } else {
                $scope.searchVesselType = item.name;
                $scope.advancedSearchObject.TYPE = item.code;
            }
        };

        $scope.searchActiveSelected = function(item){
            if(item === undefined){
                $scope.searchActive = "Active";
                delete $scope.advancedSearchObject.ACTIVE;
            } else {
                $scope.searchActive = item.name;
                $scope.advancedSearchObject.ACTIVE = item.code;
            }
        };

        $scope.searchLicenseTypeSelected = function(item){
            if(item === undefined){
                $scope.searchActive = "License";
                delete $scope.advancedSearchObject.LICENSE;
            } else {
                $scope.searchLicenseType = item.name;
                $scope.advancedSearchObject.LICENSE = item.code;
            }
        };

        $scope.searchAddCFR = function(data){
            $scope.updateAdvancedSearchObject("CFR", data);
        };

        $scope.searchAddIRCS = function(data){
            $scope.updateAdvancedSearchObject("IRCS", data);
        };

        $scope.searchAddName = function(data){
            $scope.updateAdvancedSearchObject("NAME", data);
        };

        $scope.searchAddExternalMarking = function(data){
            $scope.updateAdvancedSearchObject("EXTERNAL_MARKING", data);
        };

        $scope.searchAddHomePort = function(data){
            $scope.updateAdvancedSearchObject("HOMEPORT", data);
        };

        $scope.searchAddMMSI = function(data){
            $scope.updateAdvancedSearchObject("MMSI", data);
        };
      
    }
);
