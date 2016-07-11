/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('vmsVisibilityService',function() {

	var vmsVisibilityService = {
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
        positionsColumns: ['fs','extMark','ircs','cfr','name','posTime','lat','lon','stat','m_spd','c_spd','crs','msg_tp','act_tp','source'],
        segmentsColumns: ['fs','extMark','ircs','cfr','name','dist','dur','spd','crs','cat'],
        tracksColumns: ['fs','extMark','ircs','cfr','name','dist','dur','timeSea'],
        setVisibility: function(data){
             for (var key in data){
                 this[key] = setItems(this[key], data[key].table.values);
                 this[key + 'Columns'] = data[key].table.order;
             }
        }
	};
	
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

	return vmsVisibilityService;
});