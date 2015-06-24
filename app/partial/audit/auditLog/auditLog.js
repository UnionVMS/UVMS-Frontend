angular.module('unionvmsWeb').controller('AuditlogCtrl',function($scope, locale){

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

    $scope.currentSearchResults.audits = [{
        username: "nicand",
        operation: "Add vessel create rights",
        objectType: "User",
        date: "2015-06-24T12:00:01+0200",
        objectAffected: "000123"
    },
    {
        username: "System",
        operation: "Create",
        objectType: "Automatic system report",
        date: "2015-06-23T12:00:01+0200",
        objectAffected: "000125"
    }];

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
        // TODO
    }

});