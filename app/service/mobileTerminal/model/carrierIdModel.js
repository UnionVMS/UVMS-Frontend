angular.module('unionvmsWeb')
.factory('CarrierId', function(EventHistory) {

    var CARRIER_TYPE_VESSEL ="VESSEL";

    function CarrierId(){
    }

    CarrierId.fromJson = function(data){
        var carrierId = new CarrierId();
        carrierId.carrierType = data.carrierType;
        carrierId.idType = data.idType;
        carrierId.value = data.value;
        return carrierId;
    };

    CarrierId.createVesselWithInternalId = function(internalId){
        var carrierId = new CarrierId();
        carrierId.carrierType = CARRIER_TYPE_VESSEL;
        carrierId.idType = "ID";
        carrierId.value = internalId;
        return carrierId;
    };

    CarrierId.prototype.toJson = function(){
        return JSON.stringify({
            carrierType : this.carrierType,
            idType : this.idType,
            value : this.value,
        });
    };

    CarrierId.prototype.setCarrierTypeToVessel = function(){
        this.carrierType = "VESSEL";
    };

    return CarrierId;
});