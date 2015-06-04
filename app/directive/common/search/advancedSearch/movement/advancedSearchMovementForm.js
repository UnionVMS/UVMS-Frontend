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
	
		var DATE_CUSTOM = "Custom";
    
        $scope.selectedSavedSearch = "";
		$scope.movementAdvancedSearch = true;
		$scope.advancedSearchObject.TIME_SPAN = "24";
	
		$scope.toggleAdvancedSearch = function(){
				$scope.movementAdvancedSearch = !$scope.movementAdvancedSearch;
				$scope.resetSearch();
			};

		$scope.resetSearch = function(){
				//empty advancedSearchobject.
				$scope.extMarkNameIRCS = "";
				$scope.selectedSavedSearch = "";
				$scope.resetAdvancedSearchForm(false);
				$scope.advancedSearchObject.TIME_SPAN = "24";
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

        var setupDropdowns = function(){
			$scope.timeSpanDropDownItems = [{'text':'Last 24h', 'code':'24'},{'text':'Last 48h', 'code':'48'}, {'text':'Last 96h', 'code':'96'},{"text":"Custom", "code":DATE_CUSTOM}];
			$scope.flagStates =[{'text':'SWE','code':'SWE'},{'text':'DNK','code':'DNK'},{'text':'NOR','code':'NOR'}];
			$scope.carrierType =[{'text':'Ferry','code':'ferry'},{'text':'Trawler','code':'2'}];
			$scope.gearType =[{'text':'Single','code':'1'},{'text':'Double','code':'2'}];
			$scope.power =[{'text':'100 - 200','code':'100 - 200'},{'text':'201 - 300','code':'201 - 300'}];
			$scope.carrierLength = [{'text':'100-200','code':'100-200'},{'text':'201-300','code':'201-300'}];
			$scope.productOwner = [{'text':'SWE','code':'46'},{'text':'IRL','code':'49'}];
			$scope.messageType = [{'text':'106','code':'106'},{'text':'110','code':'110'}];
			$scope.userOrg = [{'text':'111','code':'111'},{'text':'222','code':'222'}];
			$scope.meassuredSpeed = [{'text':'0 - 5','code':'0 - 5'},{'text':'6 - 10','code':'6 - 10'},{'text':'11 - 15','code':'11 - 15'},{'text':'16 - 20','code':'16 - 20'},{'text':'21 - 25','code':'21 - 25'}];
			$scope.status = [{'text':'Port','code':'port'},{'text':'Sailing','code':'sailing'}];
			$scope.groups = [{'text':'Group1','code':'Group1'},{'text':'Group2','code':'Group2'}];
			$scope.mapArea = [{'text':'Area 1','code':'Area 1'},{'text':'Area 2','code':'Area 2'}];
		};

		$scope.setSimpleSearchCriterias = function (value){
			//ng-change for name/ircs input.
			$scope.advancedSearchObject.NAME = value + "*";
			$scope.advancedSearchObject.IRCS = value + "*";
		};

		  //Watch for changes to the START DATE input
	    $scope.$watch(function () { return $scope.advancedSearchObject.TO_DATE;}, function (newVal, oldVal) {
	        if (typeof newVal !== 'undefined') {
	            $scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
	        }
	    });
	    //Watch for changes to the END DATE input
	    $scope.$watch(function () { return $scope.advancedSearchObject.FROM_DATE;}, function (newVal, oldVal) {
	        if (typeof newVal !== 'undefined') {
	            $scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
	        }
	    });    
	    //Watch for changes to the DATE DROPDOWN
	    $scope.$watch(function () { return $scope.advancedSearchObject.TIME_SPAN;}, function (newVal, oldVal) {
	        if (typeof newVal !== 'undefined' && newVal !== DATE_CUSTOM) {
	            //Reset start date and end date when changing to something else than custom
	            $scope.advancedSearchObject.TO_DATE = undefined;
	            $scope.advancedSearchObject.FROM_DATE = undefined;
	        }
	    });    

		var init = function(){
			setupDropdowns();
			$scope.performAdvancedSearch();
		};

		init();

	}); 
