describe('stActivityDateUtc', function() {

    var mockUnitConversionService = {
         date: {
            convertToUserFormat: function(timeInMillisec) {
                return timeInMillisec + 'mock';
            }
         }
    };

    beforeEach(module('unionvmsWeb', function () {
      module(function ($provide) {
                $provide.value('unitConversionService', mockUnitConversionService);
              });
            }));

    it('should ...', inject(function($filter ) {

        var filter = $filter('stActivityDateUtc');
        var datetime = new Date().getTime();
        expect(filter(datetime)).toEqual(new Date(datetime)+'mock');

    }));

});
