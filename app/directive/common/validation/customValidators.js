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