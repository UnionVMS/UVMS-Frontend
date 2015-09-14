angular.module('unionvmsWeb').controller('AlarmSearchController', function($scope, locale) {

	var DATE_CUSTOM = "Custom";

    $scope.advancedSearchObject.TIME_SPAN = '24';
	$scope.timeSpanOptions = [{
		text:'24h',
		code:'24'
	},
	{
		text: locale.getString("config.ALARMS_TIME_SPAN_custom"),
		code: DATE_CUSTOM
	}];

    //Reset the form
    $scope.resetSearch = function(){
        //empty advancedSearchobject.
        $scope.resetAdvancedSearchForm(false);
        $scope.advancedSearchObject.TIME_SPAN = $scope.timeSpanOptions[0].code;
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

});
