angular.module('unionvmsWeb').controller('pollingLogsCtrl',function($scope, Poll, PollStatus, alertService){


    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 25,
        polls : [],
        errorMessage : "",
        loading : false,
        sortBy : "",
        sortReverse : ""
    };   

    //Date search
    $scope.dateSearch = {
        selectedItem : 'all',
        startDate : undefined,
        endDate : undefined,
    };

    //DUMMY DATA
    $scope.dateSearchItems = [];
    $scope.dateSearchItems.push({"text":"All", "code":"all"});
    $scope.dateSearchItems.push({"text":"Today", "code":"today"});
    $scope.dateSearchItems.push({"text":"This week", "code":"this_week"});
    $scope.dateSearchItems.push({"text":"Last month", "code":"last_month"});
    $scope.dateSearchItems.push({"text":"Custom", "code":"custom"});

    $scope.pollTypes = [];
    $scope.pollTypes.push({"text":"Configuration", "code":"configuration"});
    $scope.pollTypes.push({"text":"Manual", "code":"manual"});
    $scope.pollTypes.push({"text":"Program", "code":"program"});
    $scope.pollTypes.push({"text":"Sample", "code":"sample"});

    $scope.statusTypes = [];
    $scope.statusTypes.push({"text":"Initiated", "code":"Initiated"});
    $scope.statusTypes.push({"text":"Succeeded", "code":"Succeeded"});
    $scope.statusTypes.push({"text":"Request failed", "code":"Failed"});

    $scope.transponderTypes = [];
    $scope.transponderTypes.push({"text":"Inmarsat-C", "code":"INMARSAT_C"});

    $scope.organizations = [];
    $scope.organizations.push({"text":"Control Authority 1", "code":"CA1"});
    $scope.organizations.push({"text":"Control Authority 2", "code":"CA2"});

    //Init function when entering page
    var init = function(){
        //Load list with program polls
        //$scope.searchMobileTerminals();

        //Add 3 dummy polls
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        var a = new Poll();
        a.status = [new PollStatus("Request failed")];
        $scope.currentSearchResults.polls.push(a);
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());
        $scope.currentSearchResults.polls.push(new Poll());

    };


    $scope.print = function(){
        console.log("Print...");
        window.print();        
    };

    $scope.exportAsFile = function(){
        alertService.showInfoMessageWithTimeout("Export as file will soon be available. Stay tuned!");
    };

    init();


});