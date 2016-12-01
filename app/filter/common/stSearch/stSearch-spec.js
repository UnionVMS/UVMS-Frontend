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
describe('stSearch', function() {

	var filter;
	
	beforeEach(module('unionvmsWeb'));
	
	beforeEach(inject(function($filter){
		filter = $filter('stSearch');
	}));
	
	function makeArray(){
		return [{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r1 description",
			executedOn: "2016-10-26T09:01:38",
			name: "r11"
		},{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r1 description",
			executedOn: "2016-10-26T09:01:38",
			name: "r1"
		},{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r2 description",
			executedOn: "2016-10-26T08:28:16",
			name: "r2"
		}];
	}

	function makePredictedObj(searchStr){
		return "name|desc|createdOn|createdBy|executedOn|visibility|" + searchStr;
	}	
	
	it('should return filtered results with multiple matches', function() {
		var srcData = makeArray();
		var predictedObj = makePredictedObj("r1");
		var result = [{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r1 description",
			executedOn: "2016-10-26T09:01:38",
			name: "r11"
		},{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r1 description",
			executedOn: "2016-10-26T09:01:38",
			name: "r1"
		}];
        
        expect(filter(srcData, predictedObj)).toEqual(result);
		expect(filter(srcData, predictedObj)).toEqual(jasmine.any(Array));
		expect(filter(srcData, predictedObj).length).toEqual(2);
	});
	
	it('should return filtered results with a single result', function() {
		var srcData = makeArray();
		var predictedObj = makePredictedObj("r2");
		var result = [{
			createdBy: "rep_power",
			createdOn: "2016-10-26T08:27:54",
			desc: "r2 description",
			executedOn: "2016-10-26T08:28:16",
			name: "r2"
		}];
        
        expect(filter(srcData, predictedObj)).toEqual(result);
		expect(filter(srcData, predictedObj)).toEqual(jasmine.any(Array));
		expect(filter(srcData, predictedObj).length).toEqual(1);
	});
	
	it('should return empty array if input search string is not found in the data', function() {
		var srcData = makeArray();
		var predictedObj = makePredictedObj("testing");
        
		expect(filter(srcData, predictedObj)).toEqual(jasmine.any(Array));
		expect(filter(srcData, predictedObj).length).toEqual(0);
	});
	
	it('should return the source array if input is undefined', function(){
	    var srcData = makeArray();
	    var predictedObj = makePredictedObj('undefined');
	    
	    expect(filter(srcData, predictedObj)).toEqual(jasmine.any(Array));
	    expect(filter(srcData, predictedObj)).toEqual(srcData);
	});
	
	it('should return the source array if input is empty', function(){
        var srcData = makeArray();
        var predictedObj = makePredictedObj(''); 
        
        expect(filter(srcData, predictedObj)).toEqual(jasmine.any(Array));
        expect(filter(srcData, predictedObj)).toEqual(srcData);
    });

});
