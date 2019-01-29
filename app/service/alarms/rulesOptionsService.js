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
angular.module('unionvmsWeb').factory('rulesOptionsService',function(configurationService, locale, savedSearchService, ruleRestService) {

    var actionsThatRequireValue = [];
    var DROPDOWNS = {
        ACTIONS : [],
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

        //Availability types
        DROPDOWNS.AVAILABILITY_TYPES =[
            {'text': locale.getString('config.RULES_AVAILABILITY_PUBLIC'),'code': 'PUBLIC'},
            {'text': locale.getString('config.RULES_AVAILABILITY_PRIVATE'),'code': 'PRIVATE'},
            {'text': locale.getString('config.RULES_AVAILABILITY_GLOBAL'),'code': 'GLOBAL'},
        ];
        DROPDOWNS.AVAILABILITY_TYPES = _.sortBy(DROPDOWNS.AVAILABILITY_TYPES, function(obj){return obj.text;});

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
            VESSEL_STATUS: [],
        },
        ASSET_GROUP : {
            ASSET_GROUP : [],
        },
        MOBILE_TERMINAL : {
            MT_TYPE: [],
            COMCHANNEL_TYPE: [],
            MT_STATUS: [],
        },
        POSITION : {
            MOVEMENT_TYPE: [],
            SEGMENT_TYPE: [],
            STATUS_CODE: [],
            SOURCE: [],
        },
        AREA : {
            AREA_TYPE: [],
            AREA_TYPE_ENT: [],
            AREA_TYPE_EXT: []
        }
    };
    var setupRuleDefinitionValueDropdowns = function(){
        //Activity subcriterias
        ruleDefinitionDropdowns.ACTIVITY.ACTIVITY_MESSAGE_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'ACTIVITY_TYPE'), 'ACTIVITY_TYPE', 'MOVEMENT', true);

        //Asset subcriterias
        ruleDefinitionDropdowns.ASSET.ASSET_ID_GEAR_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FISHING_TYPE'), undefined,'VESSEL', true);
        ruleDefinitionDropdowns.ASSET.FLAG_STATE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
        ruleDefinitionDropdowns.ASSET.VESSEL_STATUS = configurationService.setTextAndCodeForDropDown(configurationService.getValue('RULES', 'ASSET_STATUSES'), 'ASSET_STATUSES', 'RULES', true);

        //Mobile terminal subcriterias
        ruleDefinitionDropdowns.MOBILE_TERMINAL.MT_TYPE = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOBILETERMINAL', 'TRANSPONDERS'), 'TRANSPONDERS', 'MOBILETERMINAL', true);
        ruleDefinitionDropdowns.MOBILE_TERMINAL.COMCHANNEL_TYPE = createDropdownItemsWithSameTextAsValue(configurationService.getConfig('MOBILE_TERMINAL_CHANNELS'));
        ruleDefinitionDropdowns.MOBILE_TERMINAL.MT_STATUS = configurationService.setTextAndCodeForDropDown(configurationService.getValue('RULES', 'MOBILETERMINAL_STATUSES'), 'MOBILETERMINAL_STATUSES', 'RULES', true);

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

        ruleRestService.getAreaTypes().then(function(areaTypes) {
            areaTypes = areaTypes.map(function(areaType) {
                return {"text": areaType, "code": areaType};
            });

            ruleDefinitionDropdowns.AREA = {
                AREA_TYPE: areaTypes,
                AREA_TYPE_ENT: areaTypes,
                AREA_TYPE_EXT: areaTypes
            };
        });
    };

    //Dropdown values for actions
    var actionDropdowns = {
        SEND_TO_FLUX : [],
        SEND_TO_NAF : [],
    };
    var setupActionDropdowns = function(){
        //TODO: Get config from Rules?
        actionDropdowns.SEND_TO_FLUX = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
        actionDropdowns.SEND_TO_NAF = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL', true);
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