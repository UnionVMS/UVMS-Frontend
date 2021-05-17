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
angular.module('unionvmsWeb').controller('ExchangeCtrl',function($scope, $log, $filter,$location, $modal, locale, searchService, exchangeRestService, infoModal, ManualPosition, alertService, csvService, ExchangeService, SearchResults, $resource, longPolling, userService){

    $scope.transmissionStatuses = new SearchResults();
    $scope.sendingQueue = new SearchResults();
    $scope.notifications = 0;
    $scope.pausedQueueItems = {};

    $scope.exchangeLogsSearchResults = new SearchResults('dateReceived', true);
    $scope.exchangeLogsSearchResults.incomingOutgoing = 'all';
    $scope.exchangeLogsSearchResults.loading = true;

    $scope.checkedStatus = false;

    $scope.previousList = [];

    $scope.newExchangeLogCount = 0;
    var longPollingIdPlugins, longPollingIdSendingQueue, longPollingIdExchangeList;

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
        delete $scope.isLinkActive;
        $scope.$broadcast("resetExchangeLogSearch");
    };

    var init = function(){
        $scope.getSendingQueue();
        $scope.getTransmissionStatuses();

        longPollingIdPlugins = longPolling.poll("exchange/activity/plugins", function(response) {
            updatePluginStatuses(response);
        });

        longPollingIdSendingQueue = longPolling.poll("exchange/activity/queue", function(response) {
            if (response.ids.length > 0) {
                $scope.getSendingQueue();
            }
        });

        longPollingIdExchangeList =  longPolling.poll("exchange/activity/exchange", function(response) {
            if (response.ids.length > 0) {
                updateExchangeLogs(response.ids[0]);
            }
        });
    };

    $scope.sendQueuedMessages = function(messageIds){
        exchangeRestService.sendQueue(messageIds).then(
        function(data){
            $log.debug("Message(s) successfully sent.");
            //get que again
             $scope.getSendingQueue();
        },
        function(error){
            $log.error("Error trying to send messagequeue.");
        });
    };


    $scope.getSendingQueue = function(){
        $scope.sendingQueue.setLoading(true);
        $scope.sendingQueue.clearErrorMessage();

        $scope.grouped_data = [];

        exchangeRestService.getSendingQueue().then(
            function(data) {
                $scope.sendingQueue.setLoading(false);
                $scope.sendingQueue.items = data;
                 $scope.notifications = $scope.getAmountOfNotifications($scope.sendingQueue.items);
        },
        function(error) {
            $scope.sendingQueue.setLoading(false);
            $scope.sendingQueue.items = [];
            console.error("Error getting sendingqueue statuses", error);
            $scope.sendingQueue.setErrorMessage(locale.getString('common.error_getting_data_from_server'));

        });
    };

    $scope.getAmountOfNotifications = function(items){
        var quantity = 0;

        for (var i = items.length - 1; i >= 0; i--) {
            quantity = quantity + items[i].pluginList.sendingLogList.length;
        }
        return quantity;
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
            $log.debug("Service successfully stopped.");
            alertService.showSuccessMessageWithTimeout(locale.getString('exchange.transmission_stop_transmission_successfull'));
            model.setAsStopped();
        },
        function(error){
            $log.error("Error trying to send messagequeue.");
            alertService.showErrorMessageWithTimeout(locale.getString('exchange.transmission_stop_transmission_error'));
        });
    };

    //Start transmission service
    $scope.startTransmissionService = function(model){
        exchangeRestService.startTransmission(encodeURI(model.serviceClassName)).then(
        function(data){
            $log.debug("Service successfully started.");
            alertService.showSuccessMessageWithTimeout(locale.getString('exchange.transmission_start_transmission_successfull'));
            model.setAsStarted();
        },
        function(error){
            $log.error("Error trying to start plugin.");
             alertService.showErrorMessageWithTimeout(locale.getString('exchange.transmission_start_transmission_error'));
        });
    };

    var resetExchangeLogsList = function(){
        $scope.exchangeLogsSearchResults.items = [];
        $scope.displayedMessages = [];
    };

    $scope.searchExchange = function() {
        delete $scope.isLinkActive;
        $scope.exchangeLogsSearchResults.loading = true;
        $scope.clearSelection();
        resetExchangeLogsList();
        $scope.exchangeLogsSearchResults.clearErrorMessage();
        $scope.exchangeLogsSearchResults.setLoading(true);
        $scope.newExchangeLogCount = 0;
        searchService.searchExchange($scope.exchangeLogsSearchResults.incomingOutgoing).then(function(page) {
            $scope.exchangeLogsSearchResults.updateWithNewResults(page);
            $scope.displayedMessages = [].concat($scope.exchangeLogsSearchResults.items);
            $scope.exchangeLogsSearchResults.loading = false;
        },
        function(error) {
            $scope.exchangeLogsSearchResults.removeAllItems();
            $scope.exchangeLogsSearchResults.setLoading(false);
            $scope.exchangeLogsSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
            $scope.exchangeLogsSearchResults.loading = false;
        });
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchExchange();
        }
    };

    var faTypes = ['FA_QUERY', 'FA_REPORT','FA_RESPONSE'];

    $scope.showDetailsButton = function(model){
        var visible = false;
        var feature, application, operator;
        if (angular.isDefined(model.logData) && model.logData.type){
            switch(model.logData.type){
                case 'POLL':
                    visible = true;
                    break;
                case 'MOVEMENT':
                    feature = ['viewMovements'];
                    application = 'Movement';
                    break;
                case 'ALARM':
                    feature = ['viewAlarmsHoldingTable', 'viewAlarmRules'];
                    application = 'Rules';
                    operator = 'AND';
                    break;
                default:
                    break;
            }

            if (angular.isDefined(feature) && feature.length > 0){
                var tempVisibility = [];
                angular.forEach(feature, function(value){
                    tempVisibility.push(userService.isAllowed(value, application, true));
                });

                if (tempVisibility.length !== 0){
                    tempVisibility = _.unique(tempVisibility);
                    if (tempVisibility.length === 1){
                        visible = tempVisibility[0];
                        if (model.status === 'ISSUED' && feature[0] === 'viewMovements'){
                            visible = true;
                        }
                    } else {
                        if (operator === 'OR'){
                            visible = true;
                        } else {
                            visible = false;
                        }
                    }
                }
            }
        }


        if (_.indexOf(faTypes, model.typeRefType) !== -1){
            visible = true;
        }

        return visible;
    };

    function getRawXmlData (id){
        $scope.isLoadingXml = id;
        exchangeRestService.getRawExchangeMessage(id).then(
        function(data){
            $scope.openXmlModal(data);
        },
        function(error){
            $log.error("Error getting the raw message.");
        });
    }

    $scope.showMessageDetails = function(model) {
        if (angular.isDefined(model.logData) && model.logData.type && _.indexOf(faTypes, model.logData.type) === -1){
            switch(model.logData.type){
                case 'POLL':
                    $location.path('/polling/logs/' + model.logData.guid);
                    break;

                case 'ALARM':
                    $location.path('/alerts/holdingtable/' + model.logData.guid);
                    break;

                case 'MOVEMENT':
                    getRawXmlData(model.id);
                    break;

                default:
                    $log.info("No matching type in model");
                    break;
            }
        } else {
            if (_.indexOf(faTypes, model.typeRefType) !== -1){
                getRawXmlData(model.id);
            } else {
                $log.info("No matching type in model");
            }
        }
    };

    $scope.openXmlModal = function(data){
        $scope.isLoadingXml = undefined;
        var modalInstance = $modal.open({
            templateUrl: 'partial/exchange/messageModal/messageModal.html',
            controller: 'MessagemodalCtrl',
            size: 'lg',
            resolve: {
                msg: function(){
                    return data;
                }
            }
        });
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
        $log.info("open a page... feature not implementet yet.");
    };

    $scope.getIdToDisplay = function(item) {
        if (angular.isDefined(item.logData)){
            var id = item.logData.guid;
            if (item.typeRefType.toUpperCase() === 'FA_RESPONSE'){
                id = item.id;
            }
            return id;
        } else {
            return undefined;
        }
    };

    $scope.getOnValueToDisplay = function(item) {
        return angular.isDefined(item.on) ? item.on : undefined;
    };

    /**
     * Get the title for the buttons of the linked messages
     *
     * @memberOf ExchangeCtrl
     * @alias getLinkedBtnTitle
     * @public
     * @param {String} type - the type of message to be added to the title
     * @returns {String} The translated title
     */
    $scope.getLinkedBtnTitle = function(type){
        var title = locale.getString('exchange.title_details');

        var typeTitle = locale.getString('exchange.title_' + type.toLowerCase());
        if  (typeTitle !== "%%KEY_NOT_FOUND%%"){
            title += ': ' + typeTitle;
        }

        return title;
    };

    $scope.isStatusClickable = function(msg){
        var clickable = false;
        var clickableStatus = ['FAILED', 'WARN', 'ERROR', 'SUCCESSFUL_WITH_WARNINGS'];
        var msgType = ['FA_REPORT', 'FA_RESPONSE', 'FA_QUERY', 'MOVEMENT'];
        if (_.indexOf(clickableStatus, msg.status) !== -1 && _.indexOf(msgType, msg.typeRefType) !== -1){
            clickable = true;
        }
        return clickable;
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

    var getLabelText = function(status){
        var label = locale.getString('common.status_' + status.toLowerCase());
        if (label === "%%KEY_NOT_FOUND%%"){
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

    //Edit selection
    $scope.editSelectionDropdownItems =[
        {'text':locale.getString('common.export_selection'),'code':'EXPORT'}
    ];

    //Export data as CSV file
    $scope.exportLogsAsCSVFile = function(onlySelectedItems){
        var filename = 'exchangeLogs.csv';

        //Set the header columns
        var header = [
            locale.getString('exchange.table_header_date_received_sent'),
            locale.getString('exchange.table_header_source'),
            locale.getString('exchange.table_header_type'),
            locale.getString('exchange.table_header_message_uuid'),
            locale.getString('exchange.table_header_on_value'),
            locale.getString('exchange.table_header_sent_by'),
            locale.getString('exchange.table_header_fwd_rule'),
            locale.getString('exchange.table_header_recipient'),
            locale.getString('exchange.table_header_date_fwd'),
            locale.getString('exchange.table_header_status')
        ];

        //Set the data columns
        var getData = function() {
            var exportItems = [];
            //Export only selected items
            if(onlySelectedItems){
                $.each($scope.displayedMessages, function(index, item){
                    if (item.checked){
                        exportItems.push(item);
                    }
                });
            }
            //Export all logs in the table
            else{
                exportItems = $scope.displayedMessages;
            }

            return exportItems.reduce(
                function(csvObject, item){
                    var id = $scope.getIdToDisplay(item);
                    var csvRow = [
                        $filter('confDateFormat')(item.dateReceived),
                        $filter('transponderName')(item.source),
                        item.typeRefType,
                        id,
                        item.on,
                        item.senderRecipient,
                        item.forwardRule,
                        item.recipient,
                        $filter('confDateFormat')(item.dateFwd),
                        item.status
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        var exportData = getData();
        if (exportData.length > 0){
            csvService.downloadCSVFile(exportData, header, filename);
        }
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.displayedMessages.length){
            if(selectedItem.code === 'EXPORT'){
                $scope.exportLogsAsCSVFile(true);
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){
        var status = $scope.checkedStatus;
        $.each($scope.exchangeLogsSearchResults.items, function(index, item){
            item.checked = status;
        });
    };

    $scope.isAllChecked = function(){
        var globalCheckStatus = $scope.checkedStatus;
        var checkedCounter = 0;
        $.each($scope.exchangeLogsSearchResults.items, function(index, item){
            if (item.checked){
                checkedCounter += 1;
            }
        });

        var finalStatus = true;
        if (checkedCounter !== $scope.exchangeLogsSearchResults.items.length || checkedCounter === 0){
            finalStatus = false;
        }
        $scope.checkedStatus = finalStatus;
    };

    //Clear the selection
    $scope.clearSelection = function(){
        $scope.checkedStatus = false;
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        longPolling.cancel(longPollingIdPlugins);
        longPolling.cancel(longPollingIdSendingQueue);
        longPolling.cancel(longPollingIdExchangeList);
    });

    $scope.resendAllQueueItemsInGroup = function(item){
        //All ids in group.
        var sendingQueuesIds = [];
        for (var i = item.length - 1; i >= 0; i--) {
            sendingQueuesIds.push(item[i].messageId);
        }
        $scope.sendQueuedMessages(sendingQueuesIds);
    };

    $scope.resendQueuedItemInGroup = function(id){
        var sendingQueuesIds = [];
        sendingQueuesIds.push(id);
        $scope.sendQueuedMessages(sendingQueuesIds);
    };

    $scope.resendAllQueued = function(){
        var sendingQueuesIds = [];
        //$scope.sendingQueue.items[i].pluginList.sendingLogList
        for (var i = $scope.sendingQueue.items.length - 1; i >= 0; i--){
           for (var o = $scope.sendingQueue.items[i].pluginList.sendingLogList.length - 1; o >= 0; o--) {
               sendingQueuesIds.push($scope.sendingQueue.items[i].pluginList.sendingLogList[o].messageId);
           }
           //sendingQueuesIds.push($scope.sendingQueue.items[i]);
        }
        $scope.sendQueuedMessages(sendingQueuesIds);
    };

    /**
     * Get linked message data to display in the smart table
     *
     * @memberOf ExchangeCtrl
     * @public
     * @param {Object} msg - the linked message object conatining a type and a guid
     */
    $scope.getLogItem = function(msg){
        $scope.exchangeLogsSearchResults.loading = true;
        exchangeRestService.getLogItem(msg.guid).then(
            function(data){
                $scope.isLinkActive = true;
                $scope.previousList.push(angular.copy($scope.exchangeLogsSearchResults.items));

                $scope.exchangeLogsSearchResults.items = [data];
                $scope.displayedMessages = [].concat($scope.exchangeLogsSearchResults.items);
                $scope.exchangeLogsSearchResults.loading = false;
            },
            function(error){
                $scope.exchangeLogsSearchResults.loading = false;
                $log.error("Error getting the log item.");
            });
    };

    /**
     * When seeing a linked message in the table, this function will allow to go back to the previous table results that
     * were cached and avoiding another call to the server
     *
     * @memberOf ExchangeCtrl
     * @public
     */
    $scope.goBackToList = function(){
        $scope.exchangeLogsSearchResults.items = $scope.previousList.pop();
        $scope.displayedMessages = [].concat($scope.exchangeLogsSearchResults.items);
        if ($scope.previousList.length === 0){
            delete $scope.isLinkActive;
        }
    };

    /**
     * Pipe function used in the smartTable in order to support server side pagination and sorting
     *
     * @memberof ExchangeCtrl
     * @public
     * @alias callServer
     */
    var sortableKeys = {
        dateReceived: 'DATE_RECEIVED',
        source: 'SOURCE',
        typeRefType: 'TYPE',
        senderRecipient: 'SENDER_RECEIVER',
        forwardRule: 'RULE',
        recipient: 'RECIPIENT',
        dateFwd: 'DATE_FORWARDED',
        status: 'STATUS'
    };

    $scope.callServer = function(tableState, ctrl){
        if(!$scope.exchangeLogsSearchResults.loading){
            $scope.exchangeLogsSearchResults.loading = true;
            var sorting = {
                sortBy: sortableKeys[tableState.sort.predicate],
                reversed: tableState.sort.reverse
            };
            searchService.setPage($scope.exchangeLogsSearchResults.page);
            searchService.setSorting(sorting);
            $scope.searchExchange();
        }
    };

    $scope.$watch(function(){return $scope.exchangeLogsSearchResults.incomingOutgoing;}, function(newVal, oldVal){
        if (newVal !== oldVal){
            delete $scope.isLinkActive;
            $scope.searchExchange();
        }
    });

    init();
});
