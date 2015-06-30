angular.module('unionvmsWeb')
    .controller('AdvancedSearchVesselFormCtrl', function($scope, $modal, searchService, savedSearchService, configurationService, locale){

        $scope.advancedSearch = false;
        $scope.selectedVesselGroup = "";

        var init = function(){
            setUpPage();
        };
        
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
            //Add search criterias
            if(typeof $scope.freeText === 'string' && $scope.freeText.trim().length > 0){
                var searchValue = $scope.freeText +"*";
                searchService.addSearchCriteria("NAME", searchValue);
                searchService.addSearchCriteria("CFR", searchValue);
                searchService.addSearchCriteria("IRCS", searchValue);
            }

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

        var onGetValuesSuccess = function(response){
            
            $scope.flagStates = setTextAndCodeForDropDown(response.FLAG_STATE);
            $scope.licenseTypes = setTextAndCodeForDropDown(response.LICENSE_TYPE);
            $scope.vesselTypes = setTextAndCodeForDropDown(response.VESSEL_TYPE);
            $scope.types = setTextAndCodeForDropDown(response.ASSET_TYPE);
            
            //TODO: Need this from backend?
            $scope.activeTypes = [{'text':'Yes','code':'true'},{'text':'No','code':'false'}];
        };
        
        var onGetValuesFailure = function(error){
            console.log("error");
        };

         var setUpPage = function(){
            //Get values for dropdowns
            configurationService.getConfigForVessel().then(
                onGetValuesSuccess, onGetValuesFailure);
        };

        var setTextAndCodeForDropDown = function(valueToSet){
            var valueList = [];
            _.find(valueToSet, 
                function(val){
                    valueList.push({'text': translateTextForDropdowns(val), 'code': val});
                });
            return valueList;
        };

        var translateTextForDropdowns = function(textToTranslate){
            return locale.getString('config.' + textToTranslate);
        };

        init();
    }
);
