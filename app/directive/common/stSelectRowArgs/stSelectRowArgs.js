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