angular.module('unionvmsWeb').controller('AlarmSearchController', function($scope, locale, ruleRestService) {

    $scope.rules = [];

    var init = function(){
        $scope.resetSearch();

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
        $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;
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
