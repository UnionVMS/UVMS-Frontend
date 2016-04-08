angular.module('unionvmsWeb').directive('stResetSearch', function() {
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
            formId: '@',
            clearDates: '&'
        },
        templateUrl: 'directive/spatial/stResetSearch/stResetSearch.html',
        link: function(scope, element, attrs, ctrl) {
            scope.getTableState = function(){
                return ctrl.tableState();
            };
            
            scope.resetFields = function(){
                $('#' + scope.formId + ' [name]').each(
                    function(index){  
                        var input = $(this);
                        input.val('');
                    }
                );
                
                if (angular.isDefined(attrs.clearDates)){
                    scope.clearDates();
                }
            };
            
            scope.resetFilters = function(){
                scope.resetFields();
                var state = scope.getTableState();
                state.search.predicateObject = {};
                state.pagination.start = 0;
                return ctrl.pipe();
            };
            
            scope.$watch('executedReport.isReportExecuting', function(newVal){
                if (newVal){
                    scope.resetFilters();
                }
            });
        }
    };
});