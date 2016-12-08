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
.factory('EventHistory', function() {

        function EventHistory(){
            this.eventCode = undefined;
            this.eventDate = undefined;
            this.eventId = undefined;
        } 

        EventHistory.fromDTO = function(data){
            var eventHistory = new EventHistory();
            eventHistory.eventCode = data.eventCode;
            eventHistory.eventDate = data.eventDate;
            eventHistory.eventId = data.eventId;
            return eventHistory;
        };
 
        EventHistory.prototype.getFormattedEventDate = function() {
            return moment(this.eventDate).format("YYYY-MM-DD");
        };
 
        EventHistory.prototype.copy = function() {
            var copy = new EventHistory();
            copy.eventCode = this.eventCode;
            copy.eventDate = this.eventDate;
            copy.eventId = this.eventId;
            return copy;
        };

        return EventHistory;
    });