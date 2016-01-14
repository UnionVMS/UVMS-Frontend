angular.module('unionvmsWeb').factory('Report',function(globalSettingsService) {
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
	    
	    //Spatial configs
        this.mapConfiguration = {};
	}

	var getDateFormat = function(){
	    return globalSettingsService.getDateFormat();
	};
	
	var getTimeZone = function(){
	    return parseInt(globalSettingsService.getTimezone());
	};

	var convertDate = function(date, direction){
	    var displayFormat = getDateFormat();
	    var src_format = 'YYYY-MM-DD HH:mm:ss Z';
	    var server_format = 'YYYY-MM-DDTHH:mm:ss';

	    if (direction === 'to_server'){
	        if (moment.utc(date, src_format).isValid()){
	            return moment.utc(date, src_format).format(server_format);
	        }
	    } else if(direction === 'from_server') {
	        if (moment.utc(date, server_format).isValid()){
	            return moment.utc(date, server_format).format(displayFormat);
	        }
	    }
	};

	var validateFilterObject = function(filter){
	    var valid = true;
	    var existingFilter = false;
        var isDefined = false;
        for (var i in filter){
            if (i === 'id'){
                existingFilter = true;
            } else if (i !== 'id' && i !== 'type'){
                if (angular.isDefined(filter[i])){
                    isDefined = true;
                }
            }
        }

        if (existingFilter && isDefined === false){
            valid = false;
        }

        return valid;
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
			report.commonFilterId = filter.common.id;
	        report.startDateTime = angular.isDefined(filter.common.startDate) ? convertDate(filter.common.startDate, 'from_server') : undefined;
	        report.endDateTime = angular.isDefined(filter.common.endDate) ? convertDate(filter.common.endDate, 'from_server') : undefined;
	        report.positionSelector = angular.isDefined(filter.common.positionSelector) ? filter.common.positionSelector : 'all';
	        report.positionTypeSelector = angular.isDefined(filter.common.positionTypeSelector) ? filter.common.positionTypeSelector : 'positions';
	        report.xValue = angular.isDefined(filter.common.xValue) ? filter.common.xValue : undefined;

	        //Vessel filters
	        report.vesselsSelection = filter.assets;
	        if (filter.assets.length > 0){
	            report.hasVesselFilter = true;
	        }

	        //VMS positions filters
	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.vmsposition)){
	            report.vmsFilters.positions = filter.vms.vmsposition;
	            report.hasPositionsFilter = true;
	        }


	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.vmssegment)){
                report.vmsFilters.segments = filter.vms.vmssegment;
                report.hasSegmentsFilter = true;
            }

	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.tracks)){
                report.vmsFilters.tracks = filter.vms.tracks;
                report.hasTracksFilter = true;
            }

	        if (!angular.equals({}, filter.vms)){
	            report.hasVmsFilter = true;
	            for (var i in filter.vms){
	                var filterName = 'has' + i.substring(0,1).toUpperCase()+i.substring(1) + 'Filter';
	                report[filterName] = true;
	            }
	        }

	        report.areas = filter.areas;
	        
	        if (angular.isDefined(data.mapConfiguration)){
	            report.mapConfiguration = data.mapConfiguration;
	        }
	        
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
	            vmsFilters.vmsposition.movMinSpeed = vmsFilters.vmsposition.movMinSpeed === null ? undefined : vmsFilters.vmsposition.movMinSpeed;
	            vmsFilters.vmsposition.movMaxSpeed = vmsFilters.vmsposition.movMaxSpeed === null ? undefined : vmsFilters.vmsposition.movMaxSpeed;
	            vmsFilters.vmsposition.type = 'vmspos';

	            if (validateFilterObject(vmsFilters.vmsposition) === false){
	                vmsFilters.vmsposition = undefined;
	            }
	        }

	        if (this.hasSegmentsFilter === true && angular.isDefined(this.vmsFilters.segments)){
                vmsFilters.vmssegment = this.vmsFilters.segments;
                vmsFilters.vmssegment.segMinSpeed = vmsFilters.vmssegment.segMinSpeed === null ? undefined : vmsFilters.vmssegment.segMinSpeed;
                vmsFilters.vmssegment.segMaxSpeed = vmsFilters.vmssegment.segMaxSpeed === null ? undefined : vmsFilters.vmssegment.segMaxSpeed;
                vmsFilters.vmssegment.segMinDuration = vmsFilters.vmssegment.segMinDuration === null ? undefined : vmsFilters.vmssegment.segMinDuration;
                vmsFilters.vmssegment.segMaxDuration = vmsFilters.vmssegment.segMaxDuration === null ? undefined : vmsFilters.vmssegment.segMaxDuration;
                vmsFilters.vmssegment.type = 'vmsseg';

                if (validateFilterObject(vmsFilters.vmssegment) === false){
                    vmsFilters.vmssegment = undefined;
                }
            }

	        if (this.hasTracksFilter === true && angular.isDefined(this.vmsFilters.tracks)){
                vmsFilters.vmstrack = this.vmsFilters.tracks;
                vmsFilters.vmstrack.trkMinTime = vmsFilters.vmstrack.trkMinTime === null ? undefined : vmsFilters.vmstrack.trkMinTime;
                vmsFilters.vmstrack.trkMaxTime = vmsFilters.vmstrack.trkMaxTime === null ? undefined : vmsFilters.vmstrack.trkMaxTime;
                vmsFilters.vmstrack.trkMinDuration = vmsFilters.vmstrack.trkMinDuration === null ? undefined : vmsFilters.vmstrack.trkMinDuration;
                vmsFilters.vmstrack.trkMaxDuration = vmsFilters.vmstrack.trkMaxDuration === null ? undefined : vmsFilters.vmstrack.trkMaxDuration;
                vmsFilters.vmstrack.type = 'vmstrack';

                if (validateFilterObject(vmsFilters.vmstrack) === false){
                    vmsFilters.vmstrack = undefined;
                }
            }
	    }

	    var filter = {
	        common: {
				id: this.commonFilterId,
	            startDate: this.startDateTime === undefined ? undefined : convertDate(this.startDateTime, 'to_server'),
	            endDate: this.endDateTime === undefined ? undefined : convertDate(this.endDateTime, 'to_server'),
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
	    
	    if (this.withMap === true){
	        dto.mapConfiguration = this.mapConfiguration;
	    }
	    
	    return dto;
	};

	return Report;
});
