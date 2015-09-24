angular.module('applications', ['ui.route']);

angular.module('applications').config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $stateProvider
        .state('app.usm.applications', {
            url: '/applications?{page:int}&{sortColumn}&{sortDirection}&{name}&{parent}',
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

