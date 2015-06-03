angular.module('unionvmsWeb').factory('pollingService',function(pollingRestService, Poll, $q, $timeout) {

    var wizardStep = 1;

    //The selected terminals
    var selection = {
        selectedMobileTerminals : [],
        selectedMobileTerminalGroups : []
    };

    var result = {
        polls: [],
        sortBy : "",
        sortReverse : "",
        programPoll: false
    };

    var pollingOptions = {};

    function init() {
        resetPollingOptions();
    }

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

        // Last terminal removed from group also removes group
        if (terminalGroup.mobileTerminals.length === 0) {
            removeTerminalGroup(selection.selectedMobileTerminalGroups, terminalGroup);
        }
    }

    function getNumberOfSelectedTerminals(){
        var count = selection.selectedMobileTerminals.length;
        for (var i = 0; i < selection.selectedMobileTerminalGroups.length; i++) {
            count += selection.selectedMobileTerminalGroups[i].mobileTerminals.length;
        }
        return count;        
    }

    function isSingleSelection() {        
        return getNumberOfSelectedTerminals() === 1;
    }

    function getSelectedMobileTerminals() {
        var selectedMobileTerminalsInGroups = selection.selectedMobileTerminalGroups.reduce(function(list, mtg) {
            return list.concat(mtg.mobileTerminals);
        }, []);

        return selection.selectedMobileTerminals.concat(selectedMobileTerminalsInGroups);
    }

    function getAttr(k, v) {
        return {"key": k, "value": v};
    }

    function getPollAttributes(type) {
        if (type === "PROGRAM") {
            return [
                getAttr("START_DATE", addUTCTimeZone(pollingOptions.programPoll.startDate)),
                getAttr("END_DATE", addUTCTimeZone(pollingOptions.programPoll.endDate)),
                getAttr("FREQUENCY", pollingOptions.programPoll.time)
            ];
        }
        else if (type === "CONFIGURATION") {
            return [
                getAttr("REPORT_FREQUENCY", pollingOptions.configurationPoll.freq),
                getAttr("GRACE_PERIOD", pollingOptions.configurationPoll.gracePeriod),
                getAttr("IN_PORT_GRACE", pollingOptions.configurationPoll.inPortGrace),
                getAttr("DNID", pollingOptions.configurationPoll.newDNID),
                getAttr("MEMBER_ID", pollingOptions.configurationPoll.newMemberNo)
            ];
        }
        else if (type === "SAMPLING") {
            return [
                getAttr("START_DATE", addUTCTimeZone(pollingOptions.samplingPoll.startDate)),
                getAttr("END_DATE", addUTCTimeZone(pollingOptions.samplingPoll.endDate))                
            ];
        }
        else { // type === MANUAL POLL
            return [];
        }
    }

    function getCreatePollsRequestData() {
        return {
            userName: "FRONTEND_USER",
            pollType: pollingOptions.type + "_POLL",
            comment: pollingOptions.comment,
            attributes: getPollAttributes(pollingOptions.type),
            mobileTerminals: getSelectedMobileTerminals().map(function(mt) {
               return mt.toCreatePoll();
            })
        };
    }

    function createPolls() {
        var deferred = $q.defer();
        var requestData = getCreatePollsRequestData();
        pollingRestService.createPolls(requestData).then(function(polls) {
            result.polls = polls;
            result.programPoll = requestData.pollType === "PROGRAM_POLL";
            deferred.resolve();
        },
        function(error) {
            console.log("could not create polls: " + error);
            result.polls = [];
            result.programPoll = requestData.pollType === "PROGRAM_POLL";
            deferred.reject();
        });

        return deferred.promise;
    }

    function resetPollingOptions(resetComment) {
        var comment;
        if(!resetComment){
            comment = pollingOptions.comment;
        }

        pollingOptions.type = 'MANUAL';
        pollingOptions.requestChannel = undefined;
        pollingOptions.responseChannel = undefined;
        pollingOptions.comment = comment;
        pollingOptions.programPoll = {};
        pollingOptions.configurationPoll = {};
		pollingOptions.samplingPoll = {};
    }

    function addUTCTimeZone(timeDate){
        return moment(timeDate).format("YYYY-MM-DD HH:mm:ss Z");
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
                removeTerminalGroup(selection.selectedMobileTerminalGroups, terminalGroup);
            }

            // Remove any terminal in this group that was selected before
            for (var i = 0; i < terminalGroup.mobileTerminals.length; i++) {
                var terminal = terminalGroup.mobileTerminals[i];
                removeTerminal(selection.selectedMobileTerminals, terminal);
                for (var j = 0; j < selection.selectedMobileTerminalGroups.length; j++) {
                    removeTerminalFromGroup(selection.selectedMobileTerminalGroups[j], terminal);
                }
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
        getPollingOptions: function() {
            return pollingOptions;
        },
        getWizardStep : function(){
            return wizardStep;
        },
        setWizardStep : function(newStep){
            wizardStep = newStep;
        },
        isMobileTerminalSelected: isTerminalSelected,
        isMobileTerminalGroupSelected: isTerminalGroupSelected,
        isSingleSelection: isSingleSelection,
        getNumberOfSelectedTerminals: getNumberOfSelectedTerminals,
        getSelectedMobileTerminals: getSelectedMobileTerminals,
        createPolls: createPolls,
        getResult: function() {
            return result;
        },
        resetPollingOptions: resetPollingOptions
    };

    init();

    return pollingService;
});