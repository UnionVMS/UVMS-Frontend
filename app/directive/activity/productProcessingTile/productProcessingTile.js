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
angular.module('unionvmsWeb').directive('productProcessingTile', function(locale) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
		    tileTitle: '@',
		    srcData: '='
		},
		templateUrl: 'directive/activity/productProcessingTile/productProcessingTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.tableAttrs = [{
		        title: locale.getString('activity.type'),
		        srcProp: 'type',
		        isVisible: true,
		        useComboFilter: true
		    }, {
		        title: locale.getString('activity.territory_area'),
		        srcObj: 'locations',
		        srcProp: 'territory',
		        isArea: true,
		        isVisible: true,
		        useComboFilter: true
		    }, {
		        title: locale.getString('activity.fao_area'),
		        srcObj: 'locations',
                srcProp: 'fao_area',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.ices_stat_rect'),
                srcObj: 'locations',
                srcProp: 'ices_stat_rectangle',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.effort_zone'),
                srcObj: 'locations',
                srcProp: 'effort_zone',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.rfmo_area'),
                srcObj: 'locations',
                srcProp: 'rfmo',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.gfcm_area'),
                srcObj: 'locations',
                srcProp: 'gfcm_gsa',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.gfcm_stat_rect'),
                srcObj: 'locations',
                srcProp: 'gfcm_stat_rectangle',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.header_fa_species'),
                srcProp: 'species',
                isVisible: true,
                useComboFilter: true
		    }, {
		        title: locale.getString('activity.presentation'),
                srcProp: 'presentation',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.preservation'),
                srcProp: 'preservation',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.freshness'),
                srcProp: 'freshness',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.gear'),
                srcProp: 'gear',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.conversion_factor'),
                srcProp: 'conversionFactor',
                isVisible: true
		    }, {
                title: locale.getString('activity.product_weight'),
                srcProp: 'weight',
                isVisible: true,
                calculateTotal: true
		    }, {
                title: locale.getString('activity.packaging_type'),
                srcProp: 'packagingType',
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.package_weight'),
                srcProp: 'packageWeight',
                isVisible: true,
                calculateTotal: true
		    }, {
                title: locale.getString('activity.package_quantity'),
                srcProp: 'packageQuantity',
                isVisible: true,
                calculateTotal: true
		    }];
		}
	};
});
