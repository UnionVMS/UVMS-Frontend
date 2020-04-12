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
angular.module('users', [
    'ui.bootstrap',
    'ui.utils',
    'ngRoute',
    'ngAnimate',
    'account',
    'userContexts',
    'preferences',
    'usersService',
    'auth',
    'changes',
    'shared']);

angular.module('users').config(['$urlRouterProvider', '$stateProvider', 'ACCESS', 'policyValuesProvider',
    function ($urlRouterProvider, $stateProvider, ACCESS, policyValues) {
        policyValues.setPolicyName("ldap.enabled");
        policyValues.setPolicySubject("Authentication");

        var currentContextPromise = function (userService) {
            return userService.findSelectedContext();
        };
        currentContextPromise.$inject =    ['userService'];

        var orgNationsPromise = function (organisationsService) {
  	      return organisationsService.getNations().then(
  	                 function (response) {
  	                     return response.nations;
  	                 },
  	                 function (error) {
  	                 }
  	             );
  	           };
  	     orgNationsPromise.$inject =    ['organisationsService'];

        var orgNamesPromise = function (organisationsService) {
           return organisationsService.get().then(
                function (response) {
                    return response.organisations;
                },
                function (error) {
                }
            );
          };
        orgNamesPromise.$inject =    ['organisationsService'];

    $stateProvider
        .state('app.usm.users', {
            url: '/users?{page:int}&{sortColumn}&{sortDirection}&{user}&{nation}&{organisation}&{status}&{activeFrom}&{activeTo}',
            data: {
                access: ACCESS.AUTH
            },
                params: {
                    page: 1,
                    sortColumn: 'userName',
                    sortDirection: 'desc',
                    status: '',
                    user: '',
                    nation: '',
                    organisation: '',
                    activeFrom: '',
                    activeTo: ''
            },
            views: {
                    "page@app.usm": {
                    templateUrl: 'usm/users/usersList.html',
                        controller: "usersListController"
                }
            },
            ncyBreadcrumb: {
                label: 'Users'
            },
            resolve: {
                currentContext: currentContextPromise,
                    orgNations: orgNationsPromise,
            	orgNames: orgNamesPromise

            }
        })
        .state('app.usm.users.contactDetails', {
            url: '/{userName}/contactDetails',
            views: {
                    "page@app.usm": {
                    templateUrl: 'usm/users/contactDetails/partial/contactDetails.html',
                    controller: 'contactDetailsTabsCtrl'
                }
            }
        })
        .state('app.usm.users.userDetails', {
            url: '/{userName}',
                params: {
                userName: ''
            },
            views: {
                    "page@app.usm": {
                    templateUrl: 'usm/users/partial/userDetails.html',
                    controller: 'userDetailsCtlr'
                }
            },
                resolve: {
                    userDetailsService: 'userDetailsService'
            },
            ncyBreadcrumb: {
                label: 'User Details'
            }
        });
    }]);