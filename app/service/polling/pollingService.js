angular.module('unionvmsWeb').factory('pollingService',function() {

    //The selected terminals
    var selection = {
        selectedMobileTerminals : [],
        selectedMobileTerminalGroups : []
    };

	var pollingService = {
        addMobileTerminalToSelection : function(terminal){
            //...
        },
        addMobileTerminalGroupToSelection : function(terminalGroup){
            //TODO: create terminalGrou
        },
        removeMobileTerminalFromSelection : function(terminalGroup, terminal){
            //...
        },      
        clearSelection : function(){
            selection.selectedTerminals = selection.selectedTerminalGroups = [];
        },
        getSelection : function(){
            return selection;
        },
    };

	return pollingService;
});