angular.module('policies', [
    'ui.bootstrap',
    'ui.utils',
    'ngRoute',
    'ngAnimate',
    'policiesService',
    'auth'
]);

angular.module('policies').config(['$urlRouterProvider', '$stateProvider', 'ACCESS',
	function ($urlRouterProvider, $stateProvider, ACCESS) {
		$stateProvider
		.state('app.usm.policies', {
			url: '/policies',
			data: {
				access: ACCESS.AUTH
			},
			views: {
				"page@app.usm": {
					templateUrl: 'usm/policies/policiesList.html',
					controller: "policiesListController"
				}
			},
			ncyBreadcrumb: {
				label: 'Policies'
			},
			resolve: {
				policySubjects: function(policiesService){
                    return policiesService.getPolicySubjList().then(function(obj) {
                            //$log.log("results: ", obj);
                            return obj.subjects;
                        },
                        function (error) {
                            return [error];
                        });
                }
			}
		});
	}
]);

