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
angular.module('unionvmsWeb').directive('searchResultsPagination', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            page : '=',
            total : '=',
            callback : '=',
            listSize: '=?',
            showListPage: '=?'

		},
        controller : 'searchResultsPaginationCtrl',
		templateUrl: 'directive/common/searchResultsPagination/searchResultsPagination.html',
		link: function(scope, element, attrs, fn) {
		}
	};
});



angular.module('unionvmsWeb')
    .controller('searchResultsPaginationCtrl', function($scope, $timeout, searchService){

        $scope.inputPage = $scope.page;
        $scope.listSize = searchService.getListRequest().listSize;

        $scope.firstPage = function () {
            $scope.changePage(1);
        };
        $scope.lastPage = function () {
            $scope.changePage($scope.total);
        };

        $scope.prevPage = function () {
            $scope.changePage($scope.page - 1);
        };
        $scope.nextPage = function () {
            $scope.changePage($scope.page + 1);
        };

        $scope.prevPageDisabled = function () {
            return $scope.total === 0 || $scope.page === 1 ? "disabled" : "";
        };

        $scope.nextPageDisabled = function () {
            return $scope.total === 0 || $scope.page === $scope.total ? "disabled" : "";
        };

        var inputChangeCallbackTimeout;
        var handUpTime = 300;
        //Handle change in page input field
        $scope.onInputPageChange = function(){
            $timeout.cancel(inputChangeCallbackTimeout);
            inputChangeCallbackTimeout = $timeout(function(){
                if($scope.inputPage >= 1 && $scope.inputPage <= $scope.total && $scope.inputPage !== $scope.page){
                        $scope.callback($scope.inputPage);
                }else{
                    $scope.inputPage = $scope.page;
                }
            }, 300);
        };

        $scope.changePage = function(page){
            if(page >= 1 && page <= $scope.total && page !== $scope.page){
                //Update models
                $scope.page = page;
                $scope.inputPage = page;

                //Do callback
                if(angular.isDefined($scope.callback)){
                    $scope.callback(page);
                }
            }
        };

        //Update inputPage when page changes
        $scope.$watch("page", function (newValue, oldValue) {
            $scope.inputPage = $scope.page;
        });

        $scope.listSizes= [
            10,
            25,
            50,
            100
        ];
        $scope.onChangeListSize = function() {
            if(angular.isDefined($scope.callback)) {
                // override default page size of 25 records with selected page size
                searchService.getListRequest().listSize = $scope.listSize;
                $scope.callback($scope.page);
            }
        }

});
