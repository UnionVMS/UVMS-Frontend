angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService){

    $scope.isVisible = {
        search : true,
        addNewMobileTerminal : false
    };

    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        console.log("search results!");
        console.log(vesselListPage);
    };

    $scope.toggleAddNewMobileTerminal = function(){
        $scope.isVisible.addNewMobileTerminal = !$scope.isVisible.addNewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;
    };

    $scope.createNewMobileTerminal = function(){
        console.log("createNewMobileTerminal");
    };

    $scope.testItems = [
        { code: 'sv-se', text: 'Sweden' },
        { code: 'dn-dk', text: 'Denmark' },
        { code: 'no-no', text: 'Norway' }
    ];

    $scope.selectedItem = "";

    //Init function when entering page
    var init = function(){
        //Load list with vessels
        var response = searchService.searchMobileTerminals()
            .then(updateSearchResults, onGetSearchResultsError);
    };

    var updateSearchResults = function(mobileTerminalListPage){
        console.log("SUCCEEDED RETRIEVING MOBILETERMINALS!");
    };

    var onGetSearchResultsError = function(){
        console.log("ERROR RETRIEVING MOBILETERMINALS!");
    };

    init();

});
