angular.module('unionvmsWeb').directive('rulesTableDetails', function() {
	return {
		restrict: 'E',
		replace: true,
		scope: {
            rule : '@'

		},
        controller : 'rulesTableDetailsCtrl',
		templateUrl: 'directive/alarms/rules/rulesTableDetails/rulesTableDetails.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});

angular.module('unionvmsWeb')
    .controller('rulesTableDetailsCtrl', function($scope, $timeout, $log, locale, GetListRequest, SearchResults, Alarm, SearchResultListPage, searchService){

        $scope.searchObject = {};
        $scope.currentSearchResults = new SearchResults('openedDate', false);

        var getListRequest = new GetListRequest(1, 5, false, []);
        var DATE_CUSTOM = "CUSTOM";

        var init = function(){
            $scope.searchAlarms();
        };

        var updateWithMockResults = function(page){
            //Add mock data    
            var mockAlarms = [];
            for (var i = 6; i >= 1; i--) {
                var mockAlarm = new Alarm();
                mockAlarm.id = i;
                mockAlarm.openedDate = "2015-08-22 08:00";
                mockAlarm.affectedObject = "Tunafjord";
                mockAlarm.ruleName = "POS Validation";
                mockAlarm.sender = "FMC";
                
                var random = Math.floor(Math.random() * 3) + 1;
                if(random === 3){
                    //Nothing
                }
                else if(random === 2){
                    mockAlarm.setStatusToClosed();
                    mockAlarm.resolvedDate = "2015-08-27 13:37";
                    mockAlarm.resolvedBy = "antkar";                
                }else{
                    mockAlarm.setStatusToOpen();
                }

                mockAlarms.push(mockAlarm);
            }
            var mockListPage = new SearchResultListPage(mockAlarms, page, 12);
            $scope.currentSearchResults.updateWithNewResults(mockListPage);
        };

        $scope.searchAlarms = function() {            
            getListRequest = new GetListRequest(1, 5, false, []);
            $scope.currentSearchResults.clearForSearch();
            
            //Add search criterias to getListRequest
            $.each($scope.searchObject, function(key, value){
                //Skip empty values
                if (typeof value === 'string' && value.trim().length !== 0){
                    getListRequest.addSearchCriteria(key, value);
                }                
            });

            //Fix time criterias
            getListRequest.setSearchCriterias(searchService.updateTimeSpanAndTimeZone(getListRequest.criterias));

            //TODO: Implement search using RestService directly.
            //Don't use the searchService since that can't handle multiple concurrent searches
            $log.debug("Todo: implement search! Current searchObject:");
            $log.debug($scope.searchObject);
            $log.debug(getListRequest);
            $timeout(function(){
                updateWithMockResults(1);
            }, 1000);
        };

        $scope.nextPage = function(){
            getListRequest.page += 1;
            $scope.currentSearchResults.items.length = 0;
            $scope.currentSearchResults.setLoading(true);
            //TODO: Implement real search
            $timeout(function(){
                updateWithMockResults($scope.currentSearchResults.page+1);
            }, 1000);                        
        };

        $scope.prevPage = function(){
            getListRequest.page -= 1;
            $scope.currentSearchResults.items.length = 0;
            $scope.currentSearchResults.setLoading(true);
            //TODO: Implement real search
            $timeout(function(){
                updateWithMockResults($scope.currentSearchResults.page-1);
            }, 1000);                        
        };

        //SEARCH FORM
        $scope.timeSpanOptions = [{
            text:'24' +locale.getString('common.time_hour_short'),
            code:'24'
        },
        {
            text: locale.getString("config.ALARMS_TIME_SPAN_custom"),
            code: DATE_CUSTOM
        }];
        $scope.searchObject.TIME_SPAN = $scope.timeSpanOptions[0].code;

        $scope.$watch("searchObject.FROM_DATE", function(newValue) {
            if (newValue) {
                $scope.searchObject.TIME_SPAN = DATE_CUSTOM;
            }
        });

        $scope.$watch("searchObject.TO_DATE", function(newValue) {
            if (newValue) {
                $scope.searchObject.TIME_SPAN = DATE_CUSTOM;
            }
        });

        $scope.$watch('searchObject.TIME_SPAN', function(newValue) {
            if (newValue && newValue !== DATE_CUSTOM) {
                delete $scope.searchObject.FROM_DATE;
                delete $scope.searchObject.TO_DATE;
            }
        });

        init(); 
    }
);
