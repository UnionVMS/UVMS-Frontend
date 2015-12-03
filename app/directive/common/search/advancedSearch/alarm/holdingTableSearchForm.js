angular.module('unionvmsWeb').controller('HoldingTableSearchController', function($scope, locale, configurationService) {

    var init = function(){
        //Add ALL option to timeSpan dropdown
        $scope.timeSpanOptions.unshift({text: locale.getString('common.time_span_all'), code:'ALL'});

        //Status options
        $scope.statusOptions = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('ALARM_STATUSES'), 'STATUS', 'ALARM', true);
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
        var statuses = configurationService.getConfig('ALARM_STATUSES');
        if(Array.isArray(statuses) && statuses.indexOf('OPEN') >= 0){
            $scope.advancedSearchObject.STATUS = 'OPEN';
        }

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
