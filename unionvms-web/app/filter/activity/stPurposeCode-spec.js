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
describe('stPurposeCode', function() {

    beforeEach(module('unionvmsWeb'));
    var filter, mockMdrServ;
    
    beforeEach(function(){
        mockMdrServ = jasmine.createSpyObj('mdrCacheService', ['getCodeList']);
        
        module(function($provide){
            $provide.value('mdrCacheService', mockMdrServ);
        });
    });
    
    beforeEach(inject(function($filter){
        filter = $filter('stPurposeCode');
        buildMocks();
    }));
    
    function getCodes(){
        return [{
            "code": "1",
            "description": "Cancellation"
          },{
            "code": "3",
            "description": "Delete"
          },{
            "code": "5",
            "description": "Replacement (correction)"
          },{
            "code": "9",
            "description": "Original report"
          }];
    }
    
    function buildMocks(){
        mockMdrServ.getCodeList.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getCodes());
                }
            };
        });
    }

	it('should get the code description without image', function() {
	    var codes = getCodes();
	    filter(1, false);
	    var result = filter(1, false);
	    
	    expect(mockMdrServ.getCodeList).toHaveBeenCalled();
	    expect(result).toBe(codes[0].description);
	});
	
	it('should get the code description without image by default', function() {
        var codes = getCodes();
        filter(9);
        var result = filter(9);
        
        expect(mockMdrServ.getCodeList).toHaveBeenCalled();
        expect(result).toBe(codes[3].description);
    });
	
	it('should get the font-awesome reference for an input code', function(){
	    var codes = getCodes();
        filter(1, true);
        var result = filter(3, true);
        
        expect(mockMdrServ.getCodeList).toHaveBeenCalled();
        expect(result).toBe('fa-trash-o');
	});
	
	it('should return the code if the filter does not find the a correspondence', function(){
	    var codes = getCodes();
        filter(1, true);
        var result = filter(2, true);
        
        expect(mockMdrServ.getCodeList).toHaveBeenCalled();
        expect(result).toBe(2);
	});
});
