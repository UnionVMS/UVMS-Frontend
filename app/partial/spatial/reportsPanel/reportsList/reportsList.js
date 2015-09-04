angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, $timeout, $anchorScroll, locale, datatablesService, reportRestService, DTOptionsBuilder, DTColumnDefBuilder, confirmationModal){
    //Mock config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: 'DD-MM-YYYY HH:mm:ss'
    };
    
    $scope.isLoading = true;
    $scope.alert = {
        visible: false,
        startFade: false,
        type: '',
        msg: ''
    };
    
    $scope.reports = [];
    
    //General table configuration
    $scope.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(25)
                                    .withLanguage(datatablesService)
                                    .withDOM('ftrpi')
                                    .withOption('responsive', true)
                                    .withOption('order', [[2, 'desc']])
                                    .withBootstrapOptions({
                                        pagination: {
                                            classes: {
                                                ul: 'pagination pagination-sm'
                                            }
                                        }
                                    });
    
    $scope.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2).withOption('type', 'report-date').renderWith(function(data, type, full){
            return $scope.renderDate(full[2]);
        }),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4).withOption('type', 'report-date').renderWith(function(data, type, full){
            return $scope.renderDate(full[4]);
        }),
        DTColumnDefBuilder.newColumnDef(5).withOption('type', 'visibility'),
        DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];
    
    //Return dates formated according to user definition
    $scope.renderDate = function(displayDate){
        if (moment(displayDate, $scope.config.src_format, true).isValid() === true){
            displayDate = moment(displayDate, $scope.config.src_format, true).format($scope.config.target_format);
        }
        return displayDate;
    };
    
    //Run the report
    $scope.runReport = function(index){
        var record = $scope.reports[index];
        $scope.$emit('runReport', record);
    };
    
    //Report filter definitions
    $scope.showFilters = function(index){
        $scope.toggleReportForm('EDIT', $scope.reports[index].id);
    };
    
    //Share report
    $scope.shareReport = function(index){ 
        var record = $scope.reports[index];
        record.is_shared = !record.is_shared;
        //TODO call rest api
    };
    
    //Delete report
    $scope.deleteReport = function(index){
        var options = {
            textLabel : locale.getString("spatial.reports_delete_report_confirmation_text")
        };
        confirmationModal.open(function(){
            reportRestService.deleteReport($scope.reports[index].id, index).then(deleteReportSuccess, deleteReportError);
        }, options);
    };
    
    //Show info section to inform the user about successes and errors
    $scope.showAlert = function(msg, type){
        $scope.isLoading = false;
        $scope.alert.msg = msg;
        $scope.alert.visible = true;
        $scope.alert.type = type;
        $anchorScroll();
        $timeout(function(){
            $scope.hideAlert();
        }, 3000);
    };
    
    //Hide info section
    $scope.hideAlert = function(){
        $scope.alert.startFade = true;
        $timeout(function(){
            $scope.alert.visible = false;
            $scope.alert.startFade = false;
        }, 1000);
    };
    
    //Listening for loading reports list events
    $scope.$on('loadReportsList', function(){
        $scope.reports = [];
        $scope.isLoading = true;
        reportRestService.getReportsList().then(getReportsListSuccess, getReportsListError);
    });
    
    //SUCESS AND FAILURES CALLBACKS
    
    //Get Report List Success callback
    var getReportsListSuccess = function(reports){
        $scope.reports = reports.data;
        $scope.isLoading = false;
    };
    
    //Get Report List Failure callback
    var getReportsListError = function(error){
        var msg = locale.getString('spatial.error_get_reports_list');
        $scope.showAlert(msg, 'error');
        $scope.reports = [];
    };
    
    //Delete report Success callback
    var deleteReportSuccess = function(resp){
        $scope.reports.splice(resp.index, 1);
        var msg = locale.getString('spatial.success_delete_report');
        $scope.showAlert(msg, 'success');
    };
    
    //Delete report Failure callback
    var deleteReportError = function(error){
        var searchString = 'spatial.' + error.msg;
        var msg = locale.getString(searchString);
        $scope.showAlert(msg, 'error');
    };
    
    
    //Custom sort function for the specified date target format
    $.extend($.fn.dataTableExt.oSort, {
        "report-date-pre": function (date){
            var repDate =  parseInt(moment(date, $scope.config.target_format, true).format('X'));
            return isNaN(repDate) ? 0 : repDate;
        },
        "report-date-asc": function (a, b){
            return a - b;
        },
        "report-date-desc": function (a, b){
            return b - a;
        },
        "visibility-pre": function(vis){
            var value = vis.substr(vis.indexOf('visprop') + 9, 1);
            if (value === 'p'){
                return locale.getString('spatial.reports_table_p_label');
            } else if (value === 's'){
                return locale.getString('spatial.reports_table_s_label');
            } else {
                return locale.getString('spatial.reports_table_g_label');
            }
        }
    });
});
