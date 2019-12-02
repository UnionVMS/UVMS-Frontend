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
angular.module('unionvmsWeb').controller('DetailsmodalCtrl',function($scope, $modalInstance, $q, $timeout, itemForDetail, vesselRestFactory, vesselRestService, SavedSearchGroup, GetListRequest){
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
            if ($scope.vesselGroupList[i].id === id){
                return $scope.vesselGroupList[i];
            }
        }
    };
    
    $scope.getVesselsForGroup = function(groupId){
        var deferred = $q.defer();
        vesselRestFactory.vesselGroup().get({id: groupId}, function(response, header, status) {
            if (status !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(SavedSearchGroup.fromVesselDTO(response));
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
        if ($scope.item.type === 'asset'){
            vesselRestService.getVesselByIdAtDate($scope.item.id, $scope.item.positionTime).then(
                function(response){
                    $scope.detailedItem = response;
                    $scope.isLoading = false;
                },
                function(error){
                    $scope.hasError = true;
                    $scope.isLoading = false;
                });
        } else {
            $scope.getVesselsForGroup($scope.item.id).then(function(response){
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

