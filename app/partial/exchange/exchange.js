angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, $filter, locale, searchService, exchangeRestService, infoModal, ManualPosition, alertService, csvService, ExchangeService, SearchResults){

    $scope.transmissionStatuses = new SearchResults();
    $scope.sendingQueueSearchResults = new SearchResults();

    $scope.pausedQueueItems = {};

    $scope.exchangeLogsSearchResults = new SearchResults('dateReceived', true);
    $scope.exchangeLogsSearchResults.incomingOutgoing = 'all';

    var init = function(){
        $scope.searchExchange();
        $scope.searchSendingQueue();
        $scope.getTransmissionStatuses();
    };

    $scope.filterIncomingOutgoing = function(message) {
        if ($scope.exchangeLogsSearchResults.incomingOutgoing === "all") {
            return true;
        }

        return message.outgoing ? $scope.exchangeLogsSearchResults.incomingOutgoing === "outgoing" : $scope.exchangeLogsSearchResults.incomingOutgoing === "incoming";
    };

    //TODO: REMOVE MOCK DATA
    var mockServices = [];
    var a = new ExchangeService();
    a.name = "Inmarsat-C Eik (MOCK)";
    a.status = "ONLINE";
    mockServices.push(a);
    var b = new ExchangeService();
    b.name = "Inmarsat-C Burum (MOCK)";
    b.status = "OFFLINE";
    mockServices.push(b);    
    

    $scope.getTransmissionStatuses = function() {
        $scope.transmissionStatuses.clearForSearch();
        exchangeRestService.getTransmissionStatuses().then(
            function(services) {
                $scope.transmissionStatuses.setLoading(false);
                $scope.transmissionStatuses.items = services;
            },
            function(error) {
                $scope.transmissionStatuses.setLoading(false);
                //TODO: remove mockServices
                $scope.transmissionStatuses.items = mockServices;

                $scope.transmissionStatuses.setErrorMessage(locale.getString('common.error_getting_data_from_server'));
                console.error("Error getting transmission statuses", error);
            }
        );
    };

    //Stop transmission service
    $scope.stopTransmissionService = function(service){
        //TODO: Send request to server using REST or WebSocket
        service.setAsStopped();
    };

    //Start transmission service
    $scope.startTransmissionService = function(service){
        //TODO: Send request to server using REST or WebSocket
        service.setAsStarted();
    };

    $scope.searchExchange = function() {
        $scope.exchangeLogsSearchResults.clearForSearch();        
        
        searchService.searchExchange("MESSAGES").then(function(page) {
            $scope.exchangeLogsSearchResults.updateWithNewResults(page);
        },
        function(error) {
            $scope.exchangeLogsSearchResults.setLoading(false);
            $scope.exchangeLogsSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));            
        });
    };

     $scope.searchSendingQueue = function(){
        searchService.searchExchange("SENDINGQUEUE").then(function(page) {
            $scope.sendingQueueSearchResults.updateWithNewResults(page);
        },
        function(error) {
            $scope.sendingQueueSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        });
     };

    $scope.showMessageDetails = function(message) {
        var options = {
            titleLabel : locale.getString("exchange.message_details_modal_title"),
            textLabel : message.message
        };
        infoModal.open(options);
    };

    //Get status label for the exchange log items
    $scope.getStatusLabel = function(status){
        var label;
        switch(status){
            case 'SUCCESSFUL':
                label = locale.getString('exchange.status_successful'); 
                break;
            case 'PENDING':
                label = locale.getString('exchange.status_pending'); 
                break;
            case 'ERROR':
                label = locale.getString('exchange.status_failed'); 
                break;
            default:
                label = status;
        }
        return label;
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
                            $filter('date')(item.dateRecieved, "medium"),
                            item.sentBy, 
                            item.recipient,
                            item.forwardRule,
                            $filter('date')(item.dateForward, "medium"),
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

    init();
});
