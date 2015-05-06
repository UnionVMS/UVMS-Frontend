angular.module('unionvmsWeb').controller('pollingLogsCtrl',function($scope, Poll, PollStatus, searchService, alertService, locale){

    $scope.activeTab = "POLLING_LOGS";

    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 25,
        polls : [],
        errorMessage : "",
        loading : false,
        sortBy : "status[0].time",
        sortReverse : false
    };

    //Holds the search criterias
    $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();

    //DATA FOR DROPDOWNS
    var DATE_CUSTOM = "custom";
    var DATE_TODAY = "today";
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
        //Load list with polls from start
        $scope.searchPolls();

        //Set search date to today
        $scope.advancedSearchObject.DATE = DATE_TODAY;
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
            $scope.advancedSearchObject.DATE = DATE_CUSTOM;
        }
    });
    //Watch for changes to the END DATE input
    $scope.$watch(function () { return $scope.advancedSearchObject.END_DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined') {
            $scope.advancedSearchObject.DATE = DATE_CUSTOM;
        }
    });    
    //Watch for changes to the DATE DROPDOWN
    $scope.$watch(function () { return $scope.advancedSearchObject.DATE;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined' && newVal !== DATE_CUSTOM) {
            //Reset start date and end date when changing to something else than custom
            $scope.advancedSearchObject.START_DATE = undefined;
            $scope.advancedSearchObject.END_DATE = undefined;
        }
    });    

    //Get list of polls matching the current search criterias
    $scope.searchPolls = function(){

        //Reset currentSearchResults
        $scope.currentSearchResults.errorMessage = "";
        $scope.currentSearchResults.loading = true;
        $scope.currentSearchResults.polls.length = 0;
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;

        //Create criterias and do the search
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(true);
        searchService.setSearchCriteriasToAdvancedSearch();
        searchService.searchPolls(false)
                .then(updateSearchResults, onGetSearchResultsError);
    };    

    //Update the search results
    var updateSearchResults = function(pollListPage){
        $scope.currentSearchResults.loading = false;
        if(pollListPage.totalNumberOfPages === 0 ){
            $scope.currentSearchResults.errorMessage = locale.getString('polling.polling_logs_search_zero_results_error');
        } else {
            $scope.currentSearchResults.errorMessage = "";
            if(!$scope.currentSearchResults.polls){
                $scope.currentSearchResults.polls = pollListPage.polls;
            }
            else {
                for (var i = 0; i < pollListPage.polls.length; i++){
                    $scope.currentSearchResults.polls.push(pollListPage.polls[i]);
                }
            }
        }
        //Update page info
        $scope.currentSearchResults.totalNumberOfPages = pollListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = pollListPage.currentPage;
    }; 

    //Load the next page of the search results
    $scope.loadNextPage = function(){

        if($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages )
        {
            //Increase page by 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            var response = searchService.searchPolls(true)
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });        

    init();

});