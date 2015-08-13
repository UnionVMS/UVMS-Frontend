angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, searchService, exchangeRestService){

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
        incomingOutgoing: "all"
    };

    $scope.filterIncomingOutgoing = function(message) {
        if ($scope.searchResults.incomingOutgoing === "all") {
            return true;
        }

        return message.outgoing ? $scope.searchResults.incomingOutgoing === "outgoing" : $scope.searchResults.incomingOutgoing === "incoming";
    };

    $scope.searchExchange = function() {
        searchService.searchExchange("MESSAGES").then(function(page) {
            $scope.searchResults.messages = page.exchangeMessages;
            $scope.searchResults.page = page.currentPage;
            $scope.searchResults.pageCount = page.totalNumberOfPages;
            $scope.searchResults.errorMessage = "";
        },
        function(error) {
            $scope.searchResults.errorMessage = error;
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

    $scope.searchExchange();
    $scope.searchSendingQueue();
});
