angular.module('unionvmsWeb').controller('SegmentsvisibilityCtrl',function($scope, locale){
		    
	$scope.$watch('configModel.visibilitySettings.segments', function(newVal) {
		if(newVal){
			$scope.configModel.visibilitySettings.segmentTableAttrs = [{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
		        value: 'fs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
		        value: 'extMark'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'), 
		        value: 'ircs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'), 
		        value: 'cfr'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_name'), 
		        value: 'name'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_distance'),
		        value: 'dist'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_duration'), 
		        value: 'dur'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_speed_ground'), 
		        value: 'spd'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_course_ground'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_category'),
		        value: 'cat'
		    }];
		    
		    $scope.configModel.visibilitySettings.segmentPopupAttrs = [{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
		        value: 'fs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
		        value: 'extMark'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'), 
		        value: 'ircs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'), 
		        value: 'cfr'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_name'), 
		        value: 'name'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_distance'),
		        value: 'dist'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_duration'), 
		        value: 'dur'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_speed_ground'), 
		        value: 'spd'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_course_ground'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_category'),
		        value: 'cat'
		    }];
		    
		    $scope.configModel.visibilitySettings.segmentLabelAttrs = [{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_flag_state'),
		        value: 'fs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_external_marking'),
		        value: 'extMark'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_ircs'), 
		        value: 'ircs'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_cfr'), 
		        value: 'cfr'
		    },{
		        title: locale.getString('spatial.reports_form_vessel_search_table_header_name'), 
		        value: 'name'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_distance'),
		        value: 'dist'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_duration'), 
		        value: 'dur'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_speed_ground'), 
		        value: 'spd'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_course_ground'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_seg_table_header_category'),
		        value: 'cat'
		    }];
		    
		    var contentTypes = ['Table','Popup','Label'];
			angular.forEach(contentTypes, function(contentType) {
				var segments = [];
				var segmentVisibilitySettings = $scope.configModel.visibilitySettings.segments[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()]; 
				var segmentVisibilityAttrs = $scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'];
				
				if(segmentVisibilitySettings.order && segmentVisibilitySettings.order.length > 0){
					angular.forEach(segmentVisibilitySettings.order, function(item) {
						for(var i=0;i<segmentVisibilityAttrs.length;i++){
							if(item === segmentVisibilityAttrs[i].value){
								segments.push(segmentVisibilityAttrs[i]);
							}
						}
					});
					angular.copy(segments,segmentVisibilityAttrs);
				}else{
					segmentVisibilitySettings.order = [];
					for(var i=0;i<segmentVisibilityAttrs.length;i++){
						segmentVisibilitySettings.order.push(segmentVisibilityAttrs[i].value);
					}
				}
				
				angular.forEach(segmentVisibilityAttrs, function(item) {
					item.type = contentType;
				});
				
				if(segmentVisibilitySettings.order.length !== segmentVisibilitySettings.values.length){
					$scope.selectAll.segments[contentType.toLowerCase()] = false;
				}
			});
		}
	});

});