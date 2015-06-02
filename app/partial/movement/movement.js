angular.module('unionvmsWeb').controller('MovementCtrl',function($scope, $timeout, alertService, movementRestService, searchService, locale){

    //Current filter and sorting for the results table
    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';
    $scope.editSelectionDropdownItems = [{'text':locale.getString('movement.editselection_see_on_map'),'code':'MAP'}, {'text':locale.getString('movement.editselection_export_selection'),'code':'EXPORT'}, {'text':locale.getString('movement.editselection_inactivate'),'code':'INACTIVE'}];
    
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
         $scope.searchMovements();
    };

    //AUTOMATIC REFRESH OF THE MOVEMENTS LIST
    var autoRefreshTimer;
    var AUTO_REFRESH_INTERVAL_SECONDS = 60;
    $scope.autoRefresh = false;
    $scope.autoRefreshTimer = AUTO_REFRESH_INTERVAL_SECONDS;
    var autoRefreshListWithRegularIntervals = function(){
        autoRefreshTimer = $timeout(function(){
            console.log("AUTO REFRESH TIMER");
            $scope.autoRefreshTimer--;
            if($scope.autoRefresh && $scope.autoRefreshTimer <= 0){
                $scope.refreshMovements();
                $scope.autoRefreshTimer = AUTO_REFRESH_INTERVAL_SECONDS;
            }
            autoRefreshListWithRegularIntervals();
        }, 1000);
    };

    //Stop the autmatic refresh
    $scope.stopAutoRefresh = function(){
        $scope.autoRefresh = false;
        if(angular.isDefined(autoRefreshTimer)){
            $timeout.cancel(autoRefreshTimer);
        }
    };

    //Start the autmatic refresh
    $scope.startAutoRefresh = function(){
        $scope.autoRefresh = true;
        $scope.autoRefreshTimer = AUTO_REFRESH_INTERVAL_SECONDS;
        autoRefreshListWithRegularIntervals();
    };
    
    //Refresh the list
    $scope.refreshMovements = function(){
        $scope.searchMovements();
    };

    $scope.searchMovements = function(){
        $scope.resetSearchResult();
        searchService.searchMovements()
            .then(retriveMovementsSuccess, retriveMovementsError);
    };

    
    $scope.resetSearchResult = function(){
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.movements = [];
        $scope.currentSearchResults.errorMessage ="";
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(true);
        //searchService.setSearchCriteriasToAdvancedSearch();
    };

    var retriveMovementsSuccess = function(movementListPage){
        console.info("Success in retrieveing movements..");
        console.info(movementListPage);
        $scope.currentSearchResults.loading = false;
        $scope.startAutoRefresh();

        //TODO: REMOVE THIS! JUST USED FOR DEBUGGING
        movementListPage.currentPage = 1;
        movementListPage.totalNumberOfPages = 1;

        if (movementListPage.totalNumberOfPages === 0 ) {
            $scope.currentSearchResults.errorMessage = locale.getString('movement.movement_search_error_result_zero_pages');
        } else {
            $scope.currentSearchResults.errorMessage = "";
            if (!$scope.currentSearchResults.movements) {
                $scope.currentSearchResults.movements = movementListPage.movements;
            } else {
                for (var i = movementListPage.movements.length - 1; i >= 0; i--) {
                    $scope.currentSearchResults.movements.push(movementListPage.movements[i]);
                }
            }
        }
        $scope.currentSearchResults.totalNumberOfPages = movementListPage.totalNumberOfPages;
        $scope.currentSearchResults.page = movementListPage.currentPage;

    };
    
    var retriveMovementsError = function(error){
        console.error("Error retrieveing movements");
        console.error(error);
    };


    $scope.loadNextPage = function(){
        if ($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages) {
            //increase page with 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            searchService.searchMovements()
                .then(retriveMovementsSuccess, retriveMovementsError);

            //Stop auto refresh
            $scope.stopAutoRefresh();
        }
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
        $scope.stopAutoRefresh();
    });    

    init();

});