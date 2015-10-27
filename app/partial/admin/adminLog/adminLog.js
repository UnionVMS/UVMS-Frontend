angular.module('unionvmsWeb').controller('AuditlogCtrl', function($scope, $q, locale, Audit, auditLogRestService, searchService, auditOptionsService, SearchResults, GetListRequest, infoModal, dateTimeService, pollingRestService, mobileTerminalRestService) {

    //Names used in the backend
    var TYPE_ASSET = 'Asset';
    var TYPE_MOBILE_TERMINAL = 'Mobile Terminal';
    var TYPE_POLL = 'Poll';

	// ************ Page setup ************

	$scope.isAudit = true; //Highlights submenu, aka "AUDIT LOGS"
	$scope.selectedTab = "ALL"; //Set initial tab
    auditOptionsService.setOptions($scope.selectedTab);

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
        return audit.objectType === TYPE_MOBILE_TERMINAL || audit.objectType ===  TYPE_POLL;
    };

    //Show comment in info modal
    $scope.showComment = function(audit){
        var deferred = $q.defer();
        var id = audit.affectedObject;
        //GET THE COMMENT
        var errorMessage = locale.getString('audit.show_comment_error_text');
        var getListRequest = new GetListRequest(1, 1,true, []);

        //POLL
        if(audit.objectType === TYPE_POLL){
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
        if(audit.objectType === TYPE_MOBILE_TERMINAL){
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

    //Get the url to the affected object
    $scope.affectedObjectPath = function(audit) {
        var path;
        if(audit.affectedObject){
            switch(audit.objectType){
                case TYPE_MOBILE_TERMINAL:
                    path = "/communication/" + audit.affectedObject;
                    break;
                case TYPE_ASSET:
                    path = "/assets/" + audit.affectedObject;
                    break;
                case TYPE_POLL:
                    path = "/polling/logs/" + audit.affectedObject;
                    break;
            }
        }
        return path;
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

    $scope.$on("$destroy", function() {
        searchService.reset();
    });

    init();

});