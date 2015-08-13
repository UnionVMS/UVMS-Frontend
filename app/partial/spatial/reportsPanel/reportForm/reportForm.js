angular.module('unionvmsWeb').controller('ReportformCtrl',function($scope, locale, Report){
    //Set positions selector dropdown options
    $scope.positionItems = [];
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_all'), "code": "all"});
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_last_positions'), "code": "x_positions"});
    $scope.positionItems.push({"text": locale.getString('spatial.reports_form_positions_selector_option_last_hours'), "code": "x_hours"});
    
    //Set vessel search type dropdown options
    $scope.vesselSearchItems = [];
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "vessel"});
    $scope.vesselSearchItems.push({"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"});
    
    //Data containers for report filtering criteria|selection
    $scope.vesselsSelection = [];
    $scope.vmsFilters = [];
    
    $scope.submitingReport = false;
    $scope.vesselSearchBy = 'vessel';
    
    $scope.init = function(){
        $scope.report = new Report();
    };
    
    $scope.resetForm = function(){
        $scope.init();
        $scope.vesselsSelection = [];
        $scope.vmsFilters = [];
        $scope.submitingReport = false;
        $scope.reportForm.$setPristine();
    };
    
    $scope.saveReport = function(){
        $scope.submitingReport = true;
        if ($scope.reportForm.$valid){
          //TODO check data and call rest api
            console.log('saving new report');
            console.log($scope.vesselsSelection);
        } else {
            console.log('there are errors in the form');
            console.log($scope.report);
        }
    };
    
    $scope.$on('openReportForm', function(e){
        $scope.init();
        $scope.submitingReport = false;
    });
    
    $scope.$watch('report.positionSelector', function(newVal, oldVal){
        if ($scope.report){
            //Reset X Value field
            $scope.report.xValue = undefined;
        }
    });
});