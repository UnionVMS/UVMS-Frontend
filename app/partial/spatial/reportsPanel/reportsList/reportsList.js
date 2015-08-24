angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, locale, datatablesService, reportRestService, DTOptionsBuilder, DTColumnDefBuilder, confirmationModal){
    //Mock config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: 'DD-MM-YYYY HH:mm:ss'
    };
    
    $scope.reports = [];
    
    //General table configuration
    $scope.dtOptions = DTOptionsBuilder.newOptions()
                                    .withBootstrap()
                                    .withPaginationType('simple_numbers')
                                    .withDisplayLength(50)
                                    .withLanguage(datatablesService)
                                    .withDOM('ftrpi')
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
        console.log($scope.reports[index]);
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
            console.log("Report deletion confirmed");
            $scope.reports.splice(index, 1);
            //TODO call rest api instead
        }, options);
    };
    
    //Get Report List Success callback
    var getReportsListSuccess = function(reports){
        $scope.reports = reports;
    };
    
    //Get Report List Failure callback
    var getReportsListError = function(error){
        //TODO warn the user
        console.log(error);
        $scope.reports = [];
    };
    
    reportRestService.getReportsList().then(getReportsListSuccess, getReportsListError);
        
    //Listening for loading reports list events
//    $scope.$on('loadReportsList', function(){
//        if ($scope.reports.length === 0){
//            //TODO show loading wheel
//            reportRestService.getReportsList().then(getReportsListSuccess, getReportsListError);
//        }
//    });
    
    //Custom sort function for the specified date target format
    $.extend($.fn.dataTableExt.oSort, {
        "report-date-pre": function (date){
            return parseInt(moment(date, $scope.config.target_format, true).format('X'));
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
        },
//        "visibility-asc": function(a, b){
//            return a;
//        },
//        "visibility-desc": function(a, b){
//            return b;
//        }
    });
});
