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
        "id": "dummyGuid1",
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


});