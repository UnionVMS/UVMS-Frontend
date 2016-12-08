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
angular.module('unionvmsWeb').factory('ExchangePoll', function(PollStatus) {

    function ExchangePoll(){
        this.guid = undefined;
        this.pollGuid = undefined;
        this.identifier = undefined;
        this.history = [];
    }

    ExchangePoll.fromDTO = function(dto){
        var exchangePoll = new ExchangePoll();
        exchangePoll.guid = dto.guid;
        exchangePoll.identifier = dto.identifier;
        if(angular.isDefined(dto.typeRef)){
            exchangePoll.pollGuid = dto.typeRef.refGuid;
        }

        if(angular.isDefined(dto.history)){
            for (var i = 0; i < dto.history.length; i++) {
                exchangePoll.history.push(PollStatus.fromDTO(dto.history[i]));
            }
        }

        return exchangePoll;
    };

    return ExchangePoll;
});