angular.module('unionvmsWeb').controller('PositionsvisibilityCtrl',function($scope, locale){
    
	$scope.$watch('configModel.visibilitySettings.positions', function(newVal) {
		if(newVal){
			
			$scope.configModel.visibilitySettings.positionTableAttrs = [{
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
		        title: locale.getString('spatial.tab_vms_pos_table_header_date'),
		        value: 'posTime'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lon'), 
		        value: 'lon'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lat'),
		        value: 'lat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_status'),
		        value: 'stat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_measured_speed'), 
		        value: 'm_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_calculated_speed'), 
		        value: 'c_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_course'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_msg_type'),
		        value: 'msg_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_activity_type'),
		        value: 'act_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_source'),
		        value: 'source'
		    }];
			
		    $scope.configModel.visibilitySettings.positionPopupAttrs = [{
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
		        title: locale.getString('spatial.tab_vms_pos_table_header_date'),
		        value: 'posTime'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lon'), 
		        value: 'lon'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lat'),
		        value: 'lat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_status'),
		        value: 'stat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_measured_speed'), 
		        value: 'm_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_calculated_speed'), 
		        value: 'c_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_course'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_msg_type'),
		        value: 'msg_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_activity_type'),
		        value: 'act_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_source'),
		        value: 'source'
		    }];
		    
		    $scope.configModel.visibilitySettings.positionLabelAttrs = [{
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
		        title: locale.getString('spatial.tab_vms_pos_table_header_date'),
		        value: 'posTime'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lon'), 
		        value: 'lon'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_lat'),
		        value: 'lat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_status'),
		        value: 'stat'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_measured_speed'), 
		        value: 'm_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_calculated_speed'), 
		        value: 'c_spd'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_course'), 
		        value: 'crs'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_msg_type'),
		        value: 'msg_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_activity_type'),
		        value: 'act_tp'
		    },{
		        title: locale.getString('spatial.tab_vms_pos_table_header_source'),
		        value: 'source'
		    }];
		    
		    var contentTypes = ['Table','Popup','Label'];
			angular.forEach(contentTypes, function(contentType) {
				var positions = [];
				angular.forEach($scope.configModel.visibilitySettings.positions[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()].order, function(item) {
					for(var i=0;i<$scope.configModel.visibilitySettings['position' + contentType + 'Attrs'].length;i++){
						if(item === $scope.configModel.visibilitySettings['position' + contentType + 'Attrs'][i].value){
							positions.push($scope.configModel.visibilitySettings['position' + contentType + 'Attrs'][i]);
						}
					}
				});
				angular.copy(positions,$scope.configModel.visibilitySettings['position' + contentType + 'Attrs']);
				angular.forEach($scope.configModel.visibilitySettings['position' + contentType + 'Attrs'], function(item) {
					item.type = contentType;
				});
			});
		}
	});
});