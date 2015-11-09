angular.module('unionvmsWeb').factory('rulesOptionsService',function(configurationService, locale, savedSearchService) {

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

    //Crieterias that should have value input fields of a certain type
    var longitudesCriterias = ['LONGITUDE'];
    var latitudeCriterias = ['LATITUDE'];
    var courseCriterias = ['REPORTED_COURSE', 'CALCULATED_COURSE'];
    var speedCriterias = ['REPORTED_SPEED', 'CALCULATED_SPEED'];
    var dateTimeCriterias = ['POSITION_REPORT_TIME'];

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
        DROPDOWNS.ACTIONS = [];
        $.each(configurationService.getValue('RULES', 'ACTIONS'), function(key, requiresValue){
            DROPDOWNS.ACTIONS.push(createDropdownValue('ACTIONS', key));
            if(requiresValue){
                actionsThatRequireValue.push(key);
            }
        });
        DROPDOWNS.ACTIONS = _.sortBy(DROPDOWNS.ACTIONS, function(obj){return obj.text;});

        //Conditions
        DROPDOWNS.CONDITIONS = [];
        $.each(configurationService.getValue('RULES', 'CONDITIONS'), function(index, key){
            DROPDOWNS.CONDITIONS.push(createDropdownValue('CONDITIONS', key));
        });

        //LOGIC OPERATIONS
        DROPDOWNS.LOGIC_OPERATORS = [];
        $.each(configurationService.getValue('RULES', 'LOGIC_OPERATORS'), function(index, key){
            DROPDOWNS.LOGIC_OPERATORS.push(createDropdownValue('LOGIC_OPERATORS', key));
        });

        //CRITERIAS
        DROPDOWNS.CRITERIAS = [];
        DROPDOWNS.SUBCRITERIAS = [];
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

    //Dropdown values for ruleDefintions
    var ruleDefinitionDropdowns = {
        FLAG_STATE : [],
        ASSET_GROUP : [],
        AREA_TYPE : [],
        AREA_ID : [],
        AREA_NAME: [],
        AREA_CODE: [],
    };
    var setupRuleDefinitionDropdowns = function(){
        //TODO: Get options from configurations
        ruleDefinitionDropdowns.FLAG_STATE = createDropdownItemsWithSameTextAsValue(['SWE', 'FIN', 'DEN']);
        ruleDefinitionDropdowns.AREA_TYPE = createDropdownItemsWithSameTextAsValue(['A1', 'A2', 'A3']);

        //Asset groups
        var assetGroups = savedSearchService.getVesselGroupsForUser();
        ruleDefinitionDropdowns.ASSET_GROUP = [];
        $.each(assetGroups, function(i, assetGroup){
            ruleDefinitionDropdowns.ASSET_GROUP.push({'text': assetGroup.name, 'code':assetGroup.id});
        });
        ruleDefinitionDropdowns.ASSET_GROUP = _.sortBy(ruleDefinitionDropdowns.ASSET_GROUP, function(assetGroup){return assetGroup.name;});

        //TODO: Add Areas
    };

    //Dropdown values for actions
    var actionDropdowns = {
        SEND_TO_ENDPOINT : [],
    };
    var setupActionDropdowns = function(){
        actionDropdowns.SEND_TO_ENDPOINT = createDropdownItemsWithSameTextAsValue(['SWE', 'FIN', 'DEN']);
        //Add reserved word for sending to all countries to dropdown
        var reservedWord = configurationService.getConfig('RULES_RESERVED_WORDS');
        if(Array.isArray(reservedWord) && reservedWord.length > 0){
            actionDropdowns.SEND_TO_ENDPOINT.push({'text': locale.getString('alarms.rules_form_definition_action_send_to_endpoint_closest_country'), 'code':reservedWord[0]});
        }
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

        //Get dropdown values for a ruleDefinition
        getDropdownValuesForRuleDefinition : function(ruleDefinition){
            if(ruleDefinition.criteria in ruleDefinitionDropdowns){
                return ruleDefinitionDropdowns[ruleDefinition.criteria];
            }
            if(ruleDefinition.subCriteria in ruleDefinitionDropdowns){
                return ruleDefinitionDropdowns[ruleDefinition.subCriteria];
            }
        },
        //Get dropdown values for an action
        getDropdownValuesForAction : function(action){
            if(action.action in actionDropdowns){
                return actionDropdowns[action.action];
            }
        },
        //Is the value a coordinate?
        isRuleDefinitionValueLongitudeCoordinate : function(ruleDefinition){
            return longitudesCriterias.indexOf(ruleDefinition.criteria) >= 0;
        },
        isRuleDefinitionValueLatitudeCoordinate : function(ruleDefinition){
            return latitudeCriterias.indexOf(ruleDefinition.criteria) >= 0;
        },
        isRuleDefinitionValueASpeed : function(ruleDefinition){
            return speedCriterias.indexOf(ruleDefinition.criteria) >= 0;
        },
        isRuleDefinitionValueACourse : function(ruleDefinition){
            return courseCriterias.indexOf(ruleDefinition.criteria) >= 0;
        },
        isRuleDefinitionValueADateTime : function(ruleDefinition){
            return dateTimeCriterias.indexOf(ruleDefinition.criteria) >= 0;
        },
        setupDropdowns : function(){
            setupDropdowns();
        },
        setupRuleDefinitionDropdowns : function(){
            setupRuleDefinitionDropdowns();
        },
        setupActionDropdowns : function(){
            setupActionDropdowns();
        },
    };

    var init = function(){
        setupDropdowns();
        setupRuleDefinitionDropdowns();
        setupActionDropdowns();
    };

    init();

	return rulesOptionsService;
});