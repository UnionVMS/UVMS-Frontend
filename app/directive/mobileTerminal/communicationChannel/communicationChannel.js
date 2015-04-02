angular.module('unionvmsWeb')
    .controller('communicationCtrl', function($scope){
        $scope.numberSelected = "1";
        $scope.orderSelected = "2";

        $scope.selectNumber = function(number){
            $scope.numberSelected = number;
            $scope.communicationchannel.order = number;
        };

        $scope.selectOrder = function(number){
            $scope.orderSelected = number;
            $scope.communicationchannel.orderId = number;
        };

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


    })


    .directive('communicationChannel', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            communicationchannel:'='
		},
		templateUrl: 'directive/mobileTerminal/communicationChannel/communicationChannel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});


