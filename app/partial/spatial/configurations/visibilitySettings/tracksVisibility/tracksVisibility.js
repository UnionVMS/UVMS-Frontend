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
angular.module('unionvmsWeb').controller('TracksvisibilityCtrl',function($scope, locale){
		    
	$scope.$watch('configModel.visibilitySettings.tracks', function(newVal) {
		if(newVal){
			$scope.configModel.visibilitySettings.trackTableAttrs = [{
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
		        title: locale.getString('spatial.reports_form_vms_tracks_time_at_sea'), 
		        value: 'timeSea'
		    }];
		    
		    $scope.configModel.visibilitySettings.trackPopupAttrs = [{
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
		        title: locale.getString('spatial.reports_form_vms_tracks_time_at_sea'), 
		        value: 'timeSea'
		    }];
		    
		    $scope.configModel.visibilitySettings.trackLabelAttrs = [{
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
		        title: locale.getString('spatial.reports_form_vms_tracks_time_at_sea'), 
		        value: 'timeSea'
		    }];
		    
		    var contentTypes = ['Table'];
			angular.forEach(contentTypes, function(contentType) {
				var tracks = [];
				var trackVisibilitySettings = $scope.configModel.visibilitySettings.tracks[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()];
				var trackVisibilityAttrs = $scope.configModel.visibilitySettings['track' + contentType + 'Attrs'];
				
				if(trackVisibilitySettings.order && trackVisibilitySettings.order.length > 0){
					angular.forEach(trackVisibilitySettings.order, function(item) {
						for(var i=0;i<trackVisibilityAttrs.length;i++){
							if(item === trackVisibilityAttrs[i].value){
								tracks.push(trackVisibilityAttrs[i]);
							}
						}
					});
					angular.copy(tracks,trackVisibilityAttrs);
				}else{
					trackVisibilitySettings.order = [];
					for(var i=0;i<trackVisibilityAttrs.length;i++){
						trackVisibilitySettings.order.push(trackVisibilityAttrs[i].value);
					}
				}
				
				angular.forEach(trackVisibilityAttrs, function(item) {
					item.type = contentType;
				});
				
				if(!angular.isDefined(trackVisibilitySettings.values) || trackVisibilitySettings.order.length !== trackVisibilitySettings.values.length){
					$scope.selectAll.tracks[contentType.toLowerCase()] = false;
				}else{
					$scope.selectAll.tracks[contentType.toLowerCase()] = true;
				}
			});
		}
	});

});
