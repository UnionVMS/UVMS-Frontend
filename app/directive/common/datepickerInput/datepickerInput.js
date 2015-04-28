angular.module('unionvmsWeb').directive('datepickerInput', function() {
	return {
		restrict: 'E',
		replace: true,
        controller: 'datepickerInputCtrl',
		scope: {
            model : '=',
            placeholder : '@',
            ngDisabled : '='
		},
		templateUrl: 'directive/common/datepickerInput/datepickerInput.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});

angular.module('unionvmsWeb')
    .controller('datepickerInputCtrl', function($scope){
        $scope.datePicker = (function () {
        var method = {};
        method.instances = [];

        method.open = function ($event, instance) {
            $event.preventDefault();
            $event.stopPropagation();
            method.instances[instance] = true;
        };

        method.options = {
            'show-weeks': false,
            startingDay: 0
        };

        //TODO: Move date format to configuration
        method.format = 'yyyy-MM-dd';
        return method;
    }()); 
});
