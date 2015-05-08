angular.module('unionvmsWeb').directive('periodInput', function($compile) {
	return {
		restrict: 'E',
		replace: true,
        controller : 'periodInputCtrl',
		scope: {
            model : '=',
            ngDisabled : '=',
            ngRequired : '='
		},
		templateUrl: 'directive/common/periodInput/periodInput.html',
		link: function(scope, element, attrs, fn) {
            //Add input name if name attribute exists
            var name = attrs.name;
            if (name) {
                $(element).find("input:nth-child(3)").attr('name', name);
                element.removeAttr("name");
                $compile(element)(scope);
            }
		}
	};
});


angular.module('unionvmsWeb')
    .controller('periodInputCtrl', function($scope){

        //Update the model value and set it to a time based on the hours and minutes inputs
        var setModelValueFromHoursAndMinutes = function(){
            if(angular.isDefined($scope.hours) && angular.isDefined($scope.minutes)){
                $scope.model = $scope.hours * 3600 + $scope.minutes * 60;
            }
        };

        //Set the hours and minutes inputs according to the model value
        var setHoursAndMinutesFromModelValue = function(){
            var hourMinutesSet = false;
            if(angular.isDefined($scope.model)){
                $scope.hours = Math.floor($scope.model / 3600);
                $scope.minutes = Math.floor(($scope.model % 3600) / 60);
                hourMinutesSet = true;
            }
            if(!hourMinutesSet){
                $scope.hours = 0;
                $scope.minutes = 0;
                setModelValueFromHoursAndMinutes();
            }
        };

        //Watch the model for changes
        $scope.$watch('model', function(newValue, oldValue) {
            setHoursAndMinutesFromModelValue();
        });

        //Watch the hours for changes
        $scope.$watch('hours', function(newValue, oldValue) {
            if(! _.isNumber(newValue)){
                $scope.hours = oldValue;
            }
            else{
                setModelValueFromHoursAndMinutes();
            }
        });

        //Watch the minutes for changes
        $scope.$watch('minutes', function(newValue, oldValue) {
            if(! _.isNumber(newValue)){
                $scope.minutes = oldValue;
            }
            else{
                setModelValueFromHoursAndMinutes();
            }            
        });

        var init = function(){
            setHoursAndMinutesFromModelValue();
        };


        init();  
});