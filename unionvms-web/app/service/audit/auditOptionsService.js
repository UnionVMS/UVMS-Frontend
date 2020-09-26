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
//Service for storing the current options (dropdown values) for the audit search
angular.module('unionvmsWeb').factory("auditOptionsService", function(searchService, dateTimeService) {

    var currentOptions = {
        types: [],
        operations : []
    };

    //Create dropdown item
    var createDropdownItem = function(text, code) {
        return {
            text: text,
            code: code || text
        };
    };

    //Type dropdowns with the Names used in the backend
    var TYPES = {
        ASSETS_AND_TERMINALS : {
            ASSET : 'Asset',
            ASSET_GROUP : 'Asset Group',
            MOBILE_TERMINAL : 'Mobile Terminal',
            POLL : 'Poll',
            POLLING_PROGRAM : 'Program poll',
        },
        POSITION_REPORTS : {
            AUTOMATIC_POSITION_REPORT : 'Automatic position report',
            MANUAL_POSITION_REPORT : 'Manual position report',
            TEMPORARY_POSITION_REPORT : 'Temporary position report'
        },
        GIS : {
            AREA : 'Area', //Mock value
        },
        EXCHANGE : {
            EXCHANGE_LOG : 'Exchange log',
            EXCHANGE_UNSENT_MESSAGE : 'Exchange unsent message',
        },
        ALARMS : {
            ALARM : 'Alarm',
            TICKET : 'Ticket',
            CUSTOM_RULE : 'Custom Rule',
            CUSTOM_RULE_ACTION_TRIGGERED : 'Custom Rule Action Triggered',
            CUSTOM_RULE_SUBSCRIPTION : 'Custom Rule Subscription',
        },
        ACCESS_CONTROL : {
            USER : 'User',
            USER_CONTEXT : 'Context',
            USER_PASSWORD : 'Password',
            USER_ROLE : 'Role',
            USER_ORGANISATION : 'Organisation',
            USER_POLICY : 'Policy',
            USER_APPLICATION : 'Application',
        },
        OTHER : {
            SETTING : 'Setting',
            SUBSCRIPTION: 'Subscription'
        },
    };

    //All available dropdown options for TYPE
    var dropdownTypes = {};
    $.each(TYPES, function(categoryKey, categoryTypes){
        dropdownTypes[categoryKey] = [];
        $.each(categoryTypes, function(key, value){
            dropdownTypes[categoryKey].push(createDropdownItem(value));
        });
    });

    //All available dropdown options for OPERATION
    var dropdownOperations = {
        archive: createDropdownItem("Archive"),
        create: createDropdownItem("Create"),
        update: createDropdownItem("Update"),
        remove: createDropdownItem("Remove"),
        link: createDropdownItem("Linked"),
        unlink: createDropdownItem("Unlinked"),
        delete: createDropdownItem("Delete"), //Used instead of Remove in the user module
        ruleActionSendToEndpoint: createDropdownItem("Send To Endpoint"),
        ruleActionSendEmail: createDropdownItem("Send Email"),
    };

    return{
        getTypes : function(){
            return TYPES;
        },

        //Current options
        getCurrentOptions : function(){
            return currentOptions;
        },

        //Reset default options
        resetDefaults : function() {
            //Reset date fields
            searchService.getAdvancedSearchObject()["TO_DATE"] = dateTimeService.formatUTCDateWithTimezone(moment.utc().format());
            searchService.getAdvancedSearchObject()["FROM_DATE"] = dateTimeService.formatUTCDateWithTimezone(moment().startOf('day').format("YYYY-MM-DD HH:mm"));
            searchService.setSearchCriteriasToAdvancedSearch();
        },

        //Update options depending on the selected tab
        setOptions : function(tab) {
            var newTypes = [],
                newOperations = [];
            switch(tab){
                case 'ASSETS_AND_TERMINALS':
                    newTypes = dropdownTypes.ASSETS_AND_TERMINALS;
                    newOperations = [dropdownOperations.create, dropdownOperations.update, dropdownOperations.remove, dropdownOperations.link, dropdownOperations.unlink];
                    break;
                case 'POSITION_REPORTS':
                    newTypes = dropdownTypes.POSITION_REPORTS;
                    newOperations = [dropdownOperations.create];
                    break;
                case 'EXCHANGE':
                    newTypes = dropdownTypes.EXCHANGE;
                    newOperations = [dropdownOperations.create, dropdownOperations.update, dropdownOperations.remove];
                    break;
                case 'GIS':
                    newTypes = dropdownTypes.GIS;
                    newOperations = [dropdownOperations.create, dropdownOperations.update, dropdownOperations.remove];
                    break;
                case 'ALARMS':
                    newTypes = dropdownTypes.ALARMS;
                    newOperations = [dropdownOperations.create, dropdownOperations.update, dropdownOperations.delete, dropdownOperations.ruleActionSendToEndpoint, dropdownOperations.ruleActionSendEmail];
                    break;
                case 'ACCESS_CONTROL':
                    newTypes = dropdownTypes.ACCESS_CONTROL;
                    newOperations = [dropdownOperations.create, dropdownOperations.update, dropdownOperations.delete];
                    break;
                case 'ALL':
                    newTypes = [];
                    $.each(dropdownTypes, function(key, value){
                        newTypes = newTypes.concat(value);
                    });
                    newOperations = Object.keys(dropdownOperations).map(function(key) {
                        return dropdownOperations[key];
                    });
                    break;
                default:
                    newTypes = [];
                    newOperations = [];
                    break;
            }

            //Update types and operations
            newTypes = _.sortBy(newTypes, function(obj){return obj.text;});
            currentOptions.types.splice(0, currentOptions.types.length);
            for (var i = 0; i < newTypes.length; i++) {
                currentOptions.types.push(newTypes[i]);
            }
            newOperations = _.sortBy(newOperations, function(obj){return obj.text;});
            currentOptions.operations.splice(0, currentOptions.operations.length);
            for (i = 0; i < newOperations.length; i++) {
                currentOptions.operations.push(newOperations[i]);
            }
        },

    };
});
