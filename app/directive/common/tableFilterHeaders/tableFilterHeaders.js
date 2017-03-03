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
		            return _.keys(item[scope.uniqueColumnsSrcData])
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
.directive('stSelectMultiple', function(locale){
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
            scope.selModel = [];
            scope.comboItems = [];
            
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
                    testValues = _.uniq(_.map(scope.collection, function(item){
                        return item[props[0]][props[1]];
                    }));
                    
                    uniqueValues = _.compact(testValues);
                    if (scope.isArea && !_.isEqual(uniqueValues, testValues)){
                        hasEmptyValues = true;
                    }
                }
                
                scope.selModel = _.sortBy(uniqueValues, function(item){return item;});
                
                var items = [];
                angular.forEach(scope.selModel, function(val){
                    items.push({
                        code: val,
                        text: val
                    });
                });
                
                if (hasEmptyValues){
                    scope.selModel.push('null_values'); //TODO check if it is possible to use undefined
                    items.push({
                        code: 'null_values', //TODO check if it is possible to use undefined
                        text: locale.getString('common.empty_value')
                    });
                }
                scope.comboItems = items;
            }
            
            init();
        }
    }
});
