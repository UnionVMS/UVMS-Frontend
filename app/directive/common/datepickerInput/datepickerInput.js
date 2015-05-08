angular.module('unionvmsWeb').directive('datepickerInput', function($compile) {
	return {
		restrict: 'E',
		replace: true,
        controller: 'datepickerInputCtrl',
		scope: {
            model : '=',
            placeholder : '@',
            ngDisabled : '=',
            ngRequired : '='
		},
		templateUrl: 'directive/common/datepickerInput/datepickerInput.html',
		link: function(scope, element, attrs, fn) {
            //Add input name if name attribute exists
            var name = attrs.name;
            element.find('input').attr('id', scope.randomId);

            var useTime = false;
            var format = 'Y-m-d';

            if(angular.isDefined(attrs.time)){
                useTime = attrs.time;
                format = 'Y-m-d G:i';
            }

            jQuery("#" +scope.randomId).datetimepicker({
                datepicker:true,
                timepicker:useTime,
                lazyInit: true,
                format : format,
                step: 5,
                closeOnDateSelect: !useTime
            });

            if (name) {
                element.find('input').attr('name', name);
                element.removeAttr("name");
                $compile(element)(scope);
                }
        }
	};
});

angular.module('unionvmsWeb')
    .controller('datepickerInputCtrl', function($scope){

        function guid() {
          function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
          }
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        }

        //Create a unique id for the input
        $scope.randomId = guid();

        //Open on button click
        $scope.open = function () {
            jQuery("#" +$scope.randomId).trigger("open.xdsoft");
        };

        function leadingZero(value) {
            if (value < 10) {
                return "0" + value;
            }

            return value;
        }

        $scope.$watch('viewModel', function(newValue) {
            var d = new Date(newValue);
            var date = [d.getFullYear(), leadingZero(d.getMonth()), leadingZero(d.getDate())];
            var time = [leadingZero(d.getHours()), leadingZero(d.getMinutes()), leadingZero(d.getSeconds())];
            $scope.model = date.join('-') + ' ' + time.join(':');
        });
});
