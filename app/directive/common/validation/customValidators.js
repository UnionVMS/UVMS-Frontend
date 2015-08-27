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

var getCheckFormat = function(model, regex) {
    return function(value) {
        var match = typeof value === "string" && regex.test(value);
        model.$setValidity('format', match);
        return match ? value : undefined;
    };
};

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

var getCheckLongitude = function(model) {
    return function(value) {
        var longitude = typeof value === "number" && Math.abs(value) <= 180;
        model.$setValidity('longitude', longitude);
        return longitude ? value : undefined;
    };
};

var getCheckLatitude = function(model) {
    return function(value) {
        var latitude = typeof value === "number" && Math.abs(value) <= 90;
        model.$setValidity('latitude', latitude);
        return latitude ? value : undefined;
    };
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
angular.module('unionvmsWeb').directive('minDate', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            minDate: '='
        },
        link: function(scope, elm, attrs, ctrl) {

            function updateValidity(date) {
                ctrl.$setValidity('minDate', date === undefined || scope.minDate === undefined || new Date(date) > new Date(scope.minDate));
            }

            scope.$watch('minDate', function(newValue) {
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

angular.module('unionvmsWeb').directive('maxDate', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ngModel) {
            if (attr.maxDate) {
                ngModel.$parsers.unshift(function(value) {
                    var valid = new Date(value).getTime() < attr.maxDate;
                    ngModel.$setValidity('maxDate', valid);
                    return value;
                });

                ngModel.$formatters.unshift(function(value) {
                    ngModel.$setValidity('maxDate', new Date(value).getTime() < attr.maxDate);
                    return value;
                });
            }
        }
    };
});

var formatThreeDecimals = /^-?\d*[\.,]?(\d{0,3})?$/;

angular.module('unionvmsWeb').directive('longitude', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(s, e, a, model) {
            model.$parsers.push(getCheckFormat(model, formatThreeDecimals)); // a string number with no more than 3 decimal places
            model.$parsers.push(toNumberParser); // make it a number
            model.$parsers.push(getCheckLongitude(model)); // number is within [-180, 180]
        }
    };
});

angular.module('unionvmsWeb').directive('latitude', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(s, e, a, model) {
            model.$parsers.push(getCheckFormat(model, formatThreeDecimals)); // <= 3 decimals
            model.$parsers.push(toNumberParser); // number
            model.$parsers.push(getCheckLatitude(model)); // [-90, 90]
        }
    };
});
