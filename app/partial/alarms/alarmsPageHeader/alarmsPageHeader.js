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
    .controller('alarmsPageHeaderCtrl', function($scope, openAlarmsAndTicketsService){

        $scope.isActiveTab = function(tabName){
            return $scope.activeTab === tabName;
        };
        $scope.numberOfOpenAlarmsAndTickets = openAlarmsAndTicketsService.getCount();
    });
