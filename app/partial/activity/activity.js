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
 * @name ActivityCtrl
 * @param $scope {Service} controller scope
 * @param locale {Service} angular locale service
 * @param activityService {Service} the activity service <p>{@link unionvmsWeb.activityService}</p>
 * @param breadcrumbService {Service} the breadcrumb service <p>{@link unionvmsWeb.breadcrumbService}</p>
 * @description
 *  The controller for the activity tab  
 */
angular.module('unionvmsWeb').controller('ActivityCtrl',function($scope, locale, activityService, breadcrumbService){
    $scope.actServ = activityService;
    
    /**
     * Check if partial should be visible according to the breadcrumbPages item status
     * 
     * @memberof ActivityCtrl
     * @public
     * @alias isPartialVisible
     * @param {Number} idx - The index of the item that will be checked
     * @retuns {Boolean} Whether the item is visible or not
     */
    $scope.isPartialVisible = function(idx){
        return $scope.actServ.breadcrumbPages[idx].visible;
    };
    
    /**
     * Make a certain partial visible using the breadcrumbPages array
     * 
     *  @memberof ActivityCtrl
     *  @public
     *  @alias goToView
     *  @param {Number} idx - The index of the item that should be made visible
     */
    $scope.goToView = function(idx){
        breadcrumbService.goToItem(idx);
    };
    
    /**
     * A callback function passed into the breadcrumb directive that will clean data objects upon breadcrumb click
     * 
     * @memberof ActivityCtrl
     * @public
     * @alias breadcrumbClick
     */
    $scope.breadcrumbClick = function(){
        var idxToBeCleared = breadcrumbService.getItemsToBeCleared();
        angular.forEach(idxToBeCleared, function(idx) {
            $scope.actServ.clearAttributeByType($scope.actServ.breadcrumbPages[idx].type)
        });
        
        if (breadcrumbService.getActiveItemIdx() === 0){
            $scope.actServ.clearAttributeByType('overview');
        }
    };
});
