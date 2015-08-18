angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, locale, searchService, exchangeRestService, ManualPositionReportModal, ManualPosition){

    $scope.sendingQueueSearchResults = {
        page: 0,
        pageCount: 0,
        messages: [],
        sortBy: "dateReceived",
        sortReverse: true,
        errorMessage: ""
    };

    $scope.searchResults = {
        page: 0,
        pageCount: 0,
        messages: [],
        sortBy: "dateReceived",
        sortReverse: true,
        errorMessage: "",
        loading : false,
        incomingOutgoing: "all"
    };

    $scope.filterIncomingOutgoing = function(message) {
        if ($scope.searchResults.incomingOutgoing === "all") {
            return true;
        }

        return message.outgoing ? $scope.searchResults.incomingOutgoing === "outgoing" : $scope.searchResults.incomingOutgoing === "incoming";
    };

    $scope.searchExchange = function() {
        $scope.searchResults.loading = true;
        $scope.searchResults.messages = [];
        $scope.searchResults.errorMessage = "";
        searchService.searchExchange("MESSAGES").then(function(page) {
            $scope.searchResults.messages = page.exchangeMessages;
            $scope.searchResults.page = page.currentPage;
            $scope.searchResults.pageCount = page.totalNumberOfPages;            
            $scope.searchResults.loading = false;
            if(page.totalNumberOfPages === 0 ){
              $scope.searchResults.errorMessage = locale.getString('exchange.search_zero_results_error');            
            }
        },
        function(error) {
            $scope.searchResults.errorMessage = error;
            $scope.searchResults.loading = false;
        });
    };

     $scope.searchSendingQueue = function(){
        searchService.searchExchange("SENDINGQUEUE").then(function(page) {
            $scope.sendingQueueSearchResults.messages = page.exchangeMessages;
            $scope.sendingQueueSearchResults.page = page.currentPage;
            $scope.sendingQueueSearchResults.pageCount = page.totalNumberOfPages;
            $scope.sendingQueueSearchResults.errorMessage = "";
        },
        function(error) {
            $scope.sendingQueueSearchResults.errorMessage = error;
        });
     };

    $scope.showMessageDetails = function(message) {
        console.log(message);

        //Create dummy report for now
        //TODO: Use real message values
        var report = new ManualPosition();
        report.id = message.id;
        report.speed = 23.3;
        report.course = 134;
        report.time = message.dateRecieved;
        report.updatedTime = message.dateForward;
        report.status = "010";
        report.archived = false;
        report.position.longitude = 54.56;
        report.position.latitude = 77.35434;
        report.carrier.cfr ="SWE0001234";
        report.carrier.name ="Nordvåg";
        report.carrier.externalMarking ="VG40";
        report.carrier.ircs ="SKRM";
        report.carrier.flagState ="SWE";
        report.message = message;

        //open modal
        var modalOptions = {
            sentReport : true
        };        
        ManualPositionReportModal.show(report, modalOptions).then(function(result) {
            //Nothing
        });
    };

    $scope.searchExchange();
    $scope.searchSendingQueue();
});
