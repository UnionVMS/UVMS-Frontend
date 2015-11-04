//Service for storing the current options (dropdown values) for the audit search
angular.module('unionvmsWeb').factory("auditOptionsService", function(searchService, dateTimeService) {

    //Names used in the backend
    var TYPES = {
        ASSET : 'Asset',
        MOBILE_TERMINAL : 'Mobile Terminal',
        POLL : 'Poll',
        REPORT : 'Report',
        ALARM : 'Alarm',
        CUSTOM_RULE : 'Custom rule',
    };

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

    //All available TYPES
    var auditLogTypes = {
        asset: createDropdownItem(TYPES.ASSET),
        report: createDropdownItem(TYPES.REPORT),
        mobileTerminal: createDropdownItem(TYPES.MOBILE_TERMINAL),
        poll: createDropdownItem(TYPES.POLL),
        alarm: createDropdownItem(TYPES.ALARM),
        customRule: createDropdownItem(TYPES.CUSTOM_RULE),
    };

    //All available OPERATIONS
    var auditLogOperations = {
        create: createDropdownItem("Create"),
        update: createDropdownItem("Update"),
        remove: createDropdownItem("Remove"),
        link: createDropdownItem("Linked"),
        unlink: createDropdownItem("Unlinked"),
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
            searchService.getAdvancedSearchObject()["TO_DATE"] = dateTimeService.formatUTCDateWithTimezone(moment.utc());
            searchService.getAdvancedSearchObject()["FROM_DATE"] = dateTimeService.formatUTCDateWithTimezone(moment.utc().startOf('day'));
            searchService.setSearchCriteriasToAdvancedSearch();
        },

        //Update options depending on the selected tab
        setOptions : function(tab) {
            var newTypes = [],
                newOperations = [];
            switch(tab){
                case 'ASSETS_AND_TERMINALS':
                    newTypes = [auditLogTypes.asset, auditLogTypes.mobileTerminal, auditLogTypes.poll];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove, auditLogOperations.link, auditLogOperations.unlink];
                    break;
                case 'POSITION_REPORTS':
                    newTypes = [auditLogTypes.report];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove];
                    break;
                case 'GIS':
                    newTypes = [];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove];
                    break;
                case 'CATCH_AND_SURVEILLANCE':
                    newTypes = [];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove];
                    break;
                case 'ALARMS':
                    newTypes = [auditLogTypes.alarm, auditLogTypes.customRule];
                    newOperations = [auditLogOperations.create];
                    break;
                case 'ACCESS_CONTROL':
                    newTypes = [];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove];
                    break;
                case 'ALL':
                    newTypes = Object.keys(auditLogTypes).map(function(key) {
                        return auditLogTypes[key];
                    });
                    newOperations = Object.keys(auditLogOperations).map(function(key) {
                        return auditLogOperations[key];
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
