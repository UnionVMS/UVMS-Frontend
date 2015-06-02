angular.module('unionvmsWeb').directive('advancedSearchMovementForm', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {

		},
		templateUrl: 'directive/common/search/advancedSearch/movement/advancedSearchMovementForm.html',
		link: function(scope, element, attrs, fn) {
			
		
		}
	};
});

angular.module('unionvmsWeb')
	.controller('advancedSearchMovementCtrl', function($scope, locale, savedSearchService){
	
        $scope.selectedSavedSearch = "";
		$scope.movementAdvancedSearch = true;
		$scope.timeSpanDropDownItems = [{'text':'Last 24h', 'code':'24'},{'text':'Last 48h', 'code':'48'}, {'text':'Last 96h', 'code':'96'}];

		$scope.toggleAdvancedSearch = function(){
			$scope.movementAdvancedSearch = !$scope.movementAdvancedSearch;
		};

		$scope.resetSearch = function(){
			console.log("SEARCH RESET!!");
            $scope.$selectedSavedSearch = "";
            $scope.resetAdvancedSearchForm(true);            
		};

		$scope.performSearch = function(){
			console.log("perform search");
		};

        $scope.openSaveSearchModal = function(){
            savedSearchService.openSaveSearchModal("MOVEMENT", true);        
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            console.log("performSavedSearch!");
            $scope.resetAdvancedSearchForm(false);
            $scope.performSavedGroupSearch(savedSearchGroup);
        };            


	}); 
