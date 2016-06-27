angular.module('unionvmsWeb').controller('OpenticketsCtrl',function($scope, $log, $filter, $stateParams, locale, Alarm, csvService, alertService, alarmRestService, SearchResults, SearchResultListPage, searchService, TicketModal, movementRestService, $resource, longPolling, mobileTerminalRestService, modalComment){

    $scope.selectedItems = []; //Selected items by checkboxes

    $scope.newTicketsCount = 0;
    var longPollingId;
    var modalInstance;

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];

    $scope.currentSearchResults = new SearchResults('openDate', true);

    $scope.resetSearch = function() {
        $scope.$broadcast("resetAlarmSearch");
    };

    var updateSearchWithGuid = function(guid, incrementNewTickets) {
        searchService.searchTickets().then(function(page) {
            if (page.hasItemWithGuid(guid)) {
                $scope.clearSelection();
                updateSearchResults(page);
            }
            else if (incrementNewTickets) {
                $scope.newTicketsCount++;
            }
        });
    };

    function isOpenTicketSearch() {
        var searchStatus = searchService.getAdvancedSearchObject().STATUS;
        return searchService === undefined || searchStatus === 'OPEN';
    }

    var init = function(){
        var ticketGuid = $stateParams.id;
        //Check if ticketGuid is set, the open that ticket if found
        if(angular.isDefined(ticketGuid)){
            alarmRestService.getTicket(ticketGuid).then(function(ticket){
                $scope.showOnMap(ticket);
            }, function(err){
                alertService.showErrorMessage(locale.getString('alarms.ticket_by_id_search_zero_results_error'));
            });
        }

        longPollingId = longPolling.poll("/rules/activity/ticket", {
            'onCreate': function(response) {
                if (response.ids.length > 0) {
                    updateSearchWithGuid(response.ids[0], isOpenTicketSearch());
                }
            },
            'onUpdate': function(response) {
                if (response.ids.length > 0) {
                    updateSearchWithGuid(response.ids[0], false);
                }
            }
        });
    };

    $scope.searchTickets = function() {
        $scope.newTicketsCount = 0;
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
        function completeFn(comment) {
            var copy = ticket.copy();
            copy.setStatusToClosed();
            copy.comment = comment;
            alarmRestService.updateTicketStatus(copy).then(function(updatedTicket) {
                //Update ticket values
                ticket.status = updatedTicket.status;
                ticket.updated = updatedTicket.updated;
                ticket.updatedBy = updatedTicket.updatedBy;
            },
            function(error) {
                alertService.showErrorMessageWithTimeout(locale.getString('alarms.notifications_close_error_message'));
            });
        }

        modalComment.open(completeFn, {
            titleLabel: locale.getString("alarms.notifications_table_close_title"),
            saveLabel: locale.getString("common.close"),
            placeholderLabel: locale.getString('alarms.close_notification_reason_placeholder')
        });
    };


    //Get status label
    $scope.getStatusLabel = function(status){
        switch(status){
            case 'OPEN':
                return locale.getString('alarms.alarms_status_open');
            case 'CLOSED':
                return locale.getString('alarms.alarms_status_closed');
            default:
                return status;
        }
    };

    $scope.getStatusLabelClass = function(status){
        switch(status){
            case 'CLOSED':
                return "label-success";
            case 'OPEN':
                return "label-danger";
            default:
                return "label-warning";
        }
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

    function getMovementPromise(ticket) {
        if (ticket.ruleName === 'Asset not sending') {
            return movementRestService.getLastMovement(ticket.vesselGuid);
        }
        else {
            return movementRestService.getMovement(ticket.positionGuid);
        }
    }

    $scope.showOnMap = function(item){
        //Work on a copy of the alarm item so you can cancel the editing
        var copy = item.copy();

        var options = {
            movementPromise: getMovementPromise(item)
        };

        //Open modal
        modalInstance = TicketModal.show(copy, options);

        modalInstance.result.then(function(alarm) {
            if (alarm !== undefined && !item.isClosed() && alarm.isClosed()) {
                // The alarm item was closed in the modal.
                $scope.closeTicket(item);
            }
        });
    };

    var csvReduce = function(csvObject, item){
        var affectedObjectText;
        if(angular.isDefined(item.vessel)){
            affectedObjectText = item.vessel.name;
        }else if(angular.isDefined(item.vesselGuid)){
            affectedObjectText = item.vesselGuid;
        }
        var csvRow = [
            $filter('confDateFormat')(item.openDate),
            affectedObjectText,
            item.ruleName,
            $filter('confDateFormat')(item.getResolvedDate()),
            item.getResolvedBy(),
            item.status
        ];
        csvObject.push(csvRow);
        return csvObject;
    };

    //Export data as CSV file
    $scope.exportItemsAsCSVFile = function(onlySelectedItems){
        var filename = 'notifications.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.alarms_table_date_openend'),
                locale.getString('alarms.alarms_table_object_affected'),
                locale.getString('alarms.alarms_table_rule'),
                locale.getString('alarms.alarms_table_date_resolved'),
                locale.getString('alarms.alarms_table_resolved_by'),
                locale.getString('alarms.alarms_table_status')
            ];

        //Set the data columns
        var getData = function() {
            return $scope.selectedItems.reduce(csvReduce,[]);
        };

        //Create and download the file
        if ((onlySelectedItems || $scope.selectedItems.length) && !$scope.isAllChecked()){
            csvService.downloadCSVFile(getData(), header, filename);
        } else {
            $scope.fetchAllItems(function(exportItems) {
                csvService.downloadCSVFile(exportItems, header, filename);
            });
        }
    };

    $scope.fetchAllItems = function(callback) {
        var resultList = [];
        $scope.fetchingAll = true;
        var search = function(page) {
            $scope.currentSearchResults.setLoading(true);
            searchService.setPage(page);
            searchService.searchTickets().then(function(searchResultListPage) {
                if (searchResultListPage.totalNumberOfPages > 1) {
                    searchService.getListRequest().listSize = searchResultListPage.items.length * (searchResultListPage.totalNumberOfPages + 1);
                    search(searchResultListPage.currentPage);
                } else {
                    resultList = resultList.concat(searchResultListPage.items);
                    if (searchResultListPage.currentPage < searchResultListPage.totalNumberOfPages) {
                        search(searchResultListPage.currentPage + 1);
                    } else {
                        var exportItems = resultList.reduce(csvReduce,[]);
                        $scope.currentSearchResults.setLoading(false);
                        callback(exportItems);
                    }
                }
            },
            function(error) {
                console.log(error);
                $scope.currentSearchResults.setLoading(false);
                $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
            });
        }
        search(1);
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedItems.length){
            if(selectedItem.code === 'EXPORT'){
                $scope.exportItemsAsCSVFile(true);
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
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
