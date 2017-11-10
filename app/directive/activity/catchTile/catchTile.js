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
 * @name catchTile
 * @attr {Object} tileTitle - Title of fieldset
 * @attr {Object} ngModel - Data to be displayed
 * @attr {Boolean} isLocationClickable - tells if the click is enable on location tile
 * @attr {Number} bufferDistance - Buffer distance for location tile
 * @attr {Function} clickCallback - callback for location tile
 * @description
 *  A widget to display data about the catch details with the species per class
 */
angular.module('unionvmsWeb').directive('catchTile', function(locale,reportingNavigatorService) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
			tileTitle: '@',
		    ngModel: '=',
		    isLocationClickable: '=',
		    bufferDistance: '@',
		    clickCallback: '&'
		},
		templateUrl: 'directive/activity/catchTile/catchTile.html',
		link: function(scope, element, attrs, fn) {
			scope.repNav = reportingNavigatorService;

			//columns of the first table
			scope.tableAttrs = [{
		        title: locale.getString('activity.type'),
		        srcProp: 'type',
		        isVisible: true,
		        useComboFilter: true
		    }, {
		        title: locale.getString('activity.fa_territory'),
		        srcObj: 'locations',
		        srcProp: 'territory',
		        isArea: true,
		        isVisible: true,
		        useComboFilter: true
		    }, {
		        title: locale.getString('activity.fa_fao_area'),
		        srcObj: 'locations',
                srcProp: 'faoArea',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.fa_ices_stat_rectangle'),
                srcObj: 'locations',
                srcProp: 'icesStatRectangle',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.fa_effort_zone'),
                srcObj: 'locations',
                srcProp: 'effortZone',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.fa_rfmo'),
                srcObj: 'locations',
                srcProp: 'rfmo',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.fa_gfcm_gsa'),
                srcObj: 'locations',
                srcProp: 'gfcmGsa',
                isArea: true,
                isVisible: true,
                useComboFilter: true
		    }, {
                title: locale.getString('activity.fa_gfcm_stat_rectangle'),
                srcObj: 'locations',
                srcProp: 'gfcmStatRectangle',
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

			/**
			 * Initializes the catch panel directive
			 * 
			 * @memberof catchTile
			 * @private
			 */
			var init = function(){
				//columns of the second table(classes)
				scope.classColumnOrder = ['LSC', 'BMS'];

				//selects the first row on every table(by default)
				scope.ngModel[0].selected = true;
				scope.selectedSpecieLocation = scope.ngModel[0];

				if(angular.isDefined(scope.ngModel[0].groupingDetails.LSC) && scope.ngModel[0].groupingDetails.LSC.weight){
					scope.selectedClass = 'LSC';
				}else{
					scope.selectedClass = 'BMS';
				}
			};

			/**
			 * Selects a row by index
			 * 
			 * @memberof catchTile
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
			 *  @memberof catchTile
			 *  @public
			 *  @param {String} text - The text to be displayed in the tooltip
			 *  @param {String} cssSel - The css selector class of the item against which the tip will be displayed
			 */
			scope.displayDetailsTip = function(text, cssSel){
				var target = angular.element('.catch-tile .' + cssSel);
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

			/**
			 * Create and show a tootlip with a description for the catch details type
			 *  
			 *  @memberof catchTile
			 *  @public
			 *  @param {Array} model - The catch data to be displayed in the tile
			 *  @returns {Boolean} a boolean which indicates if there's data to display or not
			 */
			scope.hasData = function(model){
				return angular.isDefined(model) && !_.isEmpty(model);
			};

			//if ngModel is not defined add a watch to wait for the model
			var watchRef;
			if(scope.hasData(scope.ngModel)){
				init();
			}else{
				watchRef = scope.$watch('ngModel',function(newVal){
					if(scope.hasData(newVal)){
						init();
						watchRef();
					}
				});	
			}
		}
	};
});
