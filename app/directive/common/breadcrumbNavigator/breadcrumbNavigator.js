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
 * @attr activeItemIdx {Number} - The index of the last displayed item in the breadcrumb (the one that is currently visible)
 * @description
 *  The controller for the breadcrumb navigator directive ({@link unionvmsWeb.breadcrumbNavigator})
 */
.controller('BreadcrumbnavigatorCtrl', ['$scope', 'breadcrumbService', function($scope, breadcrumbService){
    $scope.activeItemIdx = 0;
    
    /**
     * Function that is fired when a breadcrumb's item is clicked
     * 
     * @memberof BreadcrumbnavigatorCtrl
     * @public
     * @alias handleClick
     * @param {Number} idx - The index of the breadcrumb's clicked item 
     */
    $scope.handleClick = function(idx){
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
    
    $scope.$on('destroy', function(){
        breadcrumbService.unRegisterFn('goToItem');
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
