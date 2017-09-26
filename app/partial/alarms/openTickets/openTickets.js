/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('OpenticketsCtrl',function($scope, $log, $filter, $stateParams, locale, Alarm, csvService, alertService, alarmRestService, SearchResults, SearchResultListPage, searchService, TicketModal, movementRestService, $resource, longPolling, mobileTerminalRestService, modalComment){

    //Selected items by checkboxes
    $scope.selectedItems = [];

    //Number of items displayed on each page
    $scope.itemsByPage = 20;

    $scope.newTicketsCount = 0;
    var longPollingId;
    var modalInstance;

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'},
        {text:locale.getString('alarms.notifications_table_close_tickets'), code : 'CLOSE'}
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
        $scope.allCurrentSearchResults = searchResultsListPage.items;
        $scope.currentSearchResultsByPage = searchResultsListPage.items;
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        $scope.allCurrentSearchResults = $scope.currentSearchResults.items;
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
        if ((onlySelectedItems || $scope.selectedItems.length)){
            csvService.downloadCSVFile(getData(), header, filename);
        } else {
            $scope.fetchAllItems(true, function(exportItems) {
                csvService.downloadCSVFile(exportItems, header, filename);
            });
        }
    };

    $scope.fetchAllItems = function(reduce, callback) {
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
                        var exportItems;
                        if (reduce) {
                            exportItems = resultList.reduce(csvReduce,[]);
                        } else {
                            exportItems = resultList;
                        }
                        $scope.currentSearchResults.setLoading(false);
                        searchService.getListRequest().listSize = 20;
                        callback(exportItems);
                    }
                }
            },
            function(error) {
                console.log(error);
                $scope.currentSearchResults.setLoading(false);
                $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
            });
        };
        search(1);
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedItems.length){
            if(selectedItem.code === 'EXPORT'){
                $scope.exportItemsAsCSVFile(true);
            } else if (selectedItem.code === 'CLOSE') {
                $scope.batchCloseTickets();
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    $scope.batchCloseTickets = function() {
        var close = function(tickets) {
            $scope.currentSearchResults.setLoading(true);
            var guids = [];
            for (var i = 0; i < tickets.length; i++) {
                var ticket = tickets[i];
                guids.push({"key":"TICKET_GUID", "value":ticket.guid});
            }
            var query = {"ticketSearchCriteria":guids,"pagination":{"page":1,"listSize":20}};

            alarmRestService.updateTicketStatusQuery(query, "CLOSED").then(function(updated) {
                for (var i = 0; i < $scope.selectedItems.length; i++) {
                    var ticket = $scope.selectedItems[i];
                    ticket.status = updated[0].status;
                    ticket.updated = updated[0].updated;
                    ticket.updatedBy = updated[0].updatedBy;
                }
                $scope.selectedItems = [];
                $scope.currentSearchResults.setLoading(false);
            }, function(error) {
                console.log(error);
                $scope.currentSearchResults.setLoading(false);
            });
        };
        if ($scope.selectedItems.length && !$scope.isAllChecked()) {
            close($scope.selectedItems);
        } else {
            $scope.fetchAllItems(false, close);
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