angular.module('unionvmsWeb')
.factory('CarrierId', function() {

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

    CarrierId.createVesselWithIrcs = function(ircs){
        var carrierId = new CarrierId();
        carrierId.carrierType = CARRIER_TYPE_VESSEL;
        carrierId.idType = "IRCS";
        carrierId.value = ircs;
        return carrierId;
    };

    CarrierId.prototype.toJson = function(){
        return JSON.stringify({
            carrierType : this.carrierType,
            idType : this.idType,
            value : this.value,
        });
    };

    CarrierId.prototype.copy = function() {
        var copy = new CarrierId();
        copy.carrierType = this.carrierType;
        copy.idType = this.idType;
        copy.value = this.value;
        return copy;
    };


    CarrierId.prototype.equals = function(item) {
        return this.carrierType === item.carrierType && this.idType === item.idType && this.value === item.value;
    };

    CarrierId.prototype.setCarrierTypeToVessel = function(){
        this.carrierType = "VESSEL";
    };

    return CarrierId;
});