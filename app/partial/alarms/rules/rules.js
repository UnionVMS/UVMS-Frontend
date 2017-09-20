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
angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, $log, $stateParams, locale, csvService, alertService, $filter, Rule,  RuleDefinition, ruleRestService, SearchResults, SearchResultListPage, userService, personsService, confirmationModal, GetListRequest, RuleSubscriptionUpdate, openAlarmsAndTicketsService){

    //Number of items displayed on each page
    $scope.itemsByPage = 20;

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

    //Holds information about the current user's subscriptions of the rules in the table
    $scope.mySubscriptions = {};

    //Dropdown options for subscription
    $scope.subscriptionDropdownOptions =[
        {'text': locale.getString('common.yes'),'code': true},
        {'text': locale.getString('common.no'),'code': false},
    ];
    $scope.subscriptionDropdownOptions = _.sortBy($scope.subscriptionDropdownOptions, function(obj){return obj.text;});

    //Email adddress of the current user
    $scope.currentUserEmailAddress = undefined;
    personsService.getContactDetails(userService.getUserName()).then(function(response){
        $scope.currentUserEmailAddress = response.email;
    }, function(err){
        $log.error("Failed to get email address for current user");
    });

    $scope.currentSearchResults = new SearchResults('name', false, locale.getString('alarms.rules_zero_results_error'));

    var init = function(){
        var ruleGuid = $stateParams.id;
        //Check if ruleId is set, the open that rule if found
        if(angular.isDefined(ruleGuid)){
            ruleRestService.getRuleByGuid(ruleGuid).then(function(rule){
                $scope.toggleRuleDetails(rule);
            }, function(err){
                alertService.showErrorMessage(locale.getString('alarms.rules_by_id_search_zero_results_error'));
            });
        }

        //Load all rules
        $scope.searchRules();
    };

    //Get list of rules
    $scope.searchRules = function() {
        $scope.clearSelection();
        $scope.currentSearchResults.setLoading(true);
        //Get rules
        ruleRestService.getAllRulesForUser().then(updateSearchResults, onGetSearchResultsError);
    };

    //Callback when a new Rule has been creatad
    $scope.createdNewRuleCallback = function(newRule){
        //Add new rule to searchResult
        $scope.currentSearchResults.updateWithSingleItem(newRule);
        $scope.setUserSubscribeValues();

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
        $scope.setUserSubscribeValues();
        $scope.allCurrentSearchResults = $scope.currentSearchResults.items;
        $scope.currentSearchResultsByPage = $scope.currentSearchResults.items;
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
        //Get rules again?
        if($scope.currentSearchResults.items.length === 0){
            $scope.searchRules();
        }
    };

    //Open create form with copy of another Rule
    $scope.copyRule = function(rule){
        $scope.createNewMode = true;
        rule = rule.copy();
        //Unset some values
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
    //Update subscribe values for the rules
    $scope.setUserSubscribeValues = function(){
        $scope.mySubscriptions = {};
        $.each($scope.currentSearchResults.items, function(i, rule){
            $scope.mySubscriptions[rule.guid] = {
                TICKET : rule.isGlobal() || $scope.userIsSubscribing(rule, 'TICKET'),
                EMAIL : $scope.userIsSubscribing(rule, 'EMAIL')
            };
        });
    };

    //Does the current user subscribe to this rule with with the specified subscription type
    $scope.userIsSubscribing = function(rule, subscriptionType){
        var userName = userService.getUserName();
        if(Array.isArray(rule.subscriptions)){
            for (var i = rule.subscriptions.length-1; i >= 0; i--){
                if(rule.subscriptions[i].type === subscriptionType && rule.subscriptions[i].owner === userName){
                    return true;
                }
            }
        }
        return false;
    };

    //Callback when selecting a value in the ticket subscription dropdown
    $scope.onTicketSubscriptionSelect = function(selection, item){
        //Update subscription
        updateSubscription(item, 'TICKET', selection.code);
    };

    //Callback when selecting a value in the email subscription dropdown
    $scope.onEmailSubscriptionSelect = function(selection, item){
        //Update subscription
        updateSubscription(item, 'EMAIL', selection.code);
    };

    //Send request to update subscription for rule
    var updateSubscription = function(rule, type, addOperation){
        //Create ruleSubscriptionUpdate object
        var ruleSubscriptionUpdate = new RuleSubscriptionUpdate(type, rule.guid);
        var newSubscriptionValue;
        if(addOperation){
            ruleSubscriptionUpdate.setOperationToAdd();
            newSubscriptionValue = true;
        }else{
            ruleSubscriptionUpdate.setOperationToRemove();
            newSubscriptionValue = false;
        }

        //Don't send request if no changes has been done
        var userWasSubscribing = $scope.userIsSubscribing(rule, type);
        if(userWasSubscribing === newSubscriptionValue){
            return;
        }

        //Send request
        ruleRestService.updateSubscription(ruleSubscriptionUpdate).then(function(updatedRule){
            alertService.showSuccessMessageWithTimeout(locale.getString('alarms.rule_subscription_update_success'));
            //Update subscription values
            rule.subscriptions = updatedRule.subscriptions;
            $scope.mySubscriptions[rule.guid][type] = newSubscriptionValue;
            //Update number of open alarms and tickets in header and menu
            openAlarmsAndTicketsService.getUpdatedCounts();
        }, function(err){
            alertService.showErrorMessage(locale.getString('alarms.rule_subscription_update_errror'));
            //Reset subscribtion model value
            $scope.mySubscriptions[rule.guid][type] = !newSubscriptionValue;
        });
    };

    //User is allowed to manage global rules?
    $scope.allowedToManageGlobalRules = function(){
        return checkAccessToFeature('manageGlobalAlarmsRules');
    };

    //User is allowed to manage non global rules?
    $scope.allowedToManageRules = function(){
        return checkAccessToFeature('manageAlarmRules');
    };

    //Is the user allowed to delete or update the rule?
    $scope.allowedToDeleteOrUpdateRule = function(rule){
        if(rule.availability === 'GLOBAL'){
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

    //Subscription dropdown options
    var openticketsOpt = {'text': locale.getString('alarms.open_ticket'), 'code':'OPEN_TICKET'};
    $scope.subscriptionsOptions = [openticketsOpt];

    //Get label for availability
    $scope.getAvailabilityLabel = function(rule){
        switch(rule.availability){
            case 'GLOBAL':
                return locale.getString('alarms.rules_availability_global');
            case 'PUBLIC':
                return locale.getString('alarms.rules_availability_public');
            case 'PRIVATE':
                return locale.getString('alarms.rules_availability_private');
            default:
                return rule.availability;
        }
    };

    //Export data as CSV file
    $scope.exportRulesAsCSVFile = function(onlySelectedItems){
        var filename = 'rules.csv';

        //Set the header columns
        var header = [
                locale.getString('alarms.rules_table_name'),
                locale.getString('alarms.rules_table_last_triggered'),
                locale.getString('alarms.rules_table_date_updated'),
                locale.getString('alarms.rules_table_updated_by'),
                locale.getString('alarms.rules_table_subscription'),
                locale.getString('alarms.rules_table_notify_by_email'),
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
            var yes = locale.getString('common.yes');
            var no = locale.getString('common.no');
            return exportItems.reduce(
                function(csvObject, item){
                    var csvRow = [
                            item.name,
                            $filter('confDateFormat')(item.lastTriggered),
                            $filter('confDateFormat')(item.dateUpdated),
                            item.updatedBy,
                            $scope.mySubscriptions[item.guid].TICKET ? yes : no,
                            $scope.mySubscriptions[item.guid].EMAIL ? yes : no,
                            $scope.getStatusLabelForRule(item),
                            $scope.getAvailabilityLabel(item)
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
        if($scope.selectedRules.length){
            if(selectedItem.code === 'EXPORT'){
                $scope.exportRulesAsCSVFile(true);
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
    });

    init();

});