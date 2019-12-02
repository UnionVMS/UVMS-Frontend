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
var sharedModule = angular.module('shared');

sharedModule.directive('usmPagination', ['$log', '$stateParams', function ($log, $stateParams) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            config: '=config'
        },
        templateUrl: 'usm/shared/directive/usmPagination.html',
        link: function (scope, element, attrs) {
            var page = scope.config.page;
            //scope.currentPage = parseInt($stateParams.page) || 1;
            scope.itemsPerPage = scope.config.itemsPerPage;
            scope.startItems = scope.itemsPerPage * (scope.currentPage - 1) + 1;
            scope.limitItems = scope.config.itemsPerPage;
            scope.$watch('config.totalItems', function (newValue, oldValue) {
                if (newValue) {
                    // -1 handles no results
                    if (_.isEqual(newValue, -1)) {
                        newValue = 0;
                        scope.totalItems = newValue;
                    } else {
                        scope.totalItems = scope.config.totalItems;
                    }
                }
            }, true);
            scope.$watch('config.pageCount', function (newValue, oldValue) {
                if (newValue) {
                    // -1 handles no results
                    if (_.isEqual(newValue, -1)) {
                        newValue = 0;
                        scope.pageCount = newValue;
                    } else {
                        scope.pageCount = scope.config.pageCount;
                    }
                }
            }, true);

            scope.$watch('config.currentPage', function (newValue, oldValue) {
                if (newValue && _.isNumber(parseInt(newValue))) {
                    // -1 handles no results
                    if (_.isEqual(newValue, -1)) {
                        newValue = 0;
                    }
                    if (newValue <= 1) {
                    	newValue = 1;
                    } else if (newValue >= scope.pageCount) {
						newValue = scope.pageCount;
					}
                    scope.currentPage = newValue;
                }
            }, true);

            scope.$watch("currentPage", function (newValue, oldValue) {
                // when we first enter the page the newValue is undefined
                if (_.isUndefined(newValue) || (!_.isEqual(newValue, oldValue) && !_.isUndefined(oldValue))) {
                    if (_.isUndefined(newValue)) {
                        newValue = 1;
                    }
                scope.currentPage = newValue;
                scope.$parent.paginationConfig.currentPage = newValue;
                scope.$parent.getPage(newValue);

                }
                scope.startItems = scope.itemsPerPage * (scope.currentPage - 1) + 1;
                if (!_.isUndefined(scope.totalItems)) {
                	scope.limitItems = scope.itemsPerPage * newValue < scope.totalItems ? scope.itemsPerPage * newValue : scope.totalItems;
                } else {
                	scope.limitItems = scope.itemsPerPage;
                }
            });

            scope.firstPage = function () {
                scope.currentPage = 1;
            };
            scope.lastPage = function () {
                scope.currentPage = scope.pageCount;
            };

            scope.prevPage = function () {
                if (scope.currentPage > 1) {
                    scope.currentPage = scope.currentPage - 1;
                }
            };
            scope.nextPage = function () {
                if (scope.currentPage < scope.pageCount) {
                    scope.currentPage = scope.currentPage + 1;
                }
            };

            scope.prevPageDisabled = function () {
                return scope.currentPage === 1 ? "disabled" : "";
            };
            scope.nextPageDisabled = function () {
                return scope.currentPage === scope.pageCount ? "disabled" : "";
            };
        }
    };
}]);


sharedModule.directive("repeatPassword", function () {
    return {
        require: "ngModel",
        link: function (scope, elem, attrs, ctrl) {
            var otherInput = elem.inheritedData("$formController")[attrs.repeatPassword];

            ctrl.$parsers.push(function (value) {
                if (value === otherInput.$viewValue) {
                    ctrl.$setValidity("repeat", true);
                    return value;
                }
                ctrl.$setValidity("repeat", false);
            });

            otherInput.$parsers.push(function (value) {
                ctrl.$setValidity("repeat", value === ctrl.$viewValue);
                return value;
            });
        }
    };
});

sharedModule.directive('usmConfirmation', ['$log', function ($log) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        templateUrl: 'usm/shared/directive/usmConfirmation.html',
        link: function (scope, element, attrs) {
            scope.$watch('$parent.showConfirmation', function (newValue) {
                scope.showConfirmation = newValue;
            });
            scope.message = attrs.usmConfirmationMessage;
            // The element's bind is outside Angular's context. Apply should be called.
            element.bind('click', function () {
                scope.$apply(function () {
                    scope.$parent.confirmCheckBox = scope.confirm;
                });
            });
        }
    };
}]);

sharedModule.directive('focusMe', ["$timeout", function ($timeout) {    
    return {    
        restrict: 'A',
        transclude: true,
        scope: {},
        link: function (scope, element, attrs, model) {                
            $timeout(function () {
                element[0].focus();
            });
        }
    };
}]);