angular.module('unionvmsWeb').controller('AuditlogCtrl',function($scope, locale, Audit, AuditLogModal, auditLogRestService, searchService) {

	// ************ Page setup ************

	$scope.isAudit = true; //Highlights submenu, aka "AUDIT LOGS"
	$scope.selectedTab = "ALL"; //Set initial tab

    $scope.currentSearchResults = {
        page : 0,
        totalNumberOfPages : 0,
        audits : [],
        errorMessage : "",
        loading : false,
        sortBy : "date",
        sortReverse : true,
        filter : ""
    };

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



	// ************ Functions and Scope ************

	$scope.selectTab = function(tab){
		$scope.selectedTab = tab;

        searchService.reset();
        $scope.searchAuditLogs();
	};

    $scope.toggleCheckAll = function() {
        var allChecked = $scope.isAllChecked();
        for (var i = 0; i < $scope.currentSearchResults.audits.length; i++) {
            $scope.currentSearchResults.audits[i].checked = !allChecked;
        }
    };

    $scope.isAllChecked = function() {
        if ($scope.currentSearchResults.audits.length === 0) {
            return false;
        }

        for (var i = 0; i < $scope.currentSearchResults.audits.length; i++) {
            if (!$scope.currentSearchResults.audits[i].checked) {
                return false;
            }
        }

        return true;
    };

    $scope.loadNextPage = function() {
        if ($scope.currentSearchResults.currentPage >= $scope.currentSearchResults.totalNumberOfPages) {
            return;
        }

        searchService.increasePage();
        $scope.searchAuditLogs(true);
    };

    $scope.showAuditModal = function(audit) {
        AuditLogModal.show(audit);
    };

    $scope.clearSearchResults = function() {
        $scope.currentSearchResults.page = 0;
        $scope.currentSearchResults.totalNumberOfPages = 0;
        $scope.currentSearchResults.audits = [];
        $scope.currentSearchResults.errorMessage = "";
        $scope.currentSearchResults.loading = false;
        $scope.currentSearchResults.sortBy = "date";
        $scope.currentSearchResults.sortReverse = true;
        $scope.currentSearchResults.filter = "";
    };

    $scope.searchAuditLogs = function(append) {
        if (!append) {
            $scope.clearSearchResults();
        }

        $scope.currentSearchResults.loading = true;
        searchService.searchAuditLogs().then(function(auditLogsPage) {
            $scope.currentSearchResults.loading = false;
            $scope.updateSearchResults(auditLogsPage);
        },
        function(error) {
            console.log(error);
            $scope.currentSearchResults.errorMessage = locale.getString('common.search_failed_error');
            $scope.currentSearchResults.loading = false;
        });
    };

    $scope.updateSearchResults = function(auditLogListPage) {
        $scope.currentSearchResults.audits = $scope.currentSearchResults.audits.concat(auditLogListPage.auditLogs);
        $scope.currentSearchResults.currentPage = auditLogListPage.currentPage;
        $scope.currentSearchResults.totalNumberOfPages = auditLogListPage.totalNumberOfPages;
    };

    $scope.searchAuditLogs();

});