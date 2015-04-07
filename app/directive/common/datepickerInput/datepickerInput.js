angular.module('unionvmsWeb').directive('datepickerInput', function() {
	return {
		restrict: 'E',
		replace: true,
        controller: 'datepickerInputCtrl',
		scope: {
            model : '='
		},
		templateUrl: 'directive/common/datepickerInput/datepickerInput.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});

angular.module('unionvmsWeb')
    .controller('datepickerInputCtrl', function($scope, searchService, SearchField){
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

        var formats = ['MM/dd/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        method.format = formats[4];
        return method;
    }()); 
});
