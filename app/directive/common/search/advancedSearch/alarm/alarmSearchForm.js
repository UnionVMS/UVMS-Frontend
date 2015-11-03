angular.module('unionvmsWeb').controller('AlarmSearchController', function($scope, locale, ruleRestService) {

	var DATE_CUSTOM = "Custom";

    $scope.timeSpanOptions = [{
        text:'24' +locale.getString('common.time_hour_short'),
        code:'24'
    },
    {
        text: locale.getString("config.ALARMS_TIME_SPAN_custom"),
        code: DATE_CUSTOM
    }];

    $scope.advancedSearchObject.TIME_SPAN = $scope.timeSpanOptions[0].code;
    $scope.rules = [];

    var init = function(){
        //Populate rules dropdown
        ruleRestService.getRulesList().then(function(rulesPage){
            var rulesOptions = [];
            $.each(rulesPage.items, function(i, rule){
                rulesOptions.push({text: rule.name, code: rule.guid});
            });
            rulesOptions = _.sortBy(rulesOptions, function(obj){return obj.text;});
            $scope.rules = rulesOptions;
        });
    };

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.TIME_SPAN = $scope.timeSpanOptions[0].code;
        $scope.performAdvancedSearch();
    };

	$scope.performAdvancedSearch = function() {
		$scope.$parent.performAdvancedSearch();
	};

	$scope.$watch("advancedSearchObject.FROM_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
		}
	});

	$scope.$watch("advancedSearchObject.TO_DATE", function(newValue) {
		if (newValue) {
			$scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
		}
	});

	$scope.$watch('advancedSearchObject.TIME_SPAN', function(newValue) {
		if (newValue && newValue !== DATE_CUSTOM) {
			delete $scope.advancedSearchObject.FROM_DATE;
			delete $scope.advancedSearchObject.TO_DATE;
		}
	});

    init();
});
