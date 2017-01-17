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
angular.module('unionvmsWeb').controller('AuditlogCtrl', function($scope, $q, $filter, locale, Audit, auditLogRestService, searchService, auditOptionsService, SearchResults, GetListRequest, infoModal, pollingRestService, mobileTerminalRestService, csvService) {

    //Names used in the backend
    var TYPES = auditOptionsService.getTypes();

	// ************ Page setup ************

	$scope.isAudit = true; //Highlights submenu, aka "AUDIT LOGS"
	$scope.selectedTab = "ALL"; //Set initial tab
    auditOptionsService.setOptions($scope.selectedTab);

    $scope.currentSearchResults = new SearchResults('date', false);
    var modalInstance;

    var init = function(){
        auditOptionsService.resetDefaults();
        $scope.searchAuditLogs();
    };

    $scope.$watch('selectedTab', function(newVal) {
        auditOptionsService.setOptions(newVal);
        searchService.reset();
        auditOptionsService.resetDefaults();
        $scope.searchAuditLogs();
    });

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

        //Open comments modal
        var options = {
            titleLabel : locale.getString('common.comment'),
        };
        if(angular.isDefined(audit.comment)){
            options.textLabel = audit.comment;
        }else{
            options.textLabel = locale.getString('audit.show_comment_error_text');
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
                case TYPES.ASSETS_AND_TERMINALS.POLLING_PROGRAM:
                    return "/polling/logs/" + audit.affectedObject;
                case TYPES.ALARMS.ALARM:
                    return "/alerts/holdingtable/" + audit.affectedObject;
                case TYPES.ALARMS.TICKET:
                    return "/alerts/notifications/" + audit.affectedObject;
                case TYPES.ALARMS.CUSTOM_RULE:
                case TYPES.ALARMS.CUSTOM_RULE_SUBSCRIPTION:
                case TYPES.ALARMS.CUSTOM_RULE_ACTION_TRIGGERED:
                    return "/alerts/rules/" + audit.affectedObject;
                case TYPES.POSITION_REPORTS.AUTOMATIC_POSITION_REPORT:
                case TYPES.POSITION_REPORTS.MANUAL_POSITION_REPORT:
                    return "/movement/" + audit.affectedObject;
                case TYPES.POSITION_REPORTS.TEMPORARY_POSITION_REPORT:
                    return "/movement/manual/" + audit.affectedObject;
                case TYPES.ACCESS_CONTROL.USER:
                case TYPES.ACCESS_CONTROL.USER_PASSWORD:
                    return "/usm/users/" + audit.affectedObject;
                default:
                    return;
            }
        }
    };

    var csvReduce = function(csvObject, item){
        var csvRow = [
            item.username,
            item.operation,
            item.objectType,
            $filter('confDateFormat')(item.date)
        ];
        csvObject.push(csvRow);
        return csvObject;
    };

    //Export data as CSV file
    $scope.exportLogsAsCSVFile = function(){
        var filename = 'auditLogs.csv';

        //Set the header columns
        var header = [
            locale.getString('audit.column_username'),
            locale.getString('audit.column_operation'),
            locale.getString('audit.column_object_type'),
            locale.getString('audit.column_date')
        ];

        //Set the data columns
        var getData = function() {
            return $scope.getSelectedItems().reduce(csvReduce,[]);
        };

        //Create and download the file
        if ($scope.getSelectedItems().length > 0 && !$scope.isAllChecked()) {
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
            if ($scope.selectedTab !== "ALL" && !searchService.hasSearchCriteria("TYPE")) {
                for (var i = 0; i < auditOptionsService.getCurrentOptions().types.length; i++) {
                    searchService.addSearchCriteria("TYPE", auditOptionsService.getCurrentOptions().types[i].code);
                }
            }
            searchService.setPage(page);
            searchService.searchAuditLogs().then(function(searchResultListPage) {
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
        if(angular.isDefined(modalInstance)){
            modalInstance.dismiss();
        }
    });

    $scope.contentTabsFunctions = {
        setTabs: function() {
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
        },
        setInitialTab: function() {
            return 'ALL';
        }
    };

    init();

});