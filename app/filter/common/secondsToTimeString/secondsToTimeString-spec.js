describe('secondsToTimeString', function() {

    beforeEach(module('unionvmsWeb'));


  var locale;

    beforeEach(function() {
        locale = {
            getString : function(s){
                if(s === 'common.time_second_short'){
                    return 's';
                }
                else if(s === 'common.time_minute_short'){
                    return 'min';
                }         
                else if(s === 'common.time_hour_short'){
                    return 'h';
                }                          
            }
          };

        module(function ($provide) {
          $provide.value('locale', locale);
        });          
      });

    it('should return correct time strings', inject(function($filter) {

        var filter = $filter('secondsToTimeString');

        expect(filter('3600')).toEqual('1h');
        expect(filter('1800')).toEqual('30 min');
        expect(filter('5400')).toEqual('1h 30 min');
        expect(filter('24')).toEqual('24 s');

    }));

});