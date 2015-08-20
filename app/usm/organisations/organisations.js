var organisationsModule = angular.module('organisations', [
	'ui.bootstrap',
	'ui.utils',
	'ngRoute',
	'ngAnimate',
	'organisationsService',
	'personsService'
]);

 organisationsModule.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

	    $stateProvider
	        .state('app.usm.organisations', {
	            url: '/organisations?{page:int}&{sortColumn}&{sortDirection}&{name}&{nation}&{status}',
                params:{
                    page:1,
                    sortColumn:'name',
                    sortDirection:'asc',
                    status:'all'
                },
	            views: {
	            	"page@app": {
	                    templateUrl: 'usm/organisations/organisationsList.html'
	                }
	            },
                ncyBreadcrumb: {
                    label: 'Organisations'
                }
	        })
	        .state('app.usm.organisations.organisation', {
	            url: '/{organisationId}',
	            views: {
                    "page@app": {
	                    templateUrl: 'usm/organisations/partial/organisationDetails.html'
	                }
	            },
                ncyBreadcrumb: {
                    label: 'Organisation Details'
                }
	        })

	    .state('app.usm.organisations.organisation.endpoint', {
            url: '/endpoint/{endPointId}',
            views: {
                "page@app": {
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
