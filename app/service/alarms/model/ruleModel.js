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
angular.module('unionvmsWeb').factory('Rule', function(RuleDefinition, RuleTimeInterval, RuleAction, RuleSubscription) {

    function Rule(){
        this.guid = undefined;
        this.name = undefined;
        this.description = undefined;
        this.availability = "PUBLIC";
        this.active = true;
        this.archived = false;
        this.definitions = [];
        this.actions = [];
        this.timeIntervals = [];
        this.lastTriggered = undefined;
        this.updatedBy = undefined;
        this.dateUpdated = undefined;
        this.notifyByEMail = undefined;
        this.subscriptions = [];
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
        return typeof this.availability === 'string' && this.availability.toUpperCase() === 'GLOBAL';
    };


    Rule.prototype.isPrivate = function(){
        return typeof this.availability === 'string' &&  this.availability.toUpperCase() === 'PRIVATE';
    };

    Rule.prototype.setUpdatedBy = function(updatedBy){
        return this.updatedBy = updatedBy;
    };


    Rule.fromDTO = function(dto){
        var rule = new Rule();

        rule.guid = dto.guid;
        rule.name = dto.name;
        rule.availability = dto.availability;
        rule.active = dto.active;
        rule.archived = dto.archived;
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
        //Sort them
        rule.definitions = _.sortBy(rule.definitions, function(aDef){return aDef.order;});

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
        //Sort them by order
        rule.actions = _.sortBy(rule.actions, function(aDef){return aDef.order;});

        if(angular.isArray(dto.subscriptions)){
            $.each(dto.subscriptions, function(index, subscription){
                rule.subscriptions.push(RuleSubscription.fromDTO(subscription));
            });
        }

        return rule;
    };

    Rule.prototype.DTO = function(){
        var aDTO, i = 0, j = 0;
        return {
            guid : this.guid,
            name : this.name,
            availability : this.availability,
            active : this.active,
            archived : this.archived,
            description : this.description,
            updatedBy : this.updatedBy,
            timeIntervals : this.timeIntervals.reduce(function(intervals, timeInterval){
                intervals.push(timeInterval.DTO());
                return intervals;
            },[]),
            definitions : this.definitions.reduce(function(defs, def){
                aDTO = def.DTO();
                aDTO.order = i++; //Update order starting from 0
                defs.push(aDTO);
                return defs;
            },[]),
            actions : this.actions.reduce(function(acts, action){
                aDTO = action.DTO();
                aDTO.order = j++; //Update order starting from 0
                acts.push(aDTO);
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
        this.condition = undefined;
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
        //Parse to number if possible
        if(!isNaN(ruleDefinition.value)){
            ruleDefinition.value = parseFloat(ruleDefinition.value);
        }
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


angular.module('unionvmsWeb').factory('RuleSubscription', function() {


    function RuleSubscription(){
        this.type = undefined;
        this.owner = undefined;
    }

    RuleSubscription.fromDTO = function(dto){
        var ruleSubscription = new RuleSubscription();
        ruleSubscription.type = dto.type;
        ruleSubscription.owner = dto.owner;

        return ruleSubscription;
    };

    RuleSubscription.prototype.copy = function() {
        return RuleSubscription.fromDTO(this.DTO());
    };

    return RuleSubscription;
});