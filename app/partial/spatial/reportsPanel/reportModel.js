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
angular.module('unionvmsWeb').factory('Report',function(unitConversionService, userService, locale) { //globalSettingsService,
	function Report(){
	    this.id = undefined;
	    this.name = undefined;
	    this.desc = undefined;
	    this.createdBy = undefined;
	    this.visibility = 'private';
	    this.startDateTime = undefined;
	    this.endDateTime = undefined;
		this.reportType = 'standard';
	    this.positionSelector = 'all';
	    this.positionTypeSelector = 'positions';
	    this.xValue = undefined;

	    //Components
	    this.withMap = true;

	    //Vessel filter
	    this.vesselsSelection = [];

	    //VNS filter
	    this.hasVmsFilter = false;
		this.movSources = [];
	    this.vmsFilters = {
	        positions: {},
	        segments: {},
	        tracks: {}
	    };

		this.hasFaFilter = false;
		this.faFilters = {};

	    this.areas = [];
	    
	    //Spatial configs
        this.mapConfiguration = {
    		stylesSettings: undefined,
	        layerSettings: undefined,
	        visibilitySettings: undefined
        };
        this.currentMapConfig = {
            mapConfiguration: {}   
        };
	}

//	var getDateFormat = function(){
//	    return globalSettingsService.getDateFormat();
//	};
//	
//	var getTimeZone = function(){
//	    return parseInt(globalSettingsService.getTimezone());
//	};
//
//	var convertDate = function(date, direction){
//	    var displayFormat = getDateFormat();
//	    var src_format = 'YYYY-MM-DD HH:mm:ss Z';
//	    var server_format = 'YYYY-MM-DDTHH:mm:ss';
//
//	    if (direction === 'to_server'){
//	        if (moment.utc(date, src_format).isValid()){
//	            return moment.utc(date, src_format).format(server_format);
//	        }
//	    } else if(direction === 'from_server') {
//	        if (moment.utc(date, server_format).isValid()){
//	            return moment.utc(date, server_format).format(displayFormat);
//	        }
//	    }
//	};

	var validateFilterObject = function(filter,isRunningReport){
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

        if ((existingFilter || isRunningReport) && isDefined === false){
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
	        report.createdBy = data.createdBy;
	        report.withMap = data.withMap;
	        report.visibility = data.visibility;
	        
	        if (report.visibility !== 'private' && !userService.isAllowed('SHARE_REPORT_' + report.visibility.toUpperCase(), 'Reporting', true) && !userService.isAllowed('MANAGE_ALL_REPORTS', 'Reporting', true)){
	            report.visibility = 'private';
	        }

	        //Common filters
			report.commonFilterId = filter.common.id;
	        report.startDateTime = angular.isDefined(filter.common.startDate) ? unitConversionService.date.convertDate(filter.common.startDate, 'from_server') : undefined;
	        report.endDateTime = angular.isDefined(filter.common.endDate) ? unitConversionService.date.convertDate(filter.common.endDate, 'from_server') : undefined;
	        report.positionSelector = angular.isDefined(filter.common.positionSelector) ? filter.common.positionSelector : 'all';
	        report.positionTypeSelector = angular.isDefined(filter.common.positionTypeSelector) ? filter.common.positionTypeSelector : 'positions';
	        report.xValue = angular.isDefined(filter.common.xValue) ? filter.common.xValue : undefined;

	        //Vessel filters
	        report.vesselsSelection = filter.assets;
	        
			if(angular.isDefined(data.reportType)){
				report.reportType = data.reportType;
			}

	        //VMS positions filters
	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.vmsposition)){
				if (_.has(filter.vms.vmsposition, 'movsources')){
					report.movSources = filter.vms.vmsposition.movsources;
				}
				delete filter.vms.vmsposition.movsources;
	            report.vmsFilters.positions = filter.vms.vmsposition;
	        }


	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.vmssegment)){
                report.vmsFilters.segments = filter.vms.vmssegment;
            }

	        if (angular.isDefined(filter.vms) && angular.isDefined(filter.vms.tracks)){
                report.vmsFilters.tracks = filter.vms.tracks;
            }

	        if (!angular.equals({}, filter.vms)){
	            report.hasVmsFilter = true;
	            for (var i in filter.vms){
	                var filterName = 'has' + i.substring(0,1).toUpperCase()+i.substring(1) + 'Filter';
	                report[filterName] = true;
	            }
	        }

			//Fishing activity filters
	        if(!angular.isDefined(filter.fa)){
				filter.fa = {};
			}

			report.faFilters = filter.fa;

	        if (!angular.equals({}, filter.fa)){
	            report.hasFaFilter = true;
	        }

			if(!angular.isDefined(report.faFilters.weight)){
				report.faFilters.weight = {unit: 'kg'};
			}else if(!angular.isDefined(report.faFilters.weight.unit)){
				report.faFilters.weight.unit = 'kg';
			}

			if(!angular.isDefined(filter.sort)){
				filter.sort = {};
			}

			report.sortFilters = filter.sort;

	        report.areas = filter.areas;

			if(angular.isDefined(filter.criteria) && filter.criteria.length){
				angular.forEach(filter.criteria, function(item){
					item.text = locale.getString('spatial.criteria_' + item.code.toLowerCase());
				});
			}
			report.sortFilters = filter.criteria;
	        
	        if (angular.isDefined(data.mapConfiguration)){
	        	if(angular.isDefined(data.mapConfiguration.layerSettings) && angular.isDefined(data.mapConfiguration.layerSettings.areaLayers) && !_.isEmpty(data.mapConfiguration.layerSettings.areaLayers)){
	        		angular.forEach(data.mapConfiguration.layerSettings.areaLayers, function(item) {
	        			if(item.areaType === 'areagroup'){
	        				item.name = item.areaGroupName;
	        			}
	        		});
	        	}
	            report.mapConfiguration = data.mapConfiguration;
	            report.currentMapConfig.mapConfiguration = angular.copy(data.mapConfiguration);
	        }
	        
	    }

	    return report;
	};

	Report.prototype.toJson = function(){
	    return angular.toJson(this.DTO());
	};

	Report.prototype.DTO = function(){
	    var vmsFilters = {};
		var hasData = false;

		if(this.hasVmsFilter){
			if ((angular.isDefined(this.vmsFilters.positions) && !_.isEmpty(this.vmsFilters.positions)) || (angular.isDefined(this.movSources) && !_.isEmpty(this.movSources))){
				vmsFilters.vmsposition = this.vmsFilters.positions;
				if (this.movSources.length > 0){
					vmsFilters.vmsposition.movsources = this.movSources; 
				}

				if(angular.isDefined(this.vmsFilters.positions) && !_.isEmpty(this.vmsFilters.positions)){
					vmsFilters.vmsposition.movMinSpeed = vmsFilters.vmsposition.movMinSpeed === null ? undefined : vmsFilters.vmsposition.movMinSpeed;
					vmsFilters.vmsposition.movMaxSpeed = vmsFilters.vmsposition.movMaxSpeed === null ? undefined : vmsFilters.vmsposition.movMaxSpeed;
					vmsFilters.vmsposition.type = 'vmspos';
				}

				if (validateFilterObject(vmsFilters.vmsposition) === false){
					vmsFilters.vmsposition = undefined;
				}
			}

			if (angular.isDefined(this.vmsFilters.segments) && !_.isEmpty(this.vmsFilters.segments)){
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

			if (angular.isDefined(this.vmsFilters.tracks) && !_.isEmpty(this.vmsFilters.tracks)){
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

		//Fishing activity filter
		var faFilters;
		if(this.hasFaFilter){
			faFilters = this.faFilters;

			if(angular.isDefined(faFilters.weight) && (!angular.isDefined(faFilters.weight.min) || _.isNull(faFilters.weight.min)) &&
				(!angular.isDefined(faFilters.weight.max) || _.isNull(faFilters.weight.max))){
				delete faFilters.weight;
			}

			if (_.isEmpty(faFilters)){
				faFilters = undefined;
			}
		}

		var criteria;
		if(angular.isDefined(this.sortFilters) && this.sortFilters.length){
			criteria = [];
			angular.forEach(this.sortFilters, function(item){
				var values;

				if(!angular.isDefined(item.values)){
					values = [item.code];
				}else if(!_.isArray(item.values)){
					values = [item.values];
				}else{
					values = item.values;
				}

				criteria.push({'code': item.code, 'values': values});
			});
		}

	    var filter = {
	        common: {
				id: this.commonFilterId,
	            startDate: this.startDateTime === undefined ? undefined : unitConversionService.date.convertDate(this.startDateTime, 'to_server'),
	            endDate: this.endDateTime === undefined ? undefined : unitConversionService.date.convertDate(this.endDateTime, 'to_server'),
	            positionSelector: this.positionSelector,
	            positionTypeSelector: this.positionSelector !== 'all' ? this.positionTypeSelector: undefined,
	            xValue: this.xValue
	        },
            assets: [],
            vms: vmsFilters,
			fa: faFilters,
            areas: this.areas,
			criteria: criteria
	    };

	    if (angular.isDefined(this.vesselsSelection) && this.vesselsSelection.length){
            filter.assets = this.vesselsSelection;
        }
	    
	    var dto = {
	        id: this.id,
	        name: this.name,
	        desc: this.desc !== '' ? this.desc : undefined,
			reportType: this.reportType,
	        visibility: angular.isDefined(this.visibility) ? this.visibility : 'private',
	        withMap: this.withMap,
	        filterExpression: filter
	    };
	    
	    if(this.withMap === true){
	        dto.mapConfiguration = this.mapConfiguration;
	    }else{
	    	if(angular.isDefined(this.mapConfiguration.spatialConnectId)){
	    		dto.mapConfiguration = {'spatialConnectId': this.mapConfiguration.spatialConnectId};
	    	}
			if(angular.isDefined(this.mapConfiguration.visibilitySettings)){
				if(angular.isDefined(dto.mapConfiguration)){
					dto.mapConfiguration.visibilitySettings = this.mapConfiguration.visibilitySettings;
				}else{
	    			dto.mapConfiguration = {'visibilitySettings': this.mapConfiguration.visibilitySettings};
				}
	    	}
	    }
	    
	    if(angular.isDefined(this.additionalProperties)){
        	dto.additionalProperties = this.additionalProperties;
        }
	    
	    return dto;
	};
	
	Report.prototype.toJsonCopy = function(){
	    return angular.toJson(this.DTOCopy());
	};
	
	Report.prototype.DTOCopy = function(){
		var report = {};
		
        report.name = this.name;
        report.desc = this.desc !== '' ? this.desc : undefined;
		report.reportType = this.reportType;
        report.withMap = this.withMap;
        report.visibility = angular.isDefined(this.visibility) ? this.visibility : 'private';
        
        report.filterExpression = {};
        report.filterExpression.common = {};
        report.filterExpression.common.startDate = this.startDateTime === undefined ? undefined : unitConversionService.date.convertDate(this.startDateTime, 'to_server');
        report.filterExpression.common.endDate = this.endDateTime === undefined ? undefined : unitConversionService.date.convertDate(this.endDateTime, 'to_server');
    	report.filterExpression.common.positionTypeSelector = this.positionTypeSelector;
    	report.filterExpression.common.positionSelector = this.positionSelector;
    	report.filterExpression.common.xValue = this.xValue;
        
        report.filterExpression.areas = [];
        if(angular.isDefined(this.areas) && this.areas.length > 0){
		    angular.forEach(this.areas, function(item) {
		    	report.filterExpression.areas.push({
		    		'gid': item.gid,
		    		'areaType': item.areaType
		    	});
		    });
        }
        
        if (angular.isDefined(this.vesselsSelection) && this.vesselsSelection.length){
        	report.filterExpression.assets = [];
            angular.forEach(this.vesselsSelection, function(item) {
            	report.filterExpression.assets.push({
            		'guid': item.guid,
            		'name': item.name,
            		'type': item.type
            	});
            });
        }
        
		if(this.hasVmsFilter){
        	report.filterExpression.vms = {};
			if ((angular.isDefined(this.vmsFilters.positions) && !_.isEmpty(this.vmsFilters.positions)) || (angular.isDefined(this.movSources) && !_.isEmpty(this.movSources))){
				if(angular.isDefined(this.vmsFilters.positions) && !_.isEmpty(this.vmsFilters.positions)){
					report.filterExpression.vms.vmsposition = {
						movActivity: this.vmsFilters.positions.movActivity === null ? undefined : this.vmsFilters.positions.movActivity,
						movMaxSpeed: this.vmsFilters.positions.movMaxSpeed === null ? undefined : this.vmsFilters.positions.movMaxSpeed,
						movMinSpeed: this.vmsFilters.positions.movMinSpeed === null ? undefined : this.vmsFilters.positions.movMinSpeed,
						movsources: this.vmsFilters.positions.movsources === null ? undefined : this.vmsFilters.positions.movsources,
						movType: this.vmsFilters.positions.movType === null ? undefined : this.vmsFilters.positions.movType,
						type: "vmspos"
					};
				}
				
				if (this.movSources.length > 0){
					if(!angular.isDefined(report.filterExpression.vms.vmsposition)){
						report.filterExpression.vms.vmsposition = {};
					}
					report.filterExpression.vms.vmsposition.movsources = this.movSources; 
				}
				if (validateFilterObject(report.filterExpression.vms.vmsposition,true) === false){
					report.filterExpression.vms.vmsposition = undefined;
				}
			}

			if(this.hasSegmentsFilter === true && angular.isDefined(this.vmsFilters.segments)){
				report.filterExpression.vms.vmssegment = {
					segCategory: this.vmsFilters.segments.segCategory === null ? undefined : this.vmsFilters.segments.segCategory,
					segMaxDuration: this.vmsFilters.segments.segMaxDuration === null ? undefined : this.vmsFilters.segments.segMaxDuration,
					segMaxSpeed: this.vmsFilters.segments.segMaxSpeed === null ? undefined : this.vmsFilters.segments.segMaxSpeed,
					segMinDuration: this.vmsFilters.segments.segMinDuration === null ? undefined : this.vmsFilters.segments.segMinDuration,
					segMinSpeed: this.vmsFilters.segments.segMinSpeed === null ? undefined : this.vmsFilters.segments.segMinSpeed,
					type: "vmsseg"
				};
				if (validateFilterObject(report.filterExpression.vms.vmssegment,true) === false){
					report.filterExpression.vms.vmssegment = undefined;
				}
			}

			if (angular.isDefined(this.vmsFilters.tracks) && !_.isEmpty(this.vmsFilters.tracks)){
				report.filterExpression.vms.vmstrack = {
					trkMaxDuration: this.vmsFilters.tracks.trkMaxDuration === null ? undefined : this.vmsFilters.tracks.trkMaxDuration,
					trkMaxTime: this.vmsFilters.tracks.trkMaxTime === null ? undefined : this.vmsFilters.tracks.trkMaxTime,
					trkMinDuration: this.vmsFilters.tracks.trkMinDuration === null ? undefined : this.vmsFilters.tracks.trkMinDuration,
					trkMinTime: this.vmsFilters.tracks.trkMinTime === null ? undefined : this.vmsFilters.tracks.trkMinTime,
					type: "vmstrack"
				};
			}
			if (validateFilterObject(report.filterExpression.vms.vmstrack,true) === false){
				report.filterExpression.vms.vmstrack = undefined;
			}
		}

		//Fishing activity filter
		if(this.hasFaFilter){
			report.filterExpression.fa = this.faFilters;

			if(angular.isDefined(report.filterExpression.fa.weight) && (!angular.isDefined(report.filterExpression.fa.weight.min) || _.isNull(report.filterExpression.fa.weight.min)) &&
				(!angular.isDefined(report.filterExpression.fa.weight.max) || _.isNull(report.filterExpression.fa.weight.max))){
				delete report.filterExpression.fa.weight;
			}

			if (_.isEmpty(report.filterExpression.fa)){
				report.filterExpression.fa = undefined;
			}
		}

		var criteria;
		if(angular.isDefined(this.sortFilters) && this.sortFilters.length){
			criteria = [];
			angular.forEach(this.sortFilters, function(item){
				var values;

				if(!angular.isDefined(item.values)){
					values = [item.code];
				}else if(!_.isArray(item.values)){
					values = [item.values];
				}else{
					values = item.values;
				}

				criteria.push({'code': item.code, 'values': values});
			});
		}
		report.filterExpression.criteria = criteria;

        if(this.withMap === true){
        	report.mapConfiguration = {
        		coordinatesFormat: this.mapConfiguration.coordinatesFormat,
            	displayProjectionId: this.mapConfiguration.displayProjectionId,
            	mapProjectionId: this.mapConfiguration.mapProjectionId,
            	scaleBarUnits: this.mapConfiguration.scaleBarUnits,
            	stylesSettings: this.mapConfiguration.stylesSettings,
            	visibilitySettings: this.mapConfiguration.visibilitySettings,
            	layerSettings: this.mapConfiguration.layerSettings
            };
        }else{
        	if(angular.isDefined(this.mapConfiguration.spatialConnectId)){
        		report.mapConfiguration = {'spatialConnectId': this.mapConfiguration.spatialConnectId};
        	}
			if(angular.isDefined(this.mapConfiguration.visibilitySettings)){
				if(angular.isDefined(report.mapConfiguration)){
					report.mapConfiguration.visibilitySettings = this.mapConfiguration.visibilitySettings;
				}else{
	    			report.mapConfiguration = {'visibilitySettings': this.mapConfiguration.visibilitySettings};
				}
	    	}
	    }
        
        if(angular.isDefined(this.additionalProperties)){
        	report.additionalProperties = this.additionalProperties;
        }
        
	    return report;
	};

	return Report;
});

