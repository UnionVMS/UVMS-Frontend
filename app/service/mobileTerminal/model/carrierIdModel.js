angular.module('unionvmsWeb')
.factory('CarrierId', function(EventHistory) {

        function CarrierId(){
        }

        CarrierId.fromJson = function(data){
            var carrierId = new CarrierId();
            carrierId.carrierType = data.carrierType;
            carrierId.idType = data.idType;
            carrierId.value = data.value;
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