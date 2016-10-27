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

});