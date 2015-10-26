var scopesModule = angular.module('scopes', ['ui.bootstrap', 'ui.utils', 'ngRoute', 'ngAnimate', 'scopesServiceModule', 'auth']);

scopesModule.config(['$urlRouterProvider', '$stateProvider', 'ACCESS',
  function ($urlRouterProvider, $stateProvider, ACCESS) {
    $stateProvider
        .state('app.usm.scopes', {
            url: '/scopes?{page:int}&{sortColumn}&{sortDirection}&{name}&{application}&{status}',
			data: {
				access: ACCESS.AUTH
			},
            params:{
                page:1,
                sortColumn:'name',
                sortDirection:'asc',
                status:'all'
            },
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/scopes/scopesList.html',
                    controller: "scopesListCtrl"
                }
            },
            ncyBreadcrumb: {
                label: 'Scopes'
            },
            resolve: {
                applicationNames: function (getApplications) {
                    return getApplications.get().then(
                        function (response) {
                            return response.applications;
                        },
                        function (error) {
                            return [error];
                        });
                }
            }
        })
        .state('app.usm.scopes.scope', {
            url: '/{scopeId}',
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/scopes/partial/scopeDetails.html'
                }
            },
            ncyBreadcrumb: {
                label: 'Scope Details'
            }
        });

}]);
