angular.module('unionvmsWeb').directive('alarmsPageHeader', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
			activeTab :'@'
		},
        controller: 'alarmsPageHeaderCtrl',
		templateUrl: 'partial/alarms/alarmsPageHeader/alarmsPageHeader.html',
		link: function(scope, element, attrs, fn) {           
		}
	};
});

angular.module('unionvmsWeb')
    .controller('alarmsPageHeaderCtrl', function($scope){
        
            $scope.isActiveTab = function(tabName){
                return $scope.activeTab === tabName;
            };

            //TODO: GET REAL DATA INSTEAD OF RANDOM MOCK NUMBERS
            $scope.holdingTableNotifications = Math.round(Math.random()*15);
            $scope.openTicketsNotifications = Math.round(Math.random()*3);
    });
