angular.module('unionvmsWeb').controller('ManualPositionReportsCtrl', function($scope,searchService, locale, ManualPositionReportModal) {

    $scope.showModal = function() {
        ManualPositionReportModal.show();
    };

    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 25,
        movements : [],
        errorMessage : "",
        loading : false,
        sortBy : "state",
        sortReverse : false
    };

    var init = function(){
        $scope.searchManualPositions();
    };

    $scope.isManualMovement = true;
    
    $scope.deletePosition = function(item){
        console.log("Deleting");
    };

    $scope.editPosition = function(item){
        console.log("Editing");
    };

    
      
    $scope.searchManualPositions = function(){
        //$scope.resetSearchResult();
        searchService.searchManualPositions()
            .then(retrivePositionSuccess, retrivePositionsError);
    };

    var retrivePositionSuccess = function(positionListPage){
        console.info("Success in retrieveing manualPositions.");
        console.info(positionListPage);
        $scope.currentSearchResults.loading = false;
        
        if (positionListPage.totalNumberOfPages === 0 ) {
            $scope.currentSearchResults.errorMessage = locale.getString('movement.movement_search_error_result_zero_pages');
        } else {
            $scope.currentSearchResults.errorMessage = "";
            if (!$scope.currentSearchResults.movements) {
                $scope.currentSearchResults.movements = positionListPage.movements;
            } else {
                for (var i = positionListPage.movements.length - 1; i >= 0; i--) {
                    $scope.currentSearchResults.movements.push(positionListPage.movements[i]);
                }
            }
        }
        $scope.currentSearchResults.totalNumberOfPages = positionListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = positionListPage.currentPage;

    };
    
    var retrivePositionsError = function(error){
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };

    $scope.resetSearchResult = function(){
      
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.movements = [];
        $scope.currentSearchResults.errorMessage ="";
        $scope.currentSearchResults.loading = true;

    };

    init();




});