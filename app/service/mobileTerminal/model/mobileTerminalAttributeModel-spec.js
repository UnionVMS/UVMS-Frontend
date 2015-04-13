describe('MobileTerminalAttribute', function() {

  beforeEach(module('unionvmsWeb'));

    var responseData = {
         fieldType: "STARTED_ON",
         value: "2006-04-03"
    };

    it('fromJson should build a correct object', inject(function(MobileTerminalAttribute) {
        var attribute = MobileTerminalAttribute.fromJson(responseData);
        expect(attribute.fieldType).toEqual(responseData.fieldType);
        expect(attribute.value).toEqual(responseData.value);
    }));

    it('toJson should return correctly formatted data', inject(function(MobileTerminalAttribute) {
        var attribute = MobileTerminalAttribute.fromJson(responseData);
        var toJsonObject = JSON.parse(attribute.toJson());
        expect(angular.equals(toJsonObject, responseData)).toBeTruthy();

    }));

});
