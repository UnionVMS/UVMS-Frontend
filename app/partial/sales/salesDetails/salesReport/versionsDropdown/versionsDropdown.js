(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesVersionsDropdown', {
            templateUrl: 'partial/sales/salesDetails/salesReport/versionsDropdown/versionsDropdown.html',
            controller: versionsDropdownCtrl,
            controllerAs: 'vm',
            bindings: {
                reportVersions: '=',
                currentReportIsNewestVersion: '='
            }
        });

    function versionsDropdownCtrl($scope, $state, $filter) {
        var vm = this;

        vm.chooseOlderVersion = chooseOlderVersion;
        vm.goToNewestVersion = goToNewestVersion;
        vm.dropdownItems = [];


        updateDropdownItems(vm.reportVersions);
        $scope.$watch("vm.reportVersions", function(newValue, oldValue, event) {
            updateDropdownItems(newValue);
        });

        /**
         * Initializes dropdown items
         */
        function updateDropdownItems(reportVersions) {
            vm.dropdownItems = [];
            angular.forEach(reportVersions, function(version) {
                var dropdownItem = {
                    text : $filter('i18n')('sales.report_item_type_' + version.type) + " " + version.documentExtId,
                    reportExtId: version.reportExtId
                };
                vm.dropdownItems.push(dropdownItem);
            });
        }

        function chooseOlderVersion(item) {
            if (item && item.reportExtId) {
                $state.go('app.sales.details', {id: item.reportExtId});
            }
        }

        function goToNewestVersion() {
            if (vm.currentReportIsNewestVersion) {
                throw new Error("The button 'go to newest version' should not be activated!");
            }
            $state.go('app.sales.details', {id: vm.reportVersions[0].reportExtId});
        }
    }
})();
