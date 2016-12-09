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
var organisationsModule = angular.module('organisations', [
	'ui.bootstrap',
	'ui.utils',
	'ngRoute',
	'ngAnimate',
	'organisationsService',
	'personsService',
    'auth'
]);

 organisationsModule.config(['$urlRouterProvider', '$stateProvider', 'ACCESS',
  function ($urlRouterProvider, $stateProvider, ACCESS) {

	 var orgNationsPromise = function(organisationsService){
	      return organisationsService.getNations().then(
	                 function (response) {
	                     return response.nations;
	                 },
	                 function (error) {
	                     return [error];
	                 }
	             );
	           };
      // we must make sure to inject the selectedContext from the parent state
      // otherwise it might try resolving the promise before the selected context promise is resolved.
	  orgNationsPromise.$inject =    ['organisationsService','selectedContext'];

	  var orgNamesPromise = function(organisationsService){
	         return organisationsService.get().then(
	                 function (response) {
	                     return response.organisations;
	                 },
	                 function (error) {
	                     return [error];
	                 }
	             );
	   };
	   orgNamesPromise.$inject =    ['organisationsService','selectedContext'];

	    $stateProvider
	        .state('app.usm.organisations', {
	            url: '/organisations?{page:int}&{sortColumn}&{sortDirection}&{name}&{nation}&{status}',
				//data: {
				//	access: ACCESS.AUTH
				//},
                params:{
                    page:1,
                    sortColumn:'name',
                    sortDirection:'asc',
                    name:'',
                    nation:'',
                    status:'all'
                },
	            views: {
	            	"page@app.usm": {
	                    templateUrl: 'usm/organisations/organisationsList.html',
	                    controller: "organisationsListCtrl"
	                }
	            },
                ncyBreadcrumb: {
                    label: 'Organisations'
                },
                resolve:{

                	orgNations:orgNationsPromise,
                	orgNames:orgNamesPromise
                }
	        })
	        .state('app.usm.organisations.organisation', {
	            url: '/{organisationId}',
                params:{
                    organisationId:null
                },
	            views: {
                    "page@app.usm": {
	                    templateUrl: 'usm/organisations/partial/organisationDetails.html'
	                }
	            },
                ncyBreadcrumb: {
                    label: 'Organisation Details'
                }
	        })

	    .state('app.usm.organisations.organisation.endpoint', {
            url: '/endpoint/{endPointId}',
            params:{
                    endPointId:null
                },
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/organisations/partial/endPointsDetails.html'
                }
            },
                ncyBreadcrumb: {
                    label: 'Endpoint'
                }
        });

	}]);


	organisationsModule.factory('organisationsCache', ['$cacheFactory', function($cacheFactory){
	    return $cacheFactory('organisationsCache');
	}]);