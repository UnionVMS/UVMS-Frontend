describe('Rule', function() {

  beforeEach(module('unionvmsWeb'));


    beforeEach(inject(function($httpBackend) {
        //Mock translation files
        $httpBackend.whenGET(/usm/).respond({});
        $httpBackend.whenGET(/i18n/).respond({});
    }));

    var ruleDTO = {
        "guid": "dummyGuid1",
        "name": "My new rule1",
        "description": "Rule to test the frontend.",
        "type": "GLOBAL",
        "availability": "PUBLIC",
        "active": false,
        "lastTriggered": "2015-08-01 12:43:02",
        "updatedBy": "Test user",
        "updated": "2015-06-01 12:44:00",
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
          "start": "2015-11-18 13:49:00 +01:00",
          "end": "2016-02-03 13:49:00 +01:00"
        },
        {
          "start": "2017-11-18 13:49:00 +01:00",
          "end": "2018-02-03 13:49:00 +01:00"
        },
      ]
    };


    it('create new should set correct values', inject(function(Rule) {
        var rule = new Rule();

        expect(rule.guid).toBeUndefined();
        expect(rule.name).toBeUndefined();
        expect(rule.description).toBeUndefined();
        expect(rule.active).toEqual(true);
        expect(rule.type).toEqual("GLOBAL");
        expect(rule.availability).toEqual("PUBLIC");

        expect(rule.lastTriggered).toEqual("2015-02-05 08:00");
        expect(rule.updatedBy).toEqual("antkar");
        expect(rule.dateUpdated).toEqual("2015-08-31 09:00");

        expect(rule.notifyByEMail).toBeUndefined();
        expect(rule.subscription).toBeUndefined();

        expect(rule.timeIntervals.length).toEqual(0);
        expect(rule.definitions.length).toEqual(0);
    }));


    it("should parse DTO correctly", inject(function(Rule) {
        var rule = Rule.fromDTO(ruleDTO);

        expect(rule.guid).toEqual(ruleDTO.guid);
        expect(rule.name).toEqual(ruleDTO.name);
        expect(rule.type).toEqual(ruleDTO.type);
        expect(rule.availability).toEqual(ruleDTO.availability);
        expect(rule.active).toEqual(ruleDTO.active);

        expect(rule.recipient).toEqual(ruleDTO.recipient);
        expect(rule.lastTriggered).toEqual(ruleDTO.lastTriggered);
        expect(rule.updatedBy).toEqual(ruleDTO.updatedBy);
        expect(rule.dateUpdated).toEqual(ruleDTO.updated);

        expect(rule.definitions.length).toEqual(ruleDTO.definitions.length);
        expect(rule.timeIntervals.length).toEqual(ruleDTO.timeIntervals.length);

        expect(rule.notifyByEMail).toBeUndefined();
        expect(rule.subscription).toBeUndefined();

    }));


    it("DTO() should create correct object", inject(function(Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        var dto = rule.DTO();

        expect(angular.equals(dto, ruleDTO));
    }));


    it("copy should copy object correctly", inject(function(Rule) {
        var rule = Rule.fromDTO(ruleDTO);
        var copy = rule.copy();

        expect(copy.guid).toEqual(rule.guid);
        expect(copy.name).toEqual(rule.name);
        expect(copy.type).toEqual(rule.type);
        expect(copy.availability).toEqual(rule.availability);
        expect(copy.active).toEqual(rule.active);

        expect(copy.recipient).toEqual(rule.recipient);
        expect(copy.lastTriggered).toEqual(rule.lastTriggered);
        expect(copy.updatedBy).toEqual(rule.updatedBy);
        expect(copy.dateUpdated).toEqual(rule.dateUpdated);

        expect(copy.definitions.length).toEqual(rule.definitions.length);
        expect(copy.timeIntervals.length).toEqual(rule.timeIntervals.length);

        expect(copy.notifyByEMail).toBeUndefined();
        expect(copy.subscription).toBeUndefined();
    }));


    it("addDefinition should add definition to the end of the list", inject(function(Rule, RuleDefinition) {
        var rule = Rule.fromDTO(ruleDTO);

        var numberOfDefinitionsBefore = rule.getNumberOfDefinitions();
        var def = new RuleDefinition();
        rule.addDefinition(def);
        var numberOfDefinitionsAfter = rule.getNumberOfDefinitions();
        expect(numberOfDefinitionsAfter).toEqual(numberOfDefinitionsBefore+1);
        expect(rule.definitions[numberOfDefinitionsBefore]).toEqual(def);
    }));

    it("addAction should add action to the end of the list", inject(function(Rule, RuleAction) {
        var rule = Rule.fromDTO(ruleDTO);

        var numActionsBefore = rule.getNumberOfActions();
        var action = new RuleAction();
        rule.addAction(action);
        var numActionsAfter = rule.getNumberOfActions();
        expect(numActionsAfter).toEqual(numActionsBefore+1);
        expect(rule.actions[numActionsBefore]).toEqual(action);
    }));


    it("addTimeInterval should add action to the end of the list", inject(function(Rule, RuleTimeInterval) {
        var rule = Rule.fromDTO(ruleDTO);

        var numIntervalsBefore = rule.getNumberOfTimeIntervals();
        var inteval = new RuleTimeInterval();
        rule.addTimeInterval(inteval);
        var numIntervalsAfter = rule.getNumberOfTimeIntervals();
        expect(numIntervalsAfter).toEqual(numIntervalsBefore+1);
        expect(rule.timeIntervals[numIntervalsBefore]).toEqual(inteval);
    }));
});



