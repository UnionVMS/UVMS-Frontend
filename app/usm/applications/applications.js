angular.module('applications', ['ui.route']);

angular.module('applications').config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $stateProvider
        .state('app.usm.applications', {
            url: '/applications',
            views: {
                "page@app": {
                    templateUrl: 'usm/applications/applicationsList.html'
                }
            },
            ncyBreadcrumb: {
                label: 'Applications'
            }
        });

}]);

