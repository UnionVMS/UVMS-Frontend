/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
    .controller('rulesTableDetailsCtrl', function($scope, $timeout, $log, locale, GetListRequest, SearchResults, SearchResultListPage, searchUtilsService, searchService, alarmRestService, movementRestService, PositionReportModal){

        $scope.searchObject = {};
        $scope.currentSearchResults = new SearchResults('openDate', false);

        var getListRequest;

        var init = function(){
            $scope.searchAlarms();
        };

        $scope.searchAlarms = function() {
            getListRequest = new GetListRequest(1, 5, false, []);
            $scope.currentSearchResults.setLoading(true);

            //Add search criterias to getListRequest
            $.each($scope.searchObject, function(key, value){
                //Skip empty values
                if (typeof value === 'string' && value.trim().length !== 0){
                    getListRequest.addSearchCriteria(key, value);
                }
            });

            //Add ruleGuid as criteria
            getListRequest.addSearchCriteria('RULE_GUID', $scope.rule.guid);

            $log.debug(getListRequest);
            searchService.searchTickets(getListRequest)
                .then(updateSearchResults, onGetSearchResultsError);
        };

        //Update the search results
        var updateSearchResults = function(searchResultsListPage){
            console.log(searchResultsListPage);
            $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);
        };

        //Error during search
        var onGetSearchResultsError = function(error){
            $scope.currentSearchResults.removeAllItems();
            $scope.currentSearchResults.setLoading(false);
            $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        };

        //Goto page in the search results
        $scope.gotoPage = function(page){
            if(angular.isDefined(page)){
                getListRequest.page = page;
                $scope.currentSearchResults.setLoading(true);
                alarmRestService.getTicketsList(getListRequest)
                    .then(updateSearchResults, onGetSearchResultsError);
            }
        };

        $scope.showOnMap = function(item){
            //Work on a copy of the alarm item so you can cancel the editing
            var copy = item.copy();
            var options = {
                readOnly : true
            };
            //Get movement
            var movementPromise = movementRestService.getMovement(copy.positionGuid);
            options.movementPromise = movementPromise;

            //Open modal
            PositionReportModal.show(copy, options);
        };

        //SEARCH FORM
        var DATE_CUSTOM = searchUtilsService.getTimeSpanCodeForCustom();
        var DATE_TODAY = searchUtilsService.getTimeSpanCodeForToday();

        $scope.timeSpanOptions = searchUtilsService.getTimeSpanOptions();
        $scope.searchObject.TIME_SPAN = DATE_TODAY;

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