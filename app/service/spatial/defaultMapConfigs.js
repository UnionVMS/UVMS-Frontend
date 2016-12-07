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
angular.module('unionvmsWeb').factory('defaultMapConfigs',function() {
	var defaultMapConfigs = {
        map: {
            projection: {
                epsgCode: 3857, //So far we only support 3857 and 4326
                units: 'm',
                global: true,
                axis: 'enu',
                extent: '-20026376.39;-20048966.10;20026376.39;20048966.10'
            },
            control: [{
                type: 'zoom'
            },{
                type: 'drag'
            },{
                type: 'scale',
                units: 'nautical' //Possible values: metric, degrees, nautical, us, imperial
            },{
                type: 'mousecoords',
                epsgCode: 4326,
                format: 'dd' //Possible values: dd, dms, ddm, m
            },{
                type: 'history'
            }],
            tbControl: [{
                type: 'measure'
            },{
                type: 'fullscreen'
            },{
                type: 'mapFishPrint'
            },{
                type: 'bookmarks'
            }]
        }
    };

	return defaultMapConfigs;
});
