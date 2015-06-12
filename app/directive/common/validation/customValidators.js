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

angular.module('unionvmsWeb').directive('longitude', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, model) {
            model.$parsers.unshift(function(value) {
                model.$setValidity('longitude',  value >= -180 && value <= 180);
                return value;
            });

            model.$formatters.unshift(function(value) {
                model.$setValidity('longitude', value >= -180 && value <= 180);
                return value;
            });
        }
    };
});

angular.module('unionvmsWeb').directive('latitude', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, model) {
            model.$parsers.unshift(function(value) {
                model.$setValidity('latitude',  value >= -90 && value <= 90);
                return value;
            });

            model.$formatters.unshift(function(value) {
                model.$setValidity('latitude', value >= -90 && value <= 90);
                return value;
            });
        }
    };
});
