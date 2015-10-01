angular.module('unionvmsWeb').factory('ruleService',function(locale, $log) {

    //List of actions that require a value
    var actionsWithValue = ['SEND_TO_ENDPOINT', 'SMS', 'MAIL'];

	var ruleService = {
        getRuleAsText : function(rule){
            var text = '';
            text += locale.getString('alarms.rules_definition_if');
            $.each(rule.definitions, function(index, def){
                text += ' ' + ruleService.getRuleDefAsText(def);
            });

            text += ' ' +locale.getString('alarms.rules_definition_then');
            $.each(rule.actions, function(index, action){
                if(index === 0){
                    text += ' ';
                }else{
                    text += ' ' +locale.getString('alarms.rules_definition_and') +' ';
                }
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

            text +=' ' + def.condition + ' ' ;

            //value
            if(typeof def.value === 'string' && def.value.trim().length > 0){
                text += def.value;
            }else{
                text += '???';
            }

            text += def.endOperator;

            if(def.logicBoolOperator !== 'NONE'){
                 text += ' ' + def.logicBoolOperator;
            }

            return text;
        },
        getRuleActionAsText : function(ruleAction){
            var actionText = locale.getString('alarms.rules_definition_then_' +ruleAction.action);
            var text = actionText;
            //Show value?
            if(actionsWithValue.indexOf(ruleAction.action) >=0){
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
            //At least 1 action
            //LogicBoolOperator is AND/OR for all but the last that is NONE
            //parentheses match
            //No empty criterias field for a definition
            //No empty subcriterias field  for a definition
            //No empty values field for a definition
            //No empty condition field for a definition
            //No empty value field for an action that requires a value
            try{
                //At least 1 definition and at least 1 action
                if(rule.getNumberOfDefinitions() === 0){
                    returnObject.problems.push('NO_DEFINITIONS');
                }

                if(rule.getNumberOfActions() === 0 ){
                    returnObject.problems.push('NO_ACTIONS');
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
                    //No empty subcriterias field  for a definition
                    if(typeof definition.subCriteria !== 'string' || definition.subCriteria.trim().length === 0){
                        returnObject.problems.push('INVALID_DEF_SUBCRITERIA');
                    }
                    //No empty values field for a definition
                    if(typeof definition.value !== 'string' || definition.value.trim().length === 0){
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
                var thenAction;
                for (i = rule.actions.length-1; i >= 0; i--){
                    thenAction = rule.actions[i];
                    if(actionsWithValue.indexOf(thenAction.action) >=0){
                        if(typeof thenAction.value !== 'string' || thenAction.value.trim().length === 0){
                            returnObject.problems.push('INVALID_ACTION_VALUE');
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