angular.module('unionvmsWeb')
    .controller('AdvancedSearchVesselFormCtrl', function($scope, $modal, searchService, savedSearchService, configurationService, vesselValidationService, locale){

        $scope.advancedSearch = false;
        $scope.selectedVesselGroup = undefined;

        //Validation
        $scope.mmsiRegExp = vesselValidationService.getMMSIPattern();
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };

        var init = function(){
            //Setup dropdowns
            $scope.flagStates = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
            $scope.gearTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'GEAR_TYPE'), 'GEAR_TYPE','VESSEL', true);
            $scope.assetTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'ASSET_TYPE'),'ASSET_TYPE','VESSEL', true);
            $scope.powerSpans = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_POWER_MAIN'));
            $scope.lengthSpans = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_LENGTH_LOA'));

            //TODO: Need this from backend?
            $scope.activeTypes = [{'text':'Yes','code':'true'},{'text':'No','code':'false'}];
        };

        //Reset all search fields
        var resetSearchFields = function(){
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(false);
        };

        //On click on the reset link
        $scope.resetSearch = function(){
            $scope.resetSelectedVesselGroup();
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(true);
        };

        //Reset the saved search dropdown
        $scope.resetSelectedVesselGroup = function(){
            $scope.selectedVesselGroup = undefined;
        };

        $scope.toggleAdvancedSearch = function(){
            $scope.advancedSearch = !$scope.advancedSearch;
            resetSearchFields();
        };

        $scope.performSearch = function(){
            $scope.resetSelectedVesselGroup();
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
                var searchValue = $scope.freeText;
                searchService.addSearchCriteria("NAME", searchValue);
                searchService.addSearchCriteria("CFR", searchValue);
                searchService.addSearchCriteria("IRCS", searchValue);
            }
            if(typeof $scope.ASSET_TYPE === 'string' && $scope.ASSET_TYPE.trim().length > 0){
                searchService.addSearchCriteria("ASSET_TYPE", $scope.ASSET_TYPE);
            }

            //Do the search
            $scope.searchfunc();
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            //Inital text selected?
            if(angular.isUndefined(savedSearchGroup.searchFields)){
                return;
            }

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
            $scope.performSavedGroupSearch(savedSearchGroup, true, true);
        };

        $scope.openSaveGroupModal = function(){
            var options = {
                dynamicSearch : true,
            };
            savedSearchService.openSaveSearchModal("VESSEL", options);
        };

        init();
    }
);
