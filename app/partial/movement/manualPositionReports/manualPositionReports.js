angular.module('unionvmsWeb').controller('ManualPositionReportsCtrl', function($scope, searchService, locale, manualPositionRestService, alertService, ManualPosition, ManualPositionReportModal, confirmationModal) {

    $scope.showModal = function() {
        $scope.editPosition();
    };

    $scope.selectedMovements = [];

    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 25,
        movements : [],
        errorMessage : "",
        loading : false,
        sortBy : "carrier.name",
        sortReverse : false
    };

    var init = function(){
        $scope.searchManualPositions();
    };
    $scope.isManualMovement = true;

    $scope.removeFromSearchResults = function(report) {
        var movements = $scope.currentSearchResults.movements;
        var index = movements.indexOf(report);
        if (index < 0) {
            return;
        }

        movements.splice(index, 1);
    };

    $scope.deletePosition = function(manualPositionReport){
        var options = {
            textLabel : locale.getString("movement.manual_position_delete_confirm_text")
        };
        confirmationModal.open(function(){
            console.log("Confirmed!");
            manualPositionRestService.deleteManualPositionReport(manualPositionReport).then(
                function(){
                    alertService.showSuccessMessageWithTimeout(locale.getString('movement.manual_position_delete_success'));
                    $scope.removeFromSearchResults(manualPositionReport);
                },
                function(error){
                    alertService.showErrorMessage(locale.getString('movement.manual_position_delete_error'));
                }
            );
        }, options);
    };

    $scope.editPosition = function(item){
        ManualPositionReportModal.show(item).then(function() {
            $scope.searchManualPositions();
        });
    };

    $scope.searchManualPositions = function(){
        $scope.resetSearchResult();
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

         //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedMovements = [];
    };

    //Add a mobile terminal to the selection
    $scope.addToSelection = function(item){
        $scope.selectedMovements.push(item);
    };

    //Remove a mobile terminal from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedMovements, function(index, movement){
            if(movement.isEqualMovement(item)){
                $scope.selectedMovements.splice(index, 1);
                return false;
            }
        });
    };
 
    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){ 
    if($scope.isAllChecked()){
            //Remove all
            $scope.clearSelection();
        }else{
            //Add all
            $scope.clearSelection();
            $.each($scope.currentSearchResults.movements, function(index, item) {
                $scope.addToSelection(item);
            });
        }
    };

    $scope.checkItem = function(item){
        item.Selected = !item.Selected;
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
        }      
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.currentSearchResults.movements) || $scope.selectedMovements.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.currentSearchResults.movements, function(index, item) {
            if(!$scope.isChecked(item)){
                allChecked = false;
                return false;
            }
        });
        return allChecked;
        
    };

     $scope.isChecked = function(item){
        var checked = false;
        $.each($scope.selectedMovements, function(index, movement){
            if(movement.isEqualMovement(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();




});