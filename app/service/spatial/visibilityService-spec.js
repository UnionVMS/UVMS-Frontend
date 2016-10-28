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