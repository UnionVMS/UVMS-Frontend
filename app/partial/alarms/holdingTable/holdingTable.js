angular.module('unionvmsWeb').controller('HoldingtableCtrl',function($scope, $log, locale, Alarm, csvService, alertService){

    $scope.activeTab = "HOLDING_TABLE";
    $scope.selectedItems = []; //Selected items by checkboxes

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];

    $scope.statusFilter = 'all';
    $scope.filterOnStatus = function(alarm) {
        if ($scope.statusFilter === "all") {
            return true;
        }

        return alarm.isOpen() ? $scope.statusFilter === "open" : $scope.statusFilter === "closed";
    };    

    //dummydatafor alarms:
    var setDummyData = function(){
        var alarms = [];

        for (var i = 17; i >= 1; i--) {
            var mockAlarm = new Alarm();
            mockAlarm.id = i;
            mockAlarm.openedDate = "2015-08-22 08:00";
            mockAlarm.affectedObject = "Tunafjord";
            mockAlarm.ruleName = "POS Validation";
            mockAlarm.recipient = "FMC";
            
            var random = Math.floor(Math.random() * 2) + 1;
            if(random === 2){
                mockAlarm.setStatusToClosed();
                mockAlarm.resolvedDate = "2015-08-27 13:37";
                mockAlarm.resolvedBy = "antkar";                
            }else{
                mockAlarm.setStatusToOpen();
            }

            alarms.push(mockAlarm);

        }

        return alarms;
    };

   $scope.currentSearchResults = {
        page : 1,
        totalNumberOfPages : 17,
        items : setDummyData(),//[],
        errorMessage : "",
        loading : false,
        sortBy : "name",
        sortReverse : false,
        filter : ""
    };

    $scope.searchAlarms = function() {
        /*$scope.searchResults.loading = true;
        $scope.searchResults.messages = [];
        $scope.searchResults.errorMessage = "";
        searchService.searchExchange("MESSAGES").then(function(page) {
            $scope.searchResults.messages = page.exchangeMessages;
            $scope.searchResults.page = page.currentPage;
            $scope.searchResults.pageCount = page.totalNumberOfPages;            
            $scope.searchResults.loading = false;
            if(page.totalNumberOfPages === 0 ){
              $scope.searchResults.errorMessage = locale.getString('exchange.search_zero_results_error');            
            }
        },
        function(error) {
            $scope.searchResults.errorMessage = error;
            $scope.searchResults.loading = false;
        });*/
        $log.debug("Todo: implement search");
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

    //Print the exchange logs
    $scope.print = function(){
        alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
    };

    //Export data as CSV file
    $scope.exportItemsAsCSVFile = function(onlySelectedItems){
        var filename = 'holdingTable.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.holding_table_table_status'),
                locale.getString('alarms.holding_table_table_date_openend'),
                locale.getString('alarms.holding_table_table_object_affected'),
                locale.getString('alarms.holding_table_table_rule'),
                locale.getString('alarms.holding_table_table_recipient'),
                locale.getString('alarms.holding_table_table_date_resolved'),
                locale.getString('alarms.holding_table_table_resolved_by'),
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
                        var csvRow = [
                            item.status,
                            item.openedDate,
                            item.affectedObject,
                            item.ruleName,
                            item.recipient,
                            item.resolvedDate,
                            item.resolvedBy
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

});