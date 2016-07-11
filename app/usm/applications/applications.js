/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('applications', [
     'ui.route',
     'auth'
     ]);

angular.module('applications').config(['$urlRouterProvider', '$stateProvider', 'ACCESS',                                       
 function ($urlRouterProvider, $stateProvider, ACCESS) {
    $stateProvider
        .state('app.usm.applications', {
            url: '/applications?{page:int}&{sortColumn}&{sortDirection}&{name}&{parent}',
			data: {
				access: ACCESS.AUTH
			},
            params:{
                page:1,
                sortColumn:'name',
                sortDirection:'asc'
            },
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/applications/applicationsList.html',
                    controller: 'applicationsListCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Applications'
            },
            resolve: {
                applicationNames: function (applicationsService) {
                    return applicationsService.getParentApplicationNames().then(
                        function (response) {
                            return response.parents;
                        },
                        function (error) {
                            return [error];
                        }
                    );
                }
            }
        })
        .state('app.usm.applications.application', {
            url: '/{applicationName}',
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/applications/partial/applicationDetails.html',
                    controller: "applicationDetailsCtrl"
                }
            },
            ncyBreadcrumb: {
                label: 'Application Details'
            }
        });

}]);