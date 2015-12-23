angular.module('unionvmsWeb').controller('PositionsvisibilityCtrl',function($scope, locale){
    $scope.positionAttrs = [{
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

});