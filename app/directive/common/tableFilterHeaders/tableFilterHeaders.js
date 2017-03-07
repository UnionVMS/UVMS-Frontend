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
 * @name tableFilterHeaders
 * @attr {Array} columns - An array of objects defining all the columns of the table. Each object may containing the following properties: title, srcProp, srcObj, isArea, isVisible,
 *                         useComboFilter and calculateTotal
 * @attr {Array} records - An array containing all the data that should be displayed in the table  
 * @attr {String} uniqueColumns - A string that defines the property name of the columns object indicating that a column is filled with a nested object
 * @attr {String} uniqueColumnsSrcData - A string that specifies the source nested object to use for unique columns 
 * @description
 *  A reusable smart table directive that supports multiple and simultaneous combobox filters, and calculates totals according to an object that defines the table structure
 */
angular.module('unionvmsWeb').directive('tableFilterHeaders', function($compile) {
	return {
		restrict: 'E',
		replace: false,
		terminal: true,
		scope: {
		    columns: '=',
		    records: '=',
		    uniqueColumns: '@',
		    uniqueColumnsSrcData: '@',
		    selectedItem: '='
		},
		templateUrl: 'directive/common/tableFilterHeaders/tableFilterHeaders.html',
		link: {
		    pre: function(scope, element, attrs, fn){
		        if (angular.isDefined(scope.selectedItem)){
                    element.attr('st-auto-select-row', true);
                }
		    },
		    post: function(scope, element, attrs, fn){
                scope.hasTotals = false;
                scope.isProcessed = false;
                scope.displayedRecords = [];
                scope.$watch('records', function(newVal, oldVal){
                    if (angular.isDefined(newVal) && scope.isProcessed === false){
                        scope.isProcessed = true;
                        scope.displayedRecords = [].concat(newVal);
                        
                        if (angular.isDefined(scope.uniqueColumnsSrcData)){
                            setColumnVisibility();
                        }
                    }
                });
                
                /**
                 * Check if the footer with calculated totals should be render according to the definition object of columns
                 * 
                 * @memberof tableFilterHeaders
                 * @private
                 */
                function checkRenderTotals(){
                    for (var i = 0; i < scope.columns.length; i++){
                        if (angular.isDefined(scope.columns[i].calculateTotal) && scope.columns[i].calculateTotal){
                            scope.hasTotals = true;
                            break;
                        }
                    }
                }
                
                /**
                 * Set columns visibility if uniqueColumns and uniqueColumnsSrcData are specified.
                 * It will check the data, and hide those uniqueColumns if they are not present in the data.
                 * 
                 * @memberof tableFilterHeaders
                 * @private
                 */
                function setColumnVisibility(){
                    var allKeys = _.map(scope.records, function(item){
                        return _.keys(item[scope.uniqueColumnsSrcData]);
                    });
                    var uniqueKeys = _.uniq(_.flatten(allKeys));
                    angular.forEach(scope.columns, function(column) {
                        if (column[scope.uniqueColumns]){
                            if (_.indexOf(uniqueKeys, column.srcProp) === -1){
                                column.isVisible = false;
                            } else {
                                column.isVisible = true;
                            }
                        }
                    });
                }
                
                /**
                 * Selects a row by index
                 * 
                 * @memberof tableFilterHeaders
                 * @public
                 * @alias selectRow
                 * @param {Number} [idx] - Index of the row to be selected
                 */
                scope.selectRow = function(idx){
                    if (angular.isDefined(scope.selectedItem)){
                        angular.forEach(scope.records, function(item){
                            delete item.selected;
                        });
                        scope.displayedRecords[idx].selected = true;
                        scope.selectedItem = scope.displayedRecords[idx];
                    }
                };
                
                if (angular.isDefined(scope.uniqueColumnsSrcData)){
                    setColumnVisibility();
                }
                checkRenderTotals();
            }
		}
	};
})
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name stSelectMultiple
 * @param {Service} locale - The angular locale service
 * @param {Service} $timeout - The angular timeout service
 * @attr {Array} collection - An array of objects containing the data that is displayed in the table
 * @attr {String} predicate - A string identifying the source property to be filtered   
 * @attr {Booelan} isArea - A boolean which specifies if the column is related with an area nested object so that undefined values are supported within the filtering
 * @description
 *  A directive to add comboboxes with multiple selection for a column to support multiple filtering criteria. It should be used with {@link unionvmsWeb.tableFilterHeaders} directive.
 */
