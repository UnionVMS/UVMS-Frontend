/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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