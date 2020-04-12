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
angular.module('unionvmsWeb').controller('RulesformCtrl',function($scope, $timeout, $log, locale, alertService, ruleRestService, Rule, RuleDefinition, RuleTimeInterval, RuleAction, ruleService, confirmationModal, configurationService, rulesOptionsService, rulesSuggestionsService, savedSearchService, userService, globalSettingsService){

    $scope.submitAttempted = false;

    //Holds rule test information
    $scope.ruleTest = {
        success : false,
        message : undefined,
        outdated : false
    };

    //List of actions thare are disabled
    $scope.disabledActions = [];

    //List of availability types thare are disabled
    $scope.disabledAvailabilityTypes = [];

    //Action that creates ticket/notification
    var TICKET_ACTION = 'TICKET';

    //Watch changes to the getCurrentRule model (set in the parent scope)
    $scope.$watch('getCurrentRule()', function(newValue) {
        $scope.currentRule = $scope.getCurrentRule();
        if(angular.isDefined(newValue)){
            $scope.updateFormToMatchTheCurrentRule();
        }
    });

    //Watch for changes to the saved asset groups and update dropdown options when it happens
    $scope.$watch(function () { return savedSearchService.getVesselGroupsForUser();}, function (newVal, oldVal) {
        //Update dropdown values for ruleDefinitions
        rulesOptionsService.setupRuleDefinitionValueDropdowns();
    });

    $scope.speedUnit = globalSettingsService.getSpeedUnit();

    //Init the page
    var init = function(){
        $scope.DROPDOWNS = rulesOptionsService.getDropdownValues();
    };


    /**********BASIC FORM DATA**********/
    //Clear the form
    $scope.clearForm = function(){
        $log.debug("Clear form!");
        $scope.currentRule = new Rule();
        $scope.updateFormToMatchTheCurrentRule();
    };

    //Update form to match the current rule
    $scope.updateFormToMatchTheCurrentRule = function(){
        //Add a new definition row to new rules
        if($scope.currentRule.getNumberOfDefinitions() === 0){
            $scope.addDefinitionRow();
        }

        //Reset form validation
        if(angular.isDefined($scope.ruleForm)){
            $scope.ruleForm.$setPristine();
            $scope.submitAttempted = false;
        }
        //Reset test message
        $scope.ruleTest.message = undefined;
        $scope.ruleTest.outdated = false;

        //Enable/disable availability dropdown
        $scope.updateAvailabilityDropdown();

        //Update list of disabled (already used) actions
        $scope.updateDisabledActions();

        //Reload dropdown values
        rulesOptionsService.setupRuleDefinitionValueDropdowns();
        rulesOptionsService.setupActionDropdowns();
    };

    //Should form be disabled?
    $scope.disableForm = function(){
        //Rule is archived?
        if($scope.isRuleArchived()){
            return true;
        }

        //Create new rule
        if($scope.isCreateNewMode()){
            if($scope.allowedToManageRules()){
                return false;
            }
        }
        //Edit
        else{
            //User has access to edit the rule?
            if(angular.isDefined($scope.currentRule)){
                if($scope.allowedToDeleteOrUpdateRule($scope.currentRule)){
                    return false;
                }
            }
        }
        return true;
    };

    //Is the rule archived?
    $scope.isRuleArchived = function(){
        return angular.isDefined($scope.currentRule) && $scope.currentRule.archived;
    };

    //Callback when selecting value in Availability dropdown
    $scope.onAvailabilitySelection = function(selection){
        $scope.updateAvailabilityDropdown();
    };

    //Disable availability dropdown or options in the dropdown
    $scope.disableAvailability = false;
    $scope.updateAvailabilityDropdown = function(){
        //Disable entire dropdown if TICKET actions exists for other users
        if(existsTicketActionsForOtherUsers()){
            $scope.disableAvailability = true;
        }
        else{
            $scope.disableAvailability = false;
        }
        if(angular.isUndefined($scope.currentRule.availability)){
            $scope.currentRule.availability = $scope.DROPDOWNS.AVAILABILITY_TYPES[0].code;
        }

        //Disable Global option if user doesn't have permission to manage global rules
        if(!$scope.allowedToManageGlobalRules()){
            $scope.disabledAvailabilityTypes.push('GLOBAL');
        }else if($scope.disabledAvailabilityTypes.length > 0){
            $scope.disabledAvailabilityTypes.length = 0;
        }
    };



    /**********RULE TIME INTERVALS**********/
    //Add a time interval row
    $scope.addTimeIntervalItem = function(){
        $scope.currentRule.addTimeInterval(new RuleTimeInterval());
    };

    //Remove a time interval row
    $scope.removeTimeIntervalItem = function(intervalToBeRemoved){
        var indexToRemove = -1;
        $.each($scope.currentRule.timeIntervals, function(i, interval){
            if(intervalToBeRemoved === interval){
                indexToRemove = i;
                return false;
            }

        });
        if(indexToRemove >= 0){
            $scope.currentRule.timeIntervals.splice(indexToRemove, 1);
        }
    };




    /**********RULE DEFINITIONS**********/
    //Add a definition row
    $scope.addDefinitionRow = function(){
        var ruleDef = new RuleDefinition();
        if($scope.DROPDOWNS.CRITERIAS.length > 0){
            ruleDef.criteria = $scope.DROPDOWNS.CRITERIAS[0].code;
        }
        if(Object.keys($scope.DROPDOWNS.SUBCRITERIAS).length > 0 && ruleDef.criteria in $scope.DROPDOWNS.SUBCRITERIAS){
            ruleDef.subCriteria = $scope.DROPDOWNS.SUBCRITERIAS[ruleDef.criteria][0].code;
        }
        if(Object.keys($scope.DROPDOWNS.CONDITIONS).length > 0 && ruleDef.criteria in $scope.DROPDOWNS.CONDITIONS){
            ruleDef.condition = $scope.DROPDOWNS.CONDITIONS[ruleDef.criteria][ruleDef.subCriteria][0].code;
        }
        ruleDef.order = $scope.currentRule.getNumberOfDefinitions();
        $scope.currentRule.addDefinition(ruleDef);
    };

    //Remove a rule definition row
    $scope.removeRuleDefinition = function(definitionToBeRemoved){
        var indexToRemove = $scope.currentRule.definitions.indexOf(definitionToBeRemoved);
        if(indexToRemove >= 0){
            $scope.currentRule.definitions.splice(indexToRemove, 1);
        }

        //Set new order for definitions
        $.each($scope.currentRule.definitions, function(i, def){
            def.order = i;
        });
    };

    //Callback when selecting criteria in dropdown
    $scope.onCriteriaSelection = function(selection, ruleDef){
        var selectedVal = selection.code;
        //Set value of critera explicit to make sure the value is updated before calling setDefaultValueToDefinition
        ruleDef.criteria = selectedVal;
        ruleDef.subCriteria = $scope.DROPDOWNS.SUBCRITERIAS[ruleDef.criteria][0].code;
        ruleDef.condition = $scope.DROPDOWNS.CONDITIONS[ruleDef.criteria][ruleDef.subCriteria][0].code;
        //Reset value field
        $scope.setDefaultValueToDefinition(ruleDef);
    };

    //Callback when selecting subcriteria in dropdown
    $scope.onSubCriteriaSelection = function(selection, ruleDef){
        //Set value of subCriteria explicit to make sure the value is updated before calling setDefaultValueToDefinition
        ruleDef.subCriteria = selection.code;
        ruleDef.condition = $scope.DROPDOWNS.CONDITIONS[ruleDef.criteria][ruleDef.subCriteria][0].code;
        $scope.setDefaultValueToDefinition(ruleDef);
    };

    //Reset value field, either to undefined or to first dropdown value
    $scope.setDefaultValueToDefinition = function(ruleDef){
        ruleDef.value = undefined;
        //Value type is dropdown? Then select first value in it.
        var valueType = $scope.getRuleDefinitionValueInputType(ruleDef);
        if(valueType === 'DROPDOWN'){
            var valueDropdownOptions = rulesOptionsService.getDropdownValuesForRuleDefinition(ruleDef);
            if(valueDropdownOptions && valueDropdownOptions.length > 0){
                ruleDef.value = valueDropdownOptions[0].code;
            }
        }
    };

    //Get the type of input for the ruleDefinition value
    $scope.getRuleDefinitionValueInputType = function(ruleDefinition){
        //Dropdown?
        var dropdownValues = rulesOptionsService.getDropdownValuesForRuleDefinition(ruleDefinition);
        if(Array.isArray(dropdownValues)){
            if(dropdownValues.length === 0){
                return "DROPDOWN_EMPTY";
            }
            return "DROPDOWN";

        }

        //Text input with auto suggestion?
        if(rulesSuggestionsService.isSuggestionsAvailable(ruleDefinition)){
            return "TEXT_WITH_SUGGESTIONS";
        }

        //Speed input?
        if(rulesOptionsService.isRuleDefinitionValueASpeed(ruleDefinition)){
            return "SPEED";
        }

        //Course input?
        if(rulesOptionsService.isRuleDefinitionValueACourse(ruleDefinition)){
            return "COURSE";
        }

        //Longitude input
        if(rulesOptionsService.isRuleDefinitionValueLongitudeCoordinate(ruleDefinition)){
            return "LONGITUDE";
        }
        //Latitude input
        if(rulesOptionsService.isRuleDefinitionValueLatitudeCoordinate(ruleDefinition)){
            return "LATITUDE";
        }

        //DateTime input?
        if(rulesOptionsService.isRuleDefinitionValueADateTime(ruleDefinition)){
            return "DATETIME";
        }

        //Default text input
        return "TEXT";
    };

    //Get dropdown values for the ruleDefinition value
    $scope.getDropdownValuesForRuleDefinition = function(ruleDefinition){
        return rulesOptionsService.getDropdownValuesForRuleDefinition(ruleDefinition);
    };



    /**********RULE ACTIONS**********/
    //Add an action row
    $scope.addActionRow = function(){
        var ruleAction = new RuleAction();
        ruleAction.action = $scope.getFirstActionThatIsEnabled();
        ruleAction.order = $scope.currentRule.getNumberOfActions();

        $scope.currentRule.addAction(ruleAction);
        //Update list of disabled actions
        $scope.updateDisabledActions();
    };


    //Check if an action requires a value
    $scope.actionShouldHaveValue = function(action){
        return rulesOptionsService.actionShouldHaveValue(action);
    };

    //Get first action in action dropdown that isn't disabled (already used if only single value is allowed)
    $scope.getFirstActionThatIsEnabled = function(){
        var actionVal;
        $.each($scope.DROPDOWNS.ACTIONS, function(index, dropdownItem){
            if($scope.disabledActions.indexOf(dropdownItem.code) < 0){
                actionVal = dropdownItem.code;
                return false;
            }
        });
        return actionVal;
    };


    //Update list of disabled actions
    $scope.updateDisabledActions = function(){
        $scope.disabledActions.length = 0;
        $.each($scope.currentRule.actions, function(index, ruleAction){
            if(!$scope.actionShouldHaveValue(ruleAction.action)){
                $scope.disabledActions.push(ruleAction.action);
            }
        });

        //If global, disable "create notification for user"
        if($scope.currentRule.isGlobal()){
            $scope.disabledActions.push(TICKET_ACTION);
        }
        //Event rule, the one TICKET with username is allowed
        else{
            var ticketIndex = $scope.disabledActions.indexOf(TICKET_ACTION);
            var removeTicket = true;
            //Check if Ticket action exists for current user
            for(var i=0; i<$scope.currentRule.actions.length; i++){
                var ruleAction = $scope.currentRule.actions[i];
                if(ruleAction.action === TICKET_ACTION && ruleAction.value === userService.getUserName()){
                    removeTicket = false;
                    if(ticketIndex < 0){
                        $scope.disabledActions.push(TICKET_ACTION);
                    }
                }
            }
            //Remove TICKET from disabledActions?
            if(removeTicket && ticketIndex >= 0){
                $scope.disabledActionssplice(ticketIndex, 1);
            }
        }
    };

    function isAreaTypeDefinition(definition) {
        return definition.criteria === 'AREA' && (definition.subCriteria === 'AREA_TYPE' || definition.subCriteria === 'AREA_TYPE_ENT' || definition.subCriteria === 'AREA_TYPE_EXT');
    }

    function isAreaCodeDefinition(definition) {
        return definition.criteria === 'AREA' && (definition.subCriteria === 'AREA_CODE' || definition.subCriteria === 'AREA_CODE_ENT' || definition.subCriteria === 'AREA_CODE_EXT');
    }

    function getSelectedAreaTypes() {
        var types = [];
        if ($scope.currentRule !== undefined && $scope.currentRule.definitions !== undefined) {
            angular.forEach($scope.currentRule.definitions, function(definition) {
                if (isAreaTypeDefinition(definition) && types.indexOf(definition.value) < 0) {
                    types.push(definition.value);
                }
            });
        }

        return types;
    }

    //Check if it exists TICKET actions for other user on the rule
    var existsTicketActionsForOtherUsers = function(){
        for(var i=0; i<$scope.currentRule.actions.length; i++){
            var ruleAction = $scope.currentRule.actions[i];
            if(ruleAction.action === TICKET_ACTION && ruleAction.value !== userService.getUserName()){
                return true;
            }
        }
        return false;
    };

    function getRuleActionDefaultValue(ruleAction) {
        if (rulesOptionsService.actionShouldHaveValue(ruleAction.action)) {
            var values = rulesOptionsService.getDropdownValuesForAction(ruleAction);
            if (values && values.length > 0) {
                return values[0].code;
            }
        }
    }

    //Callback when selecting action in dropdown
    $scope.actionSelected = function(selection, ruleAction){
        ruleAction.action = selection.code;
        ruleAction.value = getRuleActionDefaultValue(ruleAction);
        $timeout($scope.updateDisabledActions, 10);
    };

    //Remove a rule action row
    $scope.removeRuleAction = function(actionToBeRemoved){
        var indexToRemove = $scope.currentRule.actions.indexOf(actionToBeRemoved);
        if(indexToRemove >= 0){
            $scope.currentRule.actions.splice(indexToRemove, 1);
        }

        //Set new order for actions
        $.each($scope.currentRule.actions, function(i, def){
            def.order = i;
        });

        //Update list of disabled actions
        $scope.updateDisabledActions();
    };

    //Get the type of input for the action value
    $scope.getActionValueInputType = function(action){
        //Dropdown?
        var dropdownValues = rulesOptionsService.getDropdownValuesForAction(action);
        if(Array.isArray(dropdownValues)){
            if(dropdownValues.length === 0){
                return "DROPDOWN_EMPTY";
            }
            return "DROPDOWN";
        }

        //Email input?
        if(rulesOptionsService.isRuleActionValueAnEmail(action)){
            return "EMAIL";
        }

        //Text input
        return "TEXT";
    };

    //Get dropdown values for the action  value
    $scope.getDropdownValuesForAction = function(action){
        return rulesOptionsService.getDropdownValuesForAction(action);
    };



    /**********CREATE/UPDATE RULE**********/
    //Check if form is valid and show error message if not
    var isValidForm = function(){
        if(!$scope.ruleForm.$valid){
            alertService.showErrorMessage(locale.getString('common.form_validation_error_message'));
            //Test rule as well to get an updated test text
            $scope.testRule();
            return false;
        }

        //Test syntax of rule and actions
        if(!$scope.testRule()){
            alertService.showErrorMessage(locale.getString('alarms.rules_add_new_alert_message_on_form_rule_validation_error'));
            return false;
        }

        return true;
    };

    //Create the rule
    $scope.createNewRule = function(){
        $scope.submitAttempted = true;
        alertService.hideMessage();

        //Validate form
        if(!isValidForm()){
            return;
        }

        //Create
        var options = {
            textLabel : locale.getString("alarms.rule_create_confirm_text")
        };
        confirmationModal.open(function(){
            $scope.waitingForCreateResponse = true;
            ruleRestService.createNewRule($scope.currentRule)
                .then(createNewRuleSuccess, createNewRuleError);
        }, options);
    };

    //Update the rule
    $scope.updateRule = function(){
        $scope.submitAttempted = true;
        alertService.hideMessage();

        //Validate form
        if(!isValidForm()){
            return;
        }

        //Update
        var options = {
            textLabel : locale.getString("alarms.rule_update_confirm_text")
        };
        confirmationModal.open(function(){
            $scope.waitingForCreateResponse = true;
            ruleRestService.updateRule($scope.currentRule)
                .then(updateRuleSuccess, updateRuleError);
        }, options);
    };

    //Success creating the rule
    var createNewRuleSuccess = function(rule) {
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('alarms.rules_add_new_alert_message_on_success'));
        $scope.currentRule = rule;
        $scope.setCreateMode(false);
        $scope.createdNewRuleCallback(rule);
    };

    //Error creating the rule
    var createNewRuleError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('alarms.rules_add_new_alert_message_on_error'));
    };

    //Success updating the rule
    var updateRuleSuccess = function(updatedRule) {
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('alarms.rules_update_alert_message_on_success'));
        $scope.updateRuleCallback();
    };

    //Error updating the rule
    var updateRuleError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('alarms.rules_update_alert_message_on_error'));
    };



    /**********RULE TEXT AND TEST**********/
    //Update the rule as text text
    var updateRuleAsText = function(){
        var text = ruleService.getRuleAsText($scope.currentRule);
        $scope.ruleAsText = text;
        $scope.ruleTest.outdated = true;
    };

    //Watch changes to the definitions and actions of the rule
    $scope.$watch('currentRule.definitions', function (newVal, oldVal){
        updateRuleAsText();
    }, true);
    $scope.$watch('currentRule.actions', function (newVal, oldVal){
        updateRuleAsText();
    }, true);

    //Test rule
    $scope.testRule = function(){
        $scope.ruleTest.outdated = false;

        //TODO: Get matches for the rule
        var testResult = ruleService.areRuleDefinitionsAndActionsValid($scope.currentRule);
        $scope.ruleTest.success = testResult.success;
        $scope.ruleTest.problems = testResult.problems;

        if(testResult.success){
            $scope.ruleTest.message = locale.getString('alarms.rules_test_success');
        }else{
            $scope.ruleTest.message = locale.getString('alarms.rules_test_fail');
        }

        return testResult.success;
    };


    /**********AUTO SUGGESTIONS**********/
    var lastAutoSuggestionRequestTimestamp;
    //Handle auto suggest error
    var autoSuggestError = function(error){
        alertService.showErrorMessage(locale.getString('alarms.rules_form_definition_auto_suggest_error'));
        return [];
    };

    //Handle auto suggest success
    var autoSuggestSuccess = function(suggestions){
       return suggestions;
    };

    function getAutoSuggestOptions(ruleDefinition) {
        var options = {};
        if (isAreaCodeDefinition(ruleDefinition)) {
            var areaTypes = getSelectedAreaTypes();
            options.countries = areaTypes.indexOf('COUNTRY') >= 0;
            options.userAreas = areaTypes.indexOf('USERAREA') >= 0;
        }

        return options;
    }

    //Function for getting auto suggestions
    $scope.getAutoSuggestValues = function(value, ruleDefinition){
        lastAutoSuggestionRequestTimestamp = new Date().getTime();
        return rulesSuggestionsService
            .getSuggestions(value, ruleDefinition, getAutoSuggestOptions(ruleDefinition))
            .then(autoSuggestSuccess, autoSuggestError);
    };

    //On select in value auto suggestion input field
    $scope.onValueSuggestionSelect = function(selectedItem, selectedLabel, ruleDefinition){
        //Update value based on selection
        ruleDefinition.value = selectedLabel;
    };

    init();


});