.directive('stSelectMultiple', function(locale, $timeout){
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=',
          predicate: '@',
          isArea: '@'
        },
        templateUrl: 'directive/common/tableFilterHeaders/stSelectMultiple.html',
        link: function(scope, element, attr, table) {
            scope.combo = {
                model: [],
                items: []
            };
            
            /**
             * Build filtering criteria object and call the smart table filtering function
             * 
             * @memberof stSelectMultiple
             * @public
             * @alias doFilter
             */
            scope.doFilter = function(){
                $timeout(function(){
                    var query = {
                        matchAny: {}
                    };

                    query.matchAny.items = angular.copy(scope.combo.model);
                    var numberOfItems = query.matchAny.items.length;
                    if (numberOfItems === 0 || numberOfItems === scope.combo.items.length) {
                        query.matchAny.all = true;
                    } else {
                        query.matchAny.all = false;
                    }

                    table.search(query, scope.predicate);
                });
            };
            
            /**
             * Initialization function
             * 
             * @memberof stSelectMultiple
             * @private
             */
            function init(){
                if (angular.isDefined(scope.collection)){
                    buildCombolistItems();
                } else {
                    var unbind = scope.$watch('collection', function(newVal, oldVal){
                        if (angular.isDefined(newVal) && !_.isEqual(newVal, oldVal)){
                            buildCombolistItems();
                            unbind(); //unregister watch
                        }
                    });
                }
            }
            
            /**
             * Build the combobox model and items list
             * 
             * @memberof stSelectMultiple
             * @private
             */
            function buildCombolistItems(){
                var uniqueValues;
                var hasEmptyValues = false;
                var props = scope.predicate.split('.');
                if (props.length === 1){
                    uniqueValues = _.uniq(_.pluck(scope.collection, props[0]));
                } else {
                    var testValues = _.uniq(_.map(scope.collection, function(item){
                        return item[props[0]][props[1]];
                    }));
                    
                    uniqueValues = _.compact(testValues);
                    if (scope.isArea && !_.isEqual(uniqueValues, testValues)){
                        hasEmptyValues = true;
                    }
                }
                
                scope.combo.model = _.sortBy(uniqueValues, function(item){return item;});
                
                var items = [];
                angular.forEach(scope.combo.model, function(val){
                    items.push({
                        code: val,
                        text: val
                    });
                });
                
                if (hasEmptyValues){
                    scope.combo.model.push('null_values');
                    items.push({
                        code: 'null_values',
                        text: locale.getString('common.empty_value')
                    });
                }
                scope.combo.items = items;
            }
            
            init();
        }
    };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name stCalculateTotals
 * @attr {String} property - A string defining the object property that should be used to calculate totals
 * @description
 *  A directive to calculate totals for a specified smart table column. It should be used with {@link unionvmsWeb.tableFilterHeaders} directive.
 */
.directive('stCalculateTotals', function(){
    return {
        restrict: 'E',
        require: '^stTable',
        template: '<div><b>&Sigma;</b> {{total}}</div>',
        scope: {
            property: '@'
        },
        link: function (scope, element, attr, table){
            scope.isCalculating = false;
            scope.$watch(table.getFilteredCollection, function(data){
                if (angular.isDefined(data) && scope.isCalculating === false){
                    scope.total = 0;
                    scope.isCalculating = true;
                    for (var i = 0; i < data.length; i++){
                        scope.total += data[i][scope.property];
                        if (i === data.length - 1){
                            scope.isCalculating = false;
                        }
                    }
                }
            });
        }
    };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @desc
 *  A directive to auto select the first row of the smart table if no record is already selected. It should be used with {@link unionvmsWeb.tableFilterHeaders} directive.
 */
.directive('stAutoSelectRow', function(){
    return {
        restrict: 'A',
        require: '^stTable',
        link: function (scope, element, attr, table){
            scope.$watch(table.getFilteredCollection, function(data){
                var isSelected = false;
                angular.forEach(data, function(record){
                    if (angular.isDefined(record.selected) && record.selected){
                        isSelected = true;
                    }
                });
                
                if (!isSelected){
                    scope.selectRow(0);
                }
            });
        }
    };
})
/**
 * @memberof unionvmsWeb
 * @ngdoc filter
 * @name comboHeaderFilter
 * @param {Service} $filter - The angular filter service 
 * @desc
 *  Filtering function for multiple select filters on smart table. It should be used with {@link unionvmsWeb.tableFilterHeaders} and {@link unionvmsWeb.stSelectMultiple} directives.
 */
.filter('comboHeaderFilter', function($filter){
    return function(array, predictedObject){
        var keys = _.keys(predictedObject);
        var records = _.filter(array, function(item){
            var status = true;
            angular.forEach(keys, function(key){
                var splitKey = key.split('.');
                var testValue = item[splitKey[0]];
                if (splitKey.length > 1){
                    testValue = testValue[splitKey[1]];
                }
                
                var nullIdx = _.indexOf(predictedObject[key].matchAny.items, 'null_values');
                if (nullIdx !== -1){
                    predictedObject[key].matchAny.items[nullIdx] = undefined;
                }
                
                if (status && !predictedObject[key].matchAny.all && _.indexOf(predictedObject[key].matchAny.items, testValue) === -1) {
                    status = false;
                } 
            });
            
            return status;
        });
        
        return records;
    };
});
