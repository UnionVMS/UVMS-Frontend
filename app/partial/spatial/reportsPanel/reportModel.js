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
	        vms: true
	    };
	    this.vesselsSelection = [];
	    this.vmsFilters = {
            positions: {
                active: false,
                def: undefined
            },
            segments: {
                active: false,
                def: undefined
            },
            tracks: {
                active: false,
                def: undefined
            }     
	    };
	}
	
	Report.prototype.fromJson = function(data){
	    var report = new Report();
	    
	    if(data){
	        var filter = angular.fromJson(data.filterExpression); //FIXME
	        console.log(filter.xValue);
	        
	        report.id = data.id;
	        report.name = data.name;
	        report.desc = data.desc;
	        report.components = angular.fromJson(data.outComponents); //FIXME
	        report.startDateTime = filter.startDate;
	        report.endDateTime = filter.endDate;
	        report.positionSelector = filter.positionSelector;
	        report.xValue = filter.xValue;
	        report.vmsFilters = filter.vmsFilters;
	        report.vesselsSelection = filter.vessels;
	        report.vmsFilters = filter.vms;
	    }
	    
	    console.log(report);
	    
	    return report;
	};
	
	Report.prototype.toJson = function(){
	    return angular.toJson(this.DTO());
	};
	
	Report.prototype.DTO = function(){
	    var filter = {
            startDate: this.startDateTime,
            endDate: this.endDateTime,
            positionSelector: this.positionSelector,
            xValue: this.xValue,
            vessels: this.vesselsSelection,
            vms: this.vmsFilters
	    };
	    
	    var dto = {
	        id: this.id,
	        name: this.name,
	        desc: this.desc !== '' ? this.desc : undefined,
	        visibility: 'PRIVATE', //FIXME
	        scopeId: '123', //FIXME
	        outComponents: angular.toJson(this.components), //FIXME
	        filterExpression: angular.toJson(filter) //FIXME
	    };
	    console.log(dto);
	    return dto;
	};
	
	return Report;
});