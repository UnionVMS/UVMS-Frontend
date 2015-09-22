describe('ruleService', function() {
  
    beforeEach(module('unionvmsWeb'));


    beforeEach(inject(function(locale) {
        var mockLocale = 
        spyOn(locale, "getString").andCallFake(function(key){
            if(key === 'alarms.rules_definition_if'){
                return 'IF';
            }else if(key === 'alarms.rules_definition_then'){
                return 'THEN';            
            }else if(key === 'alarms.rules_definition_and'){
                return 'AND';
            }else{
                return '[TRANSLATED_TEXT]';
            }
        });
        
    }));

    var ruleDTO = {
        "id": "ABC123456789",
        "name": "My new rule1",
        "description": "Rule to test the frontend.",
        "type": "GLOBAL",
        "availability": "PUBLIC",
        "active": false,
        "lastTriggered": "2015-08-01 12:43:02",
        "createdBy": "Test user",
        "dateCreated": "2015-06-01 12:44:00",
        "availableNotifications": [
            "EMAIL", 
            "OPEN_TICKET"
        ],
        "definitions": [
            {
              "startOperator": "(",
              "criteria": "VESSEL",
              "subCriteria": "CFR",
              "condition": "EQ",
              "value": "SWE111222",
              "endOperator": "",
              "logicBoolOperator": "OR",
              "order": 0
            },
            {
              "startOperator": "",
              "criteria": "VESSEL",
              "subCriteria": "CFR",
              "condition": "EQ",
              "value": "SWE111333",
              "endOperator": ")",
              "logicBoolOperator": "AND",
              "order": 1
            },
            {
              "startOperator": "",
              "criteria": "MOBILE_TERMINAL",
              "subCriteria": "MEMBER_NUMBER",
              "condition": "NEQ",
              "value": "ABC99",
              "endOperator": "",
              "logicBoolOperator": "NONE",
              "order": 2
            }
        ],
        "actions" : [
            {
                "action": "SEND_TO_ENDPOINT",
                "value": "ABC123",
                "order": 0
            },
            {
                "action": "HOLDING_TABLE",
                "value": undefined,
                "order": 1
            }
        ],
        "timeIntervals": [
        {
          "start": "2015-06-09",
          "end": "2015-08-09"
        },
        {
          "start": "2015-09-09",
          "end": "2015-12-31"
        },
      ]
    };

    it("getRuleAsText should return correct text for complete rule", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        var expectedText = 'IF (VESSEL.CFR EQ SWE111222 OR VESSEL.CFR EQ SWE111333) AND MOBILE_TERMINAL.MEMBER_NUMBER NEQ ABC99 THEN [TRANSLATED_TEXT] ABC123 AND [TRANSLATED_TEXT]';
        expect(ruleService.getRuleAsText(rule)).toEqual(expectedText);       
    }));   

    it("getRuleDefAsText should return correct text for complete ruleDefinition", inject(function(ruleService, RuleDefinition) {
        var ruleDefinition = RuleDefinition.fromDTO(ruleDTO.definitions[0]);
        var expectedText = '(VESSEL.CFR EQ SWE111222 OR';

        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);       
    }));    

    it("getRuleDefAsText should return correct text for empty ruleDefinition", inject(function(ruleService, RuleDefinition) {
        var ruleDefinition = new RuleDefinition();
        var expectedText = 'AAAA.BB EQ ???';
        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);

        ruleDefinition.criteria = 'VESSEL';
        expectedText = 'VESSEL.BB EQ ???';
        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);        

        ruleDefinition.subCriteria = 'IRCS';
        expectedText = 'VESSEL.IRCS EQ ???';
        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);                

        ruleDefinition.value = 'TEST';
        expectedText = 'VESSEL.IRCS EQ TEST';
        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);          
    }));   

    it("getRuleDefAsText should return correct text for condition part", inject(function(ruleService, RuleDefinition) {
        var ruleDefinition = new RuleDefinition();
        ruleDefinition.condition = "NEQ";
        var expectedText = 'AAAA.BB NEQ ???';
        expect(ruleService.getRuleDefAsText(ruleDefinition)).toEqual(expectedText);
    }));  

    it("getRuleActionAsText should return correct text", inject(function(ruleService, RuleAction) {
        var ruleAction = new RuleAction();
        ruleAction.action = "SEND_TO_ENDPOINT";
        ruleAction.value = "ABC123";
        var expectedText = '[TRANSLATED_TEXT] ABC123';
        expect(ruleService.getRuleActionAsText(ruleAction)).toEqual(expectedText);

        ruleAction.value = undefined;
        expectedText = '[TRANSLATED_TEXT] ???';
        expect(ruleService.getRuleActionAsText(ruleAction)).toEqual(expectedText);        

        ruleAction.value = '';
        expectedText = '[TRANSLATED_TEXT] ???';
        expect(ruleService.getRuleActionAsText(ruleAction)).toEqual(expectedText);                
    }));  

    it("areRuleDefinitionsAndActionsValid should return true for a valid rule", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeTruthy();
        expect(testResult.problems).toEqual([]);
    }));

    it("areRuleDefinitionsAndActionsValid should return false when no definitions exists", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        rule.definitions = [];
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('NO_DEFINITIONS') >= 0).toBeTruthy("NO_DEFINITIONS should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when no actions exists", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        rule.actions = [];
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('NO_ACTIONS') >= 0).toBeTruthy("NO_ACTIONS should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when logicBoolOperator is NONE for non last definition", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        rule.definitions[1].logicBoolOperator = 'NONE';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_BOOL') >= 0).toBeTruthy("INVALID_DEF_BOOL should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when logicBoolOperator is AND for last definition", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        rule.definitions[2].logicBoolOperator = 'AND';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_BOOL') >= 0).toBeTruthy("INVALID_DEF_BOOL should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when parentheses don't match", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[1].endOperator = '))';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('PARANTHESES_DONT_MATCH') >= 0).toBeTruthy("PARANTHESES_DONT_MATCH should be in problems");

        rule = Rule.fromDTO(ruleDTO);
        rule.definitions[1].startOperator = ')';
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('PARANTHESES_DONT_MATCH') >= 0).toBeTruthy("PARANTHESES_DONT_MATCH should be in problems");
        
        rule.definitions[0].startOperator = '(';
        rule.definitions[0].endOperator = '';
        rule.definitions[1].startOperator = '';
        rule.definitions[1].endOperator = '))';
        rule.definitions[2].startOperator = '(';
        rule.definitions[2].endOperator = '';            
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy('Paranteheses must be in the right order');        
        expect(testResult.problems.indexOf('PARANTHESES_DONT_MATCH') >= 0).toBeTruthy("PARANTHESES_DONT_MATCH should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when a criteria is undefined or empty", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[1].criteria = ' ';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_CRITERIA') >= 0).toBeTruthy("INVALID_DEF_CRITERIA should be in problems");

        rule.definitions[1].criteria = undefined;
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_CRITERIA') >= 0).toBeTruthy("INVALID_DEF_CRITERIA should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when a subCriteria is undefined or empty", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[1].subCriteria = ' ';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_SUBCRITERIA') >= 0).toBeTruthy("INVALID_DEF_SUBCRITERIA should be in problems");

        rule.definitions[1].subCriteria = undefined;
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_SUBCRITERIA') >= 0).toBeTruthy("INVALID_DEF_SUBCRITERIA should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when a value is undefined or empty", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[1].value = ' ';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_VALUE') >= 0).toBeTruthy("INVALID_DEF_VALUE should be in problems");

        rule.definitions[1].value = undefined;
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_VALUE') >= 0).toBeTruthy("INVALID_DEF_VALUE should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return false when a condition is undefined or empty", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[1].condition = ' ';        
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_CONDITION') >= 0).toBeTruthy("INVALID_DEF_CONDITION should be in problems");

        rule.definitions[1].condition = undefined;
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_DEF_CONDITION') >= 0).toBeTruthy("INVALID_DEF_CONDITION should be in problems");
    }));


    it("areRuleDefinitionsAndActionsValid should return false when a value is undefined or empty for an action of the type SEND_TO_ENDPOINT", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.actions[0].action = 'SEND_TO_ENDPOINT';
        rule.actions[0].value = ' ';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_ACTION_VALUE') >= 0).toBeTruthy("INVALID_ACTION_VALUE should be in problems");

        rule.actions[0].value = undefined;;
        testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.indexOf('INVALID_ACTION_VALUE') >= 0).toBeTruthy("INVALID_ACTION_VALUE should be in problems");
    }));

    it("areRuleDefinitionsAndActionsValid should return list of problems", inject(function(ruleService, Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        rule.definitions[0].value = ' ';
        rule.definitions[0].criteria = ' ';
        rule.definitions[0].subCriteria = ' ';
        rule.definitions[0].startOperator = '(';
        var testResult = ruleService.areRuleDefinitionsAndActionsValid(rule);
        expect(testResult.success).toBeFalsy();
        expect(testResult.problems.length > 1).toBeTruthy("Should be more than 1 problem");
    }));    

});