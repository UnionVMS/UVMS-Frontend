angular.module('unionvmsWeb').directive('advancedSearch', function() {
	return {
		restrict: 'E',
		replace: true,
		controller: 'AdvancedSearchCtrl',
		templateUrl: 'directive/vessel/advancedSearch/advancedSearch.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});

angular.module('unionvmsWeb')
	.controller('AdvancedSearchCtrl', function($scope, $modal){

		$scope.openSaveGroupModal = function(){
			var modalInstance = $modal.open({
			  templateUrl: 'partial/vessel/saveVesselGroupModal/saveVesselGroupModal.html',
			  controller: 'SaveVesselGroupModalInstanceCtrl',
			  windowClass : "saveVesselGroupModal",
			  size: "small",
			  resolve: {
                  searchObj: function () {
				  return $scope.searchObj;
				},
				vesselGroups: function(){
					return $scope.vesselGroups;
				},
                  advancedSearchClicked: function(){
                    return true;
                }
			  }
			});

			modalInstance.result.then(function () {
			  //Get updated list of vessel groups
			  $scope.getVesselGroupsForUser();
			}, function () {
			  //Nothing on cancel
			});
		};


});
