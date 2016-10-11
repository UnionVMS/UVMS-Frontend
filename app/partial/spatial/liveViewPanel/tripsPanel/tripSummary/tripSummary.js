angular.module('unionvmsWeb').controller('TripsummaryCtrl',function($scope,reportRestService,tripSummaryService,loadingStatus,spatialConfigAlertService,$anchorScroll,locale){

    $scope.alert = spatialConfigAlertService;

    $scope.tabTitles = [
        {
            title: 'BEL-TRP-O16-2016-0020'
        },
        {
            title: 'BEL-TRP-O16-2016-0021'
        },
        {
            title: 'BEL-TRP-O16-2016-0022'
        }
    ];

    $scope.tripId = 'NOR-TRP-20160517234053706';


    var loadReportMessages = function(){
        tripSummaryService.reportsTable = [];
        angular.forEach(tripSummaryService.reports,function(report){
            var reportItem = {};
            reportItem.type = locale.getString('spatial.activity_type_' + report.activityType.toLowerCase());
            reportItem.nodes = [];

            if(!angular.isDefined(report.delimitedPeriod) || report.delimitedPeriod.length ===0){
                report.delimitedPeriod = [{}];
            }

            angular.forEach(report.delimitedPeriod,function(subreport){
                var subreportItem = {};

                subreportItem.type = (report.correction ? 'Correction: ' : '') + locale.getString('spatial.activity_type_' + report.activityType.toLowerCase()) + ' (' + locale.getString('spatial.fa_report_document_type_' + report.faReportDocumentType.toLowerCase()) + ')';

                if(angular.isDefined(subreport.startDate) && angular.isDefined(subreport.endDate)){
                    subreportItem.date = subreport.startDate + ' - ' + subreport.endDate;
                }else{
                    subreportItem.date = report.faReportAcceptedDateTime;
                }

                if(angular.isDefined(report.locations) && report.locations.length > 0){
                    subreportItem.location = '';
                    angular.forEach(report.locations,function(location){
                        subreportItem.location += location;
                    });
                }
                subreportItem.reason = locale.getString('spatial.report_reason_' + report.reason.toLowerCase());;
                subreportItem.remarks = getRemarks(report);

                subreportItem.corrections = report.correction;
                subreportItem.detail = true;
                
                reportItem.nodes.push(subreportItem);
            });

            tripSummaryService.reportsTable.push(reportItem);
        });

        $scope.reportsTable = tripSummaryService.reportsTable;
    };

    var getRemarks = function(report){
        var remarks;

        if(report.activityType === 'DEPARTURE' || report.activityType === 'FISHING_OPERATION'){
            remarks = report.fishingGears[0].gearTypeCode;
        }else{
            remarks = report.faReportAcceptedDateTime;
        }

        switch(report.activityType){
            case 'DEPARTURE':
                remarks += ' (gear)';
                break;
            case 'FISHING_OPERATION':
                remarks += ' (gear used)';
                break;
            case 'ARRIVAL':
                if(report.faReportDocumentType === 'DECLARATION'){
                    remarks += ' (est. time landing)';
                }else if(report.faReportDocumentType === 'NOTIFICATION'){
                    remarks += ' (gear used)';
                }
                break;
            case 'LANDING':
                remarks += ' (end time landing)';
                break;
            case 'ENTRY':
            case 'EXIT':
            case 'RELOCATION':
                remarks += ' (est. time)';
                break;
            case 'TRANSHIPMENT':
                if(report.faReportDocumentType === 'DECLARATION'){
                    remarks += ' (est. time transhipment)';
                }else if(report.faReportDocumentType === 'NOTIFICATION'){
                    remarks += ' (est. time)';
                }
                break;
        }

        return remarks;
    };


    loadingStatus.isLoading('TripSummary', true);
    loadingStatus.isLoading('TripSummary', true);
    reportRestService.getTripVessel($scope.tripId).then(function(response){
        tripSummaryService.tripVessel = response.data;
        tripSummaryService.tripRoles = tripSummaryService.tripVessel.contactPersons;

        angular.forEach(tripSummaryService.tripRoles,function(value, key) {
            value.code = value.id = key;
            value.text = value.title + ' ' + value.givenName + ' ' + value.middleName + ' ' + value.familyName;
        });
        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('spatial.error_loading_trip_summary_vessel_data');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });

    var response = reportRestService.getTripReports($scope.tripId);

    tripSummaryService.overview = response.data.summary;
    tripSummaryService.reports = response.data.activityReports;
    tripSummaryService.currentTripId = response.data.fishingTripId;

    $scope.tripSummServ = tripSummaryService; 
    loadReportMessages();
    loadingStatus.isLoading('TripSummary', false);

    /*reportRestService.getTripReports($scope.tripId).then(function(response){
        tripSummaryService.overview = response.data.summary;
        tripSummaryService.reports = response.data.activityReports;

        loadingStatus.isLoading('TripSummary', false);
    }, function(error){
        $anchorScroll();
        $scope.alert.hasAlert = true;
        $scope.alert.hasError = true;
        $scope.alert.alertMessage = locale.getString('spatial.error_loading_trip_summary_reports');
        $scope.alert.hideAlert();
        loadingStatus.isLoading('TripSummary', false);
    });*/

});