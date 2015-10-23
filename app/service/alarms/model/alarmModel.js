angular.module('unionvmsWeb').factory('Alarm', function(Movement) {

    function Alarm(){
        this.guid = undefined;
        this.status = undefined;
        this.openedDate = undefined;
        this.resolvedDate = undefined;
        this.resolvedBy = undefined;
        this.alarmItems = [];
        this.movement = undefined;
        this.asset = {
            type : undefined,
            ids : {}
        };
        this.vessel = undefined;
    }

    Alarm.fromDTO = function(dto){
        var alarm = new Alarm();
        alarm.guid = dto.guid;
        alarm.status = dto.status;
        alarm.openedDate = dto.openDate;
        alarm.resolvedDate = dto.resolveDate;
        alarm.resolvedBy = dto.resolvedBy;

        //AlarmItem
        var i;
        if (angular.isDefined(dto.alarmItem)) {
            for (i = 0; i < dto.alarmItem.length; i++) {
                alarm.alarmItems.push({guid: dto.alarmItem[i].guid, ruleName: dto.alarmItem[i].ruleName});
            }
        }

        //rawMovement
        var rawMovement = dto.rawMovement;
        if(angular.isDefined(rawMovement)){
            alarm.movement = Movement.fromJson(rawMovement);

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

    Alarm.prototype.setStatusToClosed = function() {
        this.status = "CLOSED";
    };

    Alarm.prototype.setStatusToOpen = function() {
        this.status = "OPEN";
    };

    Alarm.prototype.isOpen = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "OPEN";
    };

    Alarm.prototype.isPending = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "PENDING";
    };

    Alarm.prototype.isClosed = function() {
        return typeof this.status === 'string' && this.status.toUpperCase() === "CLOSED";
    };

    Alarm.prototype.isVesselAsset = function() {
        if(angular.isDefined(this.asset) && angular.isDefined(this.asset.type)){
            return this.asset.type.toUpperCase() === 'VESSEL';
        }
        return false;
    };


    Alarm.prototype.copy = function() {
        var copy = new Alarm();
        copy.guid = this.guid;
        copy.status = this.status;
        copy.openDate = this.openDate;
        copy.resolveDate = this.resolveDate;
        copy.resolveBy = this.resolveBy;
        copy.alarmItems = this.alarmItems;
        copy.movement = this.movement;
        return copy;
    };

    //Check if the Alarm is equal another Alarm
    //Equal means same guid
    Alarm.prototype.equals = function(item) {
        return this.guid === item.guid;
    };

    return Alarm;
});