angular.module('unionvmsWeb')
.factory('Vessel', function(EventHistory) {

var SOURCE_LOCAL = "LOCAL";

    function Vessel(){
        this.active = true;
        this.source = SOURCE_LOCAL;
        this.hasIrcs = true;
        this.hasLicense = false;
        this.unitOfMessaure = "LONDON";
        this.length = "LOA";
        this.effect ="KW";
    }

    Vessel.fromJson = function(data){
        var vessel = new Vessel();
        vessel.active = data.active;
        vessel.billing = data.billing;
        vessel.cfr = data.cfr;
        vessel.countryCode = data.countryCode;
        if (data.eventHistory) {
            vessel.eventHistory = EventHistory.fromDTO(data.eventHistory);
        }

        vessel.externalMarking = data.externalMarking;
        vessel.grossTonnage = data.grossTonnage;
        vessel.hasIrcs = data.hasIrcs;
        vessel.hasLicense = data.hasLicense;
        vessel.homePort = data.homePort;
        vessel.imo = data.imo;
        vessel.ircs = data.ircs;
        vessel.lengthBetweenPerpendiculars = data.lengthBetweenPerpendiculars;
        vessel.lengthOverAll = data.lengthOverAll;
        vessel.mmsiNo = data.mmsiNo;
        vessel.name = data.name;
        vessel.otherGrossTonnage = data.otherGrossTonnage;
        vessel.powerAux = data.powerAux;
        vessel.powerMain = data.powerMain;
        vessel.safetyGrossTonnage = data.safetyGrossTonnage;
        vessel.source = data.source;
        vessel.vesselId = {
            guid : data.vesselId.guid,
            type : data.vesselId.type,
            value : data.vesselId.value
        };
        vessel.vesselType = data.vesselType;
        vessel.email = data.email;
        vessel.contactName = data.contactName;
        vessel.contactNumber = data.contactNumber;
        return vessel;
    };

    Vessel.prototype.toJson = function(){
        return JSON.stringify(this.DTO());
    };

    Vessel.prototype.DTO = function(){
        var dto = {
            active : this.active,
            billing : this.billing,
            cfr : this.cfr,
            countryCode : this.countryCode,
            externalMarking : this.externalMarking,
            grossTonnage : this.grossTonnage,
            hasIrcs : this.hasIrcs,
            hasLicense : this.hasLicense,
            homePort : this.homePort,
            imo : this.imo,
            ircs : this.ircs,
            lengthBetweenPerpendiculars : this.lengthBetweenPerpendiculars,
            lengthOverAll : this.lengthOverAll,
            mmsiNo : this.mmsiNo,
            name : this.name,
            otherGrossTonnage : this.otherGrossTonnage,
            powerAux : this.powerAux,
            powerMain : this.powerMain,
            safetyGrossTonnage : this.safetyGrossTonnage,
            source : this.source,                
            vesselType : this.vesselType,
            email : this.email,
            contactName : this.contactName,
            contactNumber : this.contactNumber,
        };

        if(angular.isDefined(this.vesselId)){
            dto['vesselId'] = {
                type : this.vesselId.type,
                value : this.vesselId.value,
            };
        }
        
        return dto;
    };

    Vessel.prototype.copy = function() {
        var copy = new Vessel();
        copy.active = this.active;
        copy.billing = this.billing;
        copy.cfr = this.cfr;
        copy.countryCode = this.countryCode;
        if(this.eventHistory){
            copy.eventHistory = this.eventHistory.copy();
        }
        copy.externalMarking = this.externalMarking;
        copy.grossTonnage = this.grossTonnage;
        copy.hasIrcs = this.hasIrcs;
        copy.hasLicense = this.hasLicense;
        copy.homePort = this.homePort;
        copy.imo = this.imo;
        copy.ircs = this.ircs;
        copy.lengthBetweenPerpendiculars = this.lengthBetweenPerpendiculars;
        copy.lengthOverAll = this.lengthOverAll;
        copy.mmsiNo = this.mmsiNo;
        copy.name = this.name;
        copy.otherGrossTonnage = this.otherGrossTonnage;
        copy.powerAux = this.powerAux;
        copy.powerMain = this.powerMain;
        copy.safetyGrossTonnage = this.safetyGrossTonnage;
        copy.source = this.source;
        if(this.vesselId){
            copy.vesselId = {
                guid : this.vesselId.guid,
                type : this.vesselId.type,
                value : this.vesselId.value
            };
        }
        copy.vesselType = this.vesselType;        
        return copy;
    };

    Vessel.prototype.getGuid = function() {
        if(angular.isDefined(this.vesselId)){
            return this.vesselId.guid;
        }
    };

    //Check if the vessel is equal another vessel
    //Equal means same guid
    Vessel.prototype.equals = function(item) {
        return this.vesselId.guid === item.vesselId.guid;
    };

    Vessel.prototype.isLocalSource = function() {
        return this.source.toUpperCase() === SOURCE_LOCAL;
    };


    return Vessel;
});
