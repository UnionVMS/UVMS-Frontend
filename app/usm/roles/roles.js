var rolesModule = angular.module('roles', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'applicationsService', 'rolesServiceModule']);

rolesModule.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $stateProvider
        .state('app.usm.roles', {
            url: '/roles?{page:int}&{sortColumn}&{sortDirection}&{role}&{application}&{status}',
            params: {
                page: 1,
                sortColumn: 'name',
                sortDirection: 'asc',
                status: 'all'
            },
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/roles/rolesList.html',
                    controller: "rolesListCtrl"
                }
            },
            ncyBreadcrumb: {
                label: 'Roles'
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
        .state('app.usm.roles.role', {
            url: '/{roleId}',
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/roles/partial/roleDetails.html'
                }
            },
            ncyBreadcrumb: {
                label: 'Role Details'
            }
        });

}]);


rolesModule.factory('rolesCache', ['$cacheFactory', function ($cacheFactory) {
    return $cacheFactory('rolesCache');
}]);

