angular.module('unionvmsWeb')
.factory('Vessel', function(EventHistory) {

        function Vessel(){
        }

        Vessel.fromJson = function(data){
            var vessel = new Vessel();
            vessel.active = data.active;
            vessel.billing = data.billing;
            vessel.cfr = data.cfr;
            vessel.countryCode = data.countryCode;
            vessel.eventHistory = new EventHistory(data.eventHistory);
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
                type : data.vesselId.type,
                value : data.vesselId.value
            };
            vessel.vesselType = data.vesselType;
            return vessel;
        };

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
