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

// End date must be after start date
//Validator with name min-date already exists in Bootstrap so use other name here
angular.module('unionvmsWeb').directive('datePickerInputMinDate', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            datePickerInputMinDate: '='
        },
        link: function(scope, elm, attrs, ctrl) {

            function updateValidity(date) {
                ctrl.$setValidity('minDate', date === undefined || scope.datePickerInputMinDate === undefined || new Date(date) > new Date(scope.datePickerInputMinDate));
            }

            scope.$watch('datePickerInputMinDate', function(newValue) {
                updateValidity(newValue);
            });

            ctrl.$parsers.push(function(viewValue) {
                updateValidity(viewValue);
                return viewValue;
            });

            ctrl.$formatters.push(function(viewValue) {
                updateValidity(viewValue);
                return viewValue;
            });
        }
    };
});

angular.module('unionvmsWeb').directive('datePickerInputMaxDate', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ngModel) {
            if (attr.datePickerInputMaxDate) {
                ngModel.$parsers.unshift(function(value) {
                    var valid = new Date(value).getTime() < attr.datePickerInputMaxDate;
                    ngModel.$setValidity('maxDate', valid);
                    return value;
                });

                ngModel.$formatters.unshift(function(value) {
                    ngModel.$setValidity('maxDate', new Date(value).getTime() < attr.datePickerInputMaxDate);
                    return value;
                });
            }
        }
    };
});

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
