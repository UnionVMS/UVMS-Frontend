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
				angular.forEach($scope.configModel.visibilitySettings.positions[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()].order, function(item) {
					for(var i=0;i<$scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'].length;i++){
						if(item === $scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'][i].value){
							segments.push($scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'][i]);
						}
					}
				});
				angular.copy(segments,$scope.configModel.visibilitySettings['segment' + contentType + 'Attrs']);
				angular.forEach($scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'], function(item) {
					item.type = contentType;
				});
			});
		}
	});

});