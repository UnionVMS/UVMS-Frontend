describe('stSpeedUnit', function() {

    var mockUnitConversionService = {
         speed: {
            formatSpeed: function() {
                return "220.21 mockspeed";
            }
         }
    };

    beforeEach(module('unionvmsWeb', function () {
      module(function ($provide) {
                $provide.value('unitConversionService', mockUnitConversionService);
              });
            }));

    it('should return formatted speed', inject(function($filter ) {

        var filter = $filter('stSpeedUnit');
        var speed = "220.21456";
        var decimalPlaces = "2";

        expect(filter(speed, decimalPlaces)).toEqual("220.21 mockspeed");

    }));

});
