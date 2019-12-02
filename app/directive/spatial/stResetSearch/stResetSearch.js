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
angular.module('unionvmsWeb').directive('stResetSearch', function() {
    return {
        restrict: 'E',
        require: '^stTable',
        scope: {
            formId: '@',
            clearDates: '&',
            clearCombos: '&'
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
                
                if (angular.isDefined(attrs.clearCombos)){
                    scope.clearCombos();
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
