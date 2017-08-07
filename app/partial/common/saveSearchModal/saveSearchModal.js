/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('unionvmsWeb').controller('SaveSearchModalInstanceCtrl', function ($scope, $modalInstance, locale, searchService, SearchField, SavedSearchGroup, savedSearchService, searchType, options, userService, alertService, salesSearchService) {

    $scope.waitingForCreateResponse = false;

    var isDynamic = false,
        searchFields,
        saveSearchFunction,
        updateSearchFunction,
        skipSearchCriteriaKeys;

    var init = function(){
        $scope.error = false;
        $scope.allowSaving = true;
        $scope.append = options.append;
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
                $scope.dropdownHeader = options.append ? locale.getString('vessel.update_the_following_group') : locale.getString('vessel.save_as_the_following_group');
                $scope.dropdownLabel = locale.getString('vessel.select_a_group');
                $scope.errorMessage = locale.getString('vessel.save_group_error');
                $scope.saveSuccessMessage = locale.getString('vessel.save_group_create_success');
                $scope.updateSuccessMessage = locale.getString('vessel.save_group_updated_success');
                $scope.savedSearchNameAlreadyExistsMessage = locale.getString('vessel.save_group_name_exists');
                skipSearchCriteriaKeys = [];
                break;
            case "MOVEMENT":
                $scope.existingGroups = savedSearchService.getMovementSearches();
                saveSearchFunction = savedSearchService.createNewMovementSearch;
                updateSearchFunction = savedSearchService.updateMovementSearch;
                $scope.modalHeader = locale.getString('movement.save_search_modal_header');
                $scope.inputPlaceholder = locale.getString('movement.save_search_modal_input_placeholder');
                $scope.dropdownHeader = options.append ? locale.getString('movement.update_search_modal_dropdown_header') : locale.getString('movement.save_search_modal_dropdown_header');
                $scope.dropdownLabel = locale.getString('movement.save_search_modal_dropdown_label');
                $scope.errorMessage = locale.getString('movement.save_search_modal_error');
                $scope.saveSuccessMessage = locale.getString('common.saved_search_create_success');
                $scope.updateSuccessMessage = locale.getString('common.saved_search_updated_success');
                $scope.savedSearchNameAlreadyExistsMessage = locale.getString('common.saved_search_group_exists');
                skipSearchCriteriaKeys = ['ASSET_GROUP'];
                break;
            case "SALES":
                $scope.existingGroups = salesSearchService.getSavedSearches();
                saveSearchFunction = salesSearchService.createNewSavedSearch;
                updateSearchFunction = salesSearchService.updateSavedSearch;
                $scope.modalHeader = locale.getString('sales.save_search_modal_header');
                $scope.inputPlaceholder = locale.getString('sales.save_search_modal_input_placeholder');
                $scope.dropdownHeader = locale.getString('sales.save_search_modal_dropdown_header');
                $scope.dropdownLabel = locale.getString('sales.save_search_modal_dropdown_label');
                $scope.errorMessage = locale.getString('sales.save_search_modal_error');
                $scope.saveSuccessMessage = locale.getString('common.saved_search_create_success');
                $scope.updateSuccessMessage = locale.getString('common.saved_search_updated_success');
                $scope.savedSearchNameAlreadyExistsMessage = locale.getString('common.saved_search_group_exists');
                break;
            default:
                console.error("Unknown search for save search modal. Search type is " + searchType);
        }

        isDynamic = !!options.dynamicSearch;
        if (!isDynamic && searchType === 'VESSEL') {
            // Non-dynamic (simple) vessel search only saves IDs
            searchFields = getVesselIdSearchFields(options.selectedItems);
        }
        else {
            // Dynamic search and non-dynamic, non-vessel search save set of criterias.
            searchFields = searchService.getAdvancedSearchCriterias(skipSearchCriteriaKeys);
        }

        //Any extra search fields to add?
        if(angular.isDefined(options.extraSearchFields)){
            $.each(options.extraSearchFields, function(index, searchField){
                searchFields.push(searchField);
            });
        }

        //Show error message if search criterias is empty
        if(searchFields.length === 0){
            $scope.errorMessage = locale.getString('common.saved_search_no_criterias_error');
            $scope.allowSaving = false;
            $scope.error = true;
        }
    };

    function getVesselIdSearchFields(vessels) {
        if (!angular.isArray(vessels)) {
            return [];
        }

        return vessels.map(function(vessel) {
            return new SearchField(vessel.vesselId.type, vessel.vesselId.value);
        });
    }

    $scope.contains = function(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].name.toLowerCase() === obj.toLowerCase()) {
                return true;
            }
        }
        return false;
    };



    //Ok to save?
    $scope.isValidSaveData = function(){
        if (options.append) {
            return angular.isDefined($scope.saveData.existingGroup);
        }
        else {
            return (angular.isDefined($scope.saveData.name) && $scope.saveData.name.trim().length > 0) || angular.isDefined($scope.saveData.existingGroup);
        }
    };

    function groupContains(group, searchField) {
        for (var i = 0; i < group.searchFields.length; i++) {
            if (group.searchFields[i].key === searchField.key && group.searchFields.value === searchField.value) {
                return true;
            }
        }

        return false;
    }

    //Save to existing group
    $scope.setExistingGroupAsSaveTarget = function(group){
        group = group.copy();
        group.dynamic = isDynamic;
        if (options.append) {
            $.each(searchFields, function(i, searchField) {
                if (!groupContains(group, searchField)) {
                    group.searchFields.push(searchField);
                }
            });
        } else {
            group.searchFields = searchFields;
        }

        $scope.saveData.existingGroup = group;
        $scope.saveData.name = undefined;
    };

    //Unset save to existing group
    $scope.unsetExistingGroupAsSaveTarget = function(){
        $scope.saveData.existingGroup = undefined;
    };

    var onSaveSuccess = function(response){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout($scope.saveSuccessMessage);
        $modalInstance.close();
    };

    var onUpdateSuccess = function(response){
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout($scope.updateSuccessMessage);
        $modalInstance.close();
    };

    var onSaveError = function(response){
        $scope.waitingForCreateResponse = false;
        console.error("Error saving search");
        $scope.error = true;
    };

    //Save or update a search
    $scope.saveSearch = function () {
        $scope.error = false;
        //Update existing group
        if(angular.isDefined($scope.saveData.existingGroup)){
            $scope.waitingForCreateResponse = true;
            updateSearchFunction($scope.saveData.existingGroup)
               .then(onUpdateSuccess, onSaveError);
        }
        //Save new group
        else{
            var newSavedGroup = new SavedSearchGroup($scope.saveData.name, userService.getUserName(), isDynamic, searchFields);
            //Trim the new name
            $scope.saveData.name = $scope.saveData.name.trim();
            //Check if name of group already exists.
            if(!$scope.contains($scope.existingGroups,$scope.saveData.name)){
                $scope.waitingForCreateResponse = true;
                saveSearchFunction(newSavedGroup).then(onSaveSuccess, onSaveError);
            } else {
                $scope.errorMessage = $scope.savedSearchNameAlreadyExistsMessage;
                $scope.error = true;
            }
        }
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    init();
});
