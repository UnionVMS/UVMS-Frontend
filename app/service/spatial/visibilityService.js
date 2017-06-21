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
 * @name visibilityService
 * @param {Service} $localStorage - The ngStorage service
 * @description
 *  A service containing all available fields for positions, segments, tracks, alarms, trips and fishing activities
 *  and their visibility and order (in the tables) as defined by the admin/user preferences
 */
angular.module('unionvmsWeb').factory('visibilityService',function($localStorage, userService) {

	var visibilityService = {
        positions: {
            fs: true,
            extMark: true,
            ircs: true,
            cfr: true,
            name: true,
            posTime: true,
            lon: true,
            lat: true,
            stat: true,
            m_spd: true,
            c_spd: true,
            crs: true,
            msg_tp: true,
            act_tp: true,
            source: true
        },
        segments: {
            fs: true,
            extMark: true,
            ircs: true,
            cfr: true,
            name: true,
            dist: true,
            dur: true,
            spd: true,
            crs: true,
            cat: true
        },
        tracks: {
            fs: true,
            extMark: true,
            ircs: true,
            cfr: true,
            name: true,
            dist: true,
            dur: true,
            timeSea: true
        },
        alarms: {
            fs: true,
            extMark: true,
            ircs: true,
            cfr: true,
            name: true,
            ruleName: true,
            ruleDesc: true,
            ticketOpenDate: true,
            ticketStatus: true,
            ticketUpdateDate: true,
            ticketUpdatedBy: true,
            ruleDefinitions: true
        },
        trips: {
            tripId: true,
            fs: true,
            extMark: true,
            ircs: true,
            cfr: true,
            uvi: true,
            iccat: true,
            gfcm: true,
            firstEventType: true,
            firstEventTime: true,
            lastEventType: true,
            lastEventTime: true,
            duration: true,
            nCorrections: true,
            nPositions: true,
            alarm: false //FIXME by default should be true when we have rules working
        },
        fishingActivities : {
            FAReportType: true,
            activityType: true,
            occurrence: true,
            purposeCode: true,
            dataSource: true,
            fromName: true,
            startDate: true,
            endDate: true,
            cfr: true,
            ircs: true,
            extMark: true,
            uvi: true,
            iccat: true,
            gfcm: true,
            areas: true,
            port: true,
            fishingGear: true,
            speciesCode: true,
            quantity: true
        },
        positionsColumns: ['fs','extMark','ircs','cfr','name','posTime','lat','lon','stat','m_spd','c_spd','crs','msg_tp','act_tp','source'],
        segmentsColumns: ['fs','extMark','ircs','cfr','name','dist','dur','spd','crs','cat'],
        tracksColumns: ['fs','extMark','ircs','cfr','name','dist','dur','timeSea'],
        alarmsColumns: ['fs', 'extMark', 'ircs', 'cfr', 'name', 'ruleName', 'ruleDesc', 'ticketOpenDate', 'ticketStatus', 'ticketUpdateDate', 'ticketUpdatedBy', 'ruleDefinitions'],
        tripsColumns: ['tripId', 'fs', 'extMark', 'ircs', 'cfr', 'uvi', 'iccat', 'gfcm', 'firstEventType', 'firstEventTime', 'lastEventType', 'lastEventTime', 'duration','nCorrections','nPositions','alarm'],
        fishingActivitiesColumns: ['FAReportType','activityType','occurrence','purposeCode','dataSource','fromName','startDate','endDate','cfr','ircs','extMark','uvi','iccat','gfcm','areas','port','fishingGear','speciesCode','quantity'],
        /**
         * Set the visibility and order of all table fields
         * 
         * @memberof visibilityService
         * @public
         * @param {Object} data - The data object containing a table object which in turn should contain two array properties: values and order
         */
        setVisibility: function(data){
             for (var key in data){
                 this[key] = setItems(this[key], data[key].table.values);
                 this[key + 'Columns'] = data[key].table.order;
             }
        },
        /**
         * Initialize the visibility settings to and from the local storage
         * 
         * @memberof visibilityService
         * @public
         */
        initFromStorage: function(){
            //FIXME - This is to be used until we have the preferences working on the backend
            var user = userService.getUserName();
            if (!angular.isDefined($localStorage.visibilitySettings)){
                $localStorage.visibilitySettings = {};
            }
            if (!angular.isDefined($localStorage.visibilitySettings[user])){
                $localStorage.visibilitySettings[user] = {
                    values: this.fishingActivities,
                    order: this.fishingActivitiesColumns
                };
            } else {
                var localConfig = angular.copy($localStorage.visibilitySettings[user]);
                this.fishingActivities = localConfig.values;
                this.fishingActivitiesColumns = localConfig.order;
            }
        },
        /**
         * Update the visibility setting in the local storage for a specific fishing activity column
         * 
         * @memberof visibilityService
         * @public
         * @param {String} prop - The property to be updated in the fishing activities visibility settings
         */
        updateStorage: function(prop){
            var user = userService.getUserName();
            $localStorage.visibilitySettings[user]['values'][prop] = this.fishingActivities[prop];
        }
	};
	
	/**
	 * Set items boolean flag for visibility purposes
	 * 
	 * @memberof visibilityService
	 * @private
	 * @param {Object} obj - The target service object which will be updated
	 * @param {Object} srcData - The source data object containing the visibility status to be applied
	 * @returns {Object} An object containing all the updated visibility configurations
	 */
	var setItems = function(obj, srcData){
	    var newObj = {};
	    for (var key in obj){
	        newObj[key] = false;
	        if (_.indexOf(srcData, key) !== -1){
	            newObj[key] = true;
	        }
	    }
	    
	    return newObj;
	};

	return visibilityService;
});