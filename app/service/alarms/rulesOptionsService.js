angular.module('unionvmsWeb').factory('rulesOptionsService',function(configurationService, locale, savedSearchService, spatialRestService) {

    var actionsThatRequireValue = [];
    var DROPDOWNS = {
        ACTIONS : [],
        RULE_TYPES : [],
        AVAILABILITY_TYPES : [],
        ACTIVE_STATUSES : [],
        START_OPERATORS : [],
        END_OPERATORS : [],
        LOGIC_OPERATORS : [],
        CRITERIAS : [],
        SUBCRITERIAS : {},
        CONDITIONS : {},
    };

    //Sub criterias that should have value input fields of a certain type
    var longitudesCriterias = ['LONGITUDE'];
    var latitudeCriterias = ['LATITUDE'];
    var courseCriterias = ['REPORTED_COURSE', 'CALCULATED_COURSE'];
    var speedCriterias = ['REPORTED_SPEED', 'CALCULATED_SPEED'];
    var dateTimeCriterias = ['POSITION_REPORT_TIME'];
    //Actions that should have value input fields of a certain type
    var emailActions = ['EMAIL'];

    var createDropdownItemsWithSameTextAsValue = function(codes){
        var options = [];
        if(Array.isArray(codes)){
            $.each(codes, function(index, code){
                options.push({'text': code,'code':code});
            });
        }
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

        //LOGIC OPERATIONS
        DROPDOWNS.LOGIC_OPERATORS = [];
        $.each(configurationService.getValue('RULES', 'LOGIC_OPERATORS'), function(index, key){
            DROPDOWNS.LOGIC_OPERATORS.push(createDropdownValue('LOGIC_OPERATORS', key));
        });

        //CRITERIAS
        DROPDOWNS.CRITERIAS = [];
        DROPDOWNS.SUBCRITERIAS = {};
        DROPDOWNS.CONDITIONS = {};
        $.each(configurationService.getValue('RULES', 'CRITERIA'), function(criteriaKey, subcriterias){
            DROPDOWNS.CRITERIAS.push(createDropdownValue('CRITERIA', criteriaKey));
            DROPDOWNS.SUBCRITERIAS[criteriaKey] = [];
            DROPDOWNS.CONDITIONS[criteriaKey] = {};

            //Create subcriterias
            $.each(subcriterias, function(subCriteriaKey, subCriteriaConditions){
                DROPDOWNS.SUBCRITERIAS[criteriaKey].push(createDropdownValue('CRITERIA_'+criteriaKey, subCriteriaKey));

                //Create conditions
                 DROPDOWNS.CONDITIONS[criteriaKey][subCriteriaKey] = [];
                $.each(subCriteriaConditions, function(i, conditionKey){
                    DROPDOWNS.CONDITIONS[criteriaKey][subCriteriaKey].push(createDropdownValue('CONDITIONS', conditionKey));
                });
            });
            DROPDOWNS.SUBCRITERIAS[criteriaKey] = _.sortBy(DROPDOWNS.SUBCRITERIAS[criteriaKey], function(obj){return obj.text;});
        });
        DROPDOWNS.CRITERIAS = _.sortBy(DROPDOWNS.CRITERIAS, function(obj){return obj.text;});
    };

    //Dropdown values for ruleDefintions
    var ruleDefinitionDropdowns = {
        ACTIVITY : {
            ACTIVITY_MESSAGE_TYPE : [],
        },
        ASSET : {
            FLAG_STATE : [],
            ASSET_ID_GEAR_TYPE : [],
        },
        ASSET_GROUP : {
            ASSET_GROUP : [],
        },
        MOBILE_TERMINAL : {
            MT_TYPE: [],
            COMCHANNEL_TYPE: [],
        },
        POSITION : {
            MOVEMENT_TYPE: [],
            SEGMENT_TYPE: [],
            STATUS_CODE: [],
            SOURCE: [],
        },
        AREA : {
            //AREA_TYPE : [],
            //AREA_ID : [],
            //AREA_NAME: [],
            //AREA_CODE: [],
        }
    };
    var setupRuleDefinitionValueDropdowns = function(){
        //Activity subcriterias
        ruleDefinitionDropdowns.ACTIVITY.ACTIVITY_MESSAGE_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT', true);

        //Asset subcriterias
        ruleDefinitionDropdowns.ASSET.ASSET_ID_GEAR_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'GEAR_TYPE'), 'GEAR_TYPE','VESSEL', true);
        ruleDefinitionDropdowns.ASSET.FLAG_STATE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);

        //Mobile terminal subcriterias
        ruleDefinitionDropdowns.MOBILE_TERMINAL.MT_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOBILETERMINAL', 'TRANSPONDERS'), 'TRANSPONDERS', 'MOBILETERMINAL', true);
        ruleDefinitionDropdowns.MOBILE_TERMINAL.COMCHANNEL_TYPE = createDropdownItemsWithSameTextAsValue(configurationService.getConfig('MOBILE_TERMINAL_CHANNELS'));

        //Position subcriterias
        ruleDefinitionDropdowns.POSITION.MOVEMENT_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'), 'MESSAGE_TYPE', 'MOVEMENT', true);
        ruleDefinitionDropdowns.POSITION.SEGMENT_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'CATEGORY_TYPE'), 'CATEGORY_TYPE', 'MOVEMENT', true);
        ruleDefinitionDropdowns.POSITION.STATUS_CODE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'STATUS'), 'STATUS', 'MOVEMENT', true);
        ruleDefinitionDropdowns.POSITION.SOURCE = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('MOVEMENT_SOURCE_TYPES'), 'SOURCE', 'MOVEMENT', true);

        //Asset groups subcriterias
        var assetGroups = savedSearchService.getVesselGroupsForUser();
        ruleDefinitionDropdowns.ASSET_GROUP.ASSET_GROUP = [];
        $.each(assetGroups, function(i, assetGroup){
            //Only static groups should be listed
            if(!assetGroup.dynamic){
                ruleDefinitionDropdowns.ASSET_GROUP.ASSET_GROUP.push({'text': assetGroup.name, 'code':assetGroup.id});
            }
        });
        ruleDefinitionDropdowns.ASSET_GROUP.ASSET_GROUP = _.sortBy(ruleDefinitionDropdowns.ASSET_GROUP.ASSET_GROUP, function(assetGroup){return assetGroup.name;});

        //Areas subcriteria
        //TODO: Add Areas
