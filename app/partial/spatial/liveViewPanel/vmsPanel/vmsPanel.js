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
angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, globalSettingsService, reportService, mapService, csvWKTService, unitConversionService, visibilityService, userService, tripSummaryService, layerPanelService, mdrCacheService){
    $scope.selectedVmsTab = 'MOVEMENTS';
    $scope.isPosFilterVisible = false;
    $scope.isSegFilterVisible = false;
    $scope.isTrackFilterVisible = false;
    $scope.isAlarmFilterVisible = false;
    $scope.isTripFilterVisible = false;
    $scope.itemsByPage = 25;
    $scope.itemsByPageModal = 15;
    $scope.modalCollapsed = false;
    $scope.executedReport = reportService;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    $scope.alarmStartDate = undefined;
    $scope.alarmEndDate = undefined;
    $scope.decimalDegrees = true;
    $scope.attrVisibility = visibilityService;
    $scope.tripSummServ = tripSummaryService;
    $scope.activityTypes = [];
    
    //Define VMS tabs
    var setVmsTabs = function(){
        var tabs = [{
            'tab': 'MOVEMENTS',
            'title': locale.getString('spatial.tab_movements')
        },{
            'tab': 'SEGMENTS',
            'title': locale.getString('spatial.tab_segments')
        },{
            'tab': 'TRACKS',
            'title': locale.getString('spatial.tab_tracks')
        }];
        
        if ($scope.isAllowed('Activity', 'ACTIVITY_ALLOWED')){
            tabs.push({
               'tab': 'TRIPS',
               'title': locale.getString('spatial.tab_trips')
            });
        }
        
        tabs.push({
            'tab': 'ALARMS',
            'title': locale.getString('spatial.tab_alarms')
        });
        
        return tabs;
   };
        
   locale.ready('spatial').then(function(){
       $scope.vmsTabMenu = setVmsTabs();
       $scope.getActivityTypes();
   });
   
   $scope.isTabVisible = function(tab){
       var visible = true;
       if ((tab === 'ALARMS' && $scope.executedReport.alarms && $scope.executedReport.alarms.length === 0) ||
        (tab === 'TRIPS' && $scope.executedReport.trips && $scope.executedReport.trips.length === 0)){
           visible = false;
       }
       
       return visible;
   };
   
   $scope.selectVmsTab = function(tab){
       $scope.selectedVmsTab = tab;
       $scope.modalCollapsed = false;
       angular.element('.vmspanel-modal').removeClass('collapsed');
   };
   
   $scope.isVmsTabSelected = function(tab){
       return $scope.selectedVmsTab === tab;
   };
   
   $scope.toggleCollapse = function(){
       $scope.modalCollapsed = !$scope.modalCollapsed;
       if($scope.modalCollapsed){
           angular.element('.vmspanel-modal').addClass('collapsed');
       }else{
           angular.element('.vmspanel-modal').removeClass('collapsed');
       }
   };
   
   $scope.toggleFiltersRow = function(type){
       switch (type){
           case 'positions':
               $scope.isPosFilterVisible = !$scope.isPosFilterVisible;
               if ($scope.isPosFilterVisible === true){
                   if (globalSettingsService.getCoordinateFormat() === 'decimalDegrees'){
                       $scope.decimalDegrees = true;
                   } else {
                       $scope.decimalDegrees = false;
                   }
               }
               break;
           case 'segments':
               $scope.isSegFilterVisible = !$scope.isSegFilterVisible;
               break;
           case 'tracks':
               $scope.isTrackFilterVisible = !$scope.isTrackFilterVisible;
               break;
           case 'alarms':
               $scope.isAlarmFilterVisible = !$scope.isAlarmFilterVisible;
               break;
           case 'trips':
               $scope.isTripFilterVisible = !$scope.isTripFilterVisible;
               break;
       }
   };
   
   $scope.clearDateFilters = function(){
       if ($scope.selectedVmsTab === 'MOVEMENTS'){
           $scope.startDate = undefined;
           $scope.endDate = undefined;
       } else if ($scope.selectedVmsTab === 'ALARMS'){
           $scope.alarmStartDate = undefined;
           $scope.alarmEndDate = undefined;
       } else if ($scope.selectedVmsTab === 'TRIPS'){
           $scope.firstEventDate = undefined;
           $scope.lastEventDate = undefined;
       }
   };
   
   $scope.clearComboFilters = function(){
       $scope.firstFishingActivityType = undefined;
       $scope.lastFishingActivityType = undefined;
   };
   
   //Positions table config
   $scope.displayedPositions = [].concat($scope.executedReport.positions);
   
   //Segments table config
   $scope.displayedSegments = [].concat($scope.executedReport.segments);
   
   //Tracks table config
   $scope.displayedTracks = [].concat($scope.executedReport.tracks);
   
   //Alarms table config
   $scope.displayedAlarms = [].concat($scope.executedReport.alarms);

   //Alarms table config
   $scope.displayedTrips = [].concat($scope.executedReport.trips);
   
   $scope.getAlarmColor = function(status){
       var style = {'background-color': mapService.getColorByStatus(mapService.styles.alarms, status)}; 
       return style;
   };
   
   $scope.isAllowed = function(module, feature){
       return userService.isAllowed(feature, module, true);
   };
   
   $scope.buildTrackGeomFromId = function(id, extent){
       var segLayer = mapService.getLayerByType('vmsseg');
       if (angular.isDefined(segLayer)){
           var coords = [];
           var counter = 0;
           var layer = mapService.getLayerByType('highlight').getSource();
           layer.clear(true);
           segLayer.getSource().forEachFeatureInExtent(extent, function(feature){
               if (feature.get('trackId') === id){
                   if (feature.getGeometry().getLength() !== 0){
                       coords.push(feature.getGeometry().getCoordinates());
                   }
               }
           });
           
           var geom = new ol.geom.MultiLineString(coords, 'XY');
           geom.set('GeometryType', 'MultiLineString');
           
           return geom;
       }
   };
   
   $scope.zoomTo = function(index, geomType){
       var geom;
       if (geomType === 'POSITION'){
           geom = new ol.geom.Point($scope.displayedPositions[index].geometry.coordinates);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'ALARM'){
           geom = new ol.geom.Point($scope.displayedAlarms[index].geometry.coordinates);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.set('GeometryType', 'LineString');
       } else if (geomType === 'TRACK') {
           geom = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
       } else if (geomType === 'TRIP') {
           var format = new ol.format.WKT();
           geom = format.readFeature($scope.displayedTrips[index].multipointWkt).getGeometry();
           geom.set('GeometryType', 'Point');
       }
       
       if (geomType !== 'ALARM'){
           geom.transform('EPSG:4326', mapService.getMapProjectionCode());
       }
       
       $scope.activateLayer(geomType);
       if (geomType !== 'TRACK'){
           mapService.highlightFeature(geom);
       } else {
           var trackGeom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, geom.getExtent());
           mapService.highlightFeature(trackGeom);
       }
       
       angular.element('.vmspanel-modal').addClass('collapsed');
       $scope.modalCollapsed = true;
       mapService.zoomTo(geom);
   };
   
   $scope.activateLayer = function(lyrType){
       var layerNames = {
           POSITION: 'vmspos',
           SEGMENT: 'vmsseg',
           TRACK: 'vmsseg',
           ALARM: 'alarms',
           TRIP: 'ers'
       };
       
       var layer = mapService.getLayerByType(layerNames[lyrType]);
       if (angular.isDefined(layer) && layer.get('visible') === false){
           layerPanelService.toggleCheckNode(layerNames[lyrType], true);
       }
   };
   
   $scope.panTo = function(index, geomType){
       var coords, geom;
       if (geomType === 'POSITION'){
           coords = ol.proj.transform($scope.displayedPositions[index].geometry.coordinates, 'EPSG:4326', mapService.getMapProjectionCode());
           geom = new ol.geom.Point(coords);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'ALARM'){
           coords = $scope.displayedAlarms[index].geometry.coordinates;
           geom = new ol.geom.Point(coords);
           geom.set('GeometryType', 'Point');
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom.set('GeometryType', 'LineString');
           coords = mapService.getMiddlePoint(geom);
       } else if (geomType === 'TRACK'){
           coords = ol.proj.transform($scope.displayedTracks[index].nearestPoint, 'EPSG:4326', mapService.getMapProjectionCode());
           var polyExtent = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
           polyExtent.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, polyExtent.getExtent());
           geom.set('GeometryType', 'MultiLineString');
       }
       
       $scope.activateLayer(geomType);
       if (geomType !== 'TRACK'){
           mapService.highlightFeature(geom);
       } else {
           var trackGeom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, geom.getExtent());
           mapService.highlightFeature(trackGeom);
       }
       
       angular.element('.vmspanel-modal').addClass('collapsed');
       $scope.modalCollapsed = true;
       mapService.panTo(coords);
   };
   
   $scope.tripIdSort = function(value){
       return value.schemeId + ':' + value.tripId;
   };
   
   $scope.getFilters = function(type){
       var elId = '#' + type + 'Filters';
       
       var formId;
       var valid = true;
       switch (type) {
           case 'positions':
               formId = 'posFiltersForm';
               break;
           case 'segments':
               formId = 'segFiltersForm';
               break;
           case 'tracks':
               formId = 'trackFiltersForm';
               break;
           case 'alarms':
               formId = 'alarmFiltersForm';
               break;
           case 'trip':
               formId = 'tripFiltersForm';
       }
       
       if ($scope.isModal){
           elId += 'Modal';
           formId += 'Modal';
       }
       var el = angular.element(elId);
       
       var data = $scope.getFilterData(formId);
       
       valid = $scope.validateDDMCoords(data);
       
       if (valid){
           el.val(JSON.stringify(data));
           el.trigger('input');
       }
   };
   
   $scope.getFilterData = function(selector){
       var obj = {};
       var comboInputs = ['firstFishingActivity', 'lastFishingActivity'];
       $('#' + selector + ' [name]').each(
           function(index){  
               var input = $(this);
               var value = input.val();
               
               if (_.indexOf(comboInputs, input.attr('name')) !== -1){
                   value = $scope[input.attr('name') + 'Type'];
               }
               
               obj[input.attr('name')] = value;
           }
       );
       
       //Get the dates for positions
       if (selector.indexOf('posFilters') !== -1){
           if (angular.isDefined($scope.startDate)){
               obj.startDate = $scope.startDate;
           }
           
           if (angular.isDefined($scope.endDate)){
               obj.endDate = $scope.endDate;
           }
       }
       
       //Get the dates for alarms
       if (selector.indexOf('alarmFilters') !== -1){
           if (angular.isDefined($scope.alarmStartDate)){
               obj.startDate = $scope.alarmStartDate;
           }
           
           if (angular.isDefined($scope.alarmEndDate)){
               obj.endDate = $scope.alarmEndDate;
           }
       }
       
       if (selector.indexOf('tripFilters') !== -1){
           if (angular.isDefined($scope.firstEventDate)){
               obj.startDate = $scope.firstEventDate;
           }
           
           if (angular.isDefined($scope.lastEventDate)){
               obj.endDate = $scope.lastEventDate;
           }
       }
       
       
       
       obj = _.pick(obj, function(value, key, obj){
           return value !== '';
       });
       
       return obj;
   };
   
   $scope.validateDDMCoords = function(data){
       var keys = _.keys(data);
       var valid = true;
       var i, value, keysToSearch, comps, qtipEl, qtipContent;
       if ($scope.decimalDegrees){
           keysToSearch = ['lon|dd', 'lat|dd'];
           for (i = 0; i < keysToSearch.length; i++){
               $('input[name="' + keysToSearch[i] + '"]:visible').removeClass('coordError');
               qtipEl = '#qtip-' + keysToSearch[i].replace('|', '-') + ' i';
               $(qtipEl).removeClass('hasError');
               if (_.indexOf(keys, keysToSearch[i]) !== -1){
                   value = data[keysToSearch[i]].replace(',', '.');  
                   if (isNaN(value) || (keysToSearch[i] === 'lon|dd' && (value > 180 || value < -180)) || (keysToSearch[i] === 'lat|dd' && (value > 90 || value < -90))){
                       $('input[name="' + keysToSearch[i] + '"]:visible').addClass('coordError');
                       $(qtipEl).addClass('hasError');
                       valid = false;
                   }
               } 
           }
       } else {
           keysToSearch = ['lon|deg', 'lon|min', 'lat|deg', 'lat|min'];
           for (i = 0; i < keysToSearch.length; i++){
               $('input[name="' + keysToSearch[i] + '"]:visible').removeClass('coordError');
               qtipEl = '#qtip-' + keysToSearch[i].split('|')[0] + '-ddm i';
               $(qtipEl).removeClass('hasError');
               if (_.indexOf(keys, keysToSearch[i]) !== -1){
                   comps = keysToSearch[i].split('|');
                   value = data[keysToSearch[i]].replace(',', '.');
                   if (comps[1] === 'deg'){
                       if ( (isNaN(value) || value.indexOf('.') !== -1 || (keysToSearch[i] === 'lon|deg' && (value > 180 || value < -180)) || (keysToSearch[i] === 'lat|deg' && (value > 90 || value < -90))) ){
                           $('input[name="' + keysToSearch[i] + '"]:visible').addClass('coordError');
                           $(qtipEl).addClass('hasError');
                           valid = false;
                       } 
                   } else {
                       if ( isNaN(value) || (value >= 60 || value < 0)){
                           $('input[name="' + keysToSearch[i] + '"]:visible').addClass('coordError');
                           $(qtipEl).addClass('hasError');
                           valid = false;
                       } else {
                           var degKey = keysToSearch[i].replace('min', 'deg');
                           if (!angular.isDefined(data[degKey])){
                               $('input[name="' + degKey + '"]:visible').addClass('coordError');
                               $(qtipEl).addClass('hasError');
                               valid = false;
                           }
                       }
                   }
               }
           }
       }
       
       return valid;
   };
   
   $scope.exportAsCSV = function(type, data){
       var filename, row;
       
       var tableData = getOrderedDataToExport(type,data);
       filename = locale.getString('spatial.tab_vms_export_csv_' + type + '_filename');
       
       //Create and download the file
       if (angular.isDefined(tableData.exportData)){
           csvWKTService.downloadCSVFile(tableData.exportData, tableData.header, filename);
       }
   };
   
   var getOrderedDataToExport = function(type, data){
	   var header = [];
	   var speedUnit = unitConversionService.speed.getUnit();
       var distanceUnit = unitConversionService.distance.getUnit();
       var wkt = new ol.format.WKT();
       var geoJson = new ol.format.GeoJSON();
	   
	   var gotHeaders = false;
       return {'exportData': data.reduce(
           function(csvObj, rec){
        	   var row = [];
			   angular.forEach($scope.attrVisibility[type + 'Columns'], function(item) {
		    	   if($scope.attrVisibility[type][item] === true){
		    		   var itemProperty;
			    	   switch(item){
			    	   		case 'fs': 
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_fs'));
			    	   			}
			    	   			if (type === 'tracks'){
			    	   			    itemProperty = rec.countryCode; 
			    	   			} else if (type === 'alarms'){
			    	   			    itemProperty = rec.properties.fs;
			    	   			} else if (type === 'trips'){
			    	   			    itemProperty = rec.flagState;
			    	   			} else {
			    	   			    itemProperty = rec.properties.countryCode;
			    	   			}
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'extMark':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_ext_mark'));
			    	   			}
			    	   			if (type === 'tracks'){
                                    itemProperty = rec.externalMarking; 
                                } else if (type === 'alarms'){
                                    itemProperty = rec.properties.extMark;
                                } else if (type === 'trips'){
                                    itemProperty = rec.EXT_MARK;
                                } else {
                                    itemProperty = rec.properties.externalMarking;
                                }
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'ircs':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_ircs'));
			    	   			}
			    	   			if (type === 'tracks'){
			    	   			    itemProperty = rec.ircs;
			    	   			} else if (type === 'trips'){
			    	   			    itemProperty = rec.IRCS;
			    	   			} else {
			    	   			    itemProperty = rec.properties.ircs;
			    	   			}
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'cfr':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_cfr'));
			    	   			}
			    	   			if (type === 'tracks'){
                                    itemProperty = rec.cfr;
                                } else if (type === 'trips'){
                                    itemProperty = rec.CFR;
                                } else {
                                    itemProperty = rec.properties.cfr;
                                }
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'uvi':
			    	   		    if (!gotHeaders){
			    	   		        header.push(locale.getString('activity.fa_details_item_uvi'));
			    	   		    }
		    	   		        row.push(rec.UVI);
			    	   		    break;
			    	   		case 'iccat':
                                if (!gotHeaders){
                                    header.push(locale.getString('activity.fa_details_item_iccat'));
                                }
                                row.push(rec.ICCAT);
                                break;
			    	   		case 'gfcm':
                                if (!gotHeaders){
                                    header.push(locale.getString('activity.fa_details_item_gfcm'));
                                }
                                row.push(rec.GFCM);
                                break;
			    	   		case 'name':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_name'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.name : rec.properties.name;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'posTime':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_date'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.positionTime : rec.properties.positionTime;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'lat':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_lat'));
			    	   			}
			    	   			row.push(rec.geometry.coordinates[1]);
			    	   			break;
			    	   		case 'lon':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_lon'));
			    	   			}
			    	   			row.push(rec.geometry.coordinates[0]);
			    	   			break;
			    	   		case 'stat':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_status'));
			    	   			}
			    	   			row.push(rec.properties.status);
			    	   			break;
			    	   		case 'm_spd':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_measured_speed') + '(' + speedUnit + ')');
			    	   			}
			    	   			row.push(rec.properties.reportedSpeed);
			    	   			break;
			    	   		case 'c_spd':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_calculated_speed') + '(' + speedUnit + ')');
			    	   			}
			    	   			row.push(rec.properties.calculatedSpeed);
			    	   			break;
			    	   		case 'crs':
			    	   			if(type === 'positions'){
			    	   				if(!gotHeaders){
			    	   					header.push(locale.getString('spatial.tab_vms_pos_table_header_course') + '(\u00B0)');
			    	   				}
			    	   				row.push(rec.properties.reportedCourse);
			    	   			}else if(type === 'segments'){
			    	   				if(!gotHeaders){
			    	   					header.push(locale.getString('spatial.tab_vms_seg_table_header_course_ground') + '(\u00B0)');
			    	   				}
			    	   				row.push(rec.properties.courseOverGround);
			    	   			}
			    	   			break;
			    	   		case 'msg_tp':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_msg_type'));
			    	   			}
			    	   			row.push(rec.properties.movementType);
			    	   			break;
			    	   		case 'act_tp':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_activity_type'));
			    	   			}
			    	   			row.push(rec.properties.activityType);
			    	   			break;
			    	   		case 'source':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_source'));
			    	   			}
			    	   			row.push(rec.properties.source);
			    	   			break;
			    	   		case 'spd':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_seg_table_header_speed_ground') + '(' + speedUnit + ')');
			    	   			}
			    	   			row.push(rec.properties.speedOverGround);
			    	   			break;
			    	   		case 'cat':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_seg_table_header_category'));
			    	   			}
			    	   			row.push(rec.properties.segmentCategory);
			    	   			break;
			    	   		case 'dist':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_seg_table_header_distance') + '(' + distanceUnit + ')');
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.distance : rec.properties.distance;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'dur':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_seg_table_header_duration') + '(' + locale.getString('spatial.miliseconds') + ')');
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.duration : rec.properties.duration;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'timeSea':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_tracks_table_header_time_at_sea') + '(' + locale.getString('spatial.miliseconds') + ')');
			    	   			}
			    	   			row.push(rec.totalTimeAtSea);
			    	   			break;
			    	   		case 'ruleName':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_table_header_name'));
                                 }
    			    	   		 row.push(rec.properties.ruleName);
			    	   		     break;
			    	   		case 'ruleDesc':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_table_header_desc'));
                                 }
                                 row.push(rec.properties.ruleDesc);
                                 break;
			    	   		case 'ticketOpenDate':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_open_date'));
                                 }
                                 row.push(rec.properties.ticketOpenDate);
                                 break;
			    	   		case 'ticketStatus':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_status'));
                                 }
                                 row.push(rec.properties.ticketStatus);
                                 break;
			    	   		case 'ticketUpdateDate':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_update_date'));
                                 }
                                 row.push(rec.properties.ticketUpdateDate);
                                 break;
			    	   		case 'ticketUpdatedBy':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_updated_by'));
                                 }
                                 row.push(rec.properties.ticketUpdatedBy);
                                 break;
			    	   		case 'ruleDefinitions':
    			    	   		 if(!gotHeaders){
                                     header.push(locale.getString('spatial.rule_definition'));
                                 }
                                 row.push(rec.properties.ruleDefinitions);
                                 break;
			    	   		case 'tripId':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_id'));
                                }
                                row.push(rec.schemeId + ':' + rec.tripId);
                                break;
			    	   		case 'firstEventType':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_first_event'));
                                }
                                row.push(rec.firstFishingActivity);
                                break;
			    	   		case 'firstEventTime':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_first_event_time'));
                                }
                                row.push(rec.firstFishingActivityDateTime);
                                break;
			    	   		case 'lastEventType':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_last_event'));
                                }
                                row.push(rec.lastFishingActivity);
                                break;
                            case 'lastEventTime':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_last_event_time'));
                                }
                                row.push(rec.lastFishingActivityDateTime);
                                break;
                            case 'duration':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_duration') + '(' + locale.getString('spatial.miliseconds') + ')');
                                }
                                row.push(rec.tripDuration);
                                break;
                            case 'nCorrections':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_nCorrections'));
                                }
                                row.push(rec.noOfCorrections);
                                break;
                            case 'nPositions':
                                if(!gotHeaders){
                                    header.push(locale.getString('activity.tab_trip_table_header_nPositions'));
                                }
                                row.push(rec.vmsPositionCount);
                                break;
                            //TODO trip alarms
			    	   }
		    	   }
		       });
			   if((type === 'segments' || (type === 'tracks' && $scope.repNav.isViewVisible('mapPanel'))) && !gotHeaders){
	        	   header.push(locale.getString('spatial.tab_vms_seg_table_header_geometry'));
	           } else if (type === 'alarms' && !gotHeaders){
	               header.push(locale.getString('spatial.tab_vms_pos_table_header_lat'));
	               header.push(locale.getString('spatial.tab_vms_pos_table_header_lon'));
	           }
	           
			   var geom = null;
			   var feature;
	           if (type === 'tracks' && $scope.repNav.isViewVisible('mapPanel')){
	               var extentPolygon = new ol.geom.Polygon.fromExtent(rec.extent);
	               extentPolygon.transform('EPSG:4326', mapService.getMapProjectionCode());
	               var trackGeom = $scope.buildTrackGeomFromId(rec.id, extentPolygon.getExtent());
	               trackGeom.transform(mapService.getMapProjectionCode(), 'EPSG:4326');
	               
	               
	               if (trackGeom.getLineString().getLength() !== 0){
	                   geom = wkt.writeGeometry(trackGeom);
	               }
	               row.push(geom);
	           }  else if (type === 'segments'){
	               feature = geoJson.readFeature(rec);
	               var segGeom = feature.getGeometry();
	               if (segGeom.getLength() !== 0){
	                   geom = wkt.writeGeometry(segGeom);
	               }
	               row.push(geom);
               } else if (type === 'alarms'){
                   feature = geoJson.readFeature(rec);
                   var alarmGeom = feature.getGeometry().transform(mapService.getMapProjectionCode(), 'EPSG:4326');
                   var coords = alarmGeom.getCoordinates();
                   row.push(coords[1]);
                   row.push(coords[0]);
               }
		   gotHeaders = true;
		   csvObj.push(row);
	       return csvObj;
           }, []
       ), 'header': header};
   };
   
   $scope.getActivityTypes = function(){
       mdrCacheService.getCodeList('FLUX_FA_TYPE').then(function(response){
           var suportedCodes = ['DEPARTURE', 'ARRIVAL', 'AREA_ENTRY', 'AREA_EXIT', 'FISHING_OPERATION', 'LANDING', 'DISCARD', 'TRANSHIPMENT', 'RELOCATION', 'JOINED_FISHING_OPERATION'];
           angular.forEach(response, function(rec){
               if (_.indexOf(suportedCodes, rec.code) !== -1){
                   $scope.activityTypes.push({
                       code: rec.code,
                       text: locale.getString('abbreviations.activity_' + rec.code),
                       desc: rec.description
                   });
               }
           });
       }, function(error){
           $scope.attrVisibility.firstEventType = false;
           $scope.attrVisibility.lastEventType = false;
       });
   };

   $scope.openTripSummary = function(tripId){
       $scope.tripSummServ.withMap = $scope.repNav.isViewVisible('mapPanel');
       $scope.tripSummServ.openNewTrip(/*'FRA-TRP-2016122102030'*/tripId);
       $scope.repNav.goToView('tripsPanel','tripSummary');
   };

   $scope.dropSuccess = function(e, item, collection){
       console.log(e);
       console.log(item);
       console.log(collection);
   };
});