describe('RuleDefinition', function() {

  beforeEach(module('unionvmsWeb'));

    var ruleDefinitionDTO = {
        "startOperator": "(",
        "criteria": "VESSEL",
        "subCriteria": "CFR",
        "condition": "EQ",
        "value": "SWE111222",
        "endOperator": "",
        "logicBoolOperator": "OR",
        "order": "0"
    };

    it('create new should set correct values', inject(function(RuleDefinition) {
        var ruleDefinition = new RuleDefinition();
        expect(ruleDefinition.startOperator).toEqual('');
        expect(ruleDefinition.criteria).toBeUndefined();
        expect(ruleDefinition.subCriteria).toBeUndefined();
        expect(ruleDefinition.condition).toEqual('EQ');
        expect(ruleDefinition.value).toEqual('');
        expect(ruleDefinition.endOperator).toEqual('');
        expect(ruleDefinition.logicBoolOperator).toEqual('NONE');
        expect(ruleDefinition.order).toBeUndefined();
    }));


    it("should parse DTO correctly", inject(function(RuleDefinition) {
        var ruleDefinition = RuleDefinition.fromDTO(ruleDefinitionDTO);

        expect(ruleDefinition.startOperator).toEqual(ruleDefinitionDTO.startOperator);
        expect(ruleDefinition.criteria).toEqual(ruleDefinitionDTO.criteria);
        expect(ruleDefinition.subCriteria).toEqual(ruleDefinitionDTO.subCriteria);
        expect(ruleDefinition.condition).toEqual(ruleDefinitionDTO.condition);
        expect(ruleDefinition.value).toEqual(ruleDefinitionDTO.value);
        expect(ruleDefinition.endOperator).toEqual(ruleDefinitionDTO.endOperator);
        expect(ruleDefinition.logicBoolOperator).toEqual(ruleDefinitionDTO.logicBoolOperator);
        expect(ruleDefinition.order).toEqual(ruleDefinitionDTO.order);
    }));

    it("DTO() should create correct object", inject(function(RuleDefinition) {
        var ruleDefinition = RuleDefinition.fromDTO(ruleDefinitionDTO);
        var dto = ruleDefinition.DTO();
        expect(dto).toEqual(ruleDefinitionDTO);

        //If subcritera is set to 'NONE', then it should be sent as undefined
        ruleDefinition = RuleDefinition.fromDTO(ruleDefinitionDTO);
        ruleDefinition.subCriteria = 'NONE';
        dto = ruleDefinition.DTO();
        expect(dto.subCriteria).toBeUndefined();
    }));

    it("copy should copy object correctly", inject(function(RuleDefinition) {
        var ruleDefinition = RuleDefinition.fromDTO(ruleDefinitionDTO);
        var copy = ruleDefinition.copy();

        expect(copy.startOperator).toEqual(ruleDefinition.startOperator);
        expect(copy.criteria).toEqual(ruleDefinition.criteria);
        expect(copy.subCriteria).toEqual(ruleDefinition.subCriteria);
        expect(copy.condition).toEqual(ruleDefinition.condition);
        expect(copy.value).toEqual(ruleDefinition.value);
        expect(copy.endOperator).toEqual(ruleDefinition.endOperator);
        expect(copy.logicBoolOperator).toEqual(ruleDefinition.logicBoolOperator);
        expect(copy.order).toEqual(ruleDefinition.order);
    }));

    it("copy should not reference original object", inject(function(RuleDefinition) {
        var ruleDefinition = RuleDefinition.fromDTO(ruleDefinitionDTO);
        var copy = ruleDefinition.copy();
        copy.startOperator = "(((";

        expect(copy.startOperator).toEqual("(((");
        expect(ruleDefinition.startOperator).toEqual(ruleDefinitionDTO.startOperator);
    }));

});



describe('RuleAction', function() {

  beforeEach(module('unionvmsWeb'));

    var ruleActionDTO = {
        "action": "SEND_TO_ENDPOINT",
        "value": "ABC123",
        "order": "0"
    };

    it('create new should set correct values', inject(function(RuleAction) {
        var ruleAction = new RuleAction();
        expect(ruleAction.action).toBeUndefined();
        expect(ruleAction.value).toBeUndefined();
        expect(ruleAction.order).toBeUndefined();
    }));


    it("should parse DTO correctly", inject(function(RuleAction) {
        var ruleAction = RuleAction.fromDTO(ruleActionDTO);

        expect(ruleAction.action).toEqual(ruleActionDTO.action);
        expect(ruleAction.value).toEqual(ruleActionDTO.value);
        expect(ruleAction.order).toEqual(ruleActionDTO.order);
    }));

    it("DTO() should create correct object", inject(function(RuleAction) {
        var ruleAction = RuleAction.fromDTO(ruleActionDTO);
        var dto = ruleAction.DTO();

        expect(dto).toEqual(ruleActionDTO);
    }));

    it("copy should copy object correctly", inject(function(RuleAction) {
        var ruleAction = RuleAction.fromDTO(ruleActionDTO);
        var copy = ruleAction.copy();

        expect(copy.criteria).toEqual(ruleAction.criteria);
        expect(copy.value).toEqual(ruleAction.value);
        expect(copy.order).toEqual(ruleAction.order);
    }));

    it("copy should not reference original object", inject(function(RuleAction) {
        var ruleAction = RuleAction.fromDTO(ruleActionDTO);
        var copy = ruleAction.copy();
        copy.value = "UPDATED";

        expect(copy.value).toEqual("UPDATED");
        expect(ruleAction.value).toEqual(ruleActionDTO.value);
    }));

});


describe('RuleTimeInterval', function() {

  beforeEach(module('unionvmsWeb'));

    var ruleTimeIntervalDTO = {
        "start": "2015-11-18 13:49:00 +01:00",
        "end": "2016-02-03 13:49:00 +01:00"
    };

    it('create new should set correct values', inject(function(RuleTimeInterval) {
        var ruleTimeInterval = new RuleTimeInterval();
        expect(ruleTimeInterval.start).toBeUndefined();
        expect(ruleTimeInterval.end).toBeUndefined();
    }));


    it("should parse DTO correctly", inject(function(RuleTimeInterval) {
        var ruleTimeInterval = RuleTimeInterval.fromDTO(ruleTimeIntervalDTO);

        expect(ruleTimeInterval.start).toEqual(ruleTimeIntervalDTO.start);
        expect(ruleTimeInterval.end).toEqual(ruleTimeIntervalDTO.end);
    }));

    it("DTO() should create correct object", inject(function(RuleTimeInterval) {
        var ruleTimeInterval = RuleTimeInterval.fromDTO(ruleTimeIntervalDTO);
        var dto = ruleTimeInterval.DTO();

        expect(dto).toEqual(ruleTimeIntervalDTO);
    }));

    it("copy should copy object correctly", inject(function(RuleTimeInterval) {
        var ruleTimeInterval = RuleTimeInterval.fromDTO(ruleTimeIntervalDTO);
        var copy = ruleTimeInterval.copy();

        expect(copy.start).toEqual(ruleTimeInterval.start);
        expect(copy.end).toEqual(ruleTimeInterval.end);
    }));

    it("copy should not reference original object ", inject(function(RuleTimeInterval) {
        var ruleTimeInterval = RuleTimeInterval.fromDTO(ruleTimeIntervalDTO);
        var copy = ruleTimeInterval.copy();
        copy.start = "2016-01-02";

        expect(copy.start).toEqual("2016-01-02");
        expect(ruleTimeInterval.start).toEqual(ruleTimeIntervalDTO.start);
    }));

});
