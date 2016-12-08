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
angular.module('unionvmsWeb').directive("sortableTableHeader", function() {
    return {
        restrict: 'A',
        transclude: true,
        template : 
        '<a class="pointer" ng-click="onClick()">'+
        '<span ng-transclude></span>&nbsp;'+ 
        '<i class="fa" ng-class="{\'fa-caret-down\' : order === by && reverse,  \'fa-caret-up\' : order===by && !reverse, \'fa-sort\' : order !== by}"></i>'+
        '</a>',
        scope: {
            order: '=',
            by: '=',
            reverse : '='
        },
        link: function(scope, element, attrs) {
            scope.onClick = function () {
                if( scope.order === scope.by ) {
                    scope.reverse = !scope.reverse;
                } else {
                    scope.by = scope.order ;
                    scope.reverse = false; 
                }
            };
        }
    };
});