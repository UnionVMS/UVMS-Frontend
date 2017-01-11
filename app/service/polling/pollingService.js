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
angular.module('unionvmsWeb').factory('pollingService',function(pollingRestService, Poll, $q, $timeout, dateTimeService, userService) {

    var wizardStep = 1;

    //The selected terminals
    var selection = {
        selectedMobileTerminals : [],
        selectedMobileTerminalGroups : []
    };

    var result = {
        unsentPolls : [],
        sentPolls : [],
        programPoll: false
    };

    var pollingOptions = {};

    function init() {
        resetPollingOptions();
    }

    function indexOfTerminal(xs, x) {
        for (var i = 0; i < xs.length; i++) {
            if (xs[i].isEqual(x)) {
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

    function getSelectedChannels() {
        var selectedMobileTerminalsInGroups = selection.selectedMobileTerminalGroups.reduce(function(list, mtg) {
            return list.concat(mtg.mobileTerminals);
        }, []);

        return selection.selectedMobileTerminals.concat(selectedMobileTerminalsInGroups);
    }

    function getAttr(k, v) {
        return {"key": k, "value": v};
    }

    /* Returns the type of the first selected mobile terminal. */
    function getSelectedMobileTerminalType() {
        var selectedChannels = getSelectedChannels();
        if(selectedChannels.length > 0){
            return selectedChannels[0].mobileTerminalType;
        }
    }

    function isNonZero(value) {
        return value > 0;
    }

    function isNonEmptyString(value) {
        return typeof value === 'string' && value.length > 0; 
    }

    /* Pushes an attribute onto an array, checking validity. */
    function pushAttribute(attrs, key, value, checkFn) {
        if (typeof checkFn === 'function' && !checkFn(value)) {
            return;
        }

        attrs.push(getAttr(key, value));
    }

    function getPollAttributes(type) {
        if (type === "PROGRAM") {
            return [
                getAttr("START_DATE", dateTimeService.formatUTCDateWithTimezone(pollingOptions.programPoll.startDate)),
                getAttr("END_DATE", dateTimeService.formatUTCDateWithTimezone(pollingOptions.programPoll.endDate)),
                getAttr("FREQUENCY", pollingOptions.programPoll.time)
            ];
        }
        else if (type === "CONFIGURATION") {
            var attrs = [];
            switch (getSelectedMobileTerminalType()) {
                case 'INMARSAT_C':
                    pushAttribute(attrs, "GRACE_PERIOD", pollingOptions.configurationPoll.gracePeriod, isNonZero);
                    pushAttribute(attrs, "IN_PORT_GRACE", pollingOptions.configurationPoll.inPortGrace, isNonZero);
                    pushAttribute(attrs, "DNID", pollingOptions.configurationPoll.newDNID, isNonEmptyString);
                    pushAttribute(attrs, "MEMBER_NUMBER", pollingOptions.configurationPoll.newMemberNo, isNonEmptyString);
                    break;
                case 'IRIDIUM':
                pushAttribute(attrs, "REPORT_FREQUENCY", pollingOptions.configurationPoll.freq, isNonZero);
            }

            return attrs;
        }
        else if (type === "SAMPLING") {
            return [
                getAttr("START_DATE", dateTimeService.formatUTCDateWithTimezone(pollingOptions.samplingPoll.startDate)),
                getAttr("END_DATE", dateTimeService.formatUTCDateWithTimezone(pollingOptions.samplingPoll.endDate))
            ];
        }
        else { // type === MANUAL POLL
            return [];
        }
    }

    function getCreatePollsRequestData(selectedChannels) {
        return {
            userName: userService.getUserName(),
            pollType: pollingOptions.type + "_POLL",
            comment: pollingOptions.comment,
            attributes: getPollAttributes(pollingOptions.type),
            mobileTerminals: selectedChannels.map(function(channel) {
               return channel.toCreatePoll();
            })
        };
    }

    function createPolls() {
        var deferred = $q.defer();
        var channels = getSelectedChannels();

        var vesselNamesByConnectId = channels.reduce(function(map, channel) {
            map[channel.connectId] = channel.vesselName;
            return map;
        }, {});

        var requestData = getCreatePollsRequestData(channels);
        pollingRestService.createPolls(requestData).then(function(pollResult) {
            result.sentPolls = pollResult.sentPollGuids;
            result.unsentPolls = pollResult.unsentPollsGuids;
            result.programPoll = requestData.pollType === "PROGRAM_POLL";
            deferred.resolve();
        },
        function(error) {
            console.log("could not create polls: " + error);
            result.sentPolls = [];
            result.unsentPolls = [];
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
        getSelectedChannels: getSelectedChannels,
        createPolls: createPolls,
        getResult: function() {
            return result;
        },
        resetPollingOptions: resetPollingOptions,
        getPollAttributes: getPollAttributes
    };

    init();

    return pollingService;
});