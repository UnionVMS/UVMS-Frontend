angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, $log, locale, csvService, alertService, $filter, Rule,  RuleDefinition, RuleAction, ruleRestService, SearchResults, SearchResultListPage){

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
    for (var i = 20; i >= 1; i--) {
        var mockRule = new Rule();
        mockRule.id = i;
        mockRule.name = "Mock Rule " + i;
        mockRule.description = "Generated rule number " + i;


        var random = Math.floor(Math.random() * 4) + 1;
        if(random === 1){
            mockRule.availableNotifications.NOTIFICATION = true;
            mockRule.availableNotifications.OPEN_TICKET = true;
        }
        else if(random === 2){
            mockRule.availableNotifications.OPEN_TICKET = true;
        }
        else if(random === 3){
            mockRule.availableNotifications.NOTIFICATION = true;
        }


        random = Math.floor(Math.random() * 5) + 1;
        if(random === 5){
            mockRule.active = false;
        }else{
            if(random === 4){
                if(mockRule.availableNotifications.NOTIFICATION){
                    mockRule.subscription = 'NOTIFICATION';
                }
            }
            if(random === 3){
                if(mockRule.availableNotifications.OPEN_TICKET){
                    mockRule.subscription = 'OPEN_TICKET';
                }
            }        
        }


        random = Math.floor(Math.random() * 4) + 1;
        mockRule.type = "GLOBAL";

        mockRule.availability = "PUBLIC";        
        random = Math.floor(Math.random() * 3) + 1;
        if(random === 1){
            mockRule.availableNotifications.EMAIL = true;
        }else if(random === 2){
            mockRule.availableNotifications.EMAIL = true;
            mockRule.notifyByEmail = "john.smith@mail.com";
        }else{
            mockRule.availableNotifications.EMAIL = false;            
        }

        if(random >= 3){
            mockRule.type = "EVENT";            
        }
        if(random === 4){
            mockRule.availability = "PRIVATE";
        }

        var ruleDef1 = new RuleDefinition();
        ruleDef1.startOperator =  "(";
        ruleDef1.criteria =  "VESSEL";
        ruleDef1.subCriteria =  "CFR";
        ruleDef1.condition =  "EQ";
        ruleDef1.value =  "SWE111222";
        ruleDef1.endOperator =  "";
        ruleDef1.logicBoolOperator =  "OR";
        ruleDef1.order = 0;

        var ruleDef2 = new RuleDefinition();
        ruleDef2.startOperator =  "";
        ruleDef2.criteria =  "VESSEL";
        ruleDef2.subCriteria =  "CFR";
        ruleDef2.condition =  "EQ";
        ruleDef2.value =  "SWE111333";
        ruleDef2.endOperator =  ")";
        ruleDef2.logicBoolOperator =  "AND";
        ruleDef2.order = 1;

        var ruleDef3 = new RuleDefinition();
        ruleDef3.startOperator =  "";
        ruleDef3.criteria =  "MOBILE_TERMINAL";
        ruleDef3.subCriteria =  "MEMBER_ID";
        ruleDef3.condition =  "EQ";
        ruleDef3.value =  "ABC99";
        ruleDef3.endOperator =  "";
        ruleDef3.logicBoolOperator =  "NONE";
        ruleDef3.order = 2;

        mockRule.addDefinition(ruleDef1);
        mockRule.addDefinition(ruleDef2);
        mockRule.addDefinition(ruleDef3);

        random = Math.floor(Math.random() * 2) + 1;
        if(random === 1){
            var ruleAction0 = new RuleAction();
            ruleAction0.action = 'MANUAL_POLL';
            mockRule.addAction(ruleAction0);
        }
        if(random === 2){
            var ruleAction1 = new RuleAction();
            ruleAction1.action = 'SEND_TO_ENDPOINT';
            ruleAction1.value = 'ABC123';
            mockRule.addAction(ruleAction1);
        }

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

    //Get status label
    $scope.getStatusLabelForRule = function(rule){
        if(rule.active){
            return locale.getString('common.active'); 
        }else{
            return locale.getString('common.inactive'); 
        }
    };    

    //Get type label
    $scope.getTypeLabelForRule = function(rule){
        var label;
        switch(rule.type){
            case 'GLOBAL':
                label = locale.getString('alarms.rules_type_global'); 
                break;
            case 'EVENT':
                label = locale.getString('alarms.rules_type_event'); 
                break;
            default:
                label = rule.type;
                break;
        }        
        return label;
    };   

    //Subscription dropdown options
    var openticketsOpt = {'text': locale.getString('alarms.open_ticket'), 'code':'OPEN_TICKET'};
    var notificationOpt = {'text': locale.getString('alarms.notification'), 'code':'NOTIFICATION'};
    $scope.subscriptionsAll = [openticketsOpt, notificationOpt];
    $scope.subscriptionsNotificationOnly = [notificationOpt];
    $scope.subscriptionsOpenTicketsOnly = [openticketsOpt];
 
    $scope.getSubscriptionOptions = function(rule){
        var available = rule.availableNotifications;
        if(available.OPEN_TICKET && available.NOTIFICATION){
            return $scope.subscriptionsAll;
        }

        if(available.NOTIFICATION){
            return $scope.subscriptionsNotificationOnly;
        }  

        if(available.OPEN_TICKET){
            return $scope.subscriptionsOpenTicketsOnly;
        }
    };

    //Export data as CSV file
    $scope.exportRulesAsCSVFile = function(onlySelectedItems){
        var filename = 'rules.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.rules_table_name'),
                locale.getString('alarms.rules_table_type'),
                locale.getString('alarms.rules_table_last_triggered'),
                locale.getString('alarms.rules_table_date_created'),
                locale.getString('alarms.rules_table_createdby'),
                locale.getString('alarms.rules_table_subscription'),
                locale.getString('alarms.rules_table_status'),
                locale.getString('alarms.rules_table_availability'),
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
                            $scope.getTypeLabelForRule(item),
                            item.lastTriggered,
                            item.dateCreated,
                            item.createdBy,
                            item.subscription,
                            $scope.getStatusLabelForRule(item),
                            item.availability
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