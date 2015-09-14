angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, $log, locale, csvService, alertService, $filter, Rule, ruleRestService, SearchResults, SearchResultListPage){

    $scope.selectedRules = []; //Selected rules checkboxes

    //Keep track of visibility statuses
    $scope.isVisible = {
        rulesForm : false
    };

    $scope.createNewMode = false;
    $scope.currentRule = undefined;

    $scope.editSelectionDropdownItems = [
        {text:locale.getString('common.export_selection'), code : 'EXPORT'}
    ];


    $scope.currentSearchResults = new SearchResults('name', false);

    //Add mock data    
    var mockRules = [];
    for (var i = 11; i >= 1; i--) {
        var mockRule = new Rule();
        mockRule.id = i;
        mockRule.name = "Rule " + i;
        mockRule.type = "MS_REPORT";
        mockRule.addNewNotification();
        mockRule.addNewMobileTerminalDefinition();
        mockRule.notifications[0].text = "test@test.com";
        mockRule.notifications[1].type = "SMS";
        mockRule.notifications[1].text = "0123456789";
        mockRule.definitions[0].text = "MONDAY";
        mockRule.definitions[1].text = "TUESDAY";
        mockRule.definitions[2].text = "TUESDAY";
        mockRule.definitions[2].compareType = "EQ";
        mockRule.definitions[3].text = "SUNDAY";

        mockRules.push(mockRule);
    }
    var mockListPage = new SearchResultListPage(mockRules, 1, 34);
    $scope.currentSearchResults.updateWithNewResults(mockListPage);



    $scope.searchRules = function() {
        /*$scope.clearSelection();
        $scope.currentSearchResults.clearForSearch();        
        searchService.searchMobileTerminals(false)
                .then(updateSearchResults, onGetSearchResultsError);*/
        $log.debug("Todo: implement search");
    };


    //Load the next page of the search results
    $scope.loadNextPage = function(){
        $log.debug("Todo: implement next page");
        $scope.currentSearchResults.setLoading(true);
        //Increase page by 1
        /*searchService.increasePage();
        $scope.currentSearchResults.setLoading(true);
        var response = searchService.searchMobileTerminals(true)
           .then(updateSearchResults, onGetSearchResultsError);*/
    };    

    //Details button
    $scope.details = function(item){
    	console.log("DETAILS ITEM -> " + item);
    };

    //delete rule
    $scope.deleteRule = function(item){
    	console.log("DELETE ITEM -> " + item.name);
        ruleRestService.deleteRule(item).then(
            function() {
                alertService.showSuccessMessageWithTimeout(locale.getString('alarms.info_removing_rule'));
            },
            function(error) {
                $scope.currentSearchResults.errorMessage = locale.getString('alarms.error_removing_rule');
                alertService.showErrorMessageWithTimeout($scope.currentSearchResults.errorMessage);
                console.error("Error removing rule", error);
            }
        );
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
        if(angular.isUndefined($scope.currentSearchResults.items) || $scope.selectedRules.length === 0){
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
        $.each($scope.selectedRules, function(index, rule){
           if(rule.equals(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };

        //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedRules = [];
    };

    //Add a rule to the selection
    $scope.addToSelection = function(item){
        $scope.selectedRules.push(item);
    };

    //Remove a rule from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedRules, function(index, rule){
           if(rule.equals(item)){
               $scope.selectedRules.splice(index, 1);
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
    $scope.exportRulesAsCSVFile = function(onlySelectedItems){
        var filename = 'rules.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.rules_table_name'),
                locale.getString('alarms.rules_table_definition'),
                locale.getString('alarms.rules_table_description'),
                locale.getString('alarms.rules_table_recipient'),
                locale.getString('alarms.rules_table_last_triggered'),
                locale.getString('alarms.rules_table_createdby'),
                locale.getString('alarms.rules_table_date_created')
            ];

        //Set the data columns
        var getData = function() {
            var exportItems;
            //Export only selected items
            if(onlySelectedItems){
                exportItems = $scope.selectedRules;
            }
            //Export all logs in the table
            else{
                exportItems = $scope.currentSearchResults.items;
            }
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                            item.name,
                            item.definitions[0],
                            item.description,
                            item.recipient,
                            item.lastTriggered,
                            item.createdBy,
                            item.dateCreated
                    ];
                    csvObject.push(csvRow);
                    return csvObject;
                },[]
            );
        };

        //Create and download the file
        csvService.downloadCSVFile(getData(), header, filename);
    };

    //Toggle (show/hide) new rule
    $scope.toggleAddNewRule = function(){
        $scope.createNewMode = true;
        toggleRuleForm(new Rule());
    };

    //Toggle (show/hide) viewing of a rule
    $scope.toggleRuleDetails = function(rule){
        $scope.createNewMode = false;
        if (rule) {
            rule = rule.copy();
        }

        toggleRuleForm(rule);
    };

    var toggleRuleForm = function(rule){
        alertService.hideMessage();
        if(angular.isDefined(rule)){
            $scope.currentRule = rule;
        }

        $scope.isVisible.rulesForm = !$scope.isVisible.rulesForm;
    };

    $scope.getCurrentRule = function(bool){
        return $scope.currentRule;
    };

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool){
        $scope.createNewMode = bool;
    };

    //Callback function for the "edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if(selectedItem.code === 'EXPORT'){
            $scope.exportRulesAsCSVFile(true);
        }
        $scope.editSelection = "";
    };

});