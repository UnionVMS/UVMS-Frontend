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
 * @ngdoc service
 * @name tripSummaryService
 * @attr {unionvmsWeb.Trip} trip - The current trip in trip summary
 * @attr {Object} mapConfigs - A property object that will contain the cronology of trips related to the current trip
 * @attr {Array} tabs - A property object that will be the catch details
 * @description
 *  Service to manage the trip summary view in the application
 */
angular.module('unionvmsWeb').factory('tripSummaryService',function($timeout) {
	var tripSummaryService = {
	    withMap: undefined,
	    trip: undefined,
	    mapConfigs: undefined,
        tabs: undefined,
        isLoadingTrip: undefined
	};

    /**
     * Open a new tab with a specific trip
     * 
     * @memberof tripSummaryService
     * @public
     * @param {String} tripId - trip id
     * @param {Boolean} [fromPopup] - whether the new trip is being called from the acitvity popup or not
	 * @alias openNewTrip
     */
    tripSummaryService.openNewTrip = function(tripId, fromPopup){
        if (angular.isDefined(fromPopup) && fromPopup){
            this.initializeTrip(tripId);
        } else {
            this.isLoadingTrip = true;
            var self = this;

            if(!angular.isDefined(this.tabs)){
                this.tabs = [];
            }
            
            angular.forEach(this.tabs, function(item) {
                item.active = false;
            });

            if(_.where(this.tabs, {title: tripId}).length === 0){
                this.tabs.push({title: tripId, active: true});
                this.initializeTrip(this.tabs[this.tabs.length-1].title);
            }else{
                angular.forEach(this.tabs, function(value,key){
                    if(value.title === tripId){
                        value.active = true;
                        self.initializeTrip(value.title);
                    }
                });
            }

            $timeout(function(){
                self.isLoadingTrip = false;
            });
        }
    };

    /**
     * Reset map configs
     * 
     * @memberof tripSummaryService
     * @public
	 * @alias resetMapConfigs
     */
	tripSummaryService.resetMapConfigs = function(){
	    this.mapConfigs = undefined;
	};
	
	return tripSummaryService;
});
