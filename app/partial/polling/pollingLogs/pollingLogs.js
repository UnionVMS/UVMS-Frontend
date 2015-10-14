angular.module('unionvmsWeb').controller('pollingLogsCtrl',function($scope, $stateParams, Poll, PollStatus, searchService, alertService, locale, SearchResults){

    $scope.activeTab = "POLLING_LOGS";

    //Show poll by ID
    $scope.pollId = undefined;
    $scope.showPollByID = false;

    $scope.currentSearchResults = new SearchResults('status[0].time', false, locale.getString('polling.polling_logs_search_zero_results_error'));

    //Holds the search criterias
    $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();

    //DATA FOR DROPDOWNS
    var DATE_CUSTOM = "custom";
    var DATE_TODAY = "24";
    $scope.dateSearchItems = [];
    $scope.dateSearchItems.push({"text":"Today", "code":DATE_TODAY});
    $scope.dateSearchItems.push({"text":"This week", "code":"this_week"});
    $scope.dateSearchItems.push({"text":"Last month", "code":"last_month"});
    $scope.dateSearchItems.push({"text":"Custom", "code":DATE_CUSTOM});

    $scope.pollTypes = [];
    $scope.pollTypes.push({"text":"Configuration", "code":"CONFIGURATION_POLL"});
    $scope.pollTypes.push({"text":"Manual", "code":"MANUAL_POLL"});
    $scope.pollTypes.push({"text":"Program", "code":"PROGRAM_POLL"});
    $scope.pollTypes.push({"text":"Sample", "code":"SAMPLE_POLL"});

    $scope.statusTypes = [];
    $scope.statusTypes.push({"text":"Initiated", "code":"Initiated"});
    $scope.statusTypes.push({"text":"Succeeded", "code":"Succeeded"});
    $scope.statusTypes.push({"text":"Request failed", "code":"Failed"});

    $scope.transponderTypes = [];
    $scope.transponderTypes.push({"text":"Inmarsat-C", "code":"INMARSAT_C"});

    $scope.organizations = [];
    $scope.organizations.push({"text":"Control Authority 1", "code":"CA1"});
    $scope.organizations.push({"text":"Control Authority 2", "code":"CA2"});

    var init = function(){
        $scope.pollId = $stateParams.id;
        //Load poll details by searching for a poll by GUID
        if(angular.isDefined($scope.pollId)){
            $scope.activeTab = "POLLING_LOGS_BY_ID";
            $scope.currentSearchResults.zeroResultsErrorMessage = locale.getString('polling.polling_logs_by_id_search_zero_results_error');
            $scope.getPolls($scope.pollId);
        }else{
            //Set search date to today
            $scope.advancedSearchObject.DATE_SPAN = DATE_TODAY;
            //Load list with polls from start
            $scope.searchPolls();
        }
    };


    $scope.print = function(){
        console.log("Print...");
        window.print();
    };

    $scope.exportAsFile = function(){
        alertService.showInfoMessageWithTimeout("Export as file will soon be available. Stay tuned!");
    };

    /*SEARCH POLLING LOGS*/

    //Watch for changes to the START DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.START_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.DATE_SPAN = DATE_CUSTOM;
        }
    });
    //Watch for changes to the END DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.END_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.DATE_SPAN = DATE_CUSTOM;
        }
    });
    //Watch for changes to the DATE DROPDOWN
    $scope.$watch(function () { return $scope.advancedSearchObject.DATE_SPAN;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined' && newVal !== DATE_CUSTOM) {
            //Reset start date and end date when changing to something else than custom
            $scope.advancedSearchObject.START_DATE = undefined;
            $scope.advancedSearchObject.END_DATE = undefined;
        }
    });



    //Get list of polls matching the current search criterias
    //If pollId is set, search for that one
    $scope.getPolls = function(pollId){
        $scope.currentSearchResults.setLoading(true);

        //Create criterias and do the search
        searchService.resetPage();
        searchService.resetSearchCriterias();

        //Search for pollId
        if(pollId){
            $scope.showPollByID = true;
            searchService.addSearchCriteria('POLL_ID', pollId);
        }else{
            searchService.setDynamic(true);
			//TODO: Enable when Exchange is in place
            //searchService.setSearchCriteriasToAdvancedSearch();
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
            $scope.searchPolls();
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});