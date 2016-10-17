angular.module('unionvmsWeb').controller('AdvancedsearchformCtrl',function($scope){

    $scope.codeLists = {
        comChannel: [{code: 'FLUX', text: 'FLUX'}],
        purposeCode: null,
        reportType: null,
        gearTypes: null,
        activityTypes: null,
        weightUnits: [{code: 'kg', text: 'KG'}, {code: 't', text: 'Ton'}]
    };

    $scope.advancedSearchObject = {
        weightUnit: "kg" //by default is kg
    };

    $scope.init = function() {
        //$scope.codeLists.purposeCode = getAllPurposeCodes(); TODO REST call to get all the purpose codes and their human readable text
         //$scope.codeLists.reportType = getAllReportTypes(); //TODO REST call
         //TODO init gearTypes
         //TODO init activityTypes
    };

    $scope.init();


    $scope.getSpecies = function(searchText) {

    };

    $scope.searchFAReports = function() {
    };


});
angular.module('unionvmsWeb').controller('AdvancedsearchformCtrl',function($scope){

    $scope.codeLists = {
        comChannel: [{code: 'FLUX', text: 'FLUX'}],
        purposeCode: null,
        reportType: null,
        gearTypes: null,
        activityTypes: null,
        weightUnits: [{code: 'kg', text: 'KG'}, {code: 't', text: 'Ton'}]
    };

    $scope.advancedSearchObject = {
        weightUnit: "kg" //by default is kg
    };

    $scope.init = function() {
        //$scope.codeLists.purposeCode = getAllPurposeCodes(); TODO REST call to get all the purpose codes and their human readable text
         //$scope.codeLists.reportType = getAllReportTypes(); //TODO REST call
         //TODO init gearTypes
         //TODO init activityTypes
    };

    $scope.init();


    $scope.getSpecies = function(searchText) {

    };

    $scope.searchFAReports = function() {
    };


});
