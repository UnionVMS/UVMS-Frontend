angular.module('unionvmsWeb').directive('simpleExport', function () {
    return {
        restrict: 'E',
        replace: true,
        controller: 'SimpleExportCtrl',
        scope: {
            exportfunc: "=",
            amountOfReports: "="
        },
        templateUrl: 'directive/sales/simpleExport/simpleExport.html',
        link: function (scope, element, attrs, fn) {
        }
    };
});

angular.module('unionvmsWeb')
.controller('SimpleExportCtrl', function ($scope, searchService, locale, csvService, salesCsvService) {
    const MAX_ITEMS = 1000;

    $scope.loading = false;
    $scope.errors = [];
    $scope.confirmed = false;
    $scope.clicked = false;

    $scope.performExport = function () {
        $scope.loading = true;
        var searchObj = searchService.getAdvancedSearchObject();
        $scope.exportfunc(searchObj).then(function (data) {
            exportFinished(data);
        }, exportFailed);
    };

    $scope.needsConfirmation = function () {
      return $scope.amountOfReports > MAX_ITEMS;
    } ;

    $scope.export = function () {
        if ($scope.needsConfirmation()) {
            //Show a message on the first click when 'export all' will be limited to 1000 records
            if (!$scope.confirmed) {
                $('#popoverbutton').popover('show');
            }

            //When the user clicks confirm, reset variables and trigger the export
            if (!$scope.confirmed && $scope.clicked) {
                $scope.confirmed = false;
                $scope.clicked = false;
                $('#popoverbutton').popover('hide');
                $scope.performExport();
            } else {
                //Only set clicked when we haven't triggered the export
                $scope.clicked = true;
            }
        } else {
            $scope.performExport();
        }
    };

    $('[data-toggle="popover"]').popover();


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
