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
            $scope.configModel.visibilitySettings.segments.formPopupTitles = {};

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
            $scope.configModel.visibilitySettings.segments.formLabelTitles = {};

		    var contentTypes = ['Table','Popup','Label'];
			angular.forEach(contentTypes, function(contentType) {
				var segments = [];
				var contentTypeLocal = contentType.toLowerCase() === 'label' ? contentType.toLowerCase() + 's' : contentType.toLowerCase();
				var segmentVisibilitySettings = $scope.configModel.visibilitySettings.segments[contentTypeLocal];
				var segmentVisibilityAttrs = $scope.configModel.visibilitySettings['segment' + contentType + 'Attrs'];
                var segmentVisibilityTitles = $scope.configModel.visibilitySettings.segments[contentTypeLocal].titles;

				if(segmentVisibilitySettings.order && segmentVisibilitySettings.order.length > 0){
					angular.forEach(segmentVisibilitySettings.order, function(item) {
						for(var i=0;i<segmentVisibilityAttrs.length;i++){
						    var code = segmentVisibilityAttrs[i].value;
							if(item === code){
								segments.push(segmentVisibilityAttrs[i]);
							}
                            if(angular.isDefined(segmentVisibilityTitles)){
                                for(var j =0; j < segmentVisibilityTitles.length;j++) {
                                    if(code === segmentVisibilityTitles[j].code){
                                        $scope.configModel.visibilitySettings.segments["form"+contentType+"Titles"][code] = segmentVisibilityTitles[j].title;
                                        break;
                                    }
                                }
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

				if(!angular.isDefined(segmentVisibilitySettings.values) || segmentVisibilitySettings.order.length !== segmentVisibilitySettings.values.length){
					$scope.selectAll.segments[contentType.toLowerCase()].values = false;
				}else{
					$scope.selectAll.segments[contentType.toLowerCase()].values = true;
				}

				if(!angular.isDefined(segmentVisibilitySettings.names) || segmentVisibilitySettings.order.length !== segmentVisibilitySettings.names.length){
                    $scope.selectAll.segments[contentType.toLowerCase()].names = false;
                }else{
                    $scope.selectAll.segments[contentType.toLowerCase()].names = true;
                }
			});
		}
	});

});