/*        spatialRestService.getAreaLayers().then(function(areasResponse){
            console.log("areasResponse");
            console.log(areasResponse);
        }, function(err){
            console.error("Error getting areas");
        });*/
        //ruleDefinitionDropdowns.AREA.AREA_TYPE = createDropdownItemsWithSameTextAsValue(['A1', 'A2', 'A3']);
        //ruleDefinitionDropdowns.AREA.AREA_ID = createDropdownItemsWithSameTextAsValue(['A1', 'A2', 'A3']);
        //ruleDefinitionDropdowns.AREA.AREA_NAME = createDropdownItemsWithSameTextAsValue(['A1', 'A2', 'A3']);
        //ruleDefinitionDropdowns.AREA.AREA_CODE = createDropdownItemsWithSameTextAsValue(['A1', 'A2', 'A3']);
    };

    //Dropdown values for actions
    var actionDropdowns = {
        SEND_TO_ENDPOINT : [],
    };
    var setupActionDropdowns = function(){
        //TODO: Get config from Rules?
        actionDropdowns.SEND_TO_ENDPOINT = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
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

        //Get dropdown values for a ruleDefinition
        getDropdownValuesForRuleDefinition : function(ruleDefinition){
            if(ruleDefinition.criteria in ruleDefinitionDropdowns){
                if(ruleDefinition.subCriteria in ruleDefinitionDropdowns[ruleDefinition.criteria]){
                    return ruleDefinitionDropdowns[ruleDefinition.criteria][ruleDefinition.subCriteria];
                }
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
            return longitudesCriterias.indexOf(ruleDefinition.subCriteria) >= 0;
        },
        isRuleDefinitionValueLatitudeCoordinate : function(ruleDefinition){
            return latitudeCriterias.indexOf(ruleDefinition.subCriteria) >= 0;
        },
        isRuleDefinitionValueASpeed : function(ruleDefinition){
            return speedCriterias.indexOf(ruleDefinition.subCriteria) >= 0;
        },
        isRuleDefinitionValueACourse : function(ruleDefinition){
            return courseCriterias.indexOf(ruleDefinition.subCriteria) >= 0;
        },
        isRuleDefinitionValueADateTime : function(ruleDefinition){
            return dateTimeCriterias.indexOf(ruleDefinition.subCriteria) >= 0;
        },
        isRuleActionValueAnEmail : function(ruleAction){
            return emailActions.indexOf(ruleAction.action) >= 0;
        },
        setupDropdowns : function(){
            setupDropdowns();
        },
        setupRuleDefinitionValueDropdowns : function(){
            setupRuleDefinitionValueDropdowns();
        },
        setupActionDropdowns : function(){
            setupActionDropdowns();
        },
    };

    var init = function(){
        setupDropdowns();
        setupRuleDefinitionValueDropdowns();
        setupActionDropdowns();
    };

    init();

	return rulesOptionsService;
});