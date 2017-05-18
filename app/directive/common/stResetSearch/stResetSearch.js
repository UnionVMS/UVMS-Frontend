angular.module('unionvmsWeb').directive('stResetSearch', function() {
	return {
		restrict: 'EA',
		require: '^stTable',
		link: function(scope, element, attrs, ctrl) {
		    scope.getTableState = function(){
		        return ctrl.tableState();
		    };
		    scope.resetFilters = function(state){
                state.search.predicateObject = {};
                state.pagination.start = 0;
                return ctrl.pipe();
		    };
		    
		    scope.$watch('executedReport.isReportExecuting', function(newVal){
		        if (newVal){
		            scope.resetFilters(scope.getTableState());
		            if (angular.isDefined(attrs.ngClick)){
		                scope.clearDateFilters();
		            }
		        }
		    });
		    
		    return element.bind('click', function(){
		        return scope.$apply(function(){
		            scope.resetFilters(scope.getTableState());
		        });
		    });
		}
	};
});