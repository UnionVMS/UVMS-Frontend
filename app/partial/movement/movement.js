angular.module('unionvmsWeb').controller('MovementCtrl',function($scope, movementRestService, searchService, locale){

   //Current filter and sorting for the results table
    $scope.sortType = 'state';
    $scope.sortReverse = false;
    $scope.sortFilter = '';
    //$scope.movements = [];
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
        //$scope.getMovementsForList();
         $scope.searchMovements();
    };


    $scope.searchMovements = function(){
        //resetSearchResult
        $scope.resetSearchResult();
        searchService.searchMovements(false)
            .then(retriveMovementsSuccess, retriveMovementsError);
    };

/*    $scope.getMovementsForList = function(){
        movementRestService.getMovementList()
        .then(retriveMovementsSuccess, retriveMovementsError);
    };
*/
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


    $scope.refreshMovements = function(){
        console.info("Lets perform a new search!");
        $scope.searchMovements();
    };

    $scope.loadNextPage = function(){
        if ($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages) {
            //increase page with 1
            searchService.increasePage();
            $scope.currentSearchResults.loading = true;
            searchService.searchMovements(true)
                .then(retriveMovementsSuccess, retriveMovementsError);
        }
    };


    init();

});