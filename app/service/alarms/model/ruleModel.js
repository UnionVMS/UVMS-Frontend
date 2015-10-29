angular.module('unionvmsWeb').factory('Rule', function(RuleDefinition, RuleTimeInterval, RuleAction) {

        function Rule(){
            this.guid = undefined;
            this.name = undefined;
            this.description = undefined;
            this.type = "GLOBAL";
            this.availability = "PUBLIC";
            this.active = true;
            this.definitions = [];
            this.actions = [];
            this.timeIntervals = [];
            this.lastTriggered = "2015-02-05 08:00";
            this.updatedBy = "antkar";
            this.dateUpdated = "2015-08-31 09:00";


            this.notifyByEMail = undefined;
            this.subscription = undefined;
        }

        Rule.prototype.addDefinition = function(def){
            this.definitions.push(def);
        };

        Rule.prototype.addAction = function(action){
            this.actions.push(action);
        };

        Rule.prototype.addTimeInterval = function(inter){
            this.timeIntervals.push(inter);
        };

        Rule.prototype.getNumberOfDefinitions = function(){
            return this.definitions.length;
        };

        Rule.prototype.getNumberOfActions = function(){
            return this.actions.length;
        };

        Rule.prototype.getNumberOfTimeIntervals = function(){
            return this.timeIntervals.length;
        };

        Rule.prototype.isGlobal = function(){
            return this.type === 'GLOBAL';
        };

        Rule.prototype.setUpdatedBy = function(updatedBy){
            return this.updatedBy = updatedBy;
        };


        Rule.fromDTO = function(dto){
            var rule = new Rule();

            rule.guid = dto.guid;
            rule.name = dto.name;
            rule.type = dto.type;
            rule.availability = dto.availability;
            rule.active = dto.active;
            rule.description = dto.description;
            rule.lastTriggered = dto.lastTriggered;
            rule.updatedBy = dto.updatedBy;
            rule.dateUpdated = dto.updated;

            rule.definitions = [];
            if(angular.isArray(dto.definitions)){
                $.each(dto.definitions, function(index, definition){
                    rule.definitions.push(RuleDefinition.fromDTO(definition));
                });
            }

            rule.timeIntervals = [];
            if(angular.isArray(dto.timeIntervals)){
                $.each(dto.timeIntervals, function(index, timeInterval){
                    rule.timeIntervals.push(RuleTimeInterval.fromDTO(timeInterval));
                });
            }

            rule.actions = [];
            if(angular.isArray(dto.actions)){
                $.each(dto.actions, function(index, action){
                    rule.actions.push(RuleAction.fromDTO(action));
                });
            }

            return rule;
        };

        Rule.prototype.DTO = function(){
            return {
                guid : this.guid,
                name : this.name,
                type : this.type,
                availability : this.availability,
                active : this.active,
                description : this.description,
                updatedBy : this.updatedBy,
                timeIntervals : this.timeIntervals.reduce(function(intervals, timeInterval){
                    intervals.push(timeInterval.DTO());
                    return intervals;
                },[]),
                definitions : this.definitions.reduce(function(defs, def){
                    defs.push(def.DTO());
                    return defs;
                },[]),
                actions : this.actions.reduce(function(acts, action){
                    acts.push(action.DTO());
                    return acts;
                },[]),
            };
        };

        Rule.prototype.copy = function() {
            var copy = Rule.fromDTO(this.DTO());
            copy.lastTriggered = this.lastTriggered;
            copy.updatedBy = this.updatedBy;
            copy.dateUpdated = this.dateUpdated;
            return  copy;
        };

        //Check if the Rule is equal another Rule
        //Equal means same guid
        Rule.prototype.equals = function(item) {
            return this.guid === item.guid;
        };

        return Rule;
    });



angular.module('unionvmsWeb').factory('RuleDefinition', function() {

        function RuleDefinition(){
            this.startOperator = '';
            this.criteria = undefined;
            this.subCriteria = undefined;
            this.condition = "EQ";
            this.value = '';
            this.endOperator = '';
            this.logicBoolOperator = 'NONE';
            this.order = undefined; //First one has order 0
        }

        RuleDefinition.prototype.copy = function() {
            return RuleDefinition.fromDTO(this.DTO());
        };

        RuleDefinition.prototype.DTO = function(){
            return {
                startOperator : this.startOperator,
                criteria : this.criteria,
                subCriteria : this.subCriteria !== 'NONE' ? this.subCriteria : undefined,
                condition : this.condition,
                value : this.value,
                endOperator : this.endOperator,
                logicBoolOperator : this.logicBoolOperator,
                order : this.order,
            };
        };

        RuleDefinition.fromDTO = function(dto){
            var ruleDefinition = new RuleDefinition();
            ruleDefinition.startOperator = dto.startOperator;
            ruleDefinition.criteria = dto.criteria;
            ruleDefinition.subCriteria = dto.subCriteria;
            ruleDefinition.condition = dto.condition;
            ruleDefinition.value = dto.value;
            ruleDefinition.endOperator = dto.endOperator;
            ruleDefinition.logicBoolOperator = dto.logicBoolOperator;
            ruleDefinition.order = dto.order;

            return ruleDefinition;
        };

        return RuleDefinition;
    });

angular.module('unionvmsWeb').factory('RuleAction', function() {

        function RuleAction(){
            this.action = undefined;
            this.value = undefined;
            this.order = undefined; //First one has order 0
        }

        RuleAction.prototype.copy = function() {
            return RuleAction.fromDTO(this.DTO());
        };

        RuleAction.prototype.DTO = function(){
            return {
                action : this.action,
                value : this.value,
                order : this.order,
            };
        };

        RuleAction.fromDTO = function(dto){
            var ruleAction = new RuleAction();
            ruleAction.action = dto.action;
            ruleAction.value = dto.value;
            ruleAction.order = dto.order;

            return ruleAction;
        };

        return RuleAction;
    });


angular.module('unionvmsWeb').factory('RuleTimeInterval', function() {


        function RuleTimeInterval(){
            this.start = undefined;
            this.end = undefined;
        }

        RuleTimeInterval.prototype.DTO = function(){
            return {
                start : this.start,
                end : this.end,
            };
        };

        RuleTimeInterval.fromDTO = function(dto){
            var ruleTimeInterval = new RuleTimeInterval();
            ruleTimeInterval.start = dto.start;
            ruleTimeInterval.end = dto.end;

            return ruleTimeInterval;
        };

        RuleTimeInterval.prototype.copy = function() {
            return RuleTimeInterval.fromDTO(this.DTO());
        };

        return RuleTimeInterval;
    });