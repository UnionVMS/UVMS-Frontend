describe('stDistanceUnit', function() {

    var mockUnitConversionService = {
         distance: {
            formatDistance: function() {
                return "220.21 mocksdistanceunit";
            }
         }
    };

    beforeEach(module('unionvmsWeb', function () {
      module(function ($provide) {
                $provide.value('unitConversionService', mockUnitConversionService);
              });
            }));

    it('should return formatted distance', inject(function($filter ) {

        var filter = $filter('stDistanceUnit');
        var distance = "220.21456 smth";
        var decimalPlaces = "2";

        expect(filter(distance, decimalPlaces)).toEqual("220.21 mocksdistanceunit");

    }));

});
