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

    $scope.itemsByPage = 25;
    $scope.displayedMdrCodeList = [];
    $scope.columns = [
        'code',
        'description',
        'startDate',
        'endDate',
        'version'
    ];

    var searchAttrs = [
        'code',
        'description',
        /* 'validityStart',
        'validityEnd', */
        'version'
    ];

    $scope.acronym = acronym;
    var currentTableState;
    var lastTableState;

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
     * Load validity dates in MDR lists
     *
     * @memberof MdrcodelistCtrl
     * @function loadValidityDates
     * @public
     * @param {Array} list - mdr code list
     */
    var loadValidityDates = function(list) {
        angular.forEach(list, function(item){
            if(item.validity){
                item.startDate = item.validity.startDate;
                item.endDate = item.validity.endDate;
            }
            delete item.validity;
        });
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
        var tsServFormat = angular.copy(tableState);
        if(angular.isDefined(tsServFormat.sort) && ['startDate', 'endDate'].indexOf(tsServFormat.sort.predicate) !== -1 ){
            tsServFormat.sort.predicate = 'validity.' + tsServFormat.sort.predicate;
        }

        mdrRestService.getMDRCodeList(acronym, tsServFormat, searchAttrs).then(function (result) {
            if (angular.isDefined(result)) {
                if(!angular.equals($scope.displayedMdrCodeList, result)){
                    loadValidityDates(result);                    
                    $scope.displayedMdrCodeList = result;
                }
            }else{
                $scope.displayedMdrCodeList = [];
            }
            $scope.tableLoading = false;
        });
    };

    $scope.filterChanged = function(tableState){
        currentTableState = tableState;

        if(!angular.isDefined(currentTableState.pagination.number)){
            currentTableState.pagination.number = $scope.itemsByPage;
        }

        var state = angular.copy(tableState);
        delete state.pagination.numberOfPages;
        
        if(!_.isEqual(lastTableState,state)){
            $scope.tableLoading = true;
            if ($scope.requestTimer){
                $timeout.cancel($scope.requestTimer);
            }

            $scope.requestTimer = $timeout(function(){
                $scope.callServer(currentTableState);
                lastTableState = angular.copy(state);
            }, 1500, true, $scope);
        }else{
            $scope.tableLoading = false;
        }
    };

});

