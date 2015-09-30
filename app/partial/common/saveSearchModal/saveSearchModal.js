
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('unionvmsWeb').controller('SaveSearchModalInstanceCtrl', function ($scope, $modalInstance, locale, searchService, SearchField, SavedSearchGroup, savedSearchService, searchType, selectedItems, dynamicSearch, userService) {

    var isDynamic = false,
        searchFields,
        saveSearchFunction,
        updateSearchFunction;

    var init = function(){
        $scope.error = false;
        $scope.allowSaving = true;
        $scope.saveData = {
            name : undefined,
            existingGroup : undefined
        };

        //Set texts, items, and save/update functions depending on the searchType
        switch(searchType) {
            case "VESSEL":
                $scope.existingGroups = savedSearchService.getVesselGroupsForUser();
                saveSearchFunction = savedSearchService.createNewVesselGroup;
                updateSearchFunction = savedSearchService.updateVesselGroup;
                $scope.modalHeader = locale.getString('vessel.save_group');
                $scope.inputPlaceholder = locale.getString('vessel.save_group_input_placeholder');
                $scope.dropdownHeader = locale.getString('vessel.save_as_the_following_group');
                $scope.dropdownLabel = locale.getString('vessel.select_a_group');
                $scope.errorMessage = locale.getString('vessel.save_group_error');
                break;
            case "MOVEMENT":
                $scope.existingGroups = savedSearchService.getMovementSearches();
                saveSearchFunction = savedSearchService.createNewMovementSearch;
                updateSearchFunction = savedSearchService.updateMovementSearch;
                $scope.modalHeader = locale.getString('movement.save_search_modal_header');
                $scope.inputPlaceholder = locale.getString('movement.save_search_modal_input_placeholder');
                $scope.dropdownHeader = locale.getString('movement.save_search_modal_dropdown_header');
                $scope.dropdownLabel = locale.getString('movement.save_search_modal_dropdown_label');
                $scope.errorMessage = locale.getString('movement.save_search_modal_error');
                break;
            default:
                console.error("Search type is missing for save search modal.");
        }

        //Create list of searchFields and set isDynamic flag
        if(dynamicSearch) {
            isDynamic = true;
            searchFields = searchService.getAdvancedSearchCriterias();
        }else{
            searchFields = [];
            //LIST OF CHECKED ITEMS
            if(searchType === "VESSEL"){
                $.each(selectedItems, function(key, vessel){
                    searchFields.push(new SearchField(vessel.vesselId.type, vessel.vesselId.value));
                });
            }
        }

        //Show error message if search criterias is empty
        if(searchFields.length === 0){
            $scope.errorMessage = locale.getString('common.saved_search_no_criterias_error');
            $scope.allowSaving = false;
            $scope.error = true;
        }
    };

    $scope.contains = function(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].name === obj) {
                return true;
            }
        }
        return false;
    };



    //Ok to save?
    $scope.isValidSaveData = function(){
        return angular.isDefined($scope.saveData.name) || angular.isDefined($scope.saveData.existingGroup);
    };

    //Save to existing group
    $scope.setExistingGroupAsSaveTarget = function(group){
        $scope.saveData.existingGroup = group;
        $scope.saveData.name = undefined;
    };

    //Unset save to existing group
    $scope.unsetExistingGroupAsSaveTarget = function(){
        $scope.saveData.existingGroup = undefined;
    };

    var onSaveSuccess = function(response){
        $modalInstance.close();
    };

    var onSaveError = function(response){
        //Nothing
        console.error("Error saving search");
        $scope.error = true;
    };

    //Save or update a search
    $scope.saveSearch = function () {
        //Update existing group
        if(angular.isDefined($scope.saveData.existingGroup)){
            $scope.saveData.existingGroup.dynamic = isDynamic;
            $scope.saveData.existingGroup.searchFields = searchFields;

            updateSearchFunction($scope.saveData.existingGroup)
               .then(onSaveSuccess, onSaveError);
        }
        //Save new group
        else{
            var newSavedGroup = new SavedSearchGroup($scope.saveData.name, userService.getUserName(), isDynamic, searchFields);
                //Check if name of group already exists.
            if(!$scope.contains($scope.existingGroups,$scope.saveData.name)){
                saveSearchFunction(newSavedGroup).then(onSaveSuccess, onSaveError);
            } else {
                $scope.errorMessage = locale.getString('common.saved_search_group_exists');
                $scope.error = true;
            }
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    init();
});
