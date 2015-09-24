var changesModule = angular.module('changes', ['ui.bootstrap', 'ui.utils', 'ngRoute', 'ngAnimate', 'changesServiceModule']);

changesModule.config(['$urlRouterProvider', '$stateProvider', function ($urlRouterProvider, $stateProvider) {

    $stateProvider
        .state('app.usm.changes', {
            url: '/changes',
            views: {
                "page@app.usm": {
                    templateUrl: 'usm/users/changes/partial/changes.html',
                    controller: 'changesListCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Changes'
            }
        });

}]);

