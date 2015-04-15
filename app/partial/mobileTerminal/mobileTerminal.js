angular.module('unionvmsWeb').controller('MobileTerminalCtrl',function($scope, searchService, alertService,MobileTerminalListPage){

    $scope.currentSearchResults = new MobileTerminalListPage();

    $scope.isVisible = {
        search : true,
        addNewMobileTerminal : false
    };

    $scope.editSelectionDropdownItems =[{'text':'Poll terminals','code':'POLL'}, {'text':'Export selection','code':'EXPORT'}];
    
    //Callback for the search
    $scope.searchcallback = function(vesselListPage){
        console.log("search results!");
        console.log(vesselListPage);
    };

    $scope.toggleAddNewMobileTerminal = function(){
        alertService.hideMessage();
        $scope.isVisible.addNewMobileTerminal = !$scope.isVisible.addNewMobileTerminal;
        $scope.isVisible.search = !$scope.isVisible.search;
    };


    $scope.selectedItem = "";

    //Init function when entering page
    var init = function(){
        //Load list with vessels
        var response = searchService.searchMobileTerminals()
            .then(updateSearchResults, onGetSearchResultsError);
    };

    var updateSearchResults = function(mobileTerminalListPage){
        $scope.currentSearchResults = mobileTerminalListPage.mobileTerminals;
    };

    var onGetSearchResultsError = function(error){
        console.log(error);
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
    });

    init();

});
