angular.module('unionvmsWeb').controller('VmspanelCtrl',function($scope, locale, globalSettingsService, reportService, mapService, csvWKTService, unitConversionService, vmsVisibilityService, userService){
    $scope.selectedVmsTab = 'MOVEMENTS';
    $scope.isPosFilterVisible = false;
    $scope.isSegFilterVisible = false;
    $scope.isTrackFilterVisible = false;
    $scope.itemsByPage = 25;
    $scope.itemsByPageModal = 15;
    $scope.modalCollapsed = false;
    $scope.executedReport = reportService;
    $scope.startDate = undefined;
    $scope.endDate = undefined;
    $scope.decimalDegrees = true;
    $scope.attrVisibility = vmsVisibilityService;
    
    //Define VMS tabs
    var setVmsTabs = function(){
        return [
                {
                    'tab': 'MOVEMENTS',
                    'title': locale.getString('spatial.tab_movements')
                },
                {
                    'tab': 'SEGMENTS',
                    'title': locale.getString('spatial.tab_segments')
                },
                {
                    'tab': 'TRACKS',
                    'title': locale.getString('spatial.tab_tracks')
                }
            ];
        };
    
        
   locale.ready('spatial').then(function(){
       $scope.vmsTabMenu = setVmsTabs();
   });
   
   $scope.selectVmsTab = function(tab){
       $scope.selectedVmsTab = tab;
       $scope.modalCollapsed = false;
   };
   
   $scope.isVmsTabSelected = function(tab){
       return $scope.selectedVmsTab === tab;
   };
   
   $scope.toggleCollapse = function(){
       $scope.modalCollapsed = !$scope.modalCollapsed;
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
       }
   };
   
   $scope.clearDateFilters = function(){
       $scope.startDate = undefined;
       $scope.endDate = undefined;
   };
   
   //Positions table config
   $scope.displayedPositions = [].concat($scope.executedReport.positions);
   
   //Segments table config
   $scope.displayedSegments = [].concat($scope.executedReport.segments);
   
   //Tracks table config
   $scope.displayedTracks = [].concat($scope.executedReport.tracks);
   
   
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
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.set('GeometryType', 'LineString');
       } else {
           geom = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
       }
       
       geom.transform('EPSG:4326', mapService.getMapProjectionCode());
       if (geomType !== 'TRACK'){
           mapService.highlightFeature(geom);
       } else {
           var trackGeom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, geom.getExtent());
           mapService.highlightFeature(trackGeom);
       }
       
       $scope.modalCollapsed = true;
       mapService.zoomTo(geom);
   };
   
   $scope.panTo = function(index, geomType){
       var coords, geom;
       if (geomType === 'POSITION'){
           coords = ol.proj.transform($scope.displayedPositions[index].geometry.coordinates, 'EPSG:4326', mapService.getMapProjectionCode());
           geom = new ol.geom.Point(coords);
           geom.set('GeometryType', 'Point');
           mapService.highlightFeature(geom);
       } else if (geomType === 'SEGMENT'){
           geom = new ol.geom.LineString($scope.displayedSegments[index].geometry.coordinates);
           geom.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom.set('GeometryType', 'LineString');
           coords = mapService.getMiddlePoint(geom);
           mapService.highlightFeature(geom);
       } else{
           coords = ol.proj.transform($scope.displayedTracks[index].nearestPoint, 'EPSG:4326', mapService.getMapProjectionCode());
           var polyExtent = new ol.geom.Polygon.fromExtent($scope.displayedTracks[index].extent);
           polyExtent.transform('EPSG:4326', mapService.getMapProjectionCode());
           geom = $scope.buildTrackGeomFromId($scope.displayedTracks[index].id, polyExtent.getExtent());
           geom.set('GeometryType', 'MultiLineString');
           mapService.highlightFeature(geom);
       }
       
       $scope.modalCollapsed = true;
       mapService.panTo(coords);
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
       $('#' + selector + ' [name]').each(
           function(index){  
               var input = $(this);
               var value = input.val();
               obj[input.attr('name')] = value;
           }
       );
       
       //Get the dates
       if (angular.isDefined($scope.startDate)){
           obj.startDate = $scope.startDate;
       }
       
       if (angular.isDefined($scope.endDate)){
           obj.endDate = $scope.endDate;
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
	   var wkt;
	   var speedUnit = unitConversionService.speed.getUnit();
       var distanceUnit = unitConversionService.distance.getUnit();
       var geoJson;
	   
	   if(['segments','tracks'].indexOf(type) !== -1){
		   wkt = new ol.format.WKT();
	   }
	   if(type === 'segments'){
		   geoJson = new ol.format.GeoJSON();
	   }
	   
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
			    	   			itemProperty = type === 'tracks'? rec.countryCode : rec.properties.countryCode;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'extMark':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_ext_mark'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.externalMarking : rec.properties.externalMarking;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'ircs':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_ircs'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.ircs : rec.properties.ircs;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'cfr':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_pos_table_header_cfr'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.cfr : rec.properties.cfr;
			    	   			row.push(itemProperty);
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
			    	   				header.push(locale.getString('spatial.tab_vms_seg_table_header_duration'));
			    	   			}
			    	   			itemProperty = type === 'tracks'? rec.duration : rec.properties.duration;
			    	   			row.push(itemProperty);
			    	   			break;
			    	   		case 'timeSea':
			    	   			if(!gotHeaders){
			    	   				header.push(locale.getString('spatial.tab_vms_tracks_table_header_time_at_sea'));
			    	   			}
			    	   			row.push(unitConversionService.duration.timeToHuman(rec.totalTimeAtSea));
			    	   			break;
			    	   }
		    	   }
		       });
			   if((type === 'segments' || (type === 'tracks' && $scope.repnav.isViewVisible('mapPanel'))) && !gotHeaders){
	        	   header.push(locale.getString('spatial.tab_vms_seg_table_header_geometry'));
	           }
	           
	           if (type === 'tracks' && $scope.repnav.isViewVisible('mapPanel')){
	               var extentPolygon = new ol.geom.Polygon.fromExtent(rec.extent);
	               extentPolygon.transform('EPSG:4326', mapService.getMapProjectionCode());
	               var trackGeom = $scope.buildTrackGeomFromId(rec.id, extentPolygon.getExtent());
	               trackGeom.transform(mapService.getMapProjectionCode(), 'EPSG:4326');
	               
	               var geom = null;
	               if (trackGeom.getLineString().getLength() !== 0){
	                   geom = wkt.writeGeometry(trackGeom);
	               }
	               
	               row.push(geom);
	           }   
		   gotHeaders = true;
		   csvObj.push(row);
	       return csvObj;
           }, []
       ), 'header': header};
   };
   
});