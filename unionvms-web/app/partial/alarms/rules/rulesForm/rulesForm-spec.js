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
describe('RulesformCtrl', function() {

    var scope, createController, createRuleWithData;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $httpBackend, $controller, configurationService, Rule, RuleAction, RuleDefinition, ruleRestService, $q) {
        scope = $rootScope.$new();

        scope.allowedToManageGlobalRules = function(){
            return true;
        }

        spyOn(configurationService, "getValue").andReturn([]);
        spyOn(configurationService, "getConfig").andReturn([]);
        spyOn(ruleRestService, "getAreaTypes").andReturn($q.when([]));
        createController = function(){
            return $controller('RulesformCtrl', {$scope: scope});
        };

        createRuleWithData = function(){
            var rule = new Rule();
            var ruleDef1 = new RuleDefinition();
            ruleDef1.criteria = 'ASSET';
            ruleDef1.subCriteria = 'VESSEL_CFR';
            ruleDef1.value = 'CFR_TEST';
            rule.addDefinition(ruleDef1);
            var ruleDef2 = new RuleDefinition();
            ruleDef2.criteria = 'MOVEMENT';
            ruleDef2.subCriteria = 'SPEED';
            ruleDef2.value = '3';
            rule.addDefinition(ruleDef2);

            var ruleAction = new RuleAction();
            ruleAction.action = "SEND_TO_EMAIL";
            ruleAction.value = "test@test.com";
            rule.addAction(ruleAction);

            return rule;
        }

    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));


    it('should call init when controller loads and set DROPDOWNS variable on the scope', inject(function($rootScope, rulesOptionsService) {
        var dropdownsValue = 'TEST';
        var setDropdownsSpy = spyOn(rulesOptionsService, "getDropdownValues").andReturn(dropdownsValue);
        var controller = createController();
        expect(setDropdownsSpy).toHaveBeenCalled();
        expect(scope.DROPDOWNS).toEqual(dropdownsValue);
    }));

    it('should watch when getCurrentRule() changes and update currentRule and form when it does', inject(function($rootScope, Rule) {
        var controller = createController();
        var rule1 = new Rule();
        var rule1Name = 'First rule';
        rule1.name = rule1Name;
        var rule2 = new Rule();
        var rule2Name = 'Second rule';
        rule2.name = rule2Name;
        var currentRule = rule1;

        scope.getCurrentRule = function(){
            return currentRule;
        }

        var updateFormSpy = spyOn(scope, "updateFormToMatchTheCurrentRule");

        //Change the rule
        currentRule = rule2;
        scope.$digest();

        //updateFormToMatchTheCurrentRule should have been called
        expect(updateFormSpy).toHaveBeenCalled();
        expect(updateFormSpy.callCount).toBe(1);
        expect(scope.currentRule.name).toEqual(rule2Name);

        //Change the rule
        currentRule = rule1;
        scope.$digest();

        //updateFormToMatchTheCurrentRule should have been called again
        expect(updateFormSpy.callCount).toBe(2);
        expect(scope.currentRule.name).toEqual(rule1Name);
    }));

    describe('updateFormToMatchTheCurrentRule()', function() {
        it('should add a new definition to new rules ', inject(function($rootScope, Rule) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            var addDefinitionRowSpy = spyOn(scope, "addDefinitionRow");;
            var addActionRowSpy = spyOn(scope, "addActionRow");;

            scope.currentRule = new Rule();
            scope.currentRule.availability = 'PUBLIC';
            scope.updateFormToMatchTheCurrentRule();

            expect(addDefinitionRowSpy).toHaveBeenCalled();
            expect(addDefinitionRowSpy.callCount).toBe(1);

            expect(addActionRowSpy).not.toHaveBeenCalled();
        }));

        it('should NOT add a new definition or action to existing Rules', inject(function($rootScope) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            var addDefinitionRowSpy = spyOn(scope, "addDefinitionRow");;
            var addActionRowSpy = spyOn(scope, "addActionRow");;

            scope.currentRule = createRuleWithData();
            scope.updateFormToMatchTheCurrentRule();

            expect(addDefinitionRowSpy).not.toHaveBeenCalled();
            expect(addActionRowSpy).not.toHaveBeenCalled();
        }));

        it('should update list of disabled action', inject(function($rootScope, Rule) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            var updateDisabledActionsSpy = spyOn(scope, "updateDisabledActions");;

            scope.currentRule = new Rule();
            scope.updateFormToMatchTheCurrentRule();

            expect(updateDisabledActionsSpy).toHaveBeenCalled();
        }));

        it('should enable or disable the dropdowns for availability and type', inject(function($rootScope, Rule) {
            var controller = createController();
            var updateAvailabilityDropdownSpy = spyOn(scope, "updateAvailabilityDropdown");;

            scope.currentRule = new Rule();
            scope.updateFormToMatchTheCurrentRule();

            expect(updateAvailabilityDropdownSpy).toHaveBeenCalled();
        }));

        it('should reset test message', inject(function($rootScope, Rule) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};

            scope.ruleTest.message = "SOMETHING";
            scope.ruleTest.outdated = true;
            scope.currentRule = new Rule();
            scope.updateFormToMatchTheCurrentRule();

            expect(scope.ruleTest.message).toEqual(undefined);
            expect(scope.ruleTest.outdated).toEqual(false);
        }));

        it('should reset form validation', inject(function($rootScope, Rule, $compile) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};

            //Create the form
            var element = angular.element('<form name="ruleForm"></form>');
            $compile(element)(scope);

            //Make form dirty and set submitAttempted to true
            scope.ruleForm.$setDirty();
            scope.submitAttempted = true;
            expect(scope.ruleForm.$pristine).toBeFalsy();

            scope.currentRule = new Rule();
            scope.updateFormToMatchTheCurrentRule();

            expect(scope.submitAttempted).toBeFalsy();
            expect(scope.ruleForm.$pristine).toBeTruthy();
        }));
    });

    //Should the form be disabled?
    describe('disableForm()', function() {
        it('should return true for creating new rules if user is missing the correct feature', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.isCreateNewMode = function(){return true;};
            scope.allowedToManageRules = function(){return false;};

            scope.currentRule = new Rule();
            expect(scope.disableForm()).toBeTruthy();
        }));

        it('should return false for creating new rules if user has the correct feature', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.isCreateNewMode = function(){return true;};
            scope.allowedToManageRules = function(){return true;};

            scope.currentRule = new Rule();
            expect(scope.disableForm()).toBeFalsy();
        }));

        it('should return true for updating existing rule if user NOT is allowed to update or delete the rule', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.isCreateNewMode = function(){return false;};
            scope.allowedToDeleteOrUpdateRule = function(){return false;};

            scope.currentRule = new Rule();
            expect(scope.disableForm()).toBeTruthy();
        }));

        it('should return false for updating existing rule if user is allowed to update or delete the rule', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.isCreateNewMode = function(){return false;};
            scope.allowedToDeleteOrUpdateRule = function(){return true;};

            scope.currentRule = new Rule();
            expect(scope.disableForm()).toBeFalsy();
        }));
    });

    describe('addDefinitionRow()', function() {
        it('should add new Rule Definition to the Rule', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.currentRule = new Rule();

            expect(scope.currentRule.definitions.length).toEqual(0);
            scope.addDefinitionRow();
            expect(scope.currentRule.definitions.length).toEqual(1);

            scope.addDefinitionRow();
            expect(scope.currentRule.definitions.length).toEqual(2);
        }));

        it('should set criteria and subcritera of the new RuleDefinition to first values in dropdowns', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.currentRule = new Rule();

            //MOCK VALUES
            scope.DROPDOWNS.CRITERIAS = [{code:'TEST'}];
            scope.DROPDOWNS.SUBCRITERIAS = {TEST: [{code:'MOCK'}]};

            scope.addDefinitionRow();
            expect(scope.currentRule.definitions.length).toEqual(1);
            expect(scope.currentRule.definitions[0].criteria).toEqual('TEST');
            expect(scope.currentRule.definitions[0].subCriteria).toEqual('MOCK');

        }));
    });

    it('removeRuleDefinition should remove the RuleDefinition from the Rule', inject(function($rootScope, Rule, RuleDefinition) {
        var controller = createController();

        scope.currentRule = new Rule();
        scope.addDefinitionRow();
        scope.addDefinitionRow();
        scope.currentRule.definitions[0].criteria = 'first';
        scope.currentRule.definitions[1].criteria = 'second';
        expect(scope.currentRule.definitions.length).toEqual(2);

        //Remove the first definition
        scope.removeRuleDefinition(scope.currentRule.definitions[0]);
        expect(scope.currentRule.definitions.length).toEqual(1);
        expect(scope.currentRule.definitions[0].criteria).toEqual('second');
    }));

    it('addTimeIntervalItem should add new RuleTimeInterval to the Rule', inject(function($rootScope, Rule) {
        var controller = createController();

        scope.currentRule = new Rule();

        expect(scope.currentRule.timeIntervals.length).toEqual(0);
        scope.addTimeIntervalItem();
        expect(scope.currentRule.timeIntervals.length).toEqual(1);

        scope.addTimeIntervalItem();
        expect(scope.currentRule.timeIntervals.length).toEqual(2);
    }));

    it('removeTimeIntervalItem should remove the ruleTimeInterval from the Rule', inject(function($rootScope, Rule) {
        var controller = createController();

        scope.currentRule = new Rule();
        scope.addTimeIntervalItem();
        scope.addTimeIntervalItem();
        scope.currentRule.timeIntervals[0].start = '2015-01-01 12:00';
        scope.currentRule.timeIntervals[1].start = '2050-01-01 12:00';
        expect(scope.currentRule.timeIntervals.length).toEqual(2);

        //Remove the first timeInterval
        scope.removeTimeIntervalItem(scope.currentRule.timeIntervals[0]);
        expect(scope.currentRule.timeIntervals.length).toEqual(1);
        expect(scope.currentRule.timeIntervals[0].start).toEqual('2050-01-01 12:00');
    }));

    describe('addActionRow()', function() {
        it('should add new RuleAction to the Rule', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.currentRule = new Rule();

            expect(scope.currentRule.actions.length).toEqual(0);
            scope.addActionRow();
            expect(scope.currentRule.actions.length).toEqual(1);

            scope.addActionRow();
            expect(scope.currentRule.actions.length).toEqual(2);
        }));

        it('should add new RuleAction with action set to first enable action', inject(function($rootScope, Rule) {
            var controller = createController();

            scope.currentRule = new Rule();
            spyOn(scope, 'getFirstActionThatIsEnabled').andReturn('TEST');

            scope.addActionRow();
            expect(scope.currentRule.actions.length).toEqual(1);
            expect(scope.currentRule.actions[0].action).toEqual("TEST");
        }));
    });

    it('removeRuleAction should remove the RuleAction from the Rule', inject(function($rootScope, Rule) {
        var controller = createController();

        scope.currentRule = new Rule();
        scope.addActionRow();
        scope.addActionRow();
        scope.currentRule.actions[0].action = 'FRIST';
        scope.currentRule.actions[1].action = 'SECOND';
        expect(scope.currentRule.actions.length).toEqual(2);

        //Remove the first action
        scope.removeRuleAction(scope.currentRule.actions[0]);
        expect(scope.currentRule.actions.length).toEqual(1);
        expect(scope.currentRule.actions[0].action).toEqual('SECOND');
    }));


    describe('updateAvailabilityDropdown()', function() {

        it('should disable Global option when user dont have permission to manage global rules', inject(function($rootScope, Rule) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            scope.allowedToManageGlobalRules = function(){
                return false;
            }

            scope.currentRule = new Rule();
            scope.currentRule.availability = 'PUBLIC';

            scope.updateAvailabilityDropdown();
            expect(scope.disabledAvailabilityTypes[0]).toEqual('GLOBAL');
            expect(scope.disableAvailability).toBeFalsy();
        }));

        it('should enable Global option when user have permission to manage global rules', inject(function($rootScope, Rule) {
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            scope.allowedToManageGlobalRules = function(){
                return true;
            }

            scope.currentRule = new Rule();
            scope.currentRule.availability = 'PUBLIC';

            scope.updateAvailabilityDropdown();
            expect(scope.disabledAvailabilityTypes.length).toEqual(0); //No options should be disabled
            expect(scope.disableAvailability).toBeFalsy();
        }));

        it('should disable availabilityType when Ticket actions exists for other users', inject(function($rootScope, userService, Rule, RuleAction) {
            spyOn(userService, 'getUserName').andReturn('TEST_USER');
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};

            scope.currentRule = new Rule();
            scope.currentRule.availability = 'PUBLIC';
            var action = new RuleAction();
            action.action = 'TICKET';
            action.value = 'OTHER_USER';
            var action2 = new RuleAction();
            action2.action = 'TICKET';
            action2.value = 'TEST_USER';
            scope.currentRule.actions = [action, action2];

            scope.updateAvailabilityDropdown();
            expect(scope.currentRule.availability).toEqual('PUBLIC');
            expect(scope.disableAvailability).toBeTruthy();
        }));

        it('should enable availabilityType when Ticket actions only exists for the current users', inject(function($rootScope, userService, Rule, RuleAction) {
            spyOn(userService, 'getUserName').andReturn('TEST_USER');
            var controller = createController();
            scope.isCreateNewMode = function(){return true;};
            scope.currentRule = new Rule();
            scope.currentRule.availability = 'PUBLIC';
            var action = new RuleAction();
            action.action = 'TICKET';
            action.value = 'TEST_USER';
            scope.currentRule.actions = [action];

            scope.updateAvailabilityDropdown();
            expect(scope.currentRule.availability).toEqual('PUBLIC');
            expect(scope.disableAvailability).toBeFalsy();
        }));

    });

    it('onCriteriaSelection should set subCriteria value to the first value in the subcriterias dropdown and conditions dropdown and call setDefaultValueToDefinition', inject(function($rootScope, RuleDefinition) {
        var controller = createController();

        var setDefaultValueToDefinitionSpy = spyOn(scope, "setDefaultValueToDefinition");
        scope.DROPDOWNS.SUBCRITERIAS = {ASSET: [{code:'FIRST'}, {code:'SECOND'}]};
        scope.DROPDOWNS.CONDITIONS = {ASSET: {FIRST : [{code:'A'}, {code:'B'}] } };

        var ruleDef = new RuleDefinition();
        var selection = {code : 'ASSET', text:'Asset'};

        scope.onCriteriaSelection(selection, ruleDef);
        expect(ruleDef.criteria).toEqual('ASSET');
        expect(ruleDef.subCriteria).toEqual('FIRST');
        expect(ruleDef.condition).toEqual('A');
        expect(setDefaultValueToDefinitionSpy).toHaveBeenCalledWith(ruleDef);
    }));

    describe('setDefaultValueToDefinition()', function() {
        it('should set ruleDef value to undefined if valueType is other than DROPDOWN', inject(function($rootScope, RuleDefinition) {
            var controller = createController();

            spyOn(scope, "getRuleDefinitionValueInputType").andReturn("INPUT");

            var ruleDef = new RuleDefinition();
            ruleDef.value = 'Old value'

            scope.setDefaultValueToDefinition(ruleDef);
            expect(ruleDef.value).toEqual(undefined);
        }));

        it('should set ruleDef value to first value in dropdown if valueType is DROPDOWN', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            var controller = createController();

            spyOn(scope, "getRuleDefinitionValueInputType").andReturn("DROPDOWN");
            spyOn(rulesOptionsService, "isRuleActionValueAnEmail").andReturn(false);
            var valueDropdownOptions = [{code: 'A'}, {code:'B'}];
            spyOn(rulesOptionsService, "getDropdownValuesForRuleDefinition").andReturn(valueDropdownOptions);

            var ruleDef = new RuleDefinition();
            ruleDef.value = 'Old value'

            scope.setDefaultValueToDefinition(ruleDef);
            expect(ruleDef.value).toEqual('A');
        }));
    });

    it('getFirstActionThatIsEnabled should return first option from the action dropdown that isn\'t disables', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
        var controller = createController();

        scope.DROPDOWNS.ACTIONS = [{code:'FIRST'}, {code:'SECOND'}, {code: 'THIRD'}];

        expect(scope.getFirstActionThatIsEnabled()).toEqual('FIRST');
        scope.disabledActions.push('SECOND');
        expect(scope.getFirstActionThatIsEnabled()).toEqual('FIRST');
        scope.disabledActions.push('FIRST');
        expect(scope.getFirstActionThatIsEnabled()).toEqual('THIRD');
        scope.disabledActions.push('THIRD');
        expect(scope.getFirstActionThatIsEnabled()).toEqual(undefined);
    }));

    it('updateDisabledActions should update disabledActions with the actions that should be disabled in the dropdowns', inject(function($rootScope, Rule, RuleAction) {
        var controller = createController();

        spyOn(scope, "actionShouldHaveValue").andCallFake(function(action){
            if(action === 'VESSEL' || action === 'MOBILE_TERMINAL'){
                return true;
            }
            return false;

        });
        scope.currentRule = new Rule();
        scope.currentRule.availability = "PUBLIC";

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual([]);

        //Add an action
        var action2 = new RuleAction();
        action2.action = 'VESSEL';
        scope.currentRule.addAction(action2)

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual([]);

        //Add an action
        var action1 = new RuleAction();
        action1.action = 'TEST';
        scope.currentRule.addAction(action1)

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual(['TEST']);
    }));

    it('updateDisabledActions should include TICKET for all GLOBAL rules', inject(function($rootScope, Rule, RuleAction) {
        var controller = createController();

        spyOn(scope, "actionShouldHaveValue").andCallFake(function(action){
            if(action === 'VESSEL' || action === 'MOBILE_TERMINAL'){
                return true;
            }
            return false;

        });
        scope.currentRule = new Rule();
        scope.currentRule.availability = "GLOBAL";

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual(['TICKET']);

        //Add an action
        var action2 = new RuleAction();
        action2.action = 'VESSEL';
        scope.currentRule.addAction(action2)

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual(['TICKET']);

        //Add an action
        var action1 = new RuleAction();
        action1.action = 'TEST';
        scope.currentRule.addAction(action1)

        scope.updateDisabledActions();
        expect(scope.disabledActions).toEqual(['TEST', 'TICKET']);
    }));

    describe('createNewRule()', function() {
        it('should open confirm modal, and when confirmed send request to server and and handle success response', inject(function($rootScope, $compile, $q, Rule, confirmationModal, ruleRestService, alertService) {
            //Mock confirmation modal and click on confirm
            var confirmationSpy = spyOn(confirmationModal, "open").andCallFake(function(callback, options){
                callback();
            });

            //Mock ruleRestService.createNewRule and resolve with mock Alarm
            var createdRule = new Rule();
            createdRule.name = "Just created";
            var deferred = $q.defer();
            deferred.resolve(createdRule);
            var ruleRestServiceSpy = spyOn(ruleRestService, "createNewRule").andReturn(deferred.promise);

            var successAlertSpy = spyOn(alertService, "showSuccessMessageWithTimeout");

            var controller = createController();

            //These functions exists in the parent scope in rule.js
            scope.isCreateNewMode = function(){
                return scope.createNewMode;
            };
            scope.setCreateMode = function(bool){
                scope.createNewMode = bool;
            };
            scope.getCurrentRule = function(){
                return scope.currentRule;
            };
            scope.createdNewRuleCallback = function(){};
            scope.currentRule = new Rule();

            var createdNewRuleCallbackSpy = spyOn(scope, "createdNewRuleCallback");

            //Mock test rule
            spyOn(scope, "testRule").andReturn(true);
            spyOn(scope, "updateFormToMatchTheCurrentRule");

            //Create the form
            var element = angular.element('<form name="ruleForm"></form>');
            $compile(element)(scope);
            expect(scope.ruleForm.$valid).toBeTruthy("form should be valid");
            expect(scope.submitAttempted).toBeFalsy();

            //CREATE THE NEW RULE
            scope.setCreateMode(true);
            scope.createNewRule();
            scope.$digest();

            //submitAttempted should be true true
            expect(scope.submitAttempted).toBeTruthy();

            //Confirmation modal should have been opened
            expect(confirmationSpy).toHaveBeenCalled();

            //RuleRestService should have been called after confirm in modal
            expect(ruleRestServiceSpy).toHaveBeenCalled();

            //Alert.showSuccessMessageWithTimeout should have been called after confirm in modal
            expect(successAlertSpy).toHaveBeenCalled();

            //Create success callback (createdNewRuleCallback) should have been called
            expect(createdNewRuleCallbackSpy).toHaveBeenCalled();

            //CreateMode should be false
            expect(scope.isCreateNewMode()).toBeFalsy();

            //scope.currentRule should have been updated to the Rule returned from the restService
            expect(scope.currentRule).toEqual(createdRule, "scope.currentRule should have been updated");
        }));

    });

    it('testRule() should test the validity of the rule and update the view with the results', inject(function($rootScope, Rule, ruleService, locale) {
        spyOn(ruleService, "areRuleDefinitionsAndActionsValid").andReturn({success: true, problems : "test"});
        spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");

        var controller = createController();
        scope.currentRule = new Rule();

        expect(scope.testRule()).toBeTruthy();
        expect(scope.ruleTest.success).toBeTruthy();
        expect(scope.ruleTest.problems).toEqual("test");
        expect(scope.ruleTest.message).toEqual("TRANSLATED_TEXT");

    }));

    describe('getRuleDefinitionValueInputType()', function() {
        it('should return TEXT by default', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForRuleDefinition").andReturn();

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('TEXT');
        }));

        it('should return DROPDOWN if option has dropdown', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForRuleDefinition").andReturn(["first", "second", "third"]);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('DROPDOWN');
        }));

        it('should return DROPDOWN_EMPTY if option should have dropdown but there are no options', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForRuleDefinition").andReturn([]);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('DROPDOWN_EMPTY');
        }));

        it('should return SPEED if isRuleDefinitionValueASpeed return true', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "isRuleDefinitionValueASpeed").andReturn(true);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('SPEED');
        }));

        it('should return COURSE if isRuleDefinitionValueACourse return true', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "isRuleDefinitionValueACourse").andReturn(true);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('COURSE');
        }));

        it('should return LONGITUDE if isRuleDefinitionValueLongitudeCoordinate return true', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "isRuleDefinitionValueLongitudeCoordinate").andReturn(true);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('LONGITUDE');
        }));

        it('should return LATITUDE if isRuleDefinitionValueLatitudeCoordinate return true', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "isRuleDefinitionValueLatitudeCoordinate").andReturn(true);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('LATITUDE');
        }));

        it('should return DATETIME if isRuleDefinitionValueADateTime return true', inject(function($rootScope, RuleDefinition, rulesOptionsService) {
            spyOn(rulesOptionsService, "isRuleDefinitionValueADateTime").andReturn(true);

            var controller = createController();
            var ruleDef = new RuleDefinition();

            expect(scope.getRuleDefinitionValueInputType(ruleDef)).toEqual('DATETIME');
        }));
    });

    describe('getActionValueInputType()', function() {
        it('should return TEXT by default', inject(function($rootScope, RuleAction, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForAction").andReturn();

            var controller = createController();
            var ruleAction = new RuleAction();

            expect(scope.getActionValueInputType(ruleAction)).toEqual('TEXT');
        }));

        it('should return DROPDOWN if option has dropdown', inject(function($rootScope, RuleAction, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForAction").andReturn(["first", "second", "third"]);

            var controller = createController();
            var ruleAction = new RuleAction();

            expect(scope.getActionValueInputType(ruleAction)).toEqual('DROPDOWN');
        }));

        it('should return DROPDOWN_EMPTY if option should have dropdown but there are no options', inject(function($rootScope, RuleAction, rulesOptionsService) {
            spyOn(rulesOptionsService, "getDropdownValuesForAction").andReturn([]);

            var controller = createController();
            var ruleAction = new RuleAction();

            expect(scope.getActionValueInputType(ruleAction)).toEqual('DROPDOWN_EMPTY');
        }));
    });
});