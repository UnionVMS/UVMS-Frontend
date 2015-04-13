describe('CarrierId', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
         carrierType: "VESSEL",
         idType: "IRCS",
         value: "ASDASD"
    };

    it('fromJson should build a correct object', inject(function(CarrierId) {
        var carrierId = CarrierId.fromJson(responseData);
        expect(carrierId.idType).toEqual(responseData.idType);
        expect(carrierId.value).toEqual(responseData.value);
    }));

    it('toJson should return correctly formatted data', inject(function(CarrierId) {
        var carrierId = CarrierId.fromJson(responseData);
        var toJsonObject = JSON.parse(carrierId.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();

    }));

    it('setCarrierTypeToVessel should set carrierType to correct value', inject(function(CarrierId) {
        var carrierId = new CarrierId();
        expect(carrierId.carrierType).toBeUndefined();
        carrierId.setCarrierTypeToVessel();
        expect(carrierId.carrierType).toEqual("VESSEL");

    }));


});
