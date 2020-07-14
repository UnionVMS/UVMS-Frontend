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
        this.guid = undefined;
        this.status = undefined;
        this.openDate = undefined;
        this.updated = undefined;
        this.updatedBy = undefined;
        this.alarmItems = [];
        this.movement = undefined;
        this.asset = {
            type : undefined,
            ids : {}
        };
        this.vesselGuid = undefined;
        this.recipient = undefined;
        this.vessel = undefined;
        this.placeholderVessel = undefined;
    }

    Alarm.fromDTO = function(dto){
        var alarm = new Alarm();
        alarm.guid = dto.guid;
        alarm.status = dto.status;
        alarm.openDate = dto.openDate;
        alarm.updated = dto.updated;
        alarm.updatedBy = dto.updatedBy;
        alarm.vesselGuid = dto.assetGuid;
        alarm.recipient = dto.recipient;

        //AlarmItem
        var i;
        if (angular.isDefined(dto.alarmItem)) {
            for (i = 0; i < dto.alarmItem.length; i++) {
                alarm.alarmItems.push({guid: dto.alarmItem[i].guid, ruleName: dto.alarmItem[i].ruleName, ruleGuid: dto.alarmItem[i].ruleGuid});
            }
        }

        //rawMovement
        var rawMovement = dto.rawMovement;
        if(rawMovement != null){
            alarm.movement = Movement.fromJson(rawMovement);
            alarm.movement.externalMarking = rawMovement.externalMarking;
            alarm.movement.flagState = rawMovement.flagState;
            alarm.movement.assetName = rawMovement.assetName;

            //AssetID
            var assetId = rawMovement.assetId;
            if(angular.isDefined(assetId)){
                alarm.asset.type = assetId.assetType;

                for (i = 0; i < assetId.assetIdList.length; i++) {
                    alarm.asset.ids[assetId.assetIdList[i].idType.toUpperCase()] = assetId.assetIdList[i].value;
                }
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
            guid : this.guid,
            status: this.status,
        };
        dto.updatedBy = this.updatedBy;

        //Hide for now
        /*if(angular.isDefined(this.placeholderVessel)){
            dto.linkedVesselGuid = this.placeholderVessel.getGuid();
        }*/
        return dto;
    };

    Alarm.prototype.copy = function() {
        var copy = new Alarm();
        copy.guid = this.guid;
        copy.status = this.status;
        copy.openDate = this.openDate;
        copy.updated = this.updated;
        copy.updatedBy = this.updatedBy;
        for(var i=0; i < this.alarmItems.length; i++){
            copy.alarmItems.push(_.clone(this.alarmItems[i]));
        }
        if(angular.isDefined(this.movement)){
            copy.movement = this.movement.copy();
            copy.movement.flagState = this.movement.flagState;
            copy.movement.externalMarking = this.movement.externalMarking;
            copy.movement.assetName = this.movement.assetName;
        }
        copy.asset = _.clone(this.asset);
        copy.vesselGuid = this.vesselGuid;
        copy.recipient = this.recipient;
        if(angular.isDefined(this.vessel)){
            copy.vessel = this.vessel.copy();
        }
        if(angular.isDefined(this.placeholderVessel)){
            copy.placeholderVessel = this.placeholderVessel.copy();
        }
        return copy;
    };

    //Check if the Alarm is equal another Alarm
    //Equal means same guid
    Alarm.prototype.equals = function(item) {
        return this.guid === item.guid;
    };

    return Alarm;
});
