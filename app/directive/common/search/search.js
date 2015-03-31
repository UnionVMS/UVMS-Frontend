angular.module('unionvmsWeb').directive('search', function() {
	return {
		restrict: 'E',
		replace: true,
		controller : 'searchCtrl',
		scope: {

		},
		templateUrl: 'directive/common/search/search.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});

angular.module('unionvmsWeb')
	.controller('searchCtrl', function($scope){

	$scope.availableTypes = ['Vessel', 'Mobile Terminal'];
	$scope.advancedSearchAvailable = false;
	$scope.advancedSearchVisible = false;
	$scope.savedGroups = [
		{name: "Swedish ships"},
		{name: "Something else"}
	];

	$scope.search = function(){
		console.log("Search...");
		console.log("TODO: Implement search function");
	};

	$scope.toggleAdvancedSearch = function(){
		$scope.advancedSearchVisible = !$scope.advancedSearchVisible;
	};

});

