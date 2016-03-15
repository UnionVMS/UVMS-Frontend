(function() {
    'use strict';

    angular
        .module('unionvmsWeb')
        .controller('exchangeHistoryController', ExchangeHistoryController);

    /* ngInject */
    function ExchangeHistoryController(exchangeHistoryService, $scope) {
        var vm = this;
        vm.colours = [ '#18a989', '#0079ff' ];
        vm.series = ['Incoming', 'Outgoing'];
        vm.options = {
            responsive: true,
            maintainAspectRatio: false,
            datasetFill: false,
            bezierCurve: false
        };

        function refresh() {
            exchangeHistoryService.getHistory().then(function(history) {
                vm.data = [ history.incoming, history.outgoing ];
                vm.labels = history.timestamps.map(function(timestamp) {
                    return moment(timestamp).format('HH:mm');
                });
            });
        }

        $scope.$on('dashboard.refresh', function() {
            refresh();
        });

        refresh();
    }

})();
