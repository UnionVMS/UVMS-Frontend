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
 * @name aggregationPanel
 * @attr {Array} ngModel - The data object used as input for the directive
 * @attr {Array} aggregationTypes - The selectable items that can be sorted
 * @attr {String} title - title for the aggregation panel
 * @description
 *  A reusable tile that will display a tree to sort the selected items
 */
angular.module('unionvmsWeb').directive('aggregationPanel', function() {
	return {
		restrict: 'E',
		scope: {
			ngModel: '=',
			aggregationTypes: '=',
			title: '@',
			minSelections: '@'
		},
		templateUrl: 'directive/spatial/aggregationPanel/aggregationPanel.html',
		link: function(scope, element, attrs, fn) {
			scope.selectedTypes = [];

			/**
			 * Limits the minimum of selections
			 * 
			 * @memberof aggregationPanel
			 * @private
			 */
			var checkMinSelections = function() {
				if(angular.isDefined(scope.minSelections)){
					var minSelections = parseInt(scope.minSelections);
					if(!angular.isDefined(scope.ngModel)){
						scope.ngModel = [];
					}
					if(scope.ngModel.length < minSelections && angular.isDefined(scope.aggregationTypes) && scope.aggregationTypes.length > 0){
						var threshold = 0;
						for(var i=scope.ngModel.length;i<minSelections+threshold;i++){
							if(_.where(scope.ngModel,{code: scope.aggregationTypes[i].code}).length){
								threshold++;
								continue;
							}
							scope.ngModel.push(scope.aggregationTypes[i]);
						}
					}	
				}
			};

			//checks if the selection of items to sort has changed
			scope.$watch('selectedTypes', function(newVal) {
				
				if(!angular.isDefined(scope.ngModel)){
					scope.ngModel = [];
				}

				if(Math.abs(newVal.length - scope.ngModel.length) < 2){
					//if any of the selected filters is not in the tree
					if(scope.ngModel.length < newVal.length){
						angular.forEach(newVal,function (type) {
							if(_.where(scope.ngModel, {code: type}).length === 0){
								scope.ngModel.push(_.where(scope.aggregationTypes, {code: type})[0]);
							}
						});
					//if any of the tree has more items than the selected ones
					}else if(scope.ngModel.length > newVal.length){
						angular.forEach(scope.ngModel,function (item) {
							var comboIdx = newVal.indexOf(item.code);

							if(comboIdx === -1){
								var idx = scope.ngModel.indexOf(item);
								scope.ngModel.splice(idx,1);
							}
						});
					}
				} else if (newVal.length === 1 && Math.abs(newVal.length - scope.ngModel.length) >= 2){
				    var itemsToRemove = [];
				    angular.forEach(scope.ngModel, function(item) {
				    	if (newVal.indexOf(item.code) === -1){
				    	    itemsToRemove.push(item);
				    	}
				    });
				    scope.ngModel = _.filter(scope.ngModel, function(item){
				        return !_.findWhere(itemsToRemove, item);
				    });
				}

			},true);

			//checks if the model changed
			scope.$watch('ngModel', function(newVal){
				synchSelectedTypes(newVal);
			}, true);

			/**
			 * synchronize the selected types in combobox with the ngModel
			 * 
			 * @memberof aggregationPanel
			 * @private
			 */
			var synchSelectedTypes = function(newVal){
				newVal = angular.isDefined(newVal) ? newVal : [];

				angular.forEach(newVal,function (item) {
					if(scope.selectedTypes.indexOf(item.code) === -1){
						scope.selectedTypes.push(item.code);
					}
				});

				if(scope.selectedTypes.length > newVal.length){
					angular.forEach(scope.selectedTypes,function (type) {
						if(newVal.indexOf(type) === -1){
							scope.selectedTypes.splice(scope.selectedTypes.indexOf(type));
						}
					});
				}
				var aux = angular.copy(scope.selectedTypes);
				scope.selectedTypes = [];
				scope.selectedTypes = angular.copy(aux);

				checkMinSelections();
			};

			/**
			 * function to calculate species Weight Percentage and return a string to be displayed in the chart tooltip
			 * 
			 * @memberof aggregationPanel
			 * @public
			 * @alias calcIdentation
			 * @param {Number} idx - index of the line to indent
			 * @returns {String} The number of pixels to indent the line
			 */
			scope.calcIdentation = function(idx){
				return ((idx-1)*50) + 40  + 'px';
			};

			if(angular.isDefined(scope.ngModel)){
				synchSelectedTypes(scope.ngModel);
			}

			checkMinSelections();
		}
	};
});
