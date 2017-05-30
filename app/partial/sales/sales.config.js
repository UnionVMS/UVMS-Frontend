(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('app.sales', {
                url: '/sales',
                abstract: true,
                views: {
                    modulepage: {
                        template: '<ui-view />'
                    }
                }
            })
            .state('app.sales.list', {
                url: '',
                templateUrl: 'partial/sales/sales.html',
                controller: 'SalesCtrl',
                controllerAs: 'vm',
                data: {
                    access: 'viewSalesNotes',
                    pageTitle: 'sales'
                }
            })
            .state('app.sales.details', {
                url: '/{id}',
                templateUrl: 'partial/sales/salesDetails/salesDetails.html',
                controller: 'SalesDetailsCtrl',
                controllerAs: 'vm',
                resolve: {
                    salesDetails: function (salesRestService, $stateParams, currentContext) {
                        return salesRestService.getSalesDetails($stateParams.id);
                    }
                },
                data: {
                    access: 'viewSalesNotes',
                    pageTitle: 'sales'
                }
            });
    }
})();
