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
 * @param mdrCacheService {Service} The MDR cache service <p>{@link unionvmsWeb.mdrCacheService}</p>
 * @description
 *  The controller for the activity tab  
 */
angular.module('unionvmsWeb').controller('ActivityCtrl', function ($scope, locale, activityService, genericMapService, breadcrumbService,Trip, mdrCacheService,tripSummaryService) {
    $scope.actServ = activityService;
    $scope.tripSummServ = tripSummaryService;
    $scope.selectedTab = 'ACTIVITES';
    $scope.tripSummServ.resetMapConfigs();
    if (mdrCacheService.isListAvailableLocally('FLUX_GP_PURPOSE') === false) {
        $scope.actServ.isGettingMdrCodes = true;
    }

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
            $scope.actServ.clearAttributeByType($scope.actServ.breadcrumbPages[idx].type);
        });

        if (breadcrumbService.getActiveItemIdx() === 0){
            $scope.actServ.clearAttributeByType('overview');
        }
    };

    /**
      * sets visible variable of selected tab to true
      * 
      *  @memberof ActivityCtrl
      *  @public
      *  @alias isTabSelected
      *  @param {Number} tab - selected tab
      */
     $scope.isTabVisible = function (tab) {
         var visible = true;
         return visible;
     };

     /**
      * selects the tab
      * 
      *  @memberof ActivityCtrl
      *  @public
      *  @alias selectTab
      *  @param {Number} tab - selected tab
      */
     $scope.selectTab = function (tab) {
         $scope.selectedTab = tab;
     };
     
     /**
      * Displays the selected tab 
      * 
      *  @memberof ActivityCtrl
      *  @public
      *  @alias isTabSelected
      *  @param {Number} tab - Displays the selected tab
      */
     $scope.isTabSelected = function(tab){
        return $scope.selectedTab === tab;
     };
   
   
    /**
      * Creates a tab view with activites and trips tabs
      * 
      * @memberof ActivityCtrl
      * @public
      * @alias setActivityTabs
      */
     var setActivityTabs = function () {
        var tabs = [{
            'tab': 'ACTIVITES',
            'title': locale.getString('activity.tab_activities')
        }, {
            'tab': 'TRIPS',
            'title': locale.getString('activity.tab_trips')
        }];

        return tabs;
     };
      /**
     * Sets map configs in trip summary service
     * 
     * @memberof TripspanelCtrl
     * @private
     */
    var setTripSumServiceMapConfigs = function () {
        $scope.tripSummServ.mapConfigs = angular.copy(genericMapService.mapBasicConfigs);
    };

    genericMapService.setMapBasicConfigs(setTripSumServiceMapConfigs);
      // function of trip summary service to open new trip
      $scope.tripSummServ.initializeTrip = function (tripId) {
        if (angular.isDefined(tripId)) {
            $scope.tripSummServ.trip = new Trip(tripId);
            $scope.trip = $scope.tripSummServ.trip;
        }
      };
    
      /**
	   * Initializes the ActivityCtrl
	   * 
	   * @memberof ActivityCtrl
	   * @private
	   */
      var init = function(){
         $scope.activityTabMenu = setActivityTabs();
      };
    
      init();
});
