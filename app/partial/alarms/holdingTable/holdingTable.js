angular.module('unionvmsWeb').controller('HoldingtableCtrl',function($scope, $log, $filter, $stateParams, locale, Alarm, alarmCsvService, alertService, SearchResults, SearchResultListPage, AlarmReportModal, userService, alarmRestService, searchService, $resource, longPolling){

    $scope.selectedItems = []; //Selected items by checkboxes

    $scope.newAlarmsCount = 0;
    var longPollingId;
    var modalInstance;

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Rules', true);
    };

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];
    if(checkAccessToFeature('manageAlarmsHoldingTable')){
        $scope.editSelectionDropdownItems.unshift({text:locale.getString('alarms.holding_table_reprocess_reports'), code : 'REPROCESS_REPORTS'});
    }

    $scope.currentSearchResults = new SearchResults('openDate', true);

    $scope.resetSearch = function() {
        $scope.$broadcast("resetAlarmSearch");
    };

    var updateSearchWithGuid = function(guid) {
        searchService.searchAlarms().then(function(page) {
            if (page.hasItemWithGuid(guid)) {
                $scope.clearSelection();
                updateSearchResults(page);
            }
            else {
                $scope.newAlarmsCount++;
            }
        });
    };

    var init = function(){
        var alarmGuid = $stateParams.id;
        //Check if alarmGuid is set, the open that ticket if found
        if(angular.isDefined(alarmGuid)){
            alarmRestService.getAlarmReport(alarmGuid).then(function(alarm){
                $scope.viewItemDetails(alarm);
            }, function(err){
                alertService.showErrorMessage(locale.getString('alarms.alarm_by_id_search_zero_results_error'));
            });
        }

        longPollingId = longPolling.poll("/rules/activity/alarm", function(response) {
            if (response.ids.length > 0) {
                updateSearchWithGuid(response.ids[0]);
            }
        });
    };

    $scope.searchAlarms = function() {
        $scope.newAlarmsCount = 0;
        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        searchService.searchAlarms()
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
            $scope.currentSearchResults.setLoading(true);
            searchService.setPage(page);
            searchService.searchAlarms()
                .then(updateSearchResults, onGetSearchResultsError);
        }
    };

    $scope.getRuleNamesTooltip = function(item){
        var ruleNames = [];
        $.each(item.alarmItems, function(index, rule){
            ruleNames.push(rule.ruleName);
        });
        return ruleNames.join(', ');
    };

    //Get status label
    $scope.getStatusLabel = function(status){
        switch(status){
            case 'OPEN':
                return locale.getString('alarms.alarms_status_open');
            case 'REJECTED':
                return locale.getString('alarms.alarms_status_rejected');
            case 'REPROCESSED':
                return locale.getString('alarms.alarms_status_reprocessed');
            default:
                return status;
        }
    };

    $scope.getStatusLabelClass = function(status){
        switch(status){
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

    //Export data as CSV file
    $scope.exportItemsAsCSVFile = function(onlySelectedItems){
        var itemsToExport = onlySelectedItems ? $scope.selectedItems : $scope.currentSearchResults.items;
        alarmCsvService.exportAlarms(itemsToExport);
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedItems.length){
            if(selectedItem.code === 'EXPORT'){
                $scope.exportItemsAsCSVFile(true);
            }
            else if(selectedItem.code === 'REPROCESS_REPORTS'){
                var alarmGuids = $scope.selectedItems.reduce(function(guids, alarm){
                        guids.push(alarm.guid);
                        return guids;
                    }, []);
                if(alarmGuids.length > 0){
                    alertService.showInfoMessage(locale.getString('alarms.holding_table_reprocess_reports_waiting_for_response_message'));
                    alarmRestService.reprocessAlarms(alarmGuids).then(function(){
                        alertService.showSuccessMessageWithTimeout(locale.getString('alarms.holding_table_reprocess_reports_success_message'));
                    }, function(err){
                        alertService.showErrorMessage(locale.getString('alarms.holding_table_reprocess_reports_error_message'));
                    });
                }
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    $scope.resolveItem = function(item){
        //Work on a copy of the alarm item so you can cancel the editing
        var alarmItem = item.copy();
        var options = {
            //Update item after status change
            updateStatusCallback : function(updatedItem){
                item.status = updatedItem.status;
                item.updated = updatedItem.updated;
                item.updatedBy = updatedItem.updatedBy;
            }
        };
        modalInstance = AlarmReportModal.show(alarmItem, options);
    };

    //View item details
    $scope.viewItemDetails = function(item){
        var alarmItem = item.copy();
        var options = {
            readOnly : true
        };
        modalInstance = AlarmReportModal.show(alarmItem, options);
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