angular.module('unionvmsWeb').directive('tableFilterHeaders', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
		    columns: '=',
		    records: '=',
		    uniqueColumns: '@',
		    uniqueColumnsSrcData: '@'
		},
		templateUrl: 'directive/common/tableFilterHeaders/tableFilterHeaders.html',
		link: function(scope, element, attrs, fn) {
		    scope.isProcessed = false;
		    scope.displayedRecords = [];
		    scope.$watch('records', function(newVal, oldVal){
		        if (angular.isDefined(newVal) && scope.isProcessed === false){
		            scope.isProcessed = true;
		            scope.displayedRecords = [].concat(newVal);
		            if (angular.isDefined(scope.uniqueColumnsSrcData)){
		                scope.setColumnVisibility();
		            }
		        }
		    });
		    
		    scope.setColumnVisibility = function(){
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
		    };
		    
		    if (angular.isDefined(scope.uniqueColumnsSrcData)){
                scope.setColumnVisibility();
            }
		}
	};
})
.directive('stSelectMultiple', function(locale, $timeout){
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
          collection: '=',
          predicate: '@',
          isArea: '@'
//          predicateExpression: '='
        },
        templateUrl: 'directive/common/tableFilterHeaders/stSelectMultiple.html',
        link: function(scope, element, attr, table) {
            scope.combo = {
                model: [],
                items: []
            };
            
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
            
//            function getPredicate() {
//                var predicate = scope.predicate;
//                if (!predicate && scope.predicateExpression) {
//                  predicate = scope.predicateExpression;
//                }
//                return predicate;
//              }
            
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
            
            return status
        });
        
        return records;
    };
});
