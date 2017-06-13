(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesRelevantReportsDropdown', {
            templateUrl: 'partial/sales/salesDetails/salesReport/relatedReportsDropdown/relatedReportsDropdown.html',
            controller: relatedReportsDropdownCtrl,
            controllerAs: 'vm',
            bindings: {
                reports: '=',
            }
        });

    function relatedReportsDropdownCtrl($scope, $state, $filter) {
        var vm = this;

        vm.chooseRelatedReport = chooseRelatedReport;
        vm.dropdownItems = [];

        //init dropdown items
        updateDropdownItems(vm.reportVersions);
        $scope.$watch("vm.reports", function(newValue, oldValue, event) {
            updateDropdownItems(newValue);
        });

        function updateDropdownItems(relevantReports) {
            vm.dropdownItems = [];
            angular.forEach(relevantReports, function(report) {
                var dropdownItem = {
                    text : $filter('i18n')('sales.report_item_type_' + report.type) + " " + report.documentExtId,
                    reportExtId: report.reportExtId
                };
                vm.dropdownItems.push(dropdownItem);
            });
        }

        function chooseRelatedReport(item) {
            if (item && item.reportExtId) {
                $state.go('app.sales.details', {id: item.reportExtId});
            }
        }
    }
})();
