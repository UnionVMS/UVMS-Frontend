angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, $log, $stateParams, locale, csvService, alertService, $filter, Rule,  RuleDefinition, ruleRestService, SearchResults, SearchResultListPage, userService, personsService, confirmationModal, GetListRequest){

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Rules', true);
    };

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

    //Email adddress of the current user
    $scope.currentUserEmailAddress = undefined;
    personsService.getContactDetails(userService.getUserName()).then(function(response){
        $scope.currentUserEmailAddress = response.email;
    }, function(err){
        $log.error("Failed to get email address for current user");
    });

    $scope.currentSearchResults = new SearchResults('name', false, locale.getString('alarms.rules_zero_results_error'));

    var init = function(){
        $scope.ruleGuid = $stateParams.id;

        //Load all rules
        $scope.searchRules();
    };

    //Get list of rules
    var getListRequest = new GetListRequest();
    $scope.searchRules = function() {
        $scope.clearSelection();
        $scope.currentSearchResults.setLoading(true);
        //Get rules
        getListRequest.addSearchCriteria('RULE_USER', userService.getUserName());
        getListRequest.addSearchCriteria('AVAILABILITY', 'PUBLIC');
        ruleRestService.getRulesByQuery(getListRequest).then(updateSearchResults, onGetSearchResultsError);
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            getListRequest.setPage(page);
            ruleRestService.getRulesByQuery(getListRequest).then(updateSearchResults, onGetSearchResultsError);
        }
    };

    //Callback when a new Rule has been creatad
    $scope.createdNewRuleCallback = function(newRule){
        //Add new rule to searchResult
        $scope.currentSearchResults.updateWithSingleItem(newRule);

        //Show search results
        $scope.isVisible.rulesForm = false;
    };

    //Callback when a Rule has been updated
    $scope.updateRuleCallback = function(updatedRule){
        //Search for all rules again
        $scope.searchRules();

        //Show search results
        $scope.isVisible.rulesForm = false;
    };

    //Update the search results
    var updateSearchResults = function(searchResultsListPage){
        $scope.currentSearchResults.updateWithNewResults(searchResultsListPage);

        //Check if ruleId is set, the open that rule if found
        if(angular.isDefined($scope.ruleGuid)){
            //Look for the rule with the right ruleGuid
            var theRule;
            $.each(searchResultsListPage.items, function(i, rule){
                if(rule.guid === $scope.ruleGuid){
                    theRule = rule;
                    $scope.toggleRuleDetails(rule);
                    return false;
                }
            });

            if(!theRule){
                alertService.showErrorMessage(locale.getString('alarms.rules_by_id_search_zero_results_error'));
            }
        }
    };

    //Error during search
    var onGetSearchResultsError = function(error){
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Remove rule from searchResults
    $scope.removeFromSearchResults = function(rule) {
        var rules = $scope.currentSearchResults.items;
        var index = rules.indexOf(rule);
        if (index < 0) {
            return;
        }

        rules.splice(index, 1);
    };

    //Open create form with copy
    $scope.copyRule = function(rule){
        $scope.createNewMode = true;
        rule = rule.copy();
        rule.lastTriggered = undefined;
        rule.updatedBy = undefined;
        rule.dateUpdated = undefined;
        toggleRuleForm(rule);
    };

    //Delete rule
    $scope.deleteRule = function(item){
        var options = {
            textLabel : locale.getString("alarms.rule_delete_confirm_text")
        };
        confirmationModal.open(function(){
            ruleRestService.deleteRule(item).then(
                function() {
                    alertService.showSuccessMessageWithTimeout(locale.getString('alarms.info_removing_rule'));
                    $scope.removeFromSearchResults(item);
                },
                function(error) {
                    alertService.showErrorMessageWithTimeout(locale.getString('alarms.error_removing_rule'));
                    $log.error("Error removing rule", error);
                }
            );
        }, options);
    };

    /*SUBSCRIPTIONS*/
    $scope.userHasTicketNotificationForRule = function(rule){
        var userName = userService.getUserName();
        for (var i = rule.actions.length-1; i >= 0; i--){
            if(rule.actions[i].action === 'TICKET' && rule.actions[i].value === userName){
                return true;
            }
        }
    };

    $scope.userHasEmailNotificationForRule = function(rule){
        if(angular.isDefined($scope.currentUserEmailAddress)){
            for (var i = rule.actions.length-1; i >= 0; i--){
                if(rule.actions[i].action === 'EMAIL' && rule.actions[i].value === $scope.currentUserEmailAddress){
                    return true;
                }
            }
        }
    };

    //User is allowed to manage global rules?
    $scope.allowedToManageGlobalRules = function(){
        return checkAccessToFeature('manageGlobalAlarmsRules');
    };

    //User is allowed to manage non global rules?
    $scope.allowedToManageRules = function(){
        return checkAccessToFeature('manageAlarmsRules');
    };

    //Is the user allowed to delete or update the rule?
    $scope.allowedToDeleteOrUpdateRule = function(rule){
        if(rule.type === 'GLOBAL'){
            //Allowed to manage global rules?
            if($scope.allowedToManageGlobalRules()){
                return true;
            }
        }
        else{
            //Allowed to manage event rules?
            if($scope.allowedToManageRules()){
                return true;
            }
        }

        return false;
    };


    //Is it possible to subscripe to the rule?
    $scope.isSubscriptionPossible = function(rule){
        return rule.type !== 'GLOBAL';
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
    $scope.subscriptionsOptions = [openticketsOpt];

    //Export data as CSV file
    $scope.exportRulesAsCSVFile = function(onlySelectedItems){
        var filename = 'rules.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.rules_table_name'),
                locale.getString('alarms.rules_table_type'),
                locale.getString('alarms.rules_table_last_triggered'),
                locale.getString('alarms.rules_table_date_updated'),
                locale.getString('alarms.rules_table_updated_by'),
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
                            $filter('confDateFormat')(item.lastTriggered),
                            $filter('confDateFormat')(item.dateUpdated),
                            item.updatedBy,
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

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
    });

    init();

});