angular.module('unionvmsWeb').factory('reportMsgService', function($timeout){
    var alert = {
        visible: false,
        type: '',
        msg: ''
    };
    
    alert.show = function(msg, type){
        var obj = this;
        this.msg = msg;
        this.visible = true;
        this.type = type;
        $timeout(function(){
            obj.hide();
        }, 3000, true, obj);
    };
    
    alert.hide = function(){
        this.visible = false;
        this.type = '';
        this.msg = '';
    };
    
    return alert;
});

angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, reportMsgService, $anchorScroll, locale, datatablesService, reportRestService, DTOptionsBuilder, DTColumnDefBuilder, DTInstances, confirmationModal){
    //Mock config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: 'DD-MM-YYYY HH:mm:ss'
    };
    
    $scope.isLoading = true;
    $scope.alert = reportMsgService;
    
    $scope.reports = [];
    $scope.reportTableInstance = {};
    $scope.searchString = '';
    
    //General table configuration
    $scope.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(25)
                                    .withLanguage(datatablesService)
                                    .withDOM('trpi')
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
        DTColumnDefBuilder.newColumnDef(5).renderWith(function(data, type, full){
            var str = full[5].toLowerCase();
            return '<span class="label label-default label-visibility">' + str.substring(0, 1).toUpperCase() + str.substr(1) + '</span>';
        }),
        DTColumnDefBuilder.newColumnDef(6).notSortable()
    ];
    
    //Global table search
    $scope.searchTable = function(){
        $scope.reportTableInstance.DataTable.search($scope.searchString, false, false, true).draw();
    };
    
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
        $scope.isLoading = true;
        reportRestService.getReport($scope.reports[index].id).then(getReportSuccess, getReportError);
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
            textLabel : locale.getString("spatial.reports_delete_report_confirmation_text") + $scope.reports[index].name.toUpperCase() + '?'
        };
        confirmationModal.open(function(){
            reportRestService.deleteReport($scope.reports[index].id, index).then(deleteReportSuccess, deleteReportError);
        }, options);
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
        $scope.isLoading = false;
        var msg = locale.getString('spatial.error_get_reports_list');
        $scope.alert.show(msg, 'error');
        $scope.reports = [];
    };
    
   //Get Report Configs Success callback
    var getReportSuccess = function(response){
        $scope.isLoading = false;
        $scope.toggleReportForm('EDIT', response);
    };
    
  //Get Report Configs Failure callback
    var getReportError = function(error){
        $scope.isLoading = false;
        $anchorScroll();
        $scope.alert.show(locale.getString('spatial.error_entry_not_found'), 'error');
    };
    
    //Delete report Success callback
    var deleteReportSuccess = function(resp){
        $scope.reports.splice(resp.index, 1);
        $scope.isLoading = false;
        $anchorScroll();
        var msg = locale.getString('spatial.success_delete_report');
        $scope.alert.show(msg, 'success');
    };
    
    //Delete report Failure callback
    var deleteReportError = function(error){
        $scope.isLoading = false;
        $anchorScroll();
        var searchString = 'spatial.' + error.msg;
        var msg = locale.getString(searchString);
        $scope.alert.show(msg, 'error');
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
        }
    });
});
