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
angular.module('unionvmsWeb').controller('PositionsvisibilityCtrl',function($scope, locale){
	$scope.isPositionVisLoading = false;
	
	$scope.$watch('configModel.visibilitySettings.positions', function(newVal) {
		$scope.isPositionVisLoading = false;
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
				var positionVisibilitySettings = $scope.configModel.visibilitySettings.positions[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
				var positionVisibilityAttrs = $scope.configModel.visibilitySettings['position' + contentType + 'Attrs'];
				
				if(positionVisibilitySettings.order && positionVisibilitySettings.order.length > 0){
					angular.forEach(positionVisibilitySettings.order, function(item) {
						for(var i=0;i<positionVisibilityAttrs.length;i++){
							if(item === positionVisibilityAttrs[i].value){
								positions.push(positionVisibilityAttrs[i]);
							}
						}
					});
					angular.copy(positions,positionVisibilityAttrs);
				}else{
					positionVisibilitySettings.order = [];
					for(var i=0;i<positionVisibilityAttrs.length;i++){
						positionVisibilitySettings.order.push(positionVisibilityAttrs[i].value);
					}
				}
				
				angular.forEach(positionVisibilityAttrs, function(item) {
					item.type = contentType;
				});
				
				if(!angular.isDefined(positionVisibilitySettings.values) || positionVisibilitySettings.order.length !== positionVisibilitySettings.values.length){
					$scope.selectAll.positions[contentType.toLowerCase()].values = false;
				}else{
					$scope.selectAll.positions[contentType.toLowerCase()].values = true;
				}
				if(!angular.isDefined(positionVisibilitySettings.names) || positionVisibilitySettings.order.length !== positionVisibilitySettings.names.length){
                	$scope.selectAll.positions[contentType.toLowerCase()].names = false;
                }else{
                    $scope.selectAll.positions[contentType.toLowerCase()].names = true;
                }
			});
			$scope.isPositionVisLoading = false;
		}
	});
});
