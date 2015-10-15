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
	    this.withMap = true;
	    
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
	
	var convertDate = function(date, direction){
	    //FIXME fetch configs from config service
	    var server_format = 'YYYY-MM-DDTHH:mm:ss';
	    var src_format = 'YYYY-MM-DD HH:mm:ss';
	    
	    if (direction === 'to_server'){
	        if (moment(date, src_format, true).isValid() === true){
	            return moment(date, src_format, true).format(server_format);
	        }
	    } else if(direction === 'from_server') {
	        if (moment(date, server_format, true).isValid() === true){
                return moment(date, server_format, true).format(src_format);
            }
	    }
	};
	
	Report.prototype.fromJson = function(data){
	    var report = new Report();
	    
	    if(data){
	        var filter = data.filterExpression;
	        
	        report.id = data.id;
	        report.name = data.name;
	        report.desc = data.desc;
	        report.withMap = data.withMap;
	        
	        //Common filters
	        report.startDateTime = angular.isDefined(filter.common.startDate) ? convertDate(filter.common.startDate, 'from_server').slice(0,-3) : undefined;
	        report.endDateTime = angular.isDefined(filter.common.endDate) ? convertDate(filter.common.endDate, 'from_server').slice(0, -3) : undefined;
	        report.positionSelector = angular.isDefined(filter.common.positionSelector) ? filter.common.positionSelector : 'all';
	        report.positionTypeSelector = angular.isDefined(filter.common.positionTypeSelector) ? filter.common.positionTypeSelector : 'positions';
	        report.xValue = angular.isDefined(filter.common.xValue) ? filter.common.xValue : undefined;
	        
	        //Vessel filters
	        if (angular.isDefined(filter.vessels)){
	            report.hasVesselFilter = true;
	            report.vesselsSelection = filter.vessels;
	        }
	        
	        //VMS positions filters
	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.vmspositions)){
	            report.vmsFilters.positions = filter.vms.vmspositions;
	        }
	        
	        
//	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.segments)){
//                report.vmsFilters.segments = filter.vms.segments;
//            }
//	        
//	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.tracks)){
//                report.vmsFilters.tracks = filter.vms.tracks;
//            }
//	        
//	        if (!angular.equals({}, filter.vms)){
//	            report.hasVmsFilter = true;
//	            for (var i in filter.vms){
//	                var filterName = 'has' + i.substring(0,1).toUpperCase()+i.substring(1) + 'Filter';
//	                report[filterName] = true;
//	            }
//	        }
//	        
//	        report.areas = filter.areas;
	    }
	    
	    return report;
	};
	
	Report.prototype.toJson = function(){
	    return angular.toJson(this.DTO());
	};
	
	Report.prototype.DTO = function(){
	    var vmsFilters = {};
	    if (this.hasVmsFilter === true){
	        if (this.hasPositionsFilter === true && angular.isDefined(this.vmsFilters.positions)){
	            vmsFilters.vmsposition = this.vmsFilters.positions;
	            vmsFilters.vmsposition.type = 'vmspos';
	        }
	        
	        if (this.hasSegmentsFilter === true && angular.isDefined(this.vmsFilters.segments)){
                vmsFilters.vmssegment = this.vmsFilters.segments;
                vmsFilters.vmssegment.type = 'vmsseg';
            }
	        
	        if (this.hasTracksFilter === true && angular.isDefined(this.vmsFilters.tracks)){
                vmsFilters.vmstrack = this.vmsFilters.tracks;
                vmsFilters.vmstrack.type = 'vmstrack';
            }
	    }
	    
	    var filter = {
	        common: {
	            startDate: convertDate(this.startDateTime, 'to_server'),
	            endDate: convertDate(this.endDateTime, 'to_server'),
	            positionSelector: this.positionSelector,
	            positionTypeSelector: this.positionSelector !== 'all' ? this.positionTypeSelector: undefined,
	            xValue: this.xValue
	        },
            vessels: [],
            vms: vmsFilters,
            areas: this.areas
	    };
	    
	    if (this.hasVesselFilter){
            filter.vessels = this.vesselsSelection;
        }
	    
	    var dto = {
	        id: this.id,
	        name: this.name,
	        desc: this.desc !== '' ? this.desc : undefined,
	        visibility: angular.isDefined(this.visibility) ? this.visibility : 'PRIVATE',
	        withMap: this.withMap,
	        filterExpression: filter
	    };
	    
	    return dto;
	};
	
	return Report;
});