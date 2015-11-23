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

angular.module('unionvmsWeb').controller('ReportslistCtrl',function($scope, globalSettingsService, reportMsgService, $anchorScroll, locale, reportRestService, confirmationModal){
    //config object
    $scope.config = {
        src_format: 'YYYY-MM-DDTHH:mm:ss',
        target_format: globalSettingsService.getDateFormat()
    };
    
    $scope.isLoading = true;
    $scope.alert = reportMsgService;
    
    $scope.reports = [];
    $scope.reportTableInstance = {};
    $scope.searchString = '';
    
    //General table configuration
    
    $scope.itemsByPage = 25;
    
    $scope.displayedRecords = [].concat($scope.reports);
    
    //Run the report
    $scope.runReport = function(index){
        var record = $scope.displayedRecords[index];
        $scope.$emit('runReport', record);
    };
    
    //Report filter definitions
    $scope.showFilters = function(index){
        $scope.isLoading = true;
        reportRestService.getReport($scope.displayedRecords[index].id).then(getReportSuccess, getReportError);
    };
    
    //Share report
    $scope.shareReport = function(index){ 
        var record = $scope.displayedRecords[index];
        record.is_shared = !record.is_shared;
        //TODO call rest api
    };
    
    //Delete report
    $scope.deleteReport = function(index){
        var options = {
            textLabel : locale.getString("spatial.reports_delete_report_confirmation_text") + $scope.displayedRecords[index].name.toUpperCase() + '?'
        };
        confirmationModal.open(function(){
            reportRestService.deleteReport($scope.displayedRecords[index].id, index).then(deleteReportSuccess, deleteReportError);
        }, options);
    };
    
    //Listening for loading reports list events
    $scope.$on('loadReportsList', function(){
//        $scope.reports = [];
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
    	var index = $scope.reports.indexOf($scope.displayedRecords[resp.index]);
        if (index !== -1) {
            $scope.reports.splice(index, 1);
        }
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

});
