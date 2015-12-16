angular.module('unionvmsWeb').controller('AuditlogCtrl', function($scope, $q, $filter, locale, Audit, auditLogRestService, searchService, auditOptionsService, SearchResults, GetListRequest, infoModal, dateTimeService, pollingRestService, mobileTerminalRestService, csvService) {

    //Names used in the backend
    var TYPES = auditOptionsService.getTypes();

	// ************ Page setup ************

	$scope.isAudit = true; //Highlights submenu, aka "AUDIT LOGS"
	$scope.selectedTab = "ALL"; //Set initial tab
    auditOptionsService.setOptions($scope.selectedTab);

    $scope.currentSearchResults = new SearchResults('date', false);
    var modalInstance;

	//Sets tabs
	var setTabs = function (){
        return [
            {
                'tab': 'ALL',
                'title': locale.getString('audit.tab_all')
            },
            {
                'tab': 'EXCHANGE',
                'title': locale.getString('audit.tab_exchange')
            },
            {
                'tab': 'POSITION_REPORTS',
                'title': locale.getString('audit.tab_position_reports')
            },
            {
                'tab': 'ASSETS_AND_TERMINALS',
                'title': locale.getString('audit.tab_assets_and_terminals')
            },
            {
                'tab': 'GIS',
                'title': locale.getString('audit.tab_gis')
            },
            {
                'tab': 'ALARMS',
                'title': locale.getString('audit.tab_alarms')
            },
            {
                'tab': 'ACCESS_CONTROL',
                'title': locale.getString('audit.tab_access_control')
            }
        ];
    };

    var init = function(){
        $scope.tabMenu = setTabs();
        auditOptionsService.resetDefaults();
        $scope.searchAuditLogs();
    };

	// ************ Functions and Scope ************
	$scope.selectTab = function(tab){
		$scope.selectedTab = tab;
        auditOptionsService.setOptions($scope.selectedTab);

        searchService.reset();
        auditOptionsService.resetDefaults();
        $scope.searchAuditLogs();
	};

    //Do the search
    $scope.searchAuditLogs = function() {
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);

        // If not ALL tab, and to TYPE criteria set, search for all types available on this tab.
        if ($scope.selectedTab !== "ALL" && !searchService.hasSearchCriteria("TYPE")) {
            for (var i = 0; i < auditOptionsService.getCurrentOptions().types.length; i++) {
                searchService.addSearchCriteria("TYPE", auditOptionsService.getCurrentOptions().types[i].code);
            }
        }

        searchService.searchAuditLogs().then(function(searchResultListPage) {
            $scope.currentSearchResults.updateWithNewResults(searchResultListPage);
        },
        function(error) {
            console.log(error);
            $scope.currentSearchResults.removeAllItems();
            $scope.currentSearchResults.setLoading(false);
            $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        });
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            $scope.currentSearchResults.setLoading(true);
            searchService.setPage(page);
            $scope.searchAuditLogs();
        }
    };

    //Does the audit log item has a comment?
    $scope.itemHasComment = function(audit){
        //Types that has special comments
        var typesWithSpecialComment = [
            TYPES.ASSETS_AND_TERMINALS.MOBILE_TERMINAL,
            TYPES.ASSETS_AND_TERMINALS.POLL,
        ];
        var hasComment = typesWithSpecialComment.indexOf(audit.objectType) >= 0;
        //Has comment set in comment field?
        if(!hasComment){
            hasComment = angular.isDefined(audit.comment);
        }
        return hasComment;
    };

    //Show comment in info modal
    $scope.showComment = function(audit){
        var deferred = $q.defer();
        var id = audit.affectedObject;
        var textLabel;

        //GET THE COMMENT
        var errorMessage = locale.getString('audit.show_comment_error_text');
        var getListRequest = new GetListRequest(1, 1,true, []);

        switch(audit.objectType){
            //POLL
            case TYPES.ASSETS_AND_TERMINALS.POLL:
                getListRequest.addSearchCriteria('POLL_ID', id);
                pollingRestService.getPollList(getListRequest).then(
                    function(searchResultsListPage){
                        if(searchResultsListPage.items.length > 0 && angular.isDefined(searchResultsListPage.items[0].poll)){
                            deferred.resolve(searchResultsListPage.items[0].poll.comment);
                        }else{
                            deferred.reject(errorMessage);
                        }
                    },function(){
                        deferred.reject(errorMessage);
                    }
                );
                break;

            //Mobile terminal
            case TYPES.ASSETS_AND_TERMINALS.MOBILE_TERMINAL:
                mobileTerminalRestService.getHistoryForMobileTerminalByGUID(id).then(
                    function(historyList){
                        if(historyList.length > 0){
                            //Find the matching historyItem by comparing dates
                            var auditDate = audit.date;
                            var historyDate, matchingHistoryItem;
                            _.sortBy(historyList, function(item){return - item.changeDate;});
                            for(var i = 0; i <  historyList.length; i++){
                                historyDate = historyList[i].changeDate;
                                //Audit date should be slightly (milliseconds) later than the mobile history date
                                if(auditDate >= historyDate){
                                    matchingHistoryItem = historyList[i];
                                }
                                //No need to look more
                                if(auditDate < historyDate){
                                    break;
                                }
                            }
                            //Found matching item?
                            if(matchingHistoryItem){
                                deferred.resolve(matchingHistoryItem.comment);
                            }else{
                                deferred.reject(errorMessage);
                            }
                        }else{
                            deferred.reject(errorMessage);
                        }
                    },function(){
                        deferred.reject(errorMessage);
                    }
                );
                break;
            default:
                textLabel = audit.comment;
                break;
        }

        //Open comments modal
        var options = {
            titleLabel : locale.getString('common.comment'),
        };
        if(angular.isDefined(textLabel)){
            options.textLabel = textLabel;
        }else{
            options.textLabelPromise = deferred.promise;
        }
        modalInstance = infoModal.open(options);
    };

    //Get simple text to show as affected object
    $scope.affectedObjectText = function(audit) {
        if(audit.affectedObject){
            switch(audit.objectType){
                case TYPES.ALARMS.CUSTOM_RULE_ACTION_TRIGGERED:
                case TYPES.OTHER.SETTING:
                    return audit.affectedObject;
                default:
                    return;
            }
        }
    };

    //Get the link text to the affected object
    //Will only be shown if affectedObjectPath is set for the item
    $scope.affectedObjectLinkText = function(audit) {
        if(audit.affectedObject){
            switch(audit.objectType){
                case TYPES.ACCESS_CONTROL.USER:
                case TYPES.ACCESS_CONTROL.USER_PASSWORD:
                    return audit.affectedObject;
                default:
                    return locale.getString('audit.show_object');
            }
        }
    };

    //Get the url to the affected object
    $scope.affectedObjectPath = function(audit) {
        if(audit.affectedObject){
            switch(audit.objectType){
                case TYPES.ASSETS_AND_TERMINALS.MOBILE_TERMINAL:
                    return "/communication/" + audit.affectedObject;
                case TYPES.ASSETS_AND_TERMINALS.ASSET:
                    return "/assets/" + audit.affectedObject;
                case TYPES.ASSETS_AND_TERMINALS.POLL:
                    return "/polling/logs/" + audit.affectedObject;
                case TYPES.ALARMS.ALARM:
                    return "/alarms/holdingtable/" + audit.affectedObject;
                case TYPES.ALARMS.TICKET:
                    return "/alarms/notifications/" + audit.affectedObject;
                case TYPES.ALARMS.CUSTOM_RULE:
                case TYPES.ALARMS.CUSTOM_RULE_SUBSCRIPTION:
                case TYPES.ALARMS.CUSTOM_RULE_ACTION_TRIGGERED:
                    return "/alarms/rules/" + audit.affectedObject;
                case TYPES.POSITION_REPORTS.AUTOMATIC_POSITION_REPORT:
                    return "/movement/" + audit.affectedObject;
                case TYPES.ACCESS_CONTROL.USER:
                case TYPES.ACCESS_CONTROL.USER_PASSWORD:
                    return "/usm/users/" + audit.affectedObject;
                default:
                    return;
            }
        }
    };

    //Export data as CSV file
    $scope.exportLogsAsCSVFile = function(){
        var filename = 'auditLogs.csv';

        //Set the header columns
        var header = [
            locale.getString('audit.column_username'),
            locale.getString('audit.column_operation'),
            locale.getString('audit.column_object_type'),
            locale.getString('audit.column_date'),
            locale.getString('audit.column_object_affected'),
        ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            var selectedItems = $scope.getSelectedItems();
            if(selectedItems.length > 0){
                exportItems = selectedItems;
            }
            //Export all logs in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                        item.username,
                        item.operation,
                        item.objectType,
                        $filter('confDateFormat')(item.date),
                        item.affectedObject
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);
    };

    //Check all/none
    $scope.toggleCheckAll = function() {
        var allChecked = $scope.isAllChecked();
        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            $scope.currentSearchResults.items[i].checked = !allChecked;
        }
    };

    //Check if all items are checked
    $scope.isAllChecked = function() {
        if ($scope.currentSearchResults.items.length === 0) {
            return false;
        }

        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            if (!$scope.currentSearchResults.items[i].checked) {
                return false;
            }
        }

        return true;
    };

    //Get the selected items
    $scope.getSelectedItems = function(){
        var selectedItems = [];
        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            if ($scope.currentSearchResults.items[i].checked) {
                selectedItems.push($scope.currentSearchResults.items[i]);
            }
        }
        return selectedItems;
    };

    $scope.$on("$destroy", function() {
        searchService.reset();
        if(angular.isDefined(modalInstance)){
            modalInstance.dismiss();
        }
    });

    init();

});