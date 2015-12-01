angular.module('unionvmsWeb').controller('HoldingTableSearchController', function($scope, locale) {

    var init = function(){
        //Add ALL option to timeSpan dropdown
        $scope.timeSpanOptions.unshift({text: locale.getString('common.time_span_all'), code:'ALL'});


        //Status options
        //TODO: GET STATUS FROM CONFIG
        $scope.statusOptions = [];
        $scope.statusOptions.push({text: locale.getString('alarms.alarms_status_reprocessed'), code:'REPROCESSED'});
        $scope.statusOptions.push({text: locale.getString('alarms.alarms_status_rejected'), code:'REJECTED'});
        $scope.statusOptions.push({text: locale.getString('alarms.alarms_status_open'), code:'OPEN'});

        $scope.resetSearch();
    };

    $scope.$on("resetAlarmSearch", function() {
        $scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        //Set TIME_SPAN to ALL
        $scope.advancedSearchObject.TIME_SPAN = $scope.ALL;

        //Set status to OPEN
        $scope.advancedSearchObject.STATUS = 'OPEN';

        //Do the search
        $scope.performAdvancedSearch();
    };

	$scope.$watch("advancedSearchObject.FROM_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.TO_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.TIME_SPAN', function(newValue) {
		if (newValue && newValue !== $scope.DATE_CUSTOM) {
			delete $scope.advancedSearchObject.FROM_DATE;
			delete $scope.advancedSearchObject.TO_DATE;
		}
	});

    init();
});
