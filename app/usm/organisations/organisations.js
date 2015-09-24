var organisationsModule = angular.module('organisations', [
	'ui.bootstrap',
	'ui.utils',
	'ngRoute',
	'ngAnimate',
	'organisationsService',
	'personsService'
]);

 organisationsModule.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

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
	  orgNationsPromise.$inject =    ['organisationsService'];

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
	   orgNamesPromise.$inject =    ['organisationsService'];

	    $stateProvider
	        .state('app.usm.organisations', {
	            url: '/organisations?{page:int}&{sortColumn}&{sortDirection}&{name}&{nation}&{status}',
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
