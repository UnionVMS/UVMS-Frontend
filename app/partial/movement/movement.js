angular.module('unionvmsWeb').controller('MovementCtrl',function($scope, $timeout, alertService, movementRestService, searchService, locale, $routeParams, ManualPositionReportModal, csvService){

    //Current filter and sorting for the results table
    $scope.sortFilter = '';
    $scope.editSelectionDropdownItems = [{'text':locale.getString('movement.editselection_see_on_map'),'code':'MAP'}, {'text':locale.getString('movement.editselection_export_selection'),'code':'EXPORT'}, {'text':locale.getString('movement.editselection_inactivate'),'code':'INACTIVE'}];
    
    //Search objects and results
    $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 25,
        movements : [],
        errorMessage : "",
        loading : false,
        sortBy : "vessel.name",
        sortReverse : false
    };

    //Selected by checkboxes
    $scope.selectedMovements = [];
    
    var movement2ManualPosition = function(movement) {
        return {
            id: movement.id,
            guid: undefined,
            speed: movement.movement.measuredSpeed,
            course: movement.movement.course,
            time: movement.time,
            updatedTime: undefined,
            status: movement.movement.status,
            archived: undefined,
            carrier: {
                cfr: undefined,
                name: movement.vessel.name,
                externalMarking: movement.vessel.externalMarking,
                ircs: movement.vessel.ircs,
                flagState: movement.vessel.state
            },
            position: {
                longitude: movement.movement.longitude,
                latitude: movement.movement.latitude
            }
        };
    };

    var init = function(){
         if ($routeParams.id) {
            movementRestService.getMovement($routeParams.id).then(function(movement) {
                ManualPositionReportModal.show(movement2ManualPosition(movement), {readOnly: true});
            });
         }
    };

    $scope.isManualMovement = false;

    //AUTOMATIC REFRESH OF THE MOVEMENTS LIST
    var autoRefreshTimer;
    var AUTO_REFRESH_INTERVAL_SECONDS = 60;
    $scope.autoRefresh = false;
    $scope.autoRefreshTimer = AUTO_REFRESH_INTERVAL_SECONDS;
    var autoRefreshListWithRegularIntervals = function(){
        autoRefreshTimer = $timeout(function(){
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
        $scope.stopAutoRefresh();
        $scope.autoRefresh = true;
        $scope.autoRefreshTimer = AUTO_REFRESH_INTERVAL_SECONDS;
        autoRefreshListWithRegularIntervals();
    };

    //Refresh the list
    $scope.refreshMovements = function(){
        $scope.searchMovements();
    };

    $scope.searchMovements = function(){
        if ($scope.currentSearchResults.loading === false){
            $scope.resetSearchResult();
            $scope.currentSearchResults.loading = true;
            searchService.searchMovements()
                .then(retriveMovementsSuccess, retriveMovementsError);      
        }
    };

    $scope.resetSearchResult = function(){
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.movements = [];
        $scope.currentSearchResults.errorMessage ="";
    };

    var retriveMovementsSuccess = function(movementListPage){
        console.info("Success in retrieveing movements..");
        console.info(movementListPage);
        $scope.currentSearchResults.loading = false;
        $scope.startAutoRefresh();

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
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.page = 0;
    };

    $scope.loadNextPage = function(){
        if ($scope.currentSearchResults.loading === false){
            if ($scope.currentSearchResults.page < $scope.currentSearchResults.totalNumberOfPages) {
                //increase page with 1
                searchService.increasePage();
                $scope.currentSearchResults.loading = true;
                searchService.searchMovements()
                    .then(retriveMovementsSuccess, retriveMovementsError);

                //Stop auto refresh
                $scope.stopAutoRefresh();
            }
        }
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

    //Callback function for the "Edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedMovements.length){
            //SEE ON MAP
            if(selectedItem.code === 'MAP'){
               alertService.showInfoMessageWithTimeout("See on map is not implemented yet. " +$scope.selectedMovements.length +" movements were selected");
            }
            //EXPORT SELECTION
            else if(selectedItem.code === 'EXPORT'){
                $scope.exportAsCSVFile(true);
            }
            //INACTIVATE
            else if(selectedItem.code === 'INACTIVATE'){
                alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    $scope.print = function(){
        console.log("Print...");
        window.print();        
    };

    //Export data as CSV file
    $scope.exportAsCSVFile = function(onlySelectedItems){
        var filename = 'positionReports.csv';

        //Set the header columns
        var header = [
            locale.getString('movement.table_header_flag_state'),
            locale.getString('movement.table_header_external_marking'),
            locale.getString('movement.table_header_ircs'),
            locale.getString('movement.table_header_name'),
            locale.getString('movement.table_header_time'),
            locale.getString('movement.table_header_latitude'),
            locale.getString('movement.table_header_longitude'),
            locale.getString('movement.table_header_status'),
            locale.getString('movement.table_header_ms'),
            locale.getString('movement.table_header_cs'),
            locale.getString('movement.table_header_course'),
            locale.getString('movement.table_header_message_type'),
            locale.getString('movement.table_header_source')
        ];

        //Set the data columns
        var getData = function() {            
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.selectedMovements;
            }
            //Export all logs in the table
            else{
                exportItems = $scope.currentSearchResults.movements;
            }
            return exportItems.reduce(
                function(csvObject, item){ 
                    var csvRow = [
                        item.vessel.state,
                        item.vessel.externalMarking,
                        item.vessel.ircs,
                        item.vessel.name,
                        item.getFormattedTime(),
                        item.movement.latitude,
                        item.movement.longitude,
                        item.movement.status,
                        item.movement.measuredSpeed +' ' +locale.getString('movement.movement_speed_unit'),
                        item.movement.calculatedSpeed +' ' +locale.getString('movement.movement_speed_unit'),
                        item.movement.course,
                        item.movement.messageType,
                        item.movement.source
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);        
    };


    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
        $scope.stopAutoRefresh();
    });    


    init();

});