angular.module('users', [
    'ui.bootstrap',
    'ui.utils',
    'ngRoute',
    'ngAnimate',
    'account',
    'userContexts',
    'preferences',
    'usersService',
    'auth'
]);

angular.module('users').config(['$urlRouterProvider', '$stateProvider','ACCESS',
    function ($urlRouterProvider, $stateProvider,ACCESS) {

        var currentContextPromise = function(userService){
            return userService.findSelectedContext();
        };
        currentContextPromise.$inject =    ['userService'];

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
        .state('app.usm.users', {
            url: '/users?{page:int}&{sortColumn}&{sortDirection}&{user}&{nation}&{organisation}&{status}&{activeFrom}&{activeTo}',
            data: {
                access: ACCESS.AUTH
            },
            params : {
                page:1,
                sortColumn:'userName',
                sortDirection:'desc',
                status:'',
                user:'',
                nation:'',
                organisation:'',
                activeFrom:'',
                activeTo:''
            },
            views: {
                "page@app": {
                    templateUrl: 'usm/users/usersList.html',
                    controller: "usersListController",
                }
            },
            ncyBreadcrumb: {
                label: 'Users'
            },
            resolve: {
                currentContext: currentContextPromise,
                orgNations: orgNationsPromise ,
            	orgNames: orgNamesPromise

            }
        })
        .state('app.usm.users.contactDetails', {
            url: '/{userName}/contactDetails',
            views: {
                "page@app": {
                    templateUrl: 'usm/users/contactDetails/partial/contactDetails.html',
                    controller: 'contactDetailsTabsCtrl'
                }
            }
        })
        .state('app.usm.users.contactDetails.contactInfo', {
            url: '/info',
            templateUrl: 'usm/users/contactDetails/partial/contactInfo/contactInfo.html'
        })
        .state('app.usm.users.contactDetails.contactRoles', {
            url: '/roles',
            templateUrl: 'usm/users/contactDetails/partial/contactRoles/contactRoles.html'
        })
        .state('app.usm.users.contactDetails.contactPreferences', {
            url: '/preferences',
            templateUrl: 'usm/users/contactDetails/partial/contactPreferences/contactPreferences.html'
        })
        .state('app.usm.users.userDetails', {
            url: '/{userName}',
            params : {
                userName: ''
            },
            views: {
                "page@app": {
                    templateUrl: 'usm/users/partial/userDetails.html',
                    controller: 'userDetailsCtlr'
                }
            },
            resolve:{

                userDetailsService: 'userDetailsService',

            },
            ncyBreadcrumb: {
                label: 'User Details'
            }
        });
}]);
