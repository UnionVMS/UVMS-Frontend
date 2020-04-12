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
angular.module('unionvmsWeb').factory('MobileTerminalHistory', function(MobileTerminal) {

    function MobileTerminalHistory(){
        this.events = [];
        this.channels = [];
    }

    MobileTerminalHistory.fromJson = function(data){
        var history = new MobileTerminalHistory();
        history.events = angular.copy(data.events);
        for (var index in data.comChannels) {
            var channel = data.comChannels[index];
            var events = channel.channel;
            channel = {"events": events};
            history.channels.push(channel);
        }
        return history;
    };

    return MobileTerminalHistory;
});
