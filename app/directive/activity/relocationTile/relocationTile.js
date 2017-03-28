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
 * @param {Service} locale - The angular locale service
 * @attr {String} tileTitle - The title of the tile
 * @attr {Array} srcData - An array containing the data to be displayed on the table within the tile
 * @desc
 *  A reusable tile to display processing and products information for a given fishing activity
 */
angular.module('unionvmsWeb').directive('relocationTile', function(locale) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
		    tileTitle: '@',
		    srcData: '='
		},
		templateUrl: 'directive/activity/relocationTile/relocationTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.tableAttrs = [{
		        title: locale.getString('activity.role'),
				srcProp: 'roleDesc',
		        isVisible: true,
		        useComboFilter: true,
				filterBy: 'role',
				translate: 'abbreviations.activity_'
		    }, {
		        title: locale.getString('activity.fs'),
                srcProp: 'country',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.vessel_id'),
				srcObj: 'vesselId',
                srcProp: 'id',
                isVisible: true,
                useComboFilter: true,
				filterBy: 'schemeId'
		    }, {
                title: locale.getString('activity.ircs'),
                srcProp: 'ircs',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.name'),
                srcProp: 'name',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.specie'),
                srcProp: 'speciesCode',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.alloc_type'),
                srcProp: 'type',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.weight'),
                srcProp: 'weight',
                isVisible: true,
                calculateTotal: true
		    }, {
		        title: '#',
                srcProp: 'unit',
                isVisible: true,
                calculateTotal: true
		    }];
		}
	};
});
