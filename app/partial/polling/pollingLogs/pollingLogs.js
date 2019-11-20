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
angular.module('unionvmsWeb').controller('pollingLogsCtrl',function($scope, $stateParams, $resource, $filter, Poll, PollStatus, searchService, searchUtilsService, alertService, locale, SearchResults, csvService, infoModal, configurationService, longPolling){

    $scope.activeTab = "POLLING_LOGS";

    //Show poll by ID
    $scope.pollId = undefined;
    $scope.showPollByID = false;

    $scope.currentSearchResults = new SearchResults('exchangePoll.history[0].time', true, locale.getString('polling.polling_logs_search_zero_results_error'));

    //Holds the search criterias
    $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();
    $scope.selectedItems = [];

    //DATA FOR DROPDOWNS
    $scope.DATE_CUSTOM = searchUtilsService.getTimeSpanCodeForCustom();
    $scope.DATE_TODAY = searchUtilsService.getTimeSpanCodeForToday();
    $scope.timeSpanOptions = searchUtilsService.getTimeSpanOptions();

    $scope.pollTypes = [];
    $scope.pollTypes.push({"text": locale.getString('config.MOBILETERMINAL_POLL_TYPE_CONFIGURATION_POLL'), "code":"CONFIGURATION_POLL"});
    $scope.pollTypes.push({"text": locale.getString('config.MOBILETERMINAL_POLL_TYPE_MANUAL_POLL'), "code":"MANUAL_POLL"});
    $scope.pollTypes.push({"text": locale.getString('config.MOBILETERMINAL_POLL_TYPE_SAMPLING_POLL'), "code":"SAMPLING_POLL"});
    $scope.pollTypes.push({"text": locale.getString('config.MOBILETERMINAL_POLL_TYPE_AUTOMATIC_POLL'), "code":"AUTOMATIC_POLL"});
    $scope.pollTypes = _.sortBy($scope.pollTypes, function(obj){return obj.text;});

    $scope.statusTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'STATUS'),'STATUS','EXCHANGE', true);
    $scope.statusTypes = _.sortBy($scope.statusTypes, function(obj){return obj.text;});

    var terminalConfigs = configurationService.getValue('MOBILE_TERMINAL_TRANSPONDERS', 'terminalConfigs');
    $scope.terminalTypes = [];
    $.each(terminalConfigs, function(index, terminalConfig){
        $scope.terminalTypes.push({"text":terminalConfig.viewName, "code": terminalConfig.systemType});
    });
    $scope.terminalTypes = _.sortBy($scope.terminalTypes, function(obj){return obj.text;});

    $scope.newPollingLogCount = 0;
    var longPollingId;
    var modalInstance;

    $scope.advancedSearch = false;

    $scope.resetSearch = function() {
        searchService.resetAdvancedSearch();
        $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;
        $scope.getPolls();
    };

    var updatePollingLogsWithGuid = function(guid) {
        searchService.searchPolls().then(function(page) {
            if (page.hasItemWithGuid(guid)) {
                $scope.clearSelection();
                updateSearchResults(page);
            }
            else {
                $scope.newPollingLogCount++;
            }
        });
    };

    var init = function(){
        searchService.reset();
        $scope.pollId = $stateParams.id;
        //Load poll details by searching for a poll by GUID
        if(angular.isDefined($scope.pollId)){
            $scope.activeTab = "POLLING_LOGS_BY_ID";
            $scope.currentSearchResults.zeroResultsErrorMessage = locale.getString('polling.polling_logs_by_id_search_zero_results_error');
            $scope.getPolls($scope.pollId);
        }else{
            //Set search date to today
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;
            //Load list with polls from start
            $scope.searchPolls();
        }

        longPollingId = longPolling.poll("/exchange/activity/poll", function(response) {
            if (response.ids.length > 0) {
                updatePollingLogsWithGuid(response.ids[0]);
            }
        });
    };

    $scope.getStatusLabelClass = function(status){
        switch(status){
            case 'SUCCESSFUL' :
                return 'status-label-success';
            case 'FAILED' :
                return 'status-label-danger';
        }
    };

    //Export data as CSV file
    $scope.exportLogsAsCSVFile = function(){
        var filename = 'pollingLogs.csv';

        //Set the header columns
        var header = [
            locale.getString('polling.polling_logs_table_header_name'),
            locale.getString('polling.polling_logs_table_header_ext_no'),
            locale.getString('polling.polling_logs_table_header_poll_type'),
            locale.getString('polling.polling_logs_table_header_transponder'),
            locale.getString('polling.polling_logs_table_header_identifier'),
            locale.getString('polling.polling_logs_table_header_user'),
            locale.getString('polling.polling_logs_table_header_time'),
            locale.getString('polling.polling_logs_table_header_status'),
            locale.getString('common.comment')
        ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            if($scope.selectedItems.length > 0){
                exportItems = $scope.selectedItems;
            }
            //Export all logs in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                        angular.isDefined(item.vessel) ? item.vessel.name : '',
                        angular.isDefined(item.vessel) ? item.vessel.externalMarking : '',
                        angular.isDefined(item.poll) ? $filter('pollTypeName')(item.poll.type) : '',
                        angular.isDefined(item.poll) ? $filter('transponderName')(item.poll.attributes.TRANSPONDER) : '',
                        angular.isDefined(item.exchangePoll) ? item.exchangePoll.identifier : '',
                        angular.isDefined(item.poll) ? item.poll.attributes.USER : '',
                        angular.isDefined(item.exchangePoll) ? $filter('confDateFormat')(item.exchangePoll.history.slice(-1)[0].time) : '',
                        angular.isDefined(item.exchangePoll) ? $filter('exchangeStatusName')(item.exchangePoll.history.slice(-1)[0].status) : '',
                        angular.isDefined(item.poll.comment) ? item.poll.comment : ''
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);
    };

    /*SEARCH POLLING LOGS*/

    //Watch for changes to the START DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.FROM_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
        }
    });
    //Watch for changes to the END DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.TO_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
        }
    });
    //Watch for changes to the DATE DROPDOWN
    $scope.$watch(function () { return $scope.advancedSearchObject.TIME_SPAN;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined' && newVal !== $scope.DATE_CUSTOM) {
            //Remove start date and end date when changing to something else than custom
            delete $scope.advancedSearchObject.FROM_DATE;
            delete $scope.advancedSearchObject.TO_DATE;
        }
    });



    //Get list of polls matching the current search criterias
    //If pollId is set, search for that one
    $scope.getPolls = function(pollId){
        $scope.newPollingLogCount = 0;
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        $scope.clearSelection();

        //Create criterias and do the search
        searchService.resetPage();
        searchService.resetSearchCriterias();

        //Search for pollId
        if(pollId){
            $scope.showPollByID = true;
            searchService.addSearchCriteria('POLL_ID', pollId);
        }else{
            searchService.setDynamic(true);
            searchService.setSearchCriteriasToAdvancedSearch();
        }
        searchService.searchPolls()
                .then(updateSearchResults, onGetSearchResultsError);
    };

    //Callback from search function
    $scope.searchPolls = function(){
        $scope.getPolls();
    };

    //Update the search results
    var updateSearchResults = function(searchResultsListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);
    };


    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.currentSearchResults.clearErrorMessage();
            $scope.currentSearchResults.setLoading(true);
            $scope.clearSelection();
            searchService.searchPolls()
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Show comment in modal
    $scope.showComment = function(item){
        var options = {
            titleLabel : locale.getString('common.comment'),
            textLabel : item.poll.comment,
        };
        modalInstance = infoModal.open(options);
    };

    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){
        if ($scope.isAllChecked()) {
            $scope.clearSelection();
            $.each($scope.currentSearchResults.items, function(index, item) {
                item.Selected = false;
                $scope.removeFromSelection(item);
            });
        } else {
            $scope.clearSelection();
            $.each($scope.currentSearchResults.items, function(index, item) {
                item.Selected = true;
                $scope.addToSelection(item);
            });
        }
    };

    $scope.checkItem = function(item){
        item.Selected = !item.Selected;

        if (item.Selected){
            $scope.addToSelection(item);
        } else {
            $scope.removeFromSelection(item);
        }
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedItems.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.currentSearchResults.items, function(index, item) {
            if(!$scope.isChecked(item)){
                allChecked = false;
                return false;
            }
        });
        return allChecked;
    };

    $scope.isChecked = function(item){
        var checked = false;

        if (item.Selected) {
            checked = true;
        }

        return checked;
    };

    //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedItems = [];
    };

    //Add an item to the selection
    $scope.addToSelection = function(item){
        $scope.selectedItems.push(item);
    };

    //Remove an item from the selection
    $scope.removeFromSelection = function(item){
        $scope.selectedItems.splice(item, 1);
    };

    //Add items to the "edit selection" dropdown
    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedItems.length > 0){
            if (selectedItem.code === 'EXPORT') {
                $scope.exportLogsAsCSVFile(true);
           }
        } else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        longPolling.cancel(longPollingId);
        if(angular.isDefined(modalInstance)){
            modalInstance.dismiss();
        }
    });

    init();
});
