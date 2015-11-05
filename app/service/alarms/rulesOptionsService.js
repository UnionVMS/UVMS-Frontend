angular.module('unionvmsWeb').factory('rulesOptionsService',function(configurationService, locale) {

    var actionsThatRequireValue = [];
    var criteriaThatRequireSubcriteria = [];
    var DROPDOWNS = {
        ACTIONS : [],
        RULE_TYPES : [],
        AVAILABILITY_TYPES : [],
        ACTIVE_STATUSES : [],
        START_OPERATORS : [],
        END_OPERATORS : [],
        LOGIC_OPERATORS : [],
        CRITERIAS : [],
        SUBCRITERIAS : [],
        CONDITIONS : [],
    };

    var createDropdownItemsWithSameTextAsValue = function(codes){
        var options = [];
        $.each(codes, function(index, code){
            options.push({'text': code,'code':code});
        });
        return options;
    };


    var createDropdownValue = function(prefix, key){
        var text = key;
        var translation = locale.getString('config.RULES_' + prefix + "_" + key);
        if(translation.indexOf('KEY_NOT_FOUND') < 0){
            text = translation;
        }
        return {'text': text,'code':key};
    };

    var setupDropdowns = function(){

        /*HARD CODED BELOW*/
        //Rule types
        DROPDOWNS.RULE_TYPES =[
            createDropdownValue('TYPES', 'GLOBAL'),
            createDropdownValue('TYPES', 'EVENT')
        ];

        //Availability types
        DROPDOWNS.AVAILABILITY_TYPES =[
            createDropdownValue('AVAILABILITIES', 'PUBLIC'),
            createDropdownValue('AVAILABILITIES', 'PRIVATE')
        ];

        //Statuses
        DROPDOWNS.ACTIVE_STATUSES =[
            {'text': locale.getString('config.RULES_ACTIVE_STATUSES_ACTIVE'),'code':true},
            {'text': locale.getString('config.RULES_ACTIVE_STATUSES_INACTIVE'),'code':false}
        ];

        //Start and stop operators
        DROPDOWNS.START_OPERATORS = createDropdownItemsWithSameTextAsValue(['(', '((', '(((']);
        DROPDOWNS.END_OPERATORS = createDropdownItemsWithSameTextAsValue([')', '))', ')))']);


        /*FROM CONFIG BELOW*/
        //Actions
        $.each(configurationService.getValue('RULES', 'ACTIONS'), function(key, requiresValue){
            DROPDOWNS.ACTIONS.push(createDropdownValue('ACTIONS', key));
            if(requiresValue){
                actionsThatRequireValue.push(key);
            }
        });
        DROPDOWNS.ACTIONS = _.sortBy(DROPDOWNS.ACTIONS, function(obj){return obj.text;});

        //Conditions
        $.each(configurationService.getValue('RULES', 'CONDITIONS'), function(index, key){
            DROPDOWNS.CONDITIONS.push(createDropdownValue('CONDITIONS', key));
        });

        //LOGIC OPERATIONS
        $.each(configurationService.getValue('RULES', 'LOGIC_OPERATORS'), function(index, key){
            DROPDOWNS.LOGIC_OPERATORS.push(createDropdownValue('LOGIC_OPERATORS', key));
        });

        //CRITERIAS
        $.each(configurationService.getValue('RULES', 'CRITERIA'), function(key, subcriterias){
            //Special ROOT element contains list of criterias without subcriterias
            if(key === 'ROOT'){
                if(Array.isArray(subcriterias) && subcriterias.length > 0){
                    $.each(subcriterias, function(index, aSubCriteria){
                        DROPDOWNS.CRITERIAS.push(createDropdownValue('CRITERIA', aSubCriteria));
                        //Set code to NONE
                        DROPDOWNS.SUBCRITERIAS[aSubCriteria] =[{'text': '-','code': 'NONE'}];
                    });
                }
            }
            //"Normal" critera with list of subcriterias
            else{
                DROPDOWNS.CRITERIAS.push(createDropdownValue('CRITERIA', key));
                DROPDOWNS.SUBCRITERIAS[key] = [];

                //Create subcriterias
                if(Array.isArray(subcriterias) && subcriterias.length > 0){
                    criteriaThatRequireSubcriteria.push(key);
                    $.each(subcriterias, function(index, aSubCriteria){
                        DROPDOWNS.SUBCRITERIAS[key].push(createDropdownValue('CRITERIA_'+key, aSubCriteria));
                    });
                    DROPDOWNS.SUBCRITERIAS[key] = _.sortBy(DROPDOWNS.SUBCRITERIAS[key], function(obj){return obj.text;});
                }else{
                    //Set code to NONE
                    DROPDOWNS.SUBCRITERIAS[key].push({'text': '-','code': 'NONE'});
                }
            }
        });
        DROPDOWNS.CRITERIAS = _.sortBy(DROPDOWNS.CRITERIAS, function(obj){return obj.text;});
    };

	var rulesOptionsService = {
        //Get all dropdown values
        getDropdownValues : function(){
            return DROPDOWNS;
        },

        //Check if an action requires a value
        actionShouldHaveValue : function(action){
            return actionsThatRequireValue.indexOf(action) >= 0;
        },

        //Check if a criteria requires a subcriteria
        criteriaShouldHaveSubcriteria : function(criteria){
            return criteriaThatRequireSubcriteria.indexOf(criteria) >= 0;
        },
    };

    setupDropdowns();

	return rulesOptionsService;
});