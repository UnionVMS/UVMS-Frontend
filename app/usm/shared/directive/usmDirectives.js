var sharedModule = angular.module('shared');

sharedModule.directive('usmDatepicker', ['$log', '$parse', 'refData', function ($log, $parse, refData) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            config: '=config'
        },
        transclude: true,
        templateUrl: 'usm/shared/directive/usmDatepicker.html',
        link: function (scope, element, attrs) {

            var putValueInNgModel = function (valueDate) {
                var date = moment(valueDate).format('YYYY-MM-DD');
                // retrieve the dataModel attribute from configuration
                var scopeVariable = scope.config.dataModel;
                // parse the expression in order to use it for assign
                var modelScopeVariable = $parse(scopeVariable);
                // assign the model variable to the target object (scope.$parent) with the value 'date'
                modelScopeVariable.assign(scope.$parent, date);
            };

            // Default values
            if (!scope.config.isDefaultValueWatched) {
                putValueInNgModel(scope.config.defaultValue);
                scope.dataModel = scope.config.defaultValue;
            }

            // For the 'Active To' min date if a value is defined in the parent scope use it...
            if (scope.config.name === 'activeTo' && !_.isUndefined(scope.$parent.minDateTo)) {
                scope.minDate = scope.$parent.minDateTo;
            } else {
                scope.minDate = refData.minCalendarDate;
            }
            scope.maxDate = refData.maxCalendarDate;
            scope.isDisabled = scope.config.isDisabled;

            if (!_.isUndefined(scope.config.isRequired)) {
                scope.isRequired = scope.config.isRequired;
            } else {
                scope.isRequired = false;
            }

            // This watch is for the date default value when comes from the scope model
            scope.$watch('config.defaultValue', function (newValue, oldValue) {

                if (newValue && scope.config.isDefaultValueWatched) {
                    scope.dataModel = moment(newValue).format('YYYY-MM-DD');
                }
            }, true);

            // This watch is for contact details form.
            // Watches the edit/submit button in order to enable disable the datepickers
            scope.$watch('$parent.formDisabled', function (newValue) {
                if (newValue) {
                    scope.isDisabled = newValue;
                } else {
                    scope.isDisabled = newValue;
                }
            }, true);

            // Watch the changes in the minDateTo of the parent and update the minDate of the 'Active To'
            scope.$watch('$parent.minDateTo', function (newValue) {
                if (newValue) {
                    if (scope.config.name === 'activeTo' && !_.isUndefined(scope.$parent.minDateTo)) {
                        scope.minDate = scope.$parent.minDateTo;
                    }
                }
            }, true);

            scope.open = function (event) {
                event.preventDefault();
                event.stopPropagation();
                scope.opened = true;
            };

            scope.change = function (element) {
                putValueInNgModel(element);

                // For 'user details' and 'create user' chnage the min date of the 'Active To' according to the day
                // of 'Active From'
                if (!_.isUndefined(scope.config.page) && (scope.config.page === 'createUser' || scope.config.page === 'userDetails')) {
                    if (scope.config.name === 'activeFrom') {
                        scope.$parent.minDateTo = moment(element).format('YYYY-MM-DD');
                    }
                }

                if (scope.isRequired && _.isUndefined(element)) {
                    if (scope.config.name === 'activeFrom') {
                        scope.$parent.activeFormRequiredAlert = true;
                    }
                    if (scope.config.name === 'activeTo') {
                        scope.$parent.activeToRequiredAlert = true;
                    }
                } else {
                    if (scope.config.name === 'activeFrom') {
                        scope.$parent.activeFormRequiredAlert = false;
                    }
                    if (scope.config.name === 'activeTo') {
                        scope.$parent.activeToRequiredAlert = false;
                    }
                }
            };

        }
    };
}]);

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
