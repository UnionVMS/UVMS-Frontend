angular.module('unionvmsWeb').controller('OpenticketsCtrl',function($scope, $log, $filter, locale, Alarm, csvService, alertService, alarmRestService, SearchResults, SearchResultListPage, searchService, PositionReportModal, movementRestService, $resource){

    $scope.selectedItems = []; //Selected items by checkboxes

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];

    $scope.currentSearchResults = new SearchResults('name', false);
    $scope.statusFilter = 'all';
    $scope.filterOnStatus = function(alarm) {
        if ($scope.statusFilter === "all") {
            return true;
        }

        return alarm.isOpen() ? $scope.statusFilter === "open" : $scope.statusFilter === "closed";
    };

    /* Do long-polling,  */
    var doLongPolling = function() {
        $resource("/rules/activity/ticket").get(function(response) {
            for (var i = 0; i < response.ids.length; i++) {
                alarmRestService.getTicket(response.ids[i]).then(function(alarmReport) {
                    for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
                        if ($scope.currentSearchResults.items[i].guid === alarmReport.guid) {
                            $scope.currentSearchResults.items.splice(i, 1);
                        }
                    }

                    $scope.currentSearchResults.updateWithSingleItem(alarmReport);
                });
            }

            doLongPolling();
        });
    };

    var init = function(){
        $scope.searchTickets();
        doLongPolling();
    };

    $scope.searchTickets = function() {
        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        searchService.searchTickets()
                .then(updateSearchResults, onGetSearchResultsError);
    };

    //Update the search results
    var updateSearchResults = function(searchResultsListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };


    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchTickets();
        }
    };

    //Close a ticket
    $scope.closeTicket = function(ticket){
        var copy = ticket.copy();
        copy.setStatusToClosed();
        alarmRestService.updateTicketStatus(copy).then(
            function(updatedTicket){
                //Update ticket values
                ticket.status = updatedTicket.status;
                ticket.resolvedDate = updatedTicket.resolvedDate;
                ticket.resolvedBy = updatedTicket.resolvedBy;
            },
            function(error){
                alertService.showErrorMessageWithTimeout(locale.getString('alarms.notifications_close_error_message'));
            }
        );
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
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedItems.length === 0){
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
        $.each($scope.selectedItems, function(index, aSelectedItem){
           if(aSelectedItem.equals(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };

        //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedItems = [];
    };

    //Add an item to the selection
    $scope.addToSelection = function(item){
        $scope.selectedItems.push(item);
    };

    //Remove an item from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedItems, function(index, aSelectedItem){
           if(aSelectedItem.equals(item)){
               $scope.selectedItems.splice(index, 1);
               return false;
           }
           return false;
        });
    };

    $scope.showOnMap = function(item){
        //Work on a copy of the alarm item so you can cancel the editing
        var copy = item.copy();
        var options = {
            readOnly : true
        };
        //Get movement
        var movementPromise = movementRestService.getMovement(copy.positionGuid);
        options.movementPromise = movementPromise;

        //Open modal
        PositionReportModal.show(copy, options);
    };

    //Print the exchange logs
    $scope.print = function(){
        alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
    };

    //Export data as CSV file
    $scope.exportItemsAsCSVFile = function(onlySelectedItems){
        var filename = 'holdingTable.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.alarms_table_status'),
                locale.getString('alarms.alarms_table_date_openend'),
                locale.getString('alarms.alarms_table_object_affected'),
                locale.getString('alarms.alarms_table_rule'),
                locale.getString('alarms.alarms_table_date_resolved'),
                locale.getString('alarms.alarms_table_resolved_by'),
            ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.selectedItems;
            }
            //Export all logs in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    if($scope.filterOnStatus(item)){
                        var affectedObjectText;
                        if(angular.isDefined(item.vessel)){
                            affectedObjectText = item.vessel.name;
                        }else if(angular.isDefined(item.vesselGuid)){
                            affectedObjectText = item.vesselGuid;
                        }
                        var csvRow = [
                            item.status,
                            $filter('confDateFormat')(item.openDate),
                            affectedObjectText,
                            item.ruleName,
                            item.isOpen()? '' : $filter('confDateFormat')(item.updated),
                            item.isOpen()? '' : item.updatedBy,
                        ];
                        csvObject.push(csvRow);
                    }
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if(selectedItem.code === 'EXPORT'){
            $scope.exportItemsAsCSVFile(true);
        }
        $scope.editSelection = "";
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    init();

});