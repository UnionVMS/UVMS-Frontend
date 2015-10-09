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
	    //Components
//	    this.includeMap = true | false
	    this.components = {
	        map: true
	    };
	    //Vessel filter
	    this.vesselsSelection = [];
	    this.hasVesselFilter = false;
	    
	    //VNS filter
	    this.hasVmsFilter = false;
	    this.hasPositionsFilter = false;
	    this.hasSegmentsFilter = false;
	    this.hasTracksFilter = false;
	    this.vmsFilters = {
	        positions: undefined,
	        segments: undefined,
	        tracks: undefined
	    };
	    this.areas = [];
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
	        report.vesselsSelection = filter.vessels;
	        report.hasVesselFilter = filter.vessels.length === 0 ? false : true;
	        
	        if (angular.isDefined(filter.vms.positions)){
	            report.vmsFilters.positions = filter.vms.positions[0];
	        }
	        
	        if (angular.isDefined(filter.vms.segments)){
                report.vmsFilters.segments = filter.vms.segments[0];
            }
	        
	        if (angular.isDefined(filter.vms.tracks)){
                report.vmsFilters.tracks = filter.vms.tracks[0];
            }
	        
	        if (!angular.equals({}, filter.vms)){
	            report.hasVmsFilter = true;
	            for (var i in filter.vms){
	                var filterName = 'has' + i.substring(0,1).toUpperCase()+i.substring(1) + 'Filter';
	                report[filterName] = true;
	            }
	        }
	        
	        report.areas = filter.areas;
	    }
	    
	    return report;
	};
	
	Report.prototype.toJson = function(){
	    console.log(angular.toJson(this.DTO()));
	    return angular.toJson(this.DTO());
	};
	
	Report.prototype.DTO = function(){
	    var vmsFilters = {};
	    if (this.hasVmsFilter === true){
	        if (this.hasPositionsFilter === true && angular.isDefined(this.vmsFilters.positions)){
	            vmsFilters.positions = [this.vmsFilters.positions];
	        }
	        
	        if (this.hasSegmentsFilter === true && angular.isDefined(this.vmsFilters.segments)){
                vmsFilters.segments = [this.vmsFilters.segments];
            }
	        
	        if (this.hasTracksFilter === true && angular.isDefined(this.vmsFilters.tracks)){
                vmsFilters.tracks = [this.vmsFilters.tracks];
            }
	    }
	    
	    var filter = {
            startDate: this.startDateTime,
            endDate: this.endDateTime,
            positionSelector: this.positionSelector,
            positionTypeSelector: this.positionSelector !== 'all' ? this.positionTypeSelector: undefined,
            xValue: this.xValue,
            vessels: this.vesselsSelection,
            vms: vmsFilters,
            areas: this.areas
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
	    
	    return dto;
	};
	
	return Report;
});