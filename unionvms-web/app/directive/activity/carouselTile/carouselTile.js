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
angular.module('unionvmsWeb').directive('carouselTile', function(locale) {
	return {
		restrict: 'E',
		replace: false,
		controller: 'CarouselTileCtrl',
		scope: {
		    tileTitle: '@',
		    ngModel: '=',
		    templateUrl: '@',
            useTopNav: '=',
            noDataMsgLoc: '@'
		},
		templateUrl: 'directive/activity/carouselTile/carouselTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.displayTopNav = true;
		    if (angular.isDefined(scope.useTopNav) && !scope.useTopNav){
		        scope.displayTopNav = false;
            }
            
            if(scope.noDataMsgLoc){
                scope.noDataMsg = locale.getString(scope.noDataMsgLoc);
            }else{
                scope.noDataMsg = locale.getString('activity.no_data');
            }
		}
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CarouselTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @param $timeout {Service} the angular timeout service
 * @description
 *  The controller for the carouselTile directive ({@link unionvmsWeb.carouselTile})
 */
.controller('CarouselTileCtrl', function($scope, locale, $timeout){
    $scope.isLoaded = true;
    $scope.initialized = false;
    $scope.slickConfig = {
        enabled: true,
        autoplay: false,
        draggable: false,
        method: {},
        event: {
            init: function (event, slick) {
                $scope.currentItem = 1;
                $scope.initialized = true;
            },
            afterChange: function(event, slick, currentSlide, nextSlide){
                $scope.currentItem = currentSlide + 1;
            }
        }
    };
    
    $scope.$watch('ngModel', function(newVal){
        if (newVal && $scope.initialized && $scope.isLoaded){
            $scope.isLoaded = false;
            $scope.currentItem = 1;
            $timeout(function () {
                $scope.isLoaded = true;
            }, 5);
        }
    });
    
    /**
     * Check if an item is the current active item (the one being displayed in the carousel)
     * 
     * @memberof CarouselTileCtrl
     * @public
     * @alias isItemActive
     * @returns {Boolean} Whether the item is active or not 
     */
    $scope.isItemActive = function(idx){
        return idx === $scope.currentItem - 1;
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
        $scope.slickConfig.method.slickGoTo(idx);
    };
});

