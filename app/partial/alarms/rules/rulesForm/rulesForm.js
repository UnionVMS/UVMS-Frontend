angular.module('unionvmsWeb').controller('RulesformCtrl',function($scope, $timeout, $log, locale, alertService, ruleRestService, Rule, RuleDefinition, RuleTimeInterval, RuleAction, ruleService, GetListRequest, vesselRestService, mobileTerminalRestService, userService){

    $scope.submitAttempted = false;

    $scope.ruleTest = {
        success : false,
        message : undefined,
        outdated : false
    };

    //Watch changes to the getCurrentRule model (set in the parent scope)
    $scope.$watch('getCurrentRule()', function(newValue) {
        $scope.currentRule = $scope.getCurrentRule();
        $scope.initForm();
    });

    $scope.initForm = function(){
        //Add a new definition row to new rules
        if($scope.currentRule.getNumberOfDefinitions() === 0){
            $scope.addDefinitionRow();
        }

        //Add a new action row to new rules
        if($scope.currentRule.getNumberOfActions() === 0){
            $scope.addActionRow();
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

        $scope.updateDisabledActions();

    };


    //Disable form
    $scope.disableForm = function(){
        //User has access to manage rules?
        if(!userService.isAllowed('manageAlarmsRules', 'Rules', true)){
            return true;
        }

        //Create new should never disable form
        if($scope.isCreateNewMode()){
            return false;
        }

        if(angular.isDefined($scope.currentRule)){
            if($scope.allowedToDeleteOrUpdateRule($scope.currentRule)){
                return false;
            }
        }
        return true;
    };

    var createDropdownItemsWithSameTextAsValue = function(codes){
        var options = [];
        $.each(codes, function(index, code){
            options.push({'text': code,'code':code});
        });
        return options;
    };

    //Dropdown values
    //TODO: Get values from config
    $scope.ruleTypes =[
        {'text': 'Global','code':'GLOBAL'},
        {'text': 'Event','code':'EVENT'}
    ];

    $scope.availabilityTypes =[
        {'text': 'Public','code':'PUBLIC'},
        {'text': 'Private','code':'PRIVATE'}
    ];
    $scope.activeStatuses =[
        {'text': 'Active','code':true},
        {'text': 'Inactive','code':false}
    ];

    //DEFINITION VALUES
    $scope.startOperators = createDropdownItemsWithSameTextAsValue(['(', '((', '(((']);
    $scope.endOperators = createDropdownItemsWithSameTextAsValue([')', '))', ')))']);
    $scope.logicBoolOperationTypes = createDropdownItemsWithSameTextAsValue(['AND', 'OR', 'NONE']);
    $scope.criterias =[
        {'text': 'Vessel','code':'VESSEL'},
        {'text': 'Mobile Terminal','code':'MOBILE_TERMINAL'},
        {'text': 'Geo area','code':'GEO'},
    ];

    $scope.subCriterias = {
        'VESSEL' :  [{'text': 'CFR','code':'CFR'}, {'text': 'IRCS','code':'IRCS'}, {'text': 'Name','code':'NAME'}],
        'MOBILE_TERMINAL' : [{'text': 'Serial number','code':'SERIAL_NUMBER'}, {'text': 'DNID','code':'DNID'}, {'text': 'Member number','code':'MEMBER_NUMBER'}],
        'GEO' : [{'text': 'Area id','code':'AREA_ID'}],
    };

    $scope.conditionTypes =[
        {'text': 'equals to','code':'EQ'},
        {'text': 'not equals to','code':'NEQ'},
    ];

    //Action values
    $scope.thenActions = [
        {'text': locale.getString('alarms.rules_form_action_NOTIFY'),'code':'NOTIFY'},
        {'text': locale.getString('alarms.rules_form_action_MANUAL_POLL'),'code':'MANUAL_POLL'},
        {'text': locale.getString('alarms.rules_form_action_SEND_TO_ENDPOINT'),'code':'SEND_TO_ENDPOINT'},
        {'text': 'Send SMS','code':'SMS'},
        {'text': 'Send EMAIL','code':'MAIL'},
    ];

    //Add a definition row
    $scope.addDefinitionRow = function(){
        var ruleDef = new RuleDefinition();
        ruleDef.criteria = $scope.criterias[0].code;
        ruleDef.subCriteria = $scope.subCriterias[ruleDef.criteria][0].code;
        ruleDef.order = $scope.currentRule.getNumberOfDefinitions();
        $scope.currentRule.addDefinition(ruleDef);
    };

    //Add a time interval row
    $scope.addTimeIntervalItem = function(){
        $scope.currentRule.addTimeInterval(new RuleTimeInterval());
    };

    //Disable availability dropdown when type is GLOBAL
    $scope.disableAvailability = false;
    $scope.updateAvailabilityDropdown = function(selection){
        var selectedType = angular.isDefined(selection) ? selection.code : $scope.currentRule.type;
        if(selectedType === 'GLOBAL'){
            $scope.currentRule.availability = 'PUBLIC';
            $scope.disableAvailability = true;
        }else{
            $scope.disableAvailability = false;
            if(angular.isUndefined($scope.currentRule.availability)){
                $scope.currentRule.availability = $scope.availabilityTypes[0].code;
            }
        }
    };

    //Callback when selecting criteria in dropdown
    $scope.criteriaSelected = function(selection, ruleDef){
        $log.debug("criteriaSelected");
        $log.debug(selection);
        $log.debug(ruleDef);
        var selectedVal = selection.code;
        var newSubCriteria;
        if(Array.isArray($scope.subCriterias[selectedVal]) && $scope.subCriterias[selectedVal].length > 0){
            newSubCriteria = $scope.subCriterias[selectedVal][0].code;
        }
        ruleDef.subCriteria = newSubCriteria;
    };

    //List of actions that require a value
    var actionsWithValue = ['SEND_TO_ENDPOINT', 'SMS', 'MAIL'];

    //Check if an action requires a value
    $scope.actionShouldHaveValue = function(action){
        return actionsWithValue.indexOf(action) >= 0;
    };

    //Get first action in action dropdown that isn't disabled (already used if only single value is allowed)
    $scope.getFirstActionThatIsEnabled = function(){
        var actionVal;
        $.each($scope.thenActions, function(index, dropdownItem){
            if($scope.disabledThenActions.indexOf(dropdownItem.code) < 0){
                actionVal = dropdownItem.code;
                return false;
            }
        });
        return actionVal;
    };

    //Add an action row
    $scope.addActionRow = function(){
        var ruleAction = new RuleAction();
        ruleAction.action = $scope.getFirstActionThatIsEnabled();
        ruleAction.order = $scope.currentRule.getNumberOfActions();
        $scope.currentRule.addAction(ruleAction);
        //Update list of disabled actions
        $scope.updateDisabledActions();
    };

    $scope.onActionAddedOrUpdated = function(newRuleAction){
        //Add notification when selecting MANUAL_POLL
        if(newRuleAction.action === 'MANUAL_POLL'){

        }

    };

    //List of actions thare are disabled (already selected in another dropdown)
    $scope.disabledThenActions = [];
    //Update list of disabled actions
    $scope.updateDisabledActions = function(){
        $scope.disabledThenActions.length = 0;
        $.each($scope.currentRule.actions, function(index, ruleAction){
            if(!$scope.actionShouldHaveValue(ruleAction.action)){
                $scope.disabledThenActions.push(ruleAction.action);
            }
        });
    };

    //Callback when selecting action in dropdown
    $scope.actionSelected = function(selection, ruleAction){
        console.log("actionSelected: " +selection.code);
        var selectedVal = selection.code;
        //Unset value if not SEND_TO_ENDPOINT
        //Add to disabledValues if not SEND_TO_ENDPOINT
        if(!$scope.actionShouldHaveValue(selectedVal.action)){
            ruleAction.value = undefined;
        }
        $timeout($scope.updateDisabledActions, 10);
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

    //Check if form is valid and show error message if not
    var isValidForm = function(){
        if(!$scope.ruleForm.$valid){
            alertService.showErrorMessage(locale.getString('common.form_validation_error_message'));
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

        //Validate form
        if(!isValidForm()){
            return;
        }

        //Create
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        ruleRestService.createNewRule($scope.currentRule)
                .then(createNewRuleSuccess, createNewRuleError);
    };

    //Update the rule
    $scope.updateRule = function(){
        $scope.submitAttempted = true;

        //Validate form
        if(!isValidForm()){
            return;
        }

        //Update
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        ruleRestService.updateRule($scope.currentRule)
                .then(updateRuleSuccess, updateRuleError);
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
        //TODO: Update currentRule and merge results back to rules list
    };

    //Error updating the rule
    var updateRuleError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('alarms.rules_update_alert_message_on_error'));
    };

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

    //Watch changes to ruleService.getRuleAsText($scope.currentRule)
    $scope.$watch(function () { return ruleService.getRuleAsText($scope.currentRule);}, function (newVal, oldVal){
        var text = ruleService.getRuleAsText($scope.currentRule);
        $scope.ruleAsText = text;
        $scope.ruleTest.outdated = true;
    });


    //AUTO SUGGESTIONS
    var maxNumberOfSuggestions = 10;
    var lastAutoSuggestionRequestTimestamp;
    var autoSuggestionGetListRequest = new GetListRequest(1, maxNumberOfSuggestions, true, []);


    //Handle auto suggest success
    var autoSuggestSuccess = function(criteria, subCriteria, searchResultListPage){
        return searchResultListPage.items.reduce(function(suggestions, resultItem){
            var suggestion;

            //Get the correct suggestion value
            if(criteria === 'VESSEL'){
                switch (subCriteria){
                    case 'CFR':
                        suggestion = resultItem.cfr;
                        break;
                    default:
                        suggestion = resultItem[subCriteria.toLowerCase()];
                        break;
                }
            }

            if(criteria === 'MOBILE_TERMINAL'){
                switch (subCriteria){
                    default:
                        suggestion = resultItem.attributes[subCriteria];
                        break;
                }
            }

            if(angular.isDefined(suggestion)){
                //Don't add duplicates
                if(!_.contains(suggestions, suggestion)){
                    suggestions.push(suggestion);
                }
            }else{
                $log.info("Couldn't find the auto suggest value.");
            }

            return suggestions;
        }, []);
    };

    //Handle auto suggest error
    var autoSuggestError = function(error){
        alertService.showErrorMessage(locale.getString('alarms.rules_form_definition_auto_suggest_error'));
        return [];
    };

    //Get vessels matching search query
    var getVessels = function(criteria, subCriteria) {
        return vesselRestService.getVesselList(autoSuggestionGetListRequest).then(
            function(vesselResultListPage){
                return autoSuggestSuccess(criteria, subCriteria, vesselResultListPage);
            },
            autoSuggestError
        );
    };

    //Get mobileTerminals matching search query
    var getMobileTerminals = function(criteria, subCriteria) {
        return mobileTerminalRestService.getMobileTerminalList(autoSuggestionGetListRequest).then(
            function(searchResultListPage){
                return autoSuggestSuccess(criteria, subCriteria, searchResultListPage);
            },
            autoSuggestError
        );
    };

    //Function for getting auto suggestions
    $scope.getAutoSuggestValues = function(value, item){
        if(angular.isDefined(item.criteria) && angular.isDefined(item.subCriteria)){
            lastAutoSuggestionRequestTimestamp = new Date().getTime();
            $log.debug("Get suggestions for:" +value);
            $log.debug(item);
            //Add the subcritera as search value and append a * at the end
            autoSuggestionGetListRequest.resetCriterias();
            autoSuggestionGetListRequest.addSearchCriteria(item.subCriteria, value +"*");

            var searchFunc;
            $log.debug("Current criteria:" +item.criteria);
            switch(item.criteria){
                case 'VESSEL':
                    searchFunc = getVessels;
                    break;
                case 'MOBILE_TERMINAL':
                    searchFunc = getMobileTerminals;
                    break;
                default:
                    break;
            }

            if(angular.isDefined(searchFunc)){
                return searchFunc(item.criteria, item.subCriteria);
            }

            //No Search func
            $log.debug("No search func defined. Return []");
        }
        return [];
    };

    //On select item in value auto suggestion input field
    $scope.onValueSuggestionSelect = function(selectedItem, selectedLabel, item){
        //Update value based on selection
        item.value = selectedLabel;
    };

    //Clear the form
    $scope.clearForm = function(){
        $log.debug("Clear form!");
        $scope.currentRule = new Rule();
        $scope.initForm();
    };


});