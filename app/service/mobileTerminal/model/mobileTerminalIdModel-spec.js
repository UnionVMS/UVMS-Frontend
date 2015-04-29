describe('MobileTerminalModelId', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
        "systemType": "INMARSAT_C",
        "idList": [
            {
                "type": "SERIAL_NUMBER", 
                "value": "SSE3456"
            }, 
            {
                "type": "INTERNAL_ID", 
                "value": "260"
            }
        ]
    };

    it('create new should set correct values', inject(function(MobileTerminalId) {
        var mobileTerminalId = new MobileTerminalId();

        //MobileTerminalId
        expect(mobileTerminalId.systemType).toBeUndefined();
        expect(mobileTerminalId.ids).toEqual({});
    }));

    it('fromJson should build a correct object', inject(function(MobileTerminalId) {
        var mobileTerminalId = MobileTerminalId.fromJson(responseData);

        expect(mobileTerminalId.systemType).toEqual(responseData.systemType);
        expect(Object.keys(mobileTerminalId.ids).length).toEqual(2);
        expect(mobileTerminalId.ids["SERIAL_NUMBER"]).toEqual("SSE3456");
        expect(mobileTerminalId.ids["INTERNAL_ID"]).toEqual("260");
    }));

    it('toJson should return correctly formatted data', inject(function(MobileTerminalId) {
        var mobileTerminalId = MobileTerminalId.fromJson(responseData);
        var toJsonObject = JSON.parse(mobileTerminalId.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();
    }));

   
    it('setSystemTypeToInmarsatC should set systemType to correct value', inject(function(MobileTerminalId) {
        var mobileTerminalId = new MobileTerminalId();
        expect(mobileTerminalId.systemType).toBeUndefined();
        mobileTerminalId.setSystemTypeToInmarsatC();
        expect(mobileTerminalId.systemType).toEqual("INMARSAT_C");

    }));

    it('isInmarsatC should return true when type is INMARSAT_C', inject(function(MobileTerminalId) {
        var mobileTerminalId = new MobileTerminalId();
        expect(mobileTerminalId.systemType).toBeUndefined();
        mobileTerminalId.setSystemTypeToInmarsatC();
        expect(mobileTerminalId.isInmarsatC()).toBeTruthy();
    }));


});
