/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').directive('advancedSearch', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'AdvancedSearchCtrl',
        scope: {
            modeltype : "=",
            searchfunc : "=",
            vesselGroupCallback : "="
        },
        templateUrl: 'directive/common/search/advancedSearch/advancedSearch.html',
        link: function(scope, element, attrs, fn) {
        }
    };
});

angular.module('unionvmsWeb')
    .controller('AdvancedSearchCtrl', function($scope, searchService, searchUtilsService, SearchField){

    $scope.DATE_CUSTOM = searchUtilsService.getTimeSpanCodeForCustom();
    $scope.DATE_TODAY = searchUtilsService.getTimeSpanCodeForToday();

    $scope.timeSpanOptions = searchUtilsService.getTimeSpanOptions();


    //Set form partial depending on modelType
    switch($scope.modeltype) {
        case "SALES":
            $scope.formPartial = 'directive/common/search/advancedSearch/sales/advancedSearchSalesForm.html';
            break;
        case "VESSEL":
            $scope.formPartial = 'directive/common/search/advancedSearch/vessel/advancedSearchVesselForm.html';
            break;
        case "MOBILE_TERMINAL":
            $scope.formPartial = 'directive/common/search/advancedSearch/mobileTerminal/advancedSearchMobileTerminalForm.html';
            break;
        case "POLLING_MOBILE_TERMINAL":
            $scope.formPartial = 'directive/common/search/advancedSearch/pollingMobileTerminal/searchPollingMobileTerminalForm.html';
            break;
        case "MOVEMENT":
            $scope.formPartial = "directive/common/search/advancedSearch/movement/advancedSearchMovementForm.html";
            break;
        case "AUDIT":
            $scope.formPartial = "directive/common/search/advancedSearch/audit/auditSearchForm.html";
            break;
        case "EXCHANGE":
            $scope.formPartial = "directive/common/search/advancedSearch/exchange/exchangeSearch.html";
            break;
        case "ALARMS_HOLDING_TABLE":
            $scope.formPartial = "directive/common/search/advancedSearch/alarm/holdingTableSearchForm.html";
            break;
        case "ALARMS_OPEN_TICKETS":
            $scope.formPartial = "directive/common/search/advancedSearch/alarm/openTicketsSearchForm.html";
            break;
        default:
            console.error("ModelType is missing for advanced search.");
    }

    $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();

    //Search by the advanced search form inputs
    $scope.performAdvancedSearch = function(){
        //Create criterias
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(true);
        searchService.setSearchCriteriasToAdvancedSearch();

        //Do the search
        $scope.searchfunc();
    };

    $scope.updateAdvancedSearchObject = function(key, value){
        if(value === undefined || (typeof value === 'string' && value.trim().length === 0) ){
            delete $scope.advancedSearchObject[key];
        }else{
            // Flag state should handle multiple search options
            if(key === 'FLAG_STATE') {
                $scope.advancedSearchObject[key].push(value);
            }else{
                $scope.advancedSearchObject[key] = value;
            }
        }
    };

    //Search by a saved group
    $scope.performSavedGroupSearch = function(savedSearchGroup, updateAdvancedSearchObject, sendSearchRequest){
        //Inital text selected?
        if(angular.isUndefined(savedSearchGroup.searchFields)){
            return;
        }

        var opt = {};
        opt.savedSearchGroup = savedSearchGroup;

        //Reset page and set search criterias and dynamic
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(savedSearchGroup.dynamic);
        searchService.setSearchCriterias(savedSearchGroup.getSearchFieldsCopy());

        //Update advancedSearchObject with values from the saved search
        searchService.resetAdvancedSearch();
        if(updateAdvancedSearchObject){
            // Create empty object for each search criteria present
            for (var i = 0; i < searchService.getSearchCriterias().length; i++) {
                $scope.advancedSearchObject[searchService.getSearchCriterias()[i].key] = [];
            }

            $.each(searchService.getSearchCriterias(), function(index, searchField){
                $scope.updateAdvancedSearchObject(searchField.key, searchField.value);
            });
        }

        //Do the search
        if(sendSearchRequest){
            $scope.searchfunc(opt);
        }
    };

    //Reset the advanced search form inputs and do a search if sendSearchRequest is set to true
    $scope.resetAdvancedSearchForm = function(sendSearchRequest){
        searchService.resetAdvancedSearch();
        $scope.advancedSearchObject = searchService.getAdvancedSearchObject();
        if(sendSearchRequest){
            $scope.performAdvancedSearch();
        }
    };


});
