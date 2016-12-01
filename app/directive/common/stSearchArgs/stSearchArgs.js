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
angular.module('smart-table')
  .directive('stSearchargs', ['stConfig', '$timeout','$parse', '$filter', function (stConfig, $timeout, $parse, $filter) {
    return {
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {
        var tableCtrl = ctrl;
        tableCtrl.tableScope = scope;
        var orderBy = $filter('orderBy');
        var tableFilter = $filter('stSearch');
        var promise = null;
        var throttle = attr.stDelay || stConfig.search.delay;
        var event = attr.stInputEvent || stConfig.search.inputEvent;
        
        function deepDelete (object, path) {
            if (path.indexOf('.') !== -1) {
              var partials = path.split('.');
              var key = partials.pop();
              var parentPath = partials.join('.');
              var parentObject = $parse(parentPath)(object);
              delete parentObject[key];
              if (Object.keys(parentObject).length === 0) {
                deepDelete(object, parentPath);
              }
            } else {
              delete object[path];
            }
          }
        
        tableCtrl.pipeArgs = function pipe () {
        	var propertyName = "displayedRecords";
            var displayGetter = $parse(propertyName);
            var displaySetter = displayGetter.assign;
	        var pagination = ctrl.tableState().pagination;
	        var output;
	        
	        var filtered = ctrl.tableState().search.predicateObject ? tableFilter(tableCtrl.tableScope.reportsList , tableCtrl.tableScope.displayedColumns + '|' + ctrl.tableState().search.predicateObject.$) : tableCtrl.tableScope.reportsList;
	        if (ctrl.tableState().sort.predicate) {
	          filtered = orderBy(filtered, ctrl.tableState().sort.predicate, ctrl.tableState().sort.reverse);
	        }
	        pagination.totalItemCount = filtered.length;
	        if (pagination.number !== undefined) {
	          pagination.numberOfPages = filtered.length > 0 ? Math.ceil(filtered.length / pagination.number) : 1;
	          pagination.start = pagination.start >= filtered.length ? (pagination.numberOfPages - 1) * pagination.number : pagination.start;
	          output = filtered.slice(pagination.start, pagination.start + parseInt(pagination.number));
	        }
	        displaySetter(tableCtrl.tableScope, output || filtered);
	      };
        
	      tableCtrl.searchArgs = function search (input, filteredColumns) {
	        var predicateObject = ctrl.tableState().search.predicateObject || {};
	        tableCtrl.tableScope.displayedColumns = filteredColumns;
	        var prop = '$';
	
	        input = angular.isString(input) ? input.trim() : input;
	        $parse(prop).assign(predicateObject, input);
	        // to avoid to filter out null value
	        if (!input) {
	          deepDelete(predicateObject, prop);
	        }
	        ctrl.tableState().search.predicateObject = predicateObject;
	        ctrl.tableState().pagination.start = 0;
	        return tableCtrl.pipeArgs();
	      };

        attr.$observe('stSearchargs', function (newValue, oldValue) {
          var input = element[0].value;
          if (newValue !== oldValue && input) {
            ctrl.tableState().search = {};
            tableCtrl.searchArgs(input, newValue);
          }
        });

        //table state -> view
        scope.$watch(function () {
          return ctrl.tableState().search;
        }, function (newValue, oldValue) {
          var predicateExpression = '$';
          if (newValue.predicateObject && $parse(predicateExpression)(newValue.predicateObject) !== element[0].value) {
            element[0].value = $parse(predicateExpression)(newValue.predicateObject) || '';
          }
        }, true);

        // view -> table state
        element.bind('input', function (evt) {
          evt = evt.originalEvent || evt;
          if (promise !== null) {
            $timeout.cancel(promise);
          }

          promise = $timeout(function () {
        	tableCtrl.searchArgs(evt.target.value, attr.stSearchargs || '');
            promise = null;
          }, throttle);
        });
      }
    };
  }]);
