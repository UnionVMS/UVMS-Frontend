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
		    templateUrl: '@',
		    useTopNav: '='
		},
		templateUrl: 'directive/activity/carouselTile/carouselTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.displayTopNav = true;
		    if (angular.isDefined(scope.useTopNav) && !scope.useTopNav){
		        scope.displayTopNav = false;
		    }
		    
            scope.$watch('ngModel',function(newVal){
                if(newVal){
                    scope.init();
                }
            });
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
                //$scope.currentItem = i + 1;
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
   
   /**
    * On slide change callback function to update the current selected item for the paginator
    * 
    * @memberof CarouselTileCtrl
    * @public
    * @param {Number} newSlide - The index of the new selected slide
    */
   $scope.onSlideChanged = function (newSlide) {
       $scope.currentItem = newSlide + 1;
   };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name onCarouselChange
 * @param {Service} $parse - The angular parse service
 * @param {Service} $animate - The angular animate service
 * @description
 *  A directive to intersect the change method of the uib-carousel directive and return the index of the new selected slide
 */
.directive('onCarouselChange', function($parse, $animate){
    return {
        require: '^uibCarousel',
        link: function(scope, element, attrs, carouselCtrl){
            var fn = $parse(attrs.onCarouselChange);
            var origSelect = carouselCtrl.select;
            carouselCtrl.select = function(nextSlide, direction, nextIndex) {
                if (nextSlide !== this.currentSlide) {
                    fn(scope, {newSlide: nextSlide.index});
                    return origSelect.apply(this, arguments);
                }
            }
        }
    };
});

