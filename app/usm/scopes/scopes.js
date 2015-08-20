var scopesModule = angular.module('scopes', ['ui.bootstrap', 'ui.utils', 'ngRoute', 'ngAnimate', 'scopesServiceModule']);

scopesModule.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {
    $stateProvider
        .state('app.usm.scopes', {
            url: '/scopes?{page:int}&{sortColumn}&{sortDirection}&{name}&{application}&{status}',
            params:{
                page:1,
                sortColumn:'name',
                sortDirection:'asc',
                status:'all'
            },
            views: {
                "page@app": {
                    templateUrl: 'usm/scopes/scopesList.html'
                }
            },
            ncyBreadcrumb: {
                label: 'Scopes'
            }
        })
        .state('app.usm.scopes.scope', {
            url: '/{scopeId}',
            views: {
                "page@app": {
                    templateUrl: 'usm/scopes/partial/scopeDetails.html'
                }
            },
            ncyBreadcrumb: {
                label: 'Scope Details'
            }
        });

}]);
