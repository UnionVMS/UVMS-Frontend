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
     * Sets map configs in trip summary service
     *
     * @memberof TripspanelCtrl
     * @private
     */
    var setTripSumServiceMapConfigs = function () {
        $scope.tripSummServ.mapConfigs = angular.copy(genericMapService.mapBasicConfigs);
    };

    /**
     * Get the proper match between client and server side attributes in order to properly set the field and order to request FA reports
     *
     * @memberof TripspanelCtrl
     * @private
     * @param {String} tablePredicate - The name of the attribute in the client side
     * @returns {String} The name of the attribute in the server side
     */
    function getTruePredicate(tablePredicate){
        var predicateMapping = {
            activityType: 'ACTIVITY_TYPE',
            purposeCode: 'PURPOSE',
            occurrence: 'OCCURRENCE',
            startDate: 'PERIOD_START',
            endDate: 'PERIOD_END',
            FAReportType: 'REPORT_TYPE',
            dataSource: 'SOURCE',
            firstFishingActivityDateTime: 'PERIOD_START',
            lastFishingActivityDateTime: 'PERIOD_END_TRIP',
            flagState: 'FLAG_STATE',
            extMark: 'EXT_MARK',
            IRCS: 'IRCS',
            CFR: 'CFR',
            UVI: 'UVI',
            ICCAT: 'ICCAT',
            GFCM: 'GFCM',
            firstFishingActivity: 'FIRST_FISHING_ACTIVITY',
            lastFishingActivity: 'LAST_FISHING_ACTIVITY',
            tripDuration: 'TRIP_DURATION',
            noOfCorrections: 'NUMBER_OF_CORRECTIONS',
            tripId: 'TRIP_ID'
        };

        return predicateMapping[tablePredicate];
    }

    /**
     * A callback function to set the correct number of pages in the smartTable. To be used with the callServer function.
     *
     * @memberof TripspanelCtrl
     * @private
     */
    function callServerCallback (tableState, listName){
        tableState.pagination.numberOfPages = $scope.actServ[listName].pagination.totalPages;
    }

    /**
     * Pipe function used in the smartTable in order to support server side pagination and sorting
     *
     * @memberof TripspanelCtrl
     * @public
     * @alias callServer
     */
    $scope.callServer = function(tableState, ctrl, listName, showLatest){
        $scope.actServ[listName].stCtrl = ctrl;
        $scope.actServ[listName].tableState = tableState;

        if (!$scope.actServ[listName].isLoading && angular.isDefined($scope.actServ[listName].searchObject.multipleCriteria) && !$scope.actServ[listName].isTableLoaded){
            $scope.actServ[listName].isLoading = true;

            var searchField, sortOrder;
            if (angular.isDefined(tableState.sort.predicate)){
                searchField = getTruePredicate(tableState.sort.predicate);
                sortOrder = tableState.sort.reverse;
            }

            $scope.actServ[listName].sorting = {
                sortBy: searchField,
                reversed: sortOrder
            };

            $scope.actServ.getActivityList(callServerCallback, tableState, listName, showLatest);
        } else {
            if (!angular.isDefined(tableState.pagination.numberOfPages) || $scope.actServ[listName].fromForm){
                callServerCallback(tableState, listName);
                $scope.actServ[listName].fromForm = false;
            } else {
                $scope.actServ[listName].isTableLoaded = false;
                ctrl.pipe();
            }
        }
    };

    genericMapService.setMapBasicConfigs(setTripSumServiceMapConfigs);

    // function of trip summary service to open new trip
    $scope.tripSummServ.initializeTrip = function (tripId) {
        if (angular.isDefined(tripId)) {
            $scope.tripSummServ.trip = new Trip(tripId);
            $scope.trip = $scope.tripSummServ.trip;
            $scope.tripSummServ.initTripSummary();
        }
    };
    $scope.contentTabsFunctions = {
        setTabs: function() {
            return [
                {
                    'tab': 'ACTIVITIES',
                    'title': locale.getString('activity.tab_activities')
                }, {
                    'tab': 'TRIPS',
                    'title': locale.getString('activity.tab_trips')
                }
            ];
        }
    };
});
