angular.module('unionvmsWeb').factory('pollingService',function() {

    //The selected terminals
    var selection = {
        selectedMobileTerminals : [],
        selectedMobileTerminalGroups : []
    };

    function indexOfTerminal(xs, x) {
        for (var i = 0; i < xs.length; i++) {
            if (xs[i].isEqualTerminal(x)) {
                return i;
            }
        }
        return -1;
    }


    function indexOfTerminalGroup(xs, name) {
            for (var i = 0; i < xs.length; i++) {
                if (xs[i].name === name) {
                    return i;
                }
            }
        return -1;
    }

    function containsTerminal(terminals, terminal) {
        return indexOfTerminal(terminals, terminal) >= 0;
    }

    function containsTerminalGroup(groups, group) {
        return indexOfTerminalGroup(groups, group.name) >= 0;
    }

    function isTerminalSelected(terminal) {
        if (containsTerminal(selection.selectedMobileTerminals, terminal)) {
            return true;
        }

        for (var i = 0; i < selection.selectedMobileTerminalGroups.length; i++) {
            var selectedGroup = selection.selectedMobileTerminalGroups[i];
            if (containsTerminal(selectedGroup.mobileTerminals, terminal)) {
                return true;
            }
        }

        return false;
    }

    function isTerminalGroupSelected(terminalGroup) {
        return containsTerminalGroup(selection.selectedMobileTerminalGroups, terminalGroup);
    }

    function removeTerminalGroup(groups, group) {
        var idx = indexOfTerminalGroup(groups, group.name);
        if (idx < 0) {
            return;
        }

        groups.splice(idx, 1);
    }

    function removeTerminal(terminals, terminal) {
        var idx = indexOfTerminal(terminals, terminal);
        if (idx < 0) {
            return;
        }
        terminals.splice(idx, 1);
    }

    function removeTerminalFromGroup(terminalGroup, terminal) {
        removeTerminal(terminalGroup.mobileTerminals, terminal);
    }

    function isSingleSelection() {
        var count = selection.selectedMobileTerminals.length;
        for (var i = 0; i < selection.selectedMobileTerminalGroups.length; i++) {
            count += selection.selectedMobileTerminalGroups[i].mobileTerminals.length;
        }

        return count === 1;
    }

	var pollingService = {
        addMobileTerminalToSelection: function(terminal) {
            if (isTerminalSelected(terminal)) {
                return;
            }

            selection.selectedMobileTerminals.push(terminal);
        },
        addMobileTerminalGroupToSelection: function(terminalGroup) {
            if (isTerminalGroupSelected(terminalGroup)) {
                return;
            }

            // Remove any terminal in this group that was individually selected before
            for (var i = 0; i < terminalGroup.mobileTerminals.length; i++) {
                var terminal = terminalGroup.mobileTerminals[i];
                removeTerminal(selection.selectedMobileTerminals, terminal);
            }

            selection.selectedMobileTerminalGroups.push(terminalGroup);
        },
        removeMobileTerminalFromSelection: function(terminalGroup, terminal) {
            if (terminalGroup) {
                if (terminal) {
                    // Remove terminal in group
                    removeTerminalFromGroup(terminalGroup, terminal);
                }
                else {
                    // Remove group itself
                    removeTerminalGroup(selection.selectedMobileTerminalGroups, terminalGroup);
                }
            }
            else if (terminal) {
                // Remove single terminal
                removeTerminal(selection.selectedMobileTerminals, terminal);
            }
        },
        clearSelection : function(){
            selection.selectedMobileTerminals = [];
            selection.selectedMobileTerminalGroups = [];
        },
        getSelection : function(){
            return selection;
        },
        isMobileTerminalSelected: isTerminalSelected,
        isMobileTerminalGroupSelected: isTerminalGroupSelected,
        isSingleSelection: isSingleSelection
    };

	return pollingService;
});