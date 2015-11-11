angular.module('unionvmsWeb').controller('DetailsmodalCtrl',function($scope, $modalInstance, $q, $timeout, itemForDetail, vesselRestFactory, vesselRestService, SavedSearchGroup, GetListRequest, datatablesService, DTOptionsBuilder, DTColumnDefBuilder, DTInstances){
    $scope.item = itemForDetail;
    $scope.vesselGroupList = [];
    
    $scope.isLoading = true;
    $scope.hasError = false;
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.vesselsByPage = 5;
    
    $scope.clickHandler = function(data){
    	$scope.detailedItem = $scope.getVesselByGuid(data);
    };
    
    $scope.getVesselByGuid = function(id){
        for (var i = 0; i < $scope.vesselGroupList.length; i++){
            if ($scope.vesselGroupList[i].vesselId.guid === id){
                return $scope.vesselGroupList[i];
            }
        }
    };
    
    $scope.getVesselsForGroup = function(groupId){
        var deferred = $q.defer();
        vesselRestFactory.vesselGroup().get({id: groupId}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(SavedSearchGroup.fromVesselDTO(response.data));
        },
        function(error) {
            console.log('error was here');
            console.error("Error when trying to get a vessel group");
            console.error(error);
            deferred.reject(error);
        });

        return deferred.promise;
    };
    
    var init = function(){
        if ($scope.item.type === 'vessel'){
            vesselRestService.getVessel($scope.item.guid).then(
                function(response){
                    $scope.detailedItem = response;
                    $scope.isLoading = false;
                },
                function(error){
                    $scope.hasError = true;
                    $scope.isLoading = false;
                });
        } else {
            $scope.getVesselsForGroup($scope.item.guid).then(function(response){
                var listRequest = new GetListRequest(1, 100000, response.dynamic, response.searchFields);
                vesselRestService.getVesselList(listRequest).then(function(response){
                    $scope.vesselGroupList = response.items;
                    $scope.displayedRecords = [].concat($scope.vesselGroupList);
                    $scope.isLoading = false;
                    $timeout(function(){
                    	angular.element('[st-safe-src="vesselGroupList"] tbody > tr:first-child').trigger('click');
                    }, 100);
                }, function(error){
                    $scope.hasError = true;
                    $scope.isLoading = false;
                });
            }, function(error){
                $scope.hasError = true;
                $scope.isLoading = false;
            });
        }
    };
    
    init();
});
