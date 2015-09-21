angular.module('unionvmsWeb').factory('ruleService',function(locale) {

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
            //Show value only for SEND_TO_ENDPOINT
            if(ruleAction.action === 'SEND_TO_ENDPOINT'){
                text += ' ';
                if(typeof ruleAction.value === 'string' && ruleAction.value.trim().length > 0){
                     text += ruleAction.value;
                } else{
                    text += '???';
                }
            }
            return text;
        },

    };

	return ruleService;
});