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
 * @name catchClassSpecieDetailTile
 * @attr {Object} tileTitle - Title of fieldset
 * @attr {Object} ngModel - Data to be displayed
 * @attr {Boolean} isLocationClickable - tells if the click is enable on location tile
 * @attr {Number} bufferDistance - Buffer distance for location tile
 * @attr {Function} clickCallback - callback for location tile
 * @description
 *  A widget to display data about the catch details with the species per class
 */
angular.module('unionvmsWeb').directive('catchClassSpecieDetailTile', function(locale,reportingNavigatorService) {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			tileTitle: '@',
		    ngModel: '=',
		    isLocationClickable: '=',
		    bufferDistance: '@',
		    clickCallback: '&'
		},
		templateUrl: 'directive/activity/catchClassSpecieDetailTile/catchClassSpecieDetailTile.html',
		link: function(scope, element, attrs, fn) {
			scope.repNav = reportingNavigatorService;

			//columns of the first table
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
                title: locale.getString('activity.header_fa_weight'),
                srcProp: 'calculatedWeight',
                isVisible: true,
                calculateTotal: true
		    }];


			//columns of the second table(classes)
			scope.classColumnOrder = ['lsc', 'bms'/*, 'dis', 'dim'*/];

			//selects the first row on every table(by default)
			scope.ngModel[0].selected = true;
			scope.selectedSpecieLocation = scope.ngModel[0];
			scope.selectedClass = 'lsc';

			/**
			 * Selects a row by index
			 * 
			 * @memberof catchClassSpecieDetailTile
			 * @public
			 * @alias selectClass
			 * @param {String} [className] - Index of the class to be selected
			 */
			scope.selectClass = function(className){
				scope.selectedClass = className;
			};


			/**
			 * Create and show a tootlip with a description for the catch details type
			 *  
			 *  @memberof catchClassSpecieDetailTile
			 *  @public
			 *  @param {String} text - The text to be displayed in the tooltip
			 *  @param {String} cssSel - The css selector class of the item against which the tip will be displayed
			 */
			scope.displayDetailsTip = function(text, cssSel){
				var target = angular.element('.catch-class-specie-detail-tile .' + cssSel);
				var tip;
				if (angular.isDefined($(target).attr('data-hasqtip'))){
					tip = $(target);
				} else {
					tip = target.qtip({
						content: {
							text: text
						},
						position: {
							my: 'left center',
							at: 'right center',
							target: target,
							effect: false
						},
						show: {
							solo: true,
							when: false,
							effect: false
						},
						style: {
							classes: 'qtip-bootstrap'
						},
						events: {
							hide: function(evt, api){
								api.destroy(true);
							}
						}
					});
				} 
				var api = tip.qtip('api');
				api.show();
			};
		}
	};
});
