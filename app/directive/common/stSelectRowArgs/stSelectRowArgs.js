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
angular.module('smart-table').directive('stSelectRowArgs', ['stConfig', function (stConfig) {
    return {
        restrict: 'A',
        require: '^stTable',
        scope: {
          row: '=stSelectRowArgs'
        },
        link: function (scope, element, attr, ctrl) {
          ctrl.lastSelected = null;
          ctrl.selectArgs = function selectArgs (row, mode) {
              var rows = scope.$parent.$parent.displayedRecords;
              var index = rows.indexOf(row);
              if (index !== -1) {
                if (mode === 'single') {
                  row.isSelected = true;
                  if (ctrl.lastSelected) {
                	  if(ctrl.lastSelected !== row){
                		  ctrl.lastSelected.isSelected = false;
                	  }
                  }
                  ctrl.lastSelected = row.isSelected === true ? row : undefined;
                } else {
                  rows[index].isSelected = !rows[index].isSelected;
                }
              }
            };
        	
          var mode = attr.stSelectMode || stConfig.select.mode;
          element.bind('click', function () {
            scope.$apply(function () {
              ctrl.selectArgs(scope.row, mode);
            });
          });

          scope.$watch('row.isSelected', function (newValue) {
            if (newValue === true) {
              element.addClass(stConfig.select.selectedClass);
            } else {
              element.removeClass(stConfig.select.selectedClass);
            }
          });
        }
      };
    }]);
