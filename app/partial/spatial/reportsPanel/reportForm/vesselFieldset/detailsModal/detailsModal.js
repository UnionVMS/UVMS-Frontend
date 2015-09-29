angular.module('unionvmsWeb').controller('DetailsmodalCtrl',function($scope, $modalInstance, $q, $timeout, itemForDetail, vesselRestFactory, vesselRestService, SavedSearchGroup, GetListRequest, datatablesService, DTOptionsBuilder, DTColumnDefBuilder, DTInstances){
    $scope.item = itemForDetail;
    $scope.vesselGroupList = [];
    
    $scope.isLoading = true;
    $scope.hasError = false;
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    
    function rowCallback (nRow, data, idx, idxFull){
        $('td', nRow).unbind('click');
        $('td', nRow).bind('click', function() {
            $(this).parents('tbody').find('td').removeClass('highlightRow');
            $(this).addClass('highlightRow');
            $scope.$apply(function() {
                $scope.clickHandler(data);
            });
        });
        return nRow;
    }
    
    $scope.groupTableInstance = {};
    $scope.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(5)
                                    .withLanguage(datatablesService)
                                    .withOption('rowCallback', rowCallback)
                                    .withDOM('trp')
                                    .withOption('autoWidth', true)
                                    .withBootstrapOptions({
                                        pagination: {
                                            classes: {
                                                ul: 'pagination pagination-sm'
                                            }
                                        }
                                    });
    
    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0).notVisible(),
        DTColumnDefBuilder.newColumnDef(1)
    ];
    
    $scope.clickHandler = function(data){
        $scope.detailedItem = $scope.getVesselByGuid(data[0]);
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

            deferred.resolve(SavedSearchGroup.fromJson(response.data));
        },
        function(error) {
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
            $scope.getVesselsForGroup($scope.item.id).then(function(response){
                var listRequest = new GetListRequest(1, 100000, response.dynamic, response.searchFields);
                vesselRestService.getVesselList(listRequest).then(function(response){
                    $scope.vesselGroupList = response.items;
                    $scope.detailedItem = $scope.vesselGroupList[$scope.vesselGroupList.length - 1];
                    $scope.isLoading = false;
                    $timeout(function(){
                        $scope.groupTableInstance.dataTable.children('tbody').find('td:first').addClass('highlightRow');
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
