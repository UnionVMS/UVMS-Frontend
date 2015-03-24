
// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

angular.module('unionvmsWeb').controller('SaveVesselGroupModalInstanceCtrl', function ($scope, $modalInstance, savedsearches, advancedSearch, vesselGroups) {

  $scope.existingGroups = vesselGroups;
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
    console.log("Save successful");
    $modalInstance.close();
  };

  var onSaveError = function(response){
    console.log("Save error");
  };

  //Save or update vessel group
  $scope.saveVesselGroup = function () {
    console.log("Save vessel group");
    console.log($scope.saveData);
    console.log(advancedSearch);
    //Update existing group
    if(angular.isDefined($scope.saveData.existingGroup)){
      console.log("Update vessel group with id: " +$scope.saveData.existingGroup);
      savedsearches.updateVesselGroup($scope.saveData.existingGroup.id, advancedSearch)
        .then(onSaveSuccess, onSaveError);
    }
    //Save new group
    else{
      console.log("Save to new group");
      savedsearches.createNewVesselGroup($scope.saveData.name, advancedSearch)
        .then(onSaveSuccess, onSaveError);
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});    