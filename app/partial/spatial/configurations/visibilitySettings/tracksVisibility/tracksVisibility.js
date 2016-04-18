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
				
				if(trackVisibilitySettings.order.length !== trackVisibilitySettings.values.length){
					$scope.selectAll.tracks[contentType.toLowerCase()] = false;
				}
			});
		}
	});

});