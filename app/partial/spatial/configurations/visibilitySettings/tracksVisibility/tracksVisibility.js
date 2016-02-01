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
				angular.forEach($scope.configModel.visibilitySettings.positions[contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase()].order, function(item) {
					for(var i=0;i<$scope.configModel.visibilitySettings['track' + contentType + 'Attrs'].length;i++){
						if(item === $scope.configModel.visibilitySettings['track' + contentType + 'Attrs'][i].value){
							tracks.push($scope.configModel.visibilitySettings['track' + contentType + 'Attrs'][i]);
						}
					}
				});
				angular.copy(tracks,$scope.configModel.visibilitySettings['track' + contentType + 'Attrs']);
				angular.forEach($scope.configModel.visibilitySettings['track' + contentType + 'Attrs'], function(item) {
					item.type = contentType;
				});
			});
		}
	});

});