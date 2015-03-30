angular.module('unionvmsWeb') 
.factory('Vessel', function(EventHistory) {

        function Vessel(data){
            this.active = data.active;
            this.billing = data.billing;
            this.cfr = data.cfr;
            this.countryCode = data.countryCode;
            this.eventHistory = new EventHistory(data.eventHistory);
            this.externalMarking = data.externalMarking;
            this.grossTonnage = data.grossTonnage;
            this.hasIrcs = data.hasIrcs;
            this.hasLicense = data.hasLicense;
            this.homePort = data.homePort;
            this.imo = data.imo;
            this.ircs = data.ircs;
            this.lengthBetweenPerpendiculars = data.lengthBetweenPerpendiculars;
            this.lengthOverAll = data.lengthOverAll;
            this.mmsiNo = data.mmsiNo;
            this.name = data.name;
            this.otherGrossTonnage = data.otherGrossTonnage;
            this.powerAux = data.powerAux;
            this.powerMain = data.powerMain;
            this.safetyGrossTonnage = data.safetyGrossTonnage;
            this.source = data.source;
            this.vesselId = {
                type : data.vesselId.type,
                value : data.vesselId.value,
            };
            this.vesselType = data.vesselType;
        }

        Vessel.prototype.toJson = function(){
            return JSON.stringify({
                active : this.active,
                billing : this.billing,
                cfr : this.cfr,
                countryCode : this.countryCode,
                eventHistory : this.eventHistory.toJson(),
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
                vesselId : {
                    type : this.vesselId.type,
                    value : this.vesselId.value,
                },
                vesselType : this.vesselType
            });
        };

        Vessel.prototype.getId = function() {
            return this.vesselId.value;
        };

        return Vessel;
    });
