/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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