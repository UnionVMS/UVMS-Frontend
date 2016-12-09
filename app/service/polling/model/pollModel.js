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
angular.module('unionvmsWeb')
.factory('Poll', function(locale) {

    function Poll(){
        this.id = undefined;
        this.type = undefined;
        this.comment = undefined;
        this.mobileTerminalId = undefined;
        this.connectionId = undefined;
        this.attributes = {};
    }

    Poll.fromAttributeList = function(attrs) {
        var poll = new Poll();
        for (var i = 0; i < attrs.length; i++) {
            var attr = attrs[i];
            poll.attributes[attr["key"]] = attr["value"];
        }

        poll.id = poll.attributes.POLL_ID;
        poll.type = poll.attributes.POLL_TYPE;
        poll.comment = poll.attributes.POLL_COMMENT;
        poll.startDate = poll.attributes.START_DATE;
        poll.endDate = poll.attributes.END_DATE;
        poll.connectionId = poll.attributes.CONNECTION_ID;
        return poll;
    };

    //Is this used?
    Poll.fromJson = function(data){
        var poll = new Poll();

        poll.id = data.pollId;
        poll.type = data.pollType;
        poll.comment = data.comment;

        //Mobile terminal
        poll.mobileTerminalId = data.mobileTerminal;

        //Attributes
        $.each(data.attributes, function(index, attribute){
            poll.attributes[attribute.key] = attribute.value;
        });


        return poll;
    };

    Poll.prototype.setVessel= function(vessel) {
        this.vessel = vessel;
    };

    return Poll;
});