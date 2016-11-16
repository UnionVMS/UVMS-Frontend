/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name carouselTile
 * @attr {String} tileTitle - The title of the fieldset tile (the string should be the one used for translating purposes, e.g. 'activity.some_key')
 * @attr {Object} ngModel - The model object containing the data that should be displayed
 * @attr {String} templateUrl - The url of the template to be used in each slide of the carousel
 * @description
 *  A reusable tile that will display a carousel with specified data and angular template
 */
angular.module('unionvmsWeb').directive('carouselTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'CarouselTileCtrl',
		scope: {
		    tileTitle: '@',
		    ngModel: '=',
		    templateUrl: '@'
		},
		templateUrl: 'directive/activity/carouselTile/carouselTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.init();
		}
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CarouselTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @description
 *  The controller for the carouselTile directive ({@link unionvmsWeb.carouselTile})
 */
.controller('CarouselTileCtrl', function($scope, locale){
    /**
     * The initialization function for the directive
     * 
     * @memberof CarouselTileCtrl
     * @public
     * @alias init
     */
    $scope.init = function(){
        for (var i = 0; i < $scope.ngModel.length; i++){
            $scope.ngModel[i].active = false;
            if (i === 0){
                $scope.ngModel[i].active = true;
            }
        }
    };
    
    /**
     * Check if an item is the current active item (the one being displayed in the carousel)
     * 
     * @memberof CarouselTileCtrl
     * @public
     * @alias isItemActive
     * @returns {Boolean} Whether the item is active or not 
     */
    $scope.isItemActive = function(idx){
        return $scope.ngModel[idx].active;
    };
    
    /**
     * Set the active carousel item by index
     * 
     * @memberof CarouselTileCtrl
     * @public
     * @alias setActiveItem
     * @param {Number} idx - The index of the item that should be set to active
     */
    $scope.setActiveItem = function(idx){
        $scope.ngModel[idx].active = true;
   };
});
