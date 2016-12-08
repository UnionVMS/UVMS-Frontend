/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
describe('visibilityService', function() {
    var visServ;
    
    beforeEach(module('unionvmsWeb'));
  
    beforeEach(inject(function(visibilityService){
        visServ = visibilityService;
    }));
    
    function buildPositionsMock(status){
        return {
            positions: {
                table: {
                    values: {
                        fs: status,
                        extMark: status,
                        ircs: status,
                        cfr: status,
                        name: status,
                        posTime: status,
                        lon: status,
                        lat: status,
                        stat: status,
                        m_spd: status,
                        c_spd: status,
                        crs: status,
                        msg_tp: status,
                        act_tp: status,
                        source: status
                    },
                    order: ['fs','extMark','ircs','cfr','name','posTime','lat','lon','stat','m_spd','c_spd','crs','msg_tp','act_tp','source']
                }
            }
        }
    }
    
    it('should set visibility and order settings by passing a new config object', function(){
        var config = buildPositionsMock(true);
        expect(visServ.positions).toEqual(config.positions.table.values);
        expect(visServ.positionsColumns).toEqual(config.positions.table.order);
        
        config = buildPositionsMock(false);
        config.positions.table.order.reverse();
        visServ.setVisibility(config);
        
        expect(visServ.positions).toEqual(config.positions.table.values);
        expect(visServ.positionsColumns).toEqual(config.positions.table.order);
    });
});
