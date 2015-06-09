angular.module('unionvmsWeb')
    .controller('AdvancedSearchVesselFormCtrl', function($scope, $modal, searchService, savedSearchService){

        $scope.advancedSearch = false;
        $scope.selectedVesselGroup = "";

        //Dummy values for dropdowns
        $scope.flagStates =[{'text':'SWE','code':'SWE'},{'text':'DNK','code':'DNK'},{'text':'NOR','code':'NOR'}];
        $scope.vesselTypes =[{'text':'Fishing Vessel','code':'Fishing Vessel'},{'text':'Pilot Vessel','code':'Pilot Vessel'},{'text':'Trawling Vessel','code':'Trawling Vessel'}];
        $scope.licenseTypes =[{'text':'Fishing license','code':'Fishing license'},{'text':'Trawling license','code':'Trawling license'}];
        $scope.activeTypes = [{'text':'Yes','code':'true'},{'text':'No','code':'false'}];
        $scope.types = [{'text':'Vessel','code':'vessel'}];

        //Reset all search fields
        var resetSearchFields = function(){
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(false);
        };

        //On click on the reset link
        $scope.resetSearch = function(){
            $scope.selectedVesselGroup = "";
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(true);
        };

        $scope.toggleAdvancedSearch = function(){
            $scope.advancedSearch = !$scope.advancedSearch;
            resetSearchFields();
        };

        $scope.performSearch = function(){
            $scope.selectedVesselGroup = "";
            if($scope.advancedSearch){
                $scope.performAdvancedSearch();
            }else{
                performFreeTextSearch();
            }
        };

        //Search by the text input field
        var performFreeTextSearch = function(){
            console.log("performFreeTextSearch");
            searchService.resetPage();
            searchService.resetSearchCriterias();
            searchService.setDynamic(false);
            var searchValue = $scope.freeText +"*";
            searchService.addSearchCriteria("NAME", searchValue);
            searchService.addSearchCriteria("CFR", searchValue);
            searchService.addSearchCriteria("IRCS", searchValue);

            //Do the search
            $scope.searchfunc();
        };

        $scope.performSavedSearch = function(savedSearchGroup){  
            //Check if advanced search should be shown or hidden
            var toggleAdvancedSearch = true;
            $.each(savedSearchGroup.searchFields, function(key, searchField){
                if(searchField.key === 'GUID'){
                    toggleAdvancedSearch = false;
                    return false;
                }
            });

            //Show or hide advanced search
            $scope.advancedSearch = toggleAdvancedSearch;            
            resetSearchFields();
            $scope.performSavedGroupSearch(savedSearchGroup, true);
        };

        $scope.openSaveGroupModal = function(){
            savedSearchService.openSaveSearchModal("VESSEL", true);        
        };    
      
    }
);
