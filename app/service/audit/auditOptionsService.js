//Service for storing the current options (dropdown values) for the audit search
angular.module('unionvmsWeb').factory("auditOptionsService", function(searchService, dateTimeService) {

    //Names used in the backend
    var TYPES = {
        ASSET : 'Asset',
        ASSET_GROUP : 'Asset Group',
        MOBILE_TERMINAL : 'Mobile Terminal',
        POLL : 'Poll',
        POLLING_PROGRAM : 'Polling program',
        AUTOMATIC_POSITION_REPORT : 'Automatic position report',
        MANUAL_POSITION_REPORT : 'Manual position report',
        ALARM : 'Alarm',
        CUSTOM_RULE : 'Custom rule',
        AREA : 'Area', //Mock value,
        USER : 'User',
        USER_CONTEXT : 'Context',
        USER_PASSWORD : 'Password',
        USER_ROLE : 'Role',
        USER_ORGANISATION : 'Organisation',
        USER_POLICY : 'Policy',
        USER_APPLICATION : 'Application',
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

    //All available dropdown options for TYPE
    var dropdownItems = {
        asset: createDropdownItem(TYPES.ASSET),
        assetGroup: createDropdownItem(TYPES.ASSET_GROUP),
        automaticPositionReport: createDropdownItem(TYPES.AUTOMATIC_POSITION_REPORT),
        manualPositionReport: createDropdownItem(TYPES.MANUAL_POSITION_REPORT),
        mobileTerminal: createDropdownItem(TYPES.MOBILE_TERMINAL),
        poll: createDropdownItem(TYPES.POLL),
        pollingProgram: createDropdownItem(TYPES.POLLING_PROGRAM),
        alarm: createDropdownItem(TYPES.ALARM),
        customRule: createDropdownItem(TYPES.CUSTOM_RULE),
        area: createDropdownItem(TYPES.AREA),
        user: createDropdownItem(TYPES.USER),
        userContext: createDropdownItem(TYPES.USER_CONTEXT),
        userPassword: createDropdownItem(TYPES.USER_PASSWORD),
        userRole: createDropdownItem(TYPES.USER_ROLE),
        userOrganisation: createDropdownItem(TYPES.USER_ORGANISATION),
        userPolicy: createDropdownItem(TYPES.USER_POLICY),
        userApplication: createDropdownItem(TYPES.USER_APPLICATION),
    };

    //All available dropdown options for OPERATION
    var auditLogOperations = {
        archive: createDropdownItem("Archive"),
        create: createDropdownItem("Create"),
        update: createDropdownItem("Update"),
        remove: createDropdownItem("Remove"),
        link: createDropdownItem("Linked"),
        unlink: createDropdownItem("Unlinked"),
        delete: createDropdownItem("Delete"), //Used instead of Remove in the user module
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
                    newTypes = [dropdownItems.asset, dropdownItems.mobileTerminal, dropdownItems.poll, dropdownItems.pollingProgram, dropdownItems.assetGroup];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove, auditLogOperations.link, auditLogOperations.unlink];
                    break;
                case 'POSITION_REPORTS':
                    newTypes = [dropdownItems.automaticPositionReport, dropdownItems.manualPositionReport];
                    newOperations = [auditLogOperations.create];
                    break;
                case 'GIS':
                    newTypes = [dropdownItems.area];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.remove];
                    break;
                case 'ALARMS':
                    newTypes = [dropdownItems.alarm, dropdownItems.customRule];
                    newOperations = [auditLogOperations.create];
                    break;
                case 'ACCESS_CONTROL':
                    newTypes = [dropdownItems.user, dropdownItems.userContext, dropdownItems.userPassword, dropdownItems.userRole, dropdownItems.userOrganisation, dropdownItems.userPolicy, dropdownItems.userApplication];
                    newOperations = [auditLogOperations.create, auditLogOperations.update, auditLogOperations.delete];
                    break;
                case 'ALL':
                    newTypes = Object.keys(dropdownItems).map(function(key) {
                        return dropdownItems[key];
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
