angular.module('unionvmsWeb').factory('pollingService',function() {

    //The selected terminals
    var selection = {
        selectedMobileTerminals : [],
        selectedMobileTerminalGroups : []
    };

    function indexOfObject(xs, x) {
        for (var i = 0; i < xs.length; i++) {
            if (xs[i] === x) {
                return i;
            }
        }

        return -1;
    }

    function removeTerminalGroup(groups, terminal) {
        var idx = indexOfObject(groups, terminal);
        if (idx < 0) {
            return;
        }

        groups.splice(idx, 1);
    }

    function removeTerminal(terminals, terminal) {
        var idx = indexOfObject(terminals, terminal);
        if (idx < 0) {
            return;
        }

        terminals.splice(idx, 1);
    }

    function removeTerminalFromGroup(terminalGroup, terminal) {
        removeTerminal(terminalGroup.mobileTerminals, terminal);
    }

	var pollingService = {
        addMobileTerminalToSelection : function(terminal){
            selection.selectedMobileTerminals.push(terminal);
        },
        addMobileTerminalGroupToSelection : function(terminalGroup){
            selection.selectedMobileTerminalGroups.push(terminalGroup);
        },
        removeMobileTerminalFromSelection : function(terminalGroup, terminal) {
            if (terminalGroup) {
                if (terminal) {
                    // Remove terminal in group
                    removeTerminalFromGroup(terminalGroup, terminal);
                }
                else {
                    // Remove group itself
                    removeTerminalGroup(selection.selectedTerminalGroups, terminalGroup);
                }
            }
            else if (terminal) {
                // Remove single terminal
                removeTerminal(selection.selectedMobileTerminals, terminal);
            }
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