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
            element.find('input').attr('id', scope.randomId);

            scope.useTime = false;
            var format = 'Y-m-d';

            if(angular.isDefined(attrs.time)){
                scope.useTime = attrs.time;
                format = 'Y-m-d G:i';
            }

            jQuery("#" +scope.randomId).datetimepicker({
                datepicker:true,
                timepicker:scope.useTime,
                lazyInit: true,
                format : format,
                step: 5,
                closeOnDateSelect: !scope.useTime
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

        //Handle change event
        $scope.onChange = function(){
            if(angular.isDefined($scope.ngChangeCallback)){
                $scope.ngChangeCallback($scope.model);
            }
        };

        var watchModelChanges = true;
        //Watch changes of the viewModel
        $scope.$watch('viewModel', function(newValue) {
            //Set watchModelChanges to false so the watch on model doesn't update the viewModel which will 4use an inifinte watch loop
            watchModelChanges = false;
            if(angular.isDefined(newValue)){
                var d = new Date(newValue);
                var date = [d.getFullYear(), leadingZero(d.getMonth() + 1), leadingZero(d.getDate())];

                var newModelVal;
                if($scope.useTime){
                    var time = [leadingZero(d.getHours()), leadingZero(d.getMinutes()), leadingZero(d.getSeconds())];
                    newModelVal = date.join('-') + ' ' + time.join(':');
                }else{
                    newModelVal = date.join('-');
                }

                //Only set model to newModelVal if valid
                if(newModelVal.indexOf("NaN") < 0){
                    $scope.model = newModelVal;
                }else{
                    $scope.model = undefined;
                }
            }
        });

        //Watch changes of the model and update the viewModel when it happens
        $scope.$watch('model', function(newValue) {
            //Don't update viewModel if the watch
            if (watchModelChanges || ($scope.viewModel === undefined && newValue !== undefined)) {
                $scope.viewModel = newValue;
            }
            watchModelChanges = true;
        });
});
