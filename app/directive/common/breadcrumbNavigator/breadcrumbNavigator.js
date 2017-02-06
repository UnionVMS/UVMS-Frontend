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
 * @ngdoc directive
 * @name breadcrumbNavigator
 * @attr {Array} items - An array containing the items that should be used for the breadcrumbs and their visibility status
 * @attr {Function} [callback] - An optional callback function to be used on breadcrumb item click 
 * @description
 *  A generic breadcrumb navigator that can change the visibility status of partials through a configuration object that is coming from the parent scope 
 */
angular.module('unionvmsWeb').directive('breadcrumbNavigator', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    items: "=",
		    callback: "&"
		},
		templateUrl: 'directive/common/breadcrumbNavigator/breadcrumbNavigator.html',
		controller: 'BreadcrumbnavigatorCtrl'
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name BreadcrumbnavigatorCtrl
 * @param $scope {Service} The controller scope
 * @param breadcrumbService {Service} The breadcrumb service <p>{@link unionvmsWeb.breadcrumbService}</p>
 * @attr items {Array} - An array containing the items that should be used for the breadcrumbs and their visibility status
 * @attr activeItemIdx {Number} - The index of the active item in the breadcrumb (the one that is currently visible)
 * @attr visibleItemsIdx {Array} - An array containing the indexes of all breadcrumb pages that should be displayed during the navigation
 * @attr itemsToBeCleared {Array} - An array containing the indexes of all items that should have their data containers cleared out 
 * @description
 *  The controller for the breadcrumb navigator directive ({@link unionvmsWeb.breadcrumbNavigator})
 */
.controller('BreadcrumbnavigatorCtrl', ['$scope', 'breadcrumbService', function($scope, breadcrumbService){
    $scope.activeItemIdx = 0;
    $scope.visibleItemsIdx = [0];
    $scope.itemsToBeCleared = [];
    
    /**
     * Check if a breadcrumb page item should be visible in the brecrumb navigator
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias isItemVisible
     * @returns {Boolean} Whether the item is visible or not
     */
    $scope.isItemVisible = function(idx){
        var visible = false;
        if (_.indexOf($scope.visibleItemsIdx, idx) !== -1){
            visible = true;
        }
        return visible;
    };
    
    /**
     * Function that is fired when a breadcrumb's item is clicked
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias handleClick
     * @param {Number} idx - The index of the breadcrumb's clicked item 
     */
    $scope.handleClick = function(idx){
        $scope.itemsToBeCleared = $scope.visibleItemsIdx.slice(_.indexOf($scope.visibleItemsIdx, idx) + 1, $scope.visibleItemsIdx.length); 
        
        $scope.visibleItemsIdx = $scope.visibleItemsIdx.slice(0, _.indexOf($scope.visibleItemsIdx, idx) + 1);
        $scope.items[$scope.activeItemIdx].visible = false;
        $scope.items[idx].visible = true;
        $scope.activeItemIdx = idx;
        
        if (angular.isDefined($scope.callback)){
            $scope.callback();
        }
    };
    
    /**
     * Go to breadcrumbs item by index. This function is accessible through the breadcrumb service ({@link unionvmsWeb.breadcrumbService})
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias goToItem
     * @param {Number} idx - The index of the breadcrumb's item to go to 
     */
    $scope.goToItem = function(idx){
        $scope.visibleItemsIdx.push(idx);
        $scope.items[$scope.activeItemIdx].visible = false;
        $scope.items[idx].visible = true;
        $scope.activeItemIdx = idx;
    };
    breadcrumbService.registerFn('goToItem', $scope.goToItem);
    
    /**
     * Get the index of the current and active breadcrumb item. This function is accessible through the breadcrumb service ({@link unionvmsWeb.breadcrumbService})
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias getActiveItemIdx
     * @returns {Number} The index of the active breadcrumb
     */
    $scope.getActiveItemIdx = function(){
        return $scope.activeItemIdx;
    };
    breadcrumbService.registerFn('getActiveItemIdx', $scope.getActiveItemIdx);
    
    /**
     * Get an array containing the breadcrumb pages index of which data containers should be cleared out
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias getItemsToBeCleared
     * @returns {Array} An array containing the index of the items that should be cleared
     */
    $scope.getItemsToBeCleared = function(){
        return $scope.itemsToBeCleared;
    };
    breadcrumbService.registerFn('getItemsToBeCleared', $scope.getItemsToBeCleared);
    
    $scope.$on('destroy', function(){
        breadcrumbService.unRegisterFn('goToItem');
        breadcrumbService.unRegisterFn('getActiveItemIdx');
        breadcrumbService.unRegisterFn('getItemsToBeCleared');
    });
}])
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name breadcrumbService
 * @description
 *  A service that exposes some functions of the breadcrumbNavigator's controller.
 */
.factory('breadcrumbService', function(){
    var service = {
        /**
         * Register a new function within the service
         * 
         * @memberof breadcrumbService
         * @public
         * @param {String} name - The name of the function that will be registered in the service
         * @param {Function} fn -  The function that should be registered in the service
         */
        registerFn: function(name, fn){
            service[name] = fn;
        },
        /**
         * Unregister a function from the service
         * 
         * @memberof breadcrumbService
         * @public
         * @param {String} name - The name of the function that will be unregistered from the service
         */
        unRegisterFn: function(name){
            delete service[name];
        }
    };
    
    return service;
});

