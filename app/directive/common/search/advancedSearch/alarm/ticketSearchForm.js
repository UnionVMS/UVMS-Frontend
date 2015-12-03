angular.module('unionvmsWeb').controller('TicketSearchController', function($scope, locale, ruleRestService, configurationService, GetListRequest, userService) {

    $scope.rules = [];

    var init = function(){
        $scope.resetSearch();

        //Add ALL option to timeSpan dropdown
        $scope.timeSpanOptions.unshift({text: locale.getString('common.time_span_all'), code:'ALL'});

        //Populate rules dropdown
        var getListRequest = new GetListRequest();
        getListRequest.addSearchCriteria('RULE_USER', userService.getUserName());
        getListRequest.addSearchCriteria('AVAILABILITY', 'PUBLIC');
        ruleRestService.getRulesByQuery(getListRequest).then(function(rulesPage){
            var rulesOptions = [];
            $.each(rulesPage.items, function(i, rule){
                rulesOptions.push({text: rule.name, code: rule.guid});
            });
            rulesOptions = _.sortBy(rulesOptions, function(obj){return obj.text;});
            $scope.rules = rulesOptions;
        });

        //Status options
        $scope.statusOptions = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('TICKET_STATUSES'), 'STATUS', 'TICKET', true);

    };

    $scope.$on("resetAlarmSearch", function() {
        $scope.resetSearch();
    });

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        //Set TIME_SPAN to ALL
        $scope.advancedSearchObject.TIME_SPAN = 'ALL';
        //Set status to OPEN
        var statuses = configurationService.getConfig('TICKET_STATUSES');
        if(Array.isArray(statuses) && statuses.indexOf('OPEN') >= 0){
            $scope.advancedSearchObject.STATUS = 'OPEN';
        }
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
