angular.module('unionvmsWeb').factory('Report',function() {

	function Report(){
	    this.id = undefined;
	    this.name = undefined;
	    this.desc = undefined;
	    this.startDateTime = undefined;
	    this.endDateTime = undefined;
	    this.positionSelector = 'all';
	    this.xValue = undefined;
	    this.components = {
	        map: true,
	        vms: {
	            table: true,
	            positions: false,
	            segments: false,
	            tracks: false
	        }
	    };
	}
	
	Report.fromJson = function(data){
	    var report = new Report();
	    
	    if(data){
	        report.id = data.id;
	        report.name = data.name;
	        report.desc = data.desc;
	        report.startTime = data.startTime;
	        report.endTime = data.endTime;
	        report.positionSelector = data.positionSelector;
	        report.xValue = data.xValue ? data.xValue : undefined;
	        report.components = {
	            map: data.map,
	            vms: data.vms
	        };
	    }
	    
	    return report;
	};

	return Report;
});