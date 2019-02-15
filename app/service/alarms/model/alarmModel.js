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
angular.module('unionvmsWeb').factory('Alarm', function(Movement) {

    function Alarm(){
        this.id = undefined;
        this.status = undefined;
        this.createdDate = undefined;
        this.updated = undefined;
        this.updatedBy = undefined;
        this.alarmItemList = [];
        this.incomingMovement = undefined;
        this.assetGuid = undefined;
        this.pluginType = undefined;
    }

    Alarm.fromDTO = function(dto){
        var alarm = new Alarm();
        alarm.id = dto.id;
        alarm.status = dto.status;
        alarm.createdDate = dto.createdDate;
        alarm.updated = dto.updated;
        alarm.updatedBy = dto.updatedBy;
        alarm.assetGuid = dto.assetGuid;
        alarm.pluginType = dto.pluginType;
        alarm.incomingMovement = dto.incomingMovement;

        //AlarmItem
        var i;
        if (angular.isDefined(dto.alarmItemList)) {
            for (i = 0; i < dto.alarmItemList.length; i++) {
                alarm.alarmItemList.push({guid: dto.alarmItemList[i].id, ruleName: dto.alarmItemList[i].ruleName});
            }
        }
        
        return alarm;
    };

    Alarm.prototype.setStatusToOpen = function() {
        this.status = "OPEN";
    };

    Alarm.prototype.setStatusToReprocessed = function() {
        this.status = "REPROCESSED";
    };

    Alarm.prototype.setStatusToRejected = function() {
        this.status = "REJECTED";
    };

    Alarm.prototype.isOpen = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "OPEN";
    };

    Alarm.prototype.isRejected = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "REJECTED";
    };

    Alarm.prototype.isReprocessed = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "REPROCESSED";
    };

    //Get resolved date. Return updated date if alarm is closed.
    Alarm.prototype.getResolvedDate = function() {
        if(this.isOpen()){
            return;
        }
        return this.updated;
    };

    //Get resolvedBy user. Return updatedBy if alarm is closed.
    Alarm.prototype.getResolvedBy = function() {
        if(this.isOpen()){
            return;
        }
        return this.updatedBy;
    };

    Alarm.prototype.setUpdatedBy = function(updatedBy) {
        this.updatedBy = updatedBy;
    };

    //Used for updating status (accepting/rejecting)
    Alarm.prototype.DTO = function(){
        var dto = {
            id : this.id,
            status: this.status,
        };
        dto.updatedBy = this.updatedBy;

        return dto;
    };

    Alarm.prototype.copy = function() {
        var copy = new Alarm();
        copy.id = this.id;
        copy.status = this.status;
        copy.createdDate = this.createdDate;
        copy.updated = this.updated;
        copy.updatedBy = this.updatedBy;
        for(var i=0; i < this.alarmItemList.length; i++){
            copy.alarmItemList.push(_.clone(this.alarmItemList[i]));
        }
        if(angular.isDefined(this.incomingMovement)){
            copy.incomingMovement = _.clone(this.incomingMovement);
        }
        copy.asset = _.clone(this.asset);
        copy.assetGuid = this.assetGuid;
        copy.pluginType = this.pluginType;

        return copy;
    };

    //Check if the Alarm is equal another Alarm
    //Equal means same guid
    Alarm.prototype.equals = function(item) {
        return this.id === item.id;
    };

    return Alarm;
});