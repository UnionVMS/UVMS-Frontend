describe('stDateUtc', function() {

    var mockUnitConversionService = {
         date: {
            convertToUserFormat: function() {
                return "2016-10-21 08:28:21";
            }
         }
    };

    beforeEach(module('unionvmsWeb', function () {
      module(function ($provide) {
                $provide.value('unitConversionService', mockUnitConversionService);
              });
            }));

    it('should return converted date', inject(function($filter ) {

        var filter = $filter('stDateUtc');
        var datetime = "2016-10-21T08:28:21";
        expect(filter(datetime)).toEqual("2016-10-21 08:28:21");

    }));

});
