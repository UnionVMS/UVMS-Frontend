angular.module('unionvmsWeb').controller('AuditlogCtrl', function($scope, $q, locale, Audit, auditLogRestService, searchService, auditLogsDefaultValues, auditLogsTypeOptions, SearchResults, GetListRequest, infoModal, dateTimeService, pollingRestService, mobileTerminalRestService) {

	// ************ Page setup ************

	$scope.isAudit = true; //Highlights submenu, aka "AUDIT LOGS"
	$scope.selectedTab = "ALL"; //Set initial tab
    auditLogsTypeOptions.setOptions(auditLogsTypeOptions.getOptions($scope.selectedTab));

    $scope.currentSearchResults = new SearchResults('date', false);

	//Sets tabs
	var setTabs = function (){
            return [
                {
                    'tab': 'ALL',
                    'title': locale.getString('audit.tab_all')
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
                    'tab': 'CATCH_AND_SURVEILLANCE',
                    'title': locale.getString('audit.tab_catch_and_surveillance')
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

	locale.ready('audit').then(function () {
		$scope.tabMenu = setTabs();
    });


    var init = function(){
        auditLogsDefaultValues.resetDefaults();
        $scope.searchAuditLogs();
    };

	// ************ Functions and Scope ************
	$scope.selectTab = function(tab){
		$scope.selectedTab = tab;
        auditLogsTypeOptions.setOptions(auditLogsTypeOptions.getOptions(tab));

        searchService.reset();
        auditLogsDefaultValues.resetDefaults();
        $scope.searchAuditLogs();
	};

    $scope.toggleCheckAll = function() {
        var allChecked = $scope.isAllChecked();
        for (var i = 0; i < $scope.currentSearchResults.items.length; i++) {
            $scope.currentSearchResults.items[i].checked = !allChecked;
        }
    };

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

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            $scope.currentSearchResults.setLoading(true);
            searchService.setPage(page);
            $scope.searchAuditLogs();
        }
    };

    $scope.searchAuditLogs = function() {
        $scope.currentSearchResults.setLoading(true);

        // If not ALL tab, and to TYPE criteria set, search for all types available on this tab.
        if ($scope.selectedTab !== "ALL" && !searchService.hasSearchCriteria("TYPE")) {
            for (var i = 0; i < auditLogsTypeOptions.options.length; i++) {
                searchService.addSearchCriteria("TYPE", auditLogsTypeOptions.options[i].code);
            }
        }

        searchService.searchAuditLogs().then(function(searchResultListPage) {
            $scope.currentSearchResults.updateWithNewResults(searchResultListPage);
        },
        function(error) {
            console.log(error);
            $scope.currentSearchResults.setLoading(false);
            $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
        });
    };

    //Does the audit log item has a comment?
    $scope.itemHasComment = function(audit){
        return audit.objectType === 'Mobile Terminal' || audit.objectType ===  'Poll';
    };

    //Show comment in info modal
    $scope.showComment = function(audit){
        var deferred = $q.defer();
        var id = audit.affectedObject;
        //GET THE COMMENT
        var errorMessage = locale.getString('audit.show_comment_error_text');
        var getListRequest = new GetListRequest(1, 1,true, []);

        //POLL
        if(audit.objectType === 'Poll'){
            getListRequest.addSearchCriteria('POLL_ID', id);
            pollingRestService.getPollList(getListRequest).then(
                function(searchResultsListPage){
                    if(searchResultsListPage.items.length > 0 && angular.isDefined(searchResultsListPage.items[0].poll)){
                        //deferred.resolve(searchResultsListPage.items[0].comment);
                        deferred.resolve("TODO: Show poll comment here!");
                    }else{
                        deferred.reject(errorMessage);
                    }
                },function(){
                    deferred.reject(errorMessage);
                }
            );
        }

        //Mobile terminal
        if(audit.objectType === 'Mobile Terminal'){
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
        }

        var options = {
            titleLabel : locale.getString('common.comment'),
            textLabelPromise : deferred.promise,
        };
        infoModal.open(options);
    };

    $scope.affectedObjectPath = function(audit) {
        var path;
        if(audit.affectedObject){
            switch(audit.objectType){
                case 'Mobile Terminal':
                    path = "/communication/" + audit.affectedObject;
                    break;
                case 'Asset':
                    path = "/assets/" + audit.affectedObject;
                    break;
                case 'Reports':
                    path = "/movement/" + audit.affectedObject;
                    break;
                case 'Reports':
                    path = "/movement/" + audit.affectedObject;
                    break;
                case 'Poll':
                    path = "/polling/logs/" + audit.affectedObject;
                    break;
            }
        }
        return path;
    };

    $scope.$on("$destroy", function() {
        searchService.reset();
    });

    init();

}).factory("auditLogsDefaultValues", function(searchService) {

    var offsetDays = function(date, addDays) {
        date.setHours(date.getHours() + 24 * addDays);
        return date;
    };

    var date2String = function(d) {
        function z(v) { return v < 10 ? "0" + v : v; }
        var date = [d.getFullYear(), z(d.getMonth() + 1), z(d.getDate())].join("-");
        var time = [z(d.getHours()), z(d.getMinutes())].join(":");
        return date + " " + time;
    };

    return {
        resetDefaults: function() {
            var now = new Date();
            searchService.getAdvancedSearchObject()["TO_DATE"] = date2String(now);
            searchService.getAdvancedSearchObject()["FROM_DATE"] = date2String(offsetDays(now, -1));
            searchService.setSearchCriteriasToAdvancedSearch();
        }
    };
}).factory("auditLogsTypeOptions", function() {
    var auditLogsTypeOptions = {};

    var createAuditLogType = function(text, code) {
        return {
            text: text,
            code: code || text
        };
    };

    var auditLogTypes = {
        asset: createAuditLogType("Asset"),
        report: createAuditLogType("Reports"),
        mobileTerminal: createAuditLogType("Mobile Terminal"),
        poll: createAuditLogType("Poll")
    };

    auditLogsTypeOptions.options = [];

    auditLogsTypeOptions.setOptions = function(newOptions) {
        auditLogsTypeOptions.options.splice(0, auditLogsTypeOptions.options.length);
        for (var i = 0; i < newOptions.length; i++) {
            auditLogsTypeOptions.options.push(newOptions[i]);
        }
    };

    auditLogsTypeOptions.getOptions = function(tab) {
        if (tab === "ASSETS_AND_TERMINALS") {
            return [auditLogTypes.asset, auditLogTypes.mobileTerminal, auditLogTypes.poll];
        }
        else if (tab === "POSITION_REPORTS") {
            return [auditLogTypes.report];
        }
        else {
            return Object.keys(auditLogTypes).map(function(key) {
                return auditLogTypes[key];
            });
        }
    };

    return auditLogsTypeOptions;
});
