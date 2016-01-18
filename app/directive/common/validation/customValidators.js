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
                ctrl.$setValidity('unique', value !== scope.existing);
                return value;
            }

            ctrl.$parsers.push(validateFn);
            ctrl.$formatters.push(validateFn);
        }
    };
});

