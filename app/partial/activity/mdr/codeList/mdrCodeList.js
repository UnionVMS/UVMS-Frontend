/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name MdrcodelistCtrl
 * @param $scope {Service} controller scope
 * @param $modalInstance {Service} angular service modalInstance
 * @param acronym {Service} the MDR code 
 * @param mdrRestService {Service} the mdr REST service <p>{@link unionvmsWeb.mdrRestService}</p>
 * @param $timeout {Service} angular service timeout
 * @description
 *  The controller for the mdr code list
 */
angular.module('unionvmsWeb').controller('MdrcodelistCtrl',function($scope, $modalInstance, acronym, mdrRestService, $timeout){

    $scope.displayedMdrCodeList = [];
    $scope.allColumns = [];
    $scope.acronym = acronym;
    $scope.tableLoading = true;
    $scope.searchFilter = '';
    $scope.tableState = null;

    /**
     * Closes the mdr code list modal
     *
     * @memberof MdrcodelistCtrl
     * @function close
     * @public
     */
    $scope.close = function() {
        $modalInstance.close();
    };

    /**
     * Closes the mdr code list modal
     *
     * @memberof MdrcodelistCtrl
     * @function callServer
     * @public
     * @param {Object} tableState - current state of filters and sorting of table
     */
    $scope.callServer = function(tableState) {
        $scope.tableState = tableState;
        $scope.tableLoading = true;

        mdrRestService.getMDRCodeListByAcronym(acronym, tableState).then(function (result) {
            if (angular.isDefined(result) && result.length > 0 ) {
                $scope.allColumns = _.allKeys(result[0]);
                $scope.displayedMdrCodeList = result;
             }

            $scope.tableLoading = false;
          });
    };

    $scope.$watch('searchFilter', function(newVal, oldVal){
        if (angular.isDefined(newVal) && newVal !== ''){
            $scope.tableLoading = true;
            if ($scope.requestTimer){
                $timeout.cancel($scope.requestTimer);
            }

            $scope.requestTimer = $timeout(function(){
                $scope.tableState.search.predicateObject = newVal;
                $scope.callServer($scope.tableState);
            }, 1500, true, $scope);
        } else {
            $scope.searchFilter = '';
        }
    });
});
