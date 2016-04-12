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
                var coordFields = ['lon|dd', 'lat|dd', 'lon|deg', 'lat|deg', 'lon|min', 'lat|min'];
                $('#' + scope.formId + ' [name]').each(
                    function(index){  
                        var input = $(this);
                        var name = input.attr('name');
                        input.val('');
                        if (_.indexOf(coordFields, name) !== -1 && input.is(':visible') && input.hasClass('coordError')){
                            input.removeClass('coordError');
                            var qtipEl;
                            if (name.indexOf('dd') !== -1){
                                qtipEl = '#qtip-' + name.replace('|', '-') + ' i';
                            } else {
                                qtipEl = '#qtip-' + name.split('|')[0] + '-ddm i';
                            }
                            $(qtipEl).removeClass('hasError');
                        }
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