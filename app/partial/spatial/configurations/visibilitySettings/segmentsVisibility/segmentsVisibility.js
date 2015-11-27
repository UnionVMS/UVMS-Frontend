angular.module('unionvmsWeb').controller('SegmentsvisibilityCtrl',function($scope, locale){
    $scope.segmentAttrs = [{
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
});