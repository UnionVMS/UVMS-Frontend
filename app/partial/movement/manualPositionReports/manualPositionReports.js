angular.module('unionvmsWeb').controller('ManualPositionReportsCtrl', function($scope, $filter, searchService, locale, manualPositionRestService, alertService, ManualPosition, ManualPositionReportModal, confirmationModal, movementCsvService, SearchResults, envConfig, $resource, $log, longPolling, $stateParams, PositionReportModal) {

    $scope.showModal = function() {
        $scope.editPosition();
    };

    $scope.selectedMovements = [];

    $scope.search = {};

    $scope.isManualMovement = true;
    var modalInstance;

    var equalGuid = function(a, b) {
        return a.guid !== undefined && b.guid !== undefined && a.guid === b.guid;
    };

    //Search objects and results
    $scope.currentSearchResults = new SearchResults('carrier.name', false, locale.getString('movement.movement_search_error_result_zero_pages'), equalGuid);
    var longPollingId;

    var init = function(){
        searchService.reset();
        $scope.searchManualPositions();

        if ($stateParams.id) {
            manualPositionRestService.getManualMovement($stateParams.id).then(function(manualMovement) {
                ManualPositionReportModal.show(manualMovement, { readOnly: true });
            });
         }

        longPollingId = longPolling.poll("/movement/activity/movement/manual", function(response) {
            if (response.ids.length > 0) {
                manualPositionRestService.getManualMovement(response.ids[0]).then(function(movement) {
                   $scope.currentSearchResults.updateWithSingleItem(movement);
                });
            }
        });
    };

    $scope.removeFromSearchResults = function(report) {
        var movements = $scope.currentSearchResults.items;
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

    $scope.viewItemDetails = function(item){
        modalInstance = ManualPositionReportModal.show(item, {
            readOnly: true
        });
    };

    $scope.editPosition = function(item, addAnother) {
        var modalOptions = {
            addAnother: addAnother || false,
            reloadFunction: $scope.searchManualPositions
        };
        
        var reportObj;
        if(angular.isDefined(item)){
            reportObj = item.copy();
        }else{
            reportObj = new ManualPosition();
            reportObj.draft();
        }

        modalInstance = ManualPositionReportModal.show(reportObj, modalOptions);
        modalInstance.result.then(function(result) {
            if (result.addAnother) {
                var p = new ManualPosition();
                p.carrier.ircs = result.ircs;
                p.carrier.cfr = result.cfr;
                p.carrier.externalMarking = result.externalMarking;
                p.carrier.name = result.name;
                $scope.editPosition(p, result.addAnother);
            }
        });
    };

    $scope.searchManualPositions = function(){
        $scope.currentSearchResults.setLoading(true);
        searchService.searchManualPositions()
            .then(retrivePositionSuccess, retrivePositionsError);
    };

    var retrivePositionSuccess = function(searchResultListPage){
        console.info("Success in retrieveing manualPositions.");
        console.info(searchResultListPage);
        $scope.currentSearchResults.updateWithNewResults(searchResultListPage);
    };

    var retrivePositionsError = function(error){
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
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
            $.each($scope.currentSearchResults.items, function(index, item) {
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
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedMovements.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.currentSearchResults.items, function(index, item) {
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

    $scope.exportAsCSVFile = function(){
        var movements = $scope.currentSearchResults.items;
        movements = $filter('orderBy')(movements, $scope.currentSearchResults.sortBy, $scope.currentSearchResults.sortReverse);
        movements = $filter('filter')(movements, $scope.search);
        movementCsvService.exportManualMovements(movements);
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        longPolling.cancel(longPollingId);
        if(angular.isDefined(modalInstance)){
            modalInstance.dismiss();
        }
    });

    init();

});