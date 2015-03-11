angular.module('unionvmsWeb')
    .controller('terminalCtrl', function($scope){

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

        $scope.addComChannel = function(){
            var newChannel =  {
                'number':'168009',
                'order':'1',
                'name':'VMS',
                'id':'104',
                'orderId':'2',
                'note':'EIK, VIZADA',
                'startDate':'2015-01-01',
                'endDate':'2015-05-01'
            };

            console.log($scope);
            if($scope.terminal.communicationChannels === undefined)
            {
                $scope.terminal.communicationChannels = [];
            }

            $scope.terminal.communicationChannels.push(newChannel);
        };

    })

    .directive('mobileterminal', function() {
	return {
		restrict: 'E',
		replace: true,
		scope:{
            terminal:'='
        },
		templateUrl: 'directive/mobileTerminal/mobileTerminal.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
