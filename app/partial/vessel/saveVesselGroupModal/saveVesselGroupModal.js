
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('unionvmsWeb').controller('SaveVesselGroupModalInstanceCtrl', function ($scope, $modalInstance, vesselRestService, searchService, SearchField, SavedSearchGroup, selectedVessels, advancedSearchClicked, savedVesselGroupService) {

  $scope.existingGroups = savedVesselGroupService.getVesselGroupsForUser();
  $scope.saveData = {
    name : undefined,
    existingGroup : undefined
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
  };

  //Save or update vessel group
  $scope.saveVesselGroup = function () {
      var isDynamic = false,
        searchFields;
      if(advancedSearchClicked) {
          isDynamic = true;
          searchFields = searchService.getAdvancedSearchCriterias();
      }else{
            searchFields = [];
            $.each(selectedVessels, function(key, value){
                searchFields.push(new SearchField("INTERNAL_ID", value));
            });
      }

    //Update existing group
    if(angular.isDefined($scope.saveData.existingGroup)){
        $scope.saveData.existingGroup.dynamic = isDynamic;
        $scope.saveData.existingGroup.searchFields = searchFields;
        
        savedVesselGroupService.updateVesselGroup($scope.saveData.existingGroup)
        .then(onSaveSuccess, onSaveError);
    }
    //Save new group
    else{
        var newSavedGroup = new SavedSearchGroup($scope.saveData.name, "", isDynamic, searchFields);
        
        savedVesselGroupService.createNewVesselGroup(newSavedGroup)
        .then(onSaveSuccess, onSaveError);
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});
