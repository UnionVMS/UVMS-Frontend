/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('smart-table')
  .directive('stSortArgs', ['stConfig', '$parse', '$timeout', function (stConfig, $parse, $timeout) {
    return {
      restrict: 'A',
      require: '^stTable',
      link: function (scope, element, attr, ctrl) {

        var predicate = attr.stSortArgs;
        var getter = $parse(predicate);
        var index = 0;
        var classAscent = attr.stClassAscent || stConfig.sort.ascentClass;
        var classDescent = attr.stClassDescent || stConfig.sort.descentClass;
        var stateClasses = [classAscent, classDescent];
        var sortDefault;
        var skipNatural = attr.stSkipNatural !== undefined ? attr.stSkipNatural : stConfig.sort.skipNatural;
        var promise = null;
        var throttle = attr.stDelay || stConfig.sort.delay;

        if (attr.stSortDefault) {
          sortDefault = scope.$eval(attr.stSortDefault) !== undefined ? scope.$eval(attr.stSortDefault) : attr.stSortDefault;
        }

        ctrl.sortByDisplayed = function sortByDisplayed (predicate, reverse) {
        	ctrl.tableState().sort.predicate = predicate;
        	ctrl.tableState().sort.reverse = reverse === true;

            if (angular.isFunction(predicate)) {
            	ctrl.tableState().sort.functionName = predicate.name;
            } else {
              delete ctrl.tableState().sort.functionName;
            }

            ctrl.tableState().pagination.start = 0;
            return ctrl.pipeArgs();
          };
        
        //view --> table state
        function sort () {
          index++;
          var func;
          predicate = angular.isFunction(getter(scope)) || angular.isArray(getter(scope)) ? getter(scope) : attr.stSortArgs;
          if (index % 3 === 0 && skipNatural !== true) {
            //manual reset
            index = 0;
            ctrl.tableState().sort = {};
            ctrl.tableState().pagination.start = 0;
            func = ctrl.pipe.bind(ctrl);
          } else {
            func = ctrl.sortByDisplayed.bind(ctrl, predicate, index % 2 === 0);
          }
          if (promise !== null) {
            $timeout.cancel(promise);
          }
          if (throttle < 0) {
            func();
          } else {
            promise = $timeout(func, throttle);
          }
        }

        element.bind('click', function sortClick () {
          if (predicate) {
            sort();
          }
        });

        if (sortDefault) {
          index = sortDefault === 'reverse' ? 1 : 0;
          sort();
        }

        //table state --> view
        scope.$watch(function () {
          return ctrl.tableState().sort;
        }, function (newValue) {
          if (newValue.predicate !== predicate) {
            index = 0;
            element
              .removeClass(classAscent)
              .removeClass(classDescent);
          } else {
            index = newValue.reverse === true ? 2 : 1;
            element
              .removeClass(stateClasses[index % 2])
              .addClass(stateClasses[index - 1]);
          }
        }, true);
      }
    };
  }]);