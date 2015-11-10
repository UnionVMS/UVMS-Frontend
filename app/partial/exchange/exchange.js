angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, $filter,$location, locale, searchService, exchangeRestService, infoModal, ManualPosition, alertService, csvService, ExchangeService, SearchResults, $resource, longPolling){

    $scope.transmissionStatuses = new SearchResults();
    $scope.sendingQueue = new SearchResults();

    $scope.pausedQueueItems = {};

    $scope.exchangeLogsSearchResults = new SearchResults('dateReceived', true);
    $scope.exchangeLogsSearchResults.incomingOutgoing = 'all';

    $scope.newExchangeLogCount = 0;

    var updatePluginStatuses = function(newStatuses) {
        $.each($scope.transmissionStatuses.items, function(index, plugin) {
            var newStatus = newStatuses[plugin.serviceClassName];
            if (newStatus === true) {
                plugin.setAsStarted();
            }
            else if (newStatus === false) {
                plugin.setAsStopped();
            }
        });
    };

    var updateExchangeLogs = function(guid) {
        searchService.searchExchange().then(function(page) {
            if (page.hasItemWithGuid(guid)) {
                $scope.exchangeLogsSearchResults.updateWithNewResults(page);
            }
            else {
                $scope.newExchangeLogCount++;
            }
        });
    };

    $scope.resetSearch = function() {
        $scope.$broadcast("resetExchangeLogSearch");
    };

    var init = function(){
        //$scope.searchExchange();
        $scope.getSendingQueue();
        $scope.getTransmissionStatuses();

        longPolling.poll("/exchange/activity/plugins", function(response) {
            updatePluginStatuses(response);
        });

        longPolling.poll("/exchange/activity/queue", function(response) {
            if (response.ids.length > 0) {
                $scope.getSendingQueue();
            }
        });

        longPolling.poll("/exchange/activity/exchange", function(response) {
            if (response.ids.length > 0) {
                updateExchangeLogs(response.ids[0]);
            }
        });
    };

    $scope.filterIncomingOutgoing = function(message) {
        if ($scope.exchangeLogsSearchResults.incomingOutgoing === "all") {
            return true;
        }

        return message.incoming ? $scope.exchangeLogsSearchResults.incomingOutgoing === "incoming" : $scope.exchangeLogsSearchResults.incomingOutgoing === "outgoing";
    };

    $scope.sendQueuedMessages = function(messageIds){
        exchangeRestService.sendQueue(messageIds).then(
        function(data){
            console.log("Message(s) successfully sent.");
            //get que again
             $scope.getSendingQueue();
        },
        function(error){
            console.log("Error trying to send messagequeue.");
        });
    };

    $scope.getSendingQueue = function(){
        $scope.sendingQueue.setLoading(true);
        $scope.sendingQueue.clearErrorMessage();

        exchangeRestService.getSendingQueue().then(
            function(data) {
                $scope.sendingQueue.setLoading(false);
                $scope.sendingQueue.items = data;
        },
        function(error) {
            $scope.sendingQueue.setLoading(false);
            $scope.sendingQueue.items = [];
            console.error("Error getting sendingqueue statuses", error);
            $scope.sendingQueue.setErrorMessage(locale.getString('common.error_getting_data_from_server'));

        });
    };

    $scope.getTransmissionStatuses = function() {
        $scope.transmissionStatuses.setLoading(true);
        $scope.transmissionStatuses.clearErrorMessage();
        exchangeRestService.getTransmissionStatuses().then(
            function(services) {
                $scope.transmissionStatuses.setLoading(false);
                $scope.transmissionStatuses.items = services;
            },
            function(error) {
                $scope.transmissionStatuses.setLoading(false);

                $scope.transmissionStatuses.setErrorMessage(locale.getString('common.error_getting_data_from_server'));
                console.error("Error getting transmission statuses", error);
            }
        );
    };

    //Stop transmission service
    $scope.stopTransmissionService = function(model){
        exchangeRestService.stopTransmission(encodeURI(model.serviceClassName)).then(
        function(data){
            console.log("Service successfully stopped.");
            alertService.showSuccessMessageWithTimeout(locale.getString('exchange.transmission_stop_transmission_successfull'));
            model.setAsStopped();
        },
        function(error){
            console.log("Error trying to send messagequeue.");
            alertService.showErrorMessageWithTimeout(locale.getString('exchange.transmission_stop_transmission_error'));
        });
    };

    //Start transmission service
    $scope.startTransmissionService = function(model){
        exchangeRestService.startTransmission(encodeURI(model.serviceClassName)).then(
        function(data){
            console.log("Service successfully started.");
            alertService.showInfoMessageWithTimeout(locale.getString('exchange.transmission_start_transmission_successfull'));
            model.setAsStarted();
        },
        function(error){
            console.log("Error trying to start plugin.");
             alertService.showInfoMessageWithTimeout(locale.getString('exchange.transmission_start_transmission_error'));
        });
    };

    $scope.searchExchange = function() {
        $scope.clearSelection();
        $scope.exchangeLogsSearchResults.clearErrorMessage();
        $scope.exchangeLogsSearchResults.setLoading(true);
        $scope.newExchangeLogCount = 0;
        searchService.searchExchange().then(function(page) {
            $scope.exchangeLogsSearchResults.updateWithNewResults(page);
        },
        function(error) {
            $scope.exchangeLogsSearchResults.removeAllItems();
            $scope.exchangeLogsSearchResults.setLoading(false);
            $scope.exchangeLogsSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        });
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchExchange();
        }
    };

    $scope.showMessageDetails = function(model) {
        if (model.logData.type){
            switch(model.logData.type){
                case 'POLL':
                    $location.path('/polling/logs/' + model.logData.guid);
                    break;

                case 'MOVEMENT':
                    $location.path('/movement/' + model.logData.guid);
                    break;

                case 'ALARM':
                    $location.path('alarms/holdingtable/' + model.logData.guid);
                    break;

                default:
                    console.log("No matching type in model");
                    break;
            }
        }
    };

    $scope.openUpModal = function(model){
        var options = {
            titleLabel : locale.getString("exchange.message_details_modal_title"),
            textLabel : model.message,
            message : model
        };
        infoModal.open(options);
    };

    $scope.openPosition = function(model){
        console.log("open a page....");
    };

    //Get status label for the exchange log items
    $scope.getStatusLabel = function(status){
        var label;
        switch(status){
            case 'SUCCESSFUL':
                label = locale.getString('common.status_successful');
                break;
            case 'PENDING':
                label = locale.getString('common.status_pending');
                break;
            case 'ERROR':
                label = locale.getString('common.status_failed');
                break;
            default:
                label = status;
        }
        return label;
    };

    $scope.getStatusLabelClass = function(status){
        var cssClass;
        switch(status){
            case 'SUCCESSFUL' :
            case 'STARTED' :
            case 'ONLINE':
                cssClass = "label-success";
                break;
            case 'OFFLINE':
            case 'STOPPED':
            case 'ERROR' :
                cssClass = "label-danger";
                break;
            default:
            cssClass = "label-warning";
        }
        return cssClass;
    };

    //Get status label for the exchange transmission service items
    $scope.getTransmissionStatusLabel = function(status){
        var label;
        switch(status){
            case 'ONLINE':
                label = locale.getString('exchange.transmission_status_online');
                break;
            case 'OFFLINE':
                label = locale.getString('exchange.transmission_status_offline');
                break;
            case 'STOPPED':
                label = locale.getString('exchange.transmission_status_stopped');
                break;
            default:
                label = status;
        }
        return label;
    };

    //Print the exchange logs
    $scope.print = function(){
        alertService.showInfoMessageWithTimeout(locale.getString('common.not_implemented'));
    };

    //Edit selection
    $scope.editSelectionDropdownItems =[
        {'text':locale.getString('common.export_selection'),'code':'EXPORT'}
    ];

    //Export data as CSV file
    $scope.exportLogsAsCSVFile = function(onlySelectedItems){
        var filename = 'exchangeLogs.csv';

        //Set the header columns
        var header = [
            locale.getString('exchange.table_header_date_received'),
            locale.getString('exchange.table_header_source'),
            locale.getString('exchange.table_header_type'),
            locale.getString('exchange.table_header_sent_by'),
            locale.getString('exchange.table_header_fwd_rule'),
            locale.getString('exchange.table_header_recipient'),
            locale.getString('exchange.table_header_date_fwd'),
            locale.getString('exchange.table_header_status')
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
                exportItems = $scope.exchangeLogsSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    if($scope.filterIncomingOutgoing(item)){
                        var csvRow = [
                            $filter('confDateFormat')(item.dateRecieved),
                            angular.isDefined(item.logData) ? item.type :'',
                            $filter('transponderName')(item.source),
                            item.senderRecipient,
                            item.forwardRule,
                            item.recipient,
                            $filter('confDateFormat')(item.dateForward),
                            $scope.getStatusLabel(item.status)
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
            $scope.exportLogsAsCSVFile(true);
        }
        $scope.editSelection = "";
    };

    //Selected by checkboxes
    $scope.selectedItems = [];

    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){
        if($scope.isAllChecked()){
            //Remove all
            $scope.clearSelection();
        }else{
            //Add all
            $scope.clearSelection();
            $.each($scope.exchangeLogsSearchResults.items, function(index, item) {
                $scope.addToSelection(item);
            });
        }
    };

    $scope.check = function(item){
        console.log(item);
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
        }
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.exchangeLogsSearchResults.items) || $scope.selectedItems.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.exchangeLogsSearchResults.items, function(index, item) {
            if(!$scope.isChecked(item)){
                allChecked = false;
                return false;
            }
        });
        return allChecked;
    };

    $scope.isChecked = function(item){
        var checked = false;
        $.each($scope.selectedItems, function(index, exchangeMessage){
            if(exchangeMessage.isEqualExchange(item)){
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
        $.each($scope.selectedItems, function(index, exchangeMessage){
            if(exchangeMessage.isEqualExchange(item)){
                $scope.selectedItems.splice(index, 1);
                return false;
            }
        });
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        searchService.reset();
    });

    $scope.resendAllQueueItemsInGroup = function(item){
        //All ids in group.
        var sendingQueuesIds = [];
        for (var i = item.sendingLogList.length - 1; i >= 0; i--) {
            sendingQueuesIds.push(item.sendingLogList[i].id);
        }
        $scope.sendQueuedMessages(sendingQueuesIds);
    };

    $scope.resendQueuedItemInGroup = function(id){
        var sendingQueuesIds = [];
        console.log("sending item with id: " + id);
        sendingQueuesIds.push(id);
        $scope.sendQueuedMessages(sendingQueuesIds);
    };

    $scope.resendAllQueued = function(){
        var sendingQueuesIds = [];
        for (var i = $scope.sendingQueue.items.length - 1; i >= 0; i--){
           for (var o = $scope.sendingQueue.items[i].sendingLogList.length - 1; o >= 0; o--) {
               sendingQueuesIds.push($scope.sendingQueue.items[i].sendingLogList[o].id);
           }
           //sendingQueuesIds.push($scope.sendingQueue.items[i]);
        }
        $scope.sendQueuedMessages(sendingQueuesIds);
    };
    $scope.messageVisible = false;

    init();
});
