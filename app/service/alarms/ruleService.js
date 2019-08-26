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
angular.module('unionvmsWeb').factory('ruleService',function(locale, $log, rulesOptionsService) {

	var ruleService = {
        getRuleAsText : function(rule){
            if(angular.isUndefined(rule)){
                return;
            }

            var text = '';
            text += locale.getString('alarms.rules_definition_if');
            $.each(rule.definitions, function(index, def){
                text += ' ' + ruleService.getRuleDefAsText(def);
            });

            text += ' ' +locale.getString('alarms.rules_definition_then');
            //Global rule? Add text "CREATE NOTIFICATION FOR ALL USERS AND"
            if(rule.isGlobal()){
                text += ' ' +locale.getString('alarms.rules_rule_as_text_action_TICKET_ALL_USERS');
            }else{
                text += ' ' +locale.getString('alarms.rules_rule_as_text_action_TICKET');
            }

            $.each(rule.actions, function(index, action){
                text += ' ' +locale.getString('alarms.rules_definition_and') +' ';
                text += ruleService.getRuleActionAsText(action);
            });
            return text;
        },
        getRuleDefAsText : function(def){
            var text = def.startOperator;

            //critera
            if(typeof def.criteria === 'string' && def.criteria.trim().length > 0){
                text += def.criteria;
            }else{
                text += 'AAAA';
            }

            //subcriteria
            text +='.';
            if(typeof def.subCriteria === 'string' && def.subCriteria.trim().length > 0){
                text += def.subCriteria;
            }else{
                text += 'BB';
            }

            //condition
            if(typeof def.condition === 'string' && def.condition.trim().length > 0){
                text +=' ' + def.condition + ' ' ;
            }else{
                text += ' UNKNOWN_COMPARE ';
            }

            //value
            if((typeof def.value === 'string' || typeof def.value === 'number') && String(def.value).trim().length > 0){
                text += String(def.value);
            }
            else{
                text += '???';
            }

            text += def.endOperator;

            if(def.logicBoolOperator !== 'NONE'){
                 text += ' ' + def.logicBoolOperator;
            }

            return text;
        },
        getRuleActionAsText : function(ruleAction){
            var actionText = locale.getString('alarms.rules_rule_as_text_action_' +ruleAction.action);
            var text = actionText;
            //Show value?
            if(rulesOptionsService.actionShouldHaveValue(ruleAction.action)){
                if (ruleAction.target) {
	                if(typeof ruleAction.target === 'string' && ruleAction.target.trim().length > 0){
	                    text += ' ' + ruleAction.target;
	                } else{
	                   text += ' ???';
	                }
	            }
                text += ' ';
                if(typeof ruleAction.value === 'string' && ruleAction.value.trim().length > 0){
                     text += ruleAction.value;
                } else{
                    text += '???';
                }
            }
            return text;
        },

        areRuleDefinitionsAndActionsValid : function(rule){
            var returnObject = {success: false, problems:[]};
            //Validation rules:
            //At least 1 definition
            //LogicBoolOperator is AND/OR for all but the last that is NONE
            //parentheses match
            //No empty criterias field for a definition
            //No empty subcriterias field for a definition
            //No empty values field for a definition
            //No empty condition field for a definition
            //No empty value field for an action that requires a value
            //No multiple actions with same action and value
            try{
                //At least 1 definition
                if(rule.getNumberOfDefinitions() === 0){
                    returnObject.problems.push('NO_DEFINITIONS');
                }

                var i,
                    definition,
                    startOperators = [],
                    endOperators = [];
                for (i = rule.definitions.length-1; i >= 0; i--){
                    definition = rule.definitions[i];

                    //No empty criterias field for a definition
                    if(typeof definition.criteria !== 'string' || definition.criteria.trim().length === 0){
                        returnObject.problems.push('INVALID_DEF_CRITERIA');
                    }
                    //No empty subcriterias field  for a definition that requires a value
                    if(typeof definition.subCriteria !== 'string' || definition.subCriteria.trim().length === 0){
                        returnObject.problems.push('INVALID_DEF_SUBCRITERIA');
                    }
                    //No empty values field for a definition
                    if(!(typeof definition.value === 'string' || typeof definition.value === 'number') || String(definition.value).trim().length === 0){
                        returnObject.problems.push('INVALID_DEF_VALUE');
                    }
                    //No empty condition field for a definition
                    if(typeof definition.condition !== 'string' || definition.condition.trim().length === 0){
                        returnObject.problems.push('INVALID_DEF_CONDITION');
                    }

                    //LogicBoolOperator is AND/OR for all but the last that is NONE
                    var validOperators = ['AND', 'OR'];
                    if(i === rule.definitions.length-1){
                        validOperators = ['NONE'];
                    }
                    if(validOperators.indexOf(definition.logicBoolOperator) < 0){
                        returnObject.problems.push('INVALID_DEF_BOOL');
                    }

                    //Add start- and endOperators to lists
                    if(typeof definition.startOperator === 'string' && definition.startOperator.trim().length > 0){
                        startOperators.push(definition.startOperator);
                    }
                    if(typeof definition.endOperator === 'string' && definition.endOperator.trim().length > 0){
                        endOperators.push(definition.endOperator);
                    }

                    //parentheses match
                    //NOTE that iteration is done from the end to the start in this for loop
                    //startOperators should not be larger than endOperators
                    if(startOperators.join('').length > endOperators.join('').length){
                        returnObject.problems.push('PARANTHESES_DONT_MATCH');
                    }
                }

                //parentheses match
                //should be same number of chars(parantheses)
                if(startOperators.join('').length !== endOperators.join('').length){
                    returnObject.problems.push('PARANTHESES_DONT_MATCH');
                }


                //No empty value field for an action that requires a value
                //No multiple actions with same action and value
                var thenAction;
                var j;
                for (i = rule.actions.length-1; i >= 0; i--){
                    thenAction = rule.actions[i];
                    if(rulesOptionsService.actionShouldHaveValue(thenAction.action)){
                        if(typeof thenAction.value !== 'string' || thenAction.value.trim().length === 0){
                            returnObject.problems.push('INVALID_ACTION_VALUE');
                        }
                    }
                    for (j = rule.actions.length-1; j >= 0; j--){
                        //Don't compare an object with it self
                        if(i !== j){
                            //Same action?
                            if(thenAction.action === rule.actions[j].action && thenAction.target === rule.actions[j].target) {
                                //Action has a value?
                                if(typeof thenAction.value === 'string' && thenAction.value.trim().length > 0){
                                    //Same value?
                                    if(typeof rule.actions[j].value === 'string' || rule.actions[j].value.trim().length > 0){
                                        if(thenAction.value.trim() === rule.actions[j].value.trim()){
                                            returnObject.problems.push('NON_UNIQUE_ACTION');
                                        }
                                    }
                                }else{
                                    returnObject.problems.push('NON_UNIQUE_ACTION');
                                }
                            }
                        }
                    }
                }

            }catch(error){
                $log.error("Error validating rule definitions and actions.", error);
                returnObject.problems.push('UNKNOWN');
            }

            if(returnObject.problems.length === 0){
                returnObject.success = true;
            }else{
                //Only want unique items
                returnObject.problems = _.uniq(returnObject.problems);
            }

            return returnObject;
        }

    };

	return ruleService;
});