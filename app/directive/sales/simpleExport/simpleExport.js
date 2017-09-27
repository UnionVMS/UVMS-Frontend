angular.module('unionvmsWeb').directive('simpleExport', function () {
    return {
        restrict: 'E',
        replace: true,
        controller: 'SimpleExportCtrl',
        scope: {
            exportfunc: "=",
        },
        templateUrl: 'directive/sales/simpleExport/simpleExport.html',
        link: function (scope, element, attrs, fn) {
        }
    };
});

angular.module('unionvmsWeb')
.controller('SimpleExportCtrl', function ($scope, searchService, locale, csvService, salesCsvService) {
    $scope.loading = false;
    $scope.errors = [];
    $scope.performExport = function () {
        $scope.loading = true;
        var searchObj = searchService.getAdvancedSearchObject();
        $scope.exportfunc(searchObj).then(function (data) {
            exportFinished(data);
        }, exportFailed);
    };


    function exportFinished(data) {
        $scope.loading = false;
        //Create and download the file
        var header = salesCsvService.headers.salesReport;
        csvService.downloadCSVFile(data, header, "sales_documents_export.csv");

        $scope.errors = [];
    }

    function exportFailed(errors) {
        $scope.loading = false;
        $scope.errors.push(locale.getString('sales.documents_export_failed'));
    }
});
