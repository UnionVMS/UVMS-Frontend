angular.module('unionvmsWeb').directive('datepickerInput', function($compile) {
	return {
		restrict: 'E',
		replace: true,
        controller: 'datepickerInputCtrl',
		scope: {
            model : '=',
            placeholder : '@',
            ngDisabled : '=',
            ngRequired : '=',
            ngChangeCallback : '=',
            startDate : '=',
            datepickerMaxDate: '@'
		},
		templateUrl: 'directive/common/datepickerInput/datepickerInput.html',
		link: function(scope, element, attrs, fn) {
            //Add input name if name attribute exists
            var name = attrs.name;
            //Add input name if name attribute exists
            if(name) {
                element.find('input').attr('name', name);
                element.removeAttr("name");
                $compile(element)(scope);
            }

            //Add a random id
            element.find('input').attr('id', scope.randomId);

            //Date format
            var dateFormat = 'Y-m-d';

            //DateTimePicker options
            var options = {
                datepicker:true,
                timepicker:false,
                lazyInit: true,
                format : dateFormat,
                closeOnDateSelect: true,
                dayOfWeekStart:1, //monday
            };

            //Set default date to current date/time in UTC
            options.defaultDate = moment.utc().format('YYYY-MM-DD');

            //Use time?
            scope.useTime = false;
            if(angular.isDefined(attrs.time) && attrs.time){
                scope.useTime = true;
                options.timepicker = true;
                options.format = 'Y-m-d G:i';
                options.step = 5;
                options.roundTime = 'floor';
                //Set default date with time also
                options.defaultDate = moment.utc().format('YYYY-MM-DD HH:mm');
                options.closeOnDateSelect = false;
            }

            //Crate dateTimePicker
            jQuery("#" +scope.randomId).datetimepicker(options);
        }
	};
});

angular.module('unionvmsWeb')
    .controller('datepickerInputCtrl', function($scope, dateTimeService){

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

        //Update model value and call callback function
        $scope.onChange = function(){
            //Update model
            if(angular.isDefined($scope.viewModel)){
                //Add UTC timezone (+00:00)
                var newModelVal = dateTimeService.formatUTCDateWithTimezone($scope.viewModel);
                //Only set model and call callback if newValue is valid
                if(newModelVal.indexOf("Invalid date") < 0){
                    $scope.model = newModelVal;
                    //Call callback
                    if(angular.isDefined($scope.ngChangeCallback)){
                        $scope.ngChangeCallback($scope.model);
                    }
                }
            }
        };

        //Watch changes of the model and update the viewModel when it happens
        $scope.$watch('model', function(newValue) {
            //Undefined or empty string?
            if(typeof newValue !== 'string' || newValue.trim().length === 0){
                $scope.viewModel = '';
            }
            else{
                //Parse the date/time and format it
                var newViewValue;
                //Parse UTC date to viewValue
                if($scope.useTime){
                    newViewValue = moment.utc(newValue).format('YYYY-MM-DD HH:mm');
                }else{
                    newViewValue = moment.utc(newValue).format('YYYY-MM-DD');
                }
                $scope.viewModel = newViewValue;
            }
        });
});
