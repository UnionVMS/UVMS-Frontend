angular.module('unionvmsWeb').factory('Report',function() {

	function Report(){
	    this.id = undefined;
	    this.name = undefined;
	    this.desc = undefined;
	    this.startDateTime = undefined;
	    this.endDateTime = undefined;
	    this.positionSelector = 'all';
	    this.positionTypeSelector = 'positions';
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
	        
	        report.id = data.id;
	        report.name = data.name;
	        report.desc = data.desc;
	        report.components = angular.fromJson(data.outComponents); //FIXME
	        report.startDateTime = angular.isDefined(filter.startDate) ? filter.startDate.slice(0, -3) : undefined;
	        report.endDateTime = angular.isDefined(filter.endDate) ? filter.endDate.slice(0, -3) : undefined;
	        report.positionSelector = filter.positionSelector;
	        if (angular.isDefined(filter.positionTypeSelector)){
	            report.positionTypeSelector = filter.positionTypeSelector;
	        }
	        report.xValue = filter.xValue;
	        report.vmsFilters = filter.vmsFilters;
	        report.vesselsSelection = filter.vessels;
	        report.vmsFilters = filter.vms;
	    }
	    
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
            positionTypeSelector: this.positionSelector !== 'all' ? this.positionTypeSelector: undefined,
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