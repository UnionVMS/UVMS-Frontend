angular.module('unionvmsWeb').controller('pollingLogsCtrl',function($scope, $stateParams, $resource, $filter, Poll, PollStatus, searchService, searchUtilsService, alertService, locale, SearchResults, csvService, infoModal, configurationService){

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
    $scope.pollTypes.push({"text":"Configuration", "code":"CONFIGURATION_POLL"});
    $scope.pollTypes.push({"text":"Manual", "code":"MANUAL_POLL"});
    $scope.pollTypes.push({"text":"Program", "code":"PROGRAM_POLL"});
    $scope.pollTypes.push({"text":"Sample", "code":"SAMPLE_POLL"});

    $scope.statusTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('EXCHANGE', 'STATUS'),'STATUS','EXCHANGE', true);

    var terminalConfigs = configurationService.getValue('MOBILE_TERMINAL_TRANSPONDERS', 'terminalConfigs');
    $scope.terminalTypes = [];
    $.each(terminalConfigs, function(index, terminalConfig){
        $scope.terminalTypes.push({"text":terminalConfig.viewName, "code": terminalConfig.systemType});
    });

    /* Do long-polling,  */
    var doLongPolling = function() {
        $resource("/exchange/activity/poll").get(function(response) {
            if (response.ids.length > 0) {
                $scope.getPolls();
            }

            doLongPolling();
        });
    };

    var init = function(){
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

        // doLongPolling();
    };

    $scope.getStatusLabelClass = function(status){
        switch(status){
            case 'SUCCESSFUL' :
                return 'label-success';
            case 'FAILTED' :
                return 'label-danger';
            default:
                return 'label-warning';
        }
    };

    $scope.print = function(){
        console.log("Print...");
        window.print();
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
            locale.getString('polling.polling_logs_table_header_time'),
            locale.getString('polling.polling_logs_table_header_status'),
            locale.getString('polling.polling_logs_table_header_user')
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
                        item.vessel.name,
                        item.vessel.externalMarking,
                        $filter('pollTypeName')(item.poll.type),
                        $filter('transponderName')(item.poll.attributes.TRANSPONDER),
                        $filter('confDateFormat')(item.exchangePoll.history[0].time),
                        $filter('exchangeStatusName')(item.exchangePoll.history[0].status),
                        item.poll.attributes.USER
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
    $scope.$watch(function () { return $scope.advancedSearchObject.START_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
        }
    });
    //Watch for changes to the END DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.END_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
        }
    });
    //Watch for changes to the DATE DROPDOWN
    $scope.$watch(function () { return $scope.advancedSearchObject.TIME_SPAN;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined' && newVal !== $scope.DATE_CUSTOM) {
            //Reset start date and end date when changing to something else than custom
            $scope.advancedSearchObject.START_DATE = undefined;
            $scope.advancedSearchObject.END_DATE = undefined;
        }
    });



    //Get list of polls matching the current search criterias
    //If pollId is set, search for that one
    $scope.getPolls = function(pollId){
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
        infoModal.open(options);
    };

    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){
        if($scope.isAllChecked()){
            //Remove all
            $scope.clearSelection();
        }else{
            //Add all
            $scope.clearSelection();
            $.each($scope.currentSearchResults.items, function(index, item) {
                $scope.addToSelection(item);
            });
        }
    };

    $scope.checkItem = function(item){
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
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
        $.each($scope.selectedItems, function(index, item){
            if(item.isEqualPollId(item)){
                checked = true;
                return false;
            }
        });
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
        $.each($scope.selectedItems, function(index, item){
            if(item.isEqualPollId(item)){
                $scope.selectedItems.splice(index, 1);
                return false;
            }
        });
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});