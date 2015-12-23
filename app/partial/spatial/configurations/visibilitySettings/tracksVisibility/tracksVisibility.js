angular.module('unionvmsWeb').controller('TracksvisibilityCtrl',function($scope, locale){
    $scope.trackAttrs = [{
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

});