var rolesModule = angular.module('roles', ['ui.bootstrap', 'ui.utils', 'ui.router', 'ngAnimate', 'applicationsService', 'rolesServiceModule', 'auth']);

rolesModule.config(['$urlRouterProvider', '$stateProvider', 'ACCESS',
  function ($urlRouterProvider, $stateProvider, ACCESS) {
    $stateProvider
        .state('app.usm.roles', {
            url: '/roles?{page:int}&{sortColumn}&{sortDirection}&{role}&{application}&{status}',
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


rolesModule.factory('rolesCache', ['$cacheFactory', function($cacheFactory){
    return $cacheFactory('rolesCache');
}]);

