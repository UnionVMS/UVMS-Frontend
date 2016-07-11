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
//Only digits
angular.module('unionvmsWeb').directive('onlyDigits', [
    function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                var validateFn = function (viewValue) {
                    if (ctrl.$isEmpty(viewValue) || /^[0-9]*$/.test(viewValue)) {
                        ctrl.$setValidity('onlyDigits', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('onlyDigits', false);
                        return undefined;
                    }
                };

                ctrl.$parsers.push(validateFn);
                ctrl.$formatters.push(validateFn);
            }
        };
}]);

//Only letters
angular.module('unionvmsWeb').directive('onlyLetters', [
    function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {

                var validateFn = function (viewValue) {
                    if (ctrl.$isEmpty(viewValue) || /^[A-ZÅÄÖa-zåäö ]*$/.test(viewValue)) {
                        ctrl.$setValidity('onlyLetters', true);
                        return viewValue;
                    } else {
                        ctrl.$setValidity('onlyLetters', false);
                        return undefined;
                    }
                };

                ctrl.$parsers.push(validateFn);
                ctrl.$formatters.push(validateFn);
            }
        };
}]);


var getCheckNumeric = function(model) {
    return function(value) {
        if (typeof value === "string") {
            value = value.replace(",", ".");
        }

        var isNumeric = model.$isEmpty(value) || !isNaN(value);
        model.$setValidity('numeric', isNumeric);
        return isNumeric ? value : undefined;
    };
};

var toNumberParser = function(value) {
    if (typeof value === "string") {
        value = value.replace(",", ".");
    }

    if (isNaN(value)) {
        return undefined;
    }

    return Number(value);
};


//Numeric
angular.module('unionvmsWeb').directive('numeric', [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(s, e, a, model) {
            model.$parsers.push(getCheckNumeric(model));
            model.$parsers.push(toNumberParser);
        }
    };
}]);

//Time interval
//Validate that the interval is larger than 0 seconds
angular.module('unionvmsWeb').directive('period', [
    function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope : {
                period : "="
            },
            link: function(scope, elm, attrs, ctrl) {

                //Watch the period for changes
                scope.$watch('period', function(newValue, oldValue) {
                    ctrl.$setValidity('period', isValidPeriod(ctrl.$viewValue));
                });

                function isValidPeriod(viewValue) {
                    return !scope.period || viewValue > 0;
                }

                ctrl.$parsers.push(function(value){
                    ctrl.$setValidity('period', isValidPeriod(value));
                    return value;
                });
                ctrl.$formatters.push(function(value){
                    ctrl.$setValidity('period', isValidPeriod(value));
                    return value;
                });
            }
        };
}]);

//Validate that model value is valid longitude
angular.module('unionvmsWeb').directive('longitude', function(coordinateFormatService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(s, e, a, model) {
            model.$parsers.push(function(value) {
                var isValid = true;
                if(angular.isDefined(value) && String(value).trim().length > 0){
                    isValid = coordinateFormatService.isValidLongitude(value);
                }
                model.$setValidity('longitude', isValid);
                return value;
            });
        }
    };
});

//Validate that model value is valid latitude
angular.module('unionvmsWeb').directive('latitude', function(coordinateFormatService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(s, e, a, model) {
            model.$parsers.push(function(value) {
                var isValid = true;
                if(angular.isDefined(value) && String(value).trim().length > 0){
                    isValid = coordinateFormatService.isValidLatitude(value);
                }
                model.$setValidity('latitude', isValid);
                return value;
            });
        }
    };
});

angular.module('unionvmsWeb').directive('course', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attrs, model) {
            model.$validators.course = function(modelValue, viewValue) {
                var value = (modelValue || viewValue);
                if (typeof value === String) {
                    value = value.replace(/,/g, ".");
                }

                return value === undefined || value === '' || (value >= 0 && value <= 360);
            };
        }
    };
});

angular.module('unionvmsWeb').directive('existing', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            existing: '='
        },
        link: function(scope, element, attrs, ctrl) {
            function validateFn(value) {
                var valid = true;
                if (value !== undefined && scope.existing !== undefined) {
                    // If both defined, value must be different from the existing value.
                    valid = value !== scope.existing;
                }

                ctrl.$setValidity('unique', valid);
                return value;
            }

            ctrl.$parsers.push(validateFn);
            ctrl.$formatters.push(validateFn);
        }
    };
});