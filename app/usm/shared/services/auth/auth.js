(function() {

// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Modules
angular.module('auth',
    [
        'auth.interceptor',
        'auth.user',
        'auth.ui-router',
        'auth.jwt'
    ]);

 angular.module('auth.interceptor', ['ngStorage','ui.bootstrap'])
    .provider('authInterceptor', function() {

        this.urlParam = null;
        this.authHeader = 'Authorization';
        this.roleHeader = 'roleName';
        this.scopeHeader = 'scopeName';
         this.authPrefix = '';
         this.restApiURLS = [
             '/vessel/rest',
             '/mobileterminal/rest/',
             '/exchange/rest/',
             '/movement/rest/',
             '/audit/rest/',
             '/rules/rest/',
             '/reporting/rest/'
         ];
         this.rest_api_base = "";
        this.tokenGetter = ['$localStorage','$log', function($localStorage,$log) {
            //myService.doSomething();
            return $localStorage.token;
        }];
        this.contextGetter = ['userService','$log', function(userService,$log) {
            var role = userService.getRoleName();
            var scope = userService.getScopeName();
            return {role:role,scope:scope};
        }];

        this.authFilter = function() {
            return false;
        };

        this.responseErrFilter = ['config','$log', function(config,$log) {
            var skipPattern = /usm-administration\/rest\/ping/i;
            return skipPattern.test(config.url);
        }];

        var config = this,
        unauth = false;

        this.$get = ["$q", "$injector", "$rootScope","$localStorage",'$timeout','$log', function ($q, $injector, $rootScope,$localStorage,$timeout,$log) {
            var isAuth = function(response){
                $log.debug('isAuth response '+response);
            };

            return {
                request: function (request) {
                    var skipFilter = $injector.invoke(config.authFilter, this, {
                        config: request
                    });
                    //when authenticating we don't want to send the authorisation header
                    skipFilter = skipFilter || /usm-administration\/rest\/authenticate/i.test(request.url);
                    if (request.skipAuthorization ||skipFilter) {
                        return request;
                    }

                    /*var isRESTApiRequest = false;
                    $.each(config.restApiURLS, function(i, val){
                        if(request.url.indexOf(val) === 0){
                            isRESTApiRequest = true;
                            return false;
                        }
                    });
                    //Change request url
                    if(isRESTApiRequest){
                        var newUrl = config.rest_api_base + request.url;
                        $log.debug("Reroute request to " + request.url +" to " +newUrl);
                        request.url = newUrl;
                    }*/

                    if (config.urlParam) {
                        request.params = request.params || {};
                        // Already has the token in the url itself
                        if (request.params[config.urlParam]) {
                            return request;
                        }
                    } else {
                        request.headers = request.headers || {};
                        // Already has an Authorization header
                        if (request.headers[config.authHeader]) {
                            return request;
                        }
                    }

                    var tokenPromise = $q.when($injector.invoke(config.tokenGetter, this, {
                        config: request
                    }));
                    var contextPromise = $q.when($injector.invoke(config.contextGetter, this, {
                        config: request
                    }));


                    return tokenPromise.then(function (token) {
                        if (token) {
                            if (config.urlParam) {
                                request.params[config.urlParam] = token;
                            } else {
                                request.headers[config.authHeader] = config.authPrefix + token;
                            }
                        }
                        request.headers['X-Requested-With'] = 'XMLHttpRequest';
                        return contextPromise.then(function (context) {
                            if (context) {
                                //request.headers[config.roleHeader] = config.authPrefix + context.role;
                                //request.headers[config.scopeHeader] = config.authPrefix + context.scope;
                            }
                                return request;
                        });
                    });
                },
                response: function (response) {
                    $q.when(response).then(
                        function (response) {
                            if (!_.isUndefined(response.headers()["authorization"])) {
                                $localStorage.token = response.headers()["authorization"];
                            }
                        }
                    );
                    return response;
                },
                responseError: function (rejection) {
                    var skipErrFilter = $injector.invoke(config.responseErrFilter, this, {
                        config: rejection
                    });

                    if(skipErrFilter){
                        return rejection;
                    }

                    if (rejection.status === 403 && !unauth) {
                        unauth = true;
                        // Inject services
                        $log.log("injecting renewLoginPanel");
                        var Retry = $injector.get('renewloginpanel');
                        var userservice = $injector.get('userService');

                        var $http = $injector.get('$http');
                        var $state = $injector.get('$state');
                        var $modalStack = $injector.get('$modalStack');

                        return $timeout(angular.noop, 200).then(function () {
                            return Retry.show();
                        }).then(function () {
                            $log.log("retry request succeeded?");
                            unauth = false;
                            $log.debug($state.current);
                            $modalStack.dismissAll();
                            //$state.reload($state.current);
                            //$state.go($state.current, {}, {reload: true});
                            if (rejection.config.headers[config.authHeader]) {
                                rejection.config.headers[config.authHeader] = null;
                            }
                            return $http(rejection.config);
                        }, function () {
                            $log.log("retry request failed?");
                            unauth = false;
                            userservice.logout();
                            $rootScope.$broadcast('authenticationNeeded');
                            return $q.reject(rejection);
                        });
                    } else {
                        return $q.reject(rejection);
                    }
                }
            };
        }]; // this.$get
    });

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

 angular.module('auth.ui-router', ['ui.bootstrap'])
    .constant("ACCESS", {
        "PUBLIC": {ac:"public"},
        "AUTH": {ac:"auth"}
    })
    .factory('routeProtection', [function() {
        var homeRoute = "";
        var anonRoute = "public";
        var initloginRoute = "initlogin";
        var renewloginRoute = "renewlogin";
        return{
            getHome : function(){
                return homeRoute;
            },
            setHome : function(homeState){
                homeRoute = homeState;
            },
            getInitLogin : function(){
                return initloginRoute;
            },
            getRenewLogin : function(){
                return renewloginRoute;
            },
            getAnon : function(){
                return anonRoute;
            }
        };
    }])
    .config(['$urlRouterProvider', '$stateProvider','ACCESS',
        function ($urlRouterProvider, $stateProvider,ACCESS) {
            // Prevent $urlRouter from automatically intercepting URL changes;
            // this allows you to configure custom behavior in between
            // location changes and route synchronization:
            $urlRouterProvider.deferIntercept();

            $stateProvider
                .state('initlogin', {
                    url: '/initlogin',
                    params:{
                        toState:null
                    },
                    access:{data:ACCESS.PUBLIC},
                    views: {
                        module: {
                            templateUrl: 'usm/shared/services/auth/renewLogin.html',
                            controller: 'initLoginCtrl'
                        }
                    }
                })
                .state('jwtcallback', {
                    url: '/jwtcallback',
                    params: {
                        jwt: null
                    },
                    access: {data: ACCESS.PUBLIC},
                    views: {
                        module: {
                            template: '<body><h2>You have successfully logged in.</h2>' +
                            '<p>This page will close automatically. If not please close it.<p>',
                            controller: ['userService', '$stateParams', function (userService, $stateParams) {
                                if ($stateParams.jwt) {
                                    userService.login($stateParams.jwt);
                                }
                            }]
                        }
                    }
                });
        }
    ])
    .run(['$rootScope', '$injector', '$timeout', '$location','routeProtection','userService','$log','renewloginpanel','ACCESS','$urlRouter',
        function ($rootScope, $injector, $timeout, $location,routeProtection,userService,$log,renewloginpanel,ACCESS,$urlRouter) {
            var redirectingTo = false;
            var uiModuleExists = false;

            try {
                $injector.get('$state');
                uiModuleExists = true;
            } catch (e) {
            }

            if (uiModuleExists) {
                $injector.invoke(['$state', function ($state) {
                    $rootScope.$on('AuthenticationSuccess', function () {
                        if($state.current.url !== "^") {
                            $state.reload();
                        }
                    });
                    /*
                    $rootScope.$on('ContextSwitch', function () {
                        $state.reload();
                    });*/

                    $rootScope.$on('authenticationNeeded', function () {
                        $log.debug('on -> authenticationNeeded');
                        //$state.reload();
                    });

                    $rootScope.$on('$locationChangeSuccess', function(e) {
                        $log.debug('$locationChangeSuccess',arguments);
                        $log.debug('redirectingTo',redirectingTo);
                        $log.debug('$state.$current.self',$state.$current.self);
                        //if we have started a manual redirect below we will only
                        // allow the $locationChangeSuccess if the state matches the redirect
                        if(redirectingTo){
                            if($state.$current.self.name !== redirectingTo){
                                e.preventDefault();

                            } else {
                                redirectingTo = null;
                            }
                        }
                        // UserService is an example service for managing user state
                        //if (UserService.isLoggedIn()) return;
                        //
                        //// Prevent $urlRouter's default handler from firing
                        //e.preventDefault();
                        //
                        //UserService.handleLogin().then(function() {
                        //    // Once the user has logged in, sync the current URL
                        //    // to the router:
                        //    $urlRouter.sync();
                        //});
                    });

                    // Configures $urlRouter's listener *after* your custom listener
                    $urlRouter.listen();

                    /*for debugging*/
                    //$rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
                    //    $log.debug('$stateChangeStart to '+toState.to+'- fired when the transition begins. toState,toParams : \n',toState, toParams);
                    //});
                    $rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
                        $log.debug('$stateChangeError - fired when an error occurs during transition.');
                        $log.debug(arguments);
                    });
                    $rootScope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
                        $log.debug('$stateChangeSuccess to '+toState.name+'- fired once the state transition is complete.');
                    });

                    // $rootScope.$on('$viewContentLoading',function(event, viewConfig){
                    //   // runs on individual scopes, so putting it in "run" doesn't work.
                    //   $log.debug('$viewContentLoading - view begins loading - dom not rendered',viewConfig);
                    // });

                    $rootScope.$on('$viewContentLoaded',function(event){
                        $log.debug('$viewContentLoaded - fired after dom rendered',event);
                    });
                    $rootScope.$on('$stateNotFound',function(event, unfoundState, fromState, fromParams){
                        $log.debug('$stateNotFound '+unfoundState.to+'  - fired when a state cannot be found by its name.');
                        $log.debug(unfoundState, fromState, fromParams);
                    });

                    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
                        $log.debug('$stateChangeStart to '+toState.to+'- fired when the transition begins. toState,toParams : \n',toState, toParams);
                        $log.debug("redirectingTo",redirectingTo);
                        //check if user is logged in:

                        var error;
                        if(!userService.isLoggedIn()) {
                            $log.debug('We are NOT logged in.');
                            //is this a public route
                            if(!('data' in toState) || !('access' in toState.data) ||toState.data.access === ACCESS.PUBLIC ) {
                                $log.debug("Access undefined for this state, or public. Go ahead");
                                //in the future we could decide that we do not allow states with undefined access but for now...
                            } else {
                                $log.debug('This route has some form of non public access restriction:',toState.data.access);
                                //We will require a login
                                //did we have a previous state?
                                if(fromState.url === '^') {
                                    $log.debug('Looks like there is no previous state');
                                    error = 'Please login with an authorised username and password.';
                                    $log.debug(error);
                                    event.preventDefault();
                                } else {
                                    $log.debug('Looks like there is a previous state: ',fromState);
                                    error = 'Your session timed out. Please Login again';
                                    $log.debug(error);
                                    event.preventDefault();
                                    //$state.go(routeProtection.getRenewLogin(), {'toState': toState, message: error});
                                }
                                /*renewloginpanel.show().*/
                                userService.findSelectedContext().then(function () {
                                    $log.log("retry request succeeded!");
                                    //$state.go(toState);
                                    $state.go(toState, toParams, {reload: true});
                                    //return $http(rejection.config);
                                }, function () {
                                    $log.log("retry request failed!");
                                    userService.logout();
                                    $rootScope.$broadcast('authenticationNeeded');
                                });
                            }
                        } else {
                            $log.debug('We ARE logged in!!!! Username: '+ userService.getUserName());
                            $log.debug(toState);
                            if (!('data' in toState) || !('access' in toState.data) || toState.data.access === ACCESS.PUBLIC || toState.data.access === ACCESS.AUTH) {
                                $log.debug("Access undefined, public or auth. Go ahead");
                                //in the future we could decide that we do not allow public pages but for now...
                            } else {
                                $log.debug('This route has some form of non public access restriction:', toState.data.access);
                                //now check access auth
                                if (!userService.isAllowed(toState.data.access)) {
                                    $log.debug('Preventing access to ' + toState.to + '. It requires ' + toState.data.access);

                                    event.preventDefault();
                                    //did we have a previous state?
                                    if (fromState.url === '^') {
                                        $log.debug('Looks like there is no previous state');
                                        error = 'Please login with an authorised username and password.';
                                        $log.debug(error);
                                        //redirectingTo = routeProtection.getInitLogin();
                                        //$state.go(redirectingTo, {'toState': toState, message: error});
                                    } else {
                                        $log.debug('Looks like there is a previous state: ', fromState);
                                        error = 'Your do not have access to this page. Login with the right credentials';
                                        $log.debug(error);
                                    }

                                    //todo: get the message to display
                                    renewloginpanel.show().then(function () {
                                        $log.log("retry request succeeded!");
                                        //$state.go(toState);
                                        $state.go(toState, toParams, {reload: true});
                                        //return $http(rejection.config);
                                    }, function () {
                                        $log.log("retry request failed! Logging Out");
                                        userService.logout();
                                        $rootScope.$broadcast('authenticationNeeded');
                                    });
                                } else {
                                    $log.debug('The logged-in user is allowed to access: ', toState.data.access);
                                }
                            }
                        }
                    }); // stateChangeStart
                }]); // $injector.invoke(['$state'...
            } // uiModuleExists
        }
    ]);

    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    angular.module('auth.user', ['ui.bootstrap'])
        .factory('userService', ['$resource', '$q', '$log', '$localStorage', 'jwtHelper', '$rootScope','$modal','$http','renewloginpanel','ecasloginpanel',
            function ($resource, $q, $log, $localStorage, jwtHelper, $rootScope,$modal,$http,renewloginpanel,ecasloginpanel) {
                var userName,
                    token,
                    contexts,
                    loggedin,
                    currentContext;

                var _reset = function () {
                    userName = "";
                    token = {};
                    loggedin = false;
                    contexts = null;
                    currentContext = null;
                };

                _reset();

                var resource = $resource('/usm-administration/rest/userContexts', {}, {
                    'get': {
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    }
                });

                var pingRequest = {
                    method: 'GET',
                    url: '/usm-administration/rest/ping',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };

                var _getCurrentContext = function () {
                    return currentContext;
                };

                var _isAllowedInContext = function (feature, app, ctxt) {
                    var allowed = false;
                    var role = ctxt.role;

                    if (role) {
                        if (role.features) {
                            for (var f = 0, lf = role.features.length; f < lf; f++) {
                                var feat = role.features[f];
                                if (feat.featureName === feature && (feat.applicationName === app || !app)) {
                                    allowed = true;
                                    break;
                                }
                            }
                        }
                    }
                    return allowed;
                };

                var _isAllowed = function (feature, application, currentContextOnly) {
                    // we could probably use the _findContexts() and _findSelectedContext() promises
                    // be for now let's simply return false if the contextset is empty

                    var ctxt, ctxtSets, allowed = false;
                    if(!contexts) {
                        return false;
                    }
                    if(contexts.length === 0) {
                        return false;
                    }
                    if (!currentContextOnly) {
                        ctxtSets = contexts;
                        for (var i = 0, len = ctxtSets.length; i < len; i++) {
                            ctxt = ctxtSets[i];
                            if (_isAllowedInContext(feature, application, ctxt)) {
                                allowed = true;
                                break;
                            }
                        }
                        return allowed;
                    } else {
                        if(!currentContext){
                            return false;
                        } else {
                            return _isAllowedInContext(feature, application, currentContext);
                        }
                    }
                };

                var _getUserName = function () {
                    return userName;
                };

                var _getToken = function () {
                    return token;
                };

                var _logout = function () {
                    _reset();
                    delete $localStorage.token;
                    _clearContexts();
                };

                var _isLoggedIn = function () {
                    return loggedin;
                };

                var _storeContexts = function (contextsArray) {
                    if (_.isArray(contextsArray)) {
                        contexts = contextsArray;
                    }
                };

                var _getRoleName = function(){
                    var roleName = '';
                    if(currentContext && currentContext.role && currentContext.role.roleName){
                        roleName = currentContext.role.roleName;
                    }
                    return roleName;
                };

                var _getScopeName = function(){
                    var scopeName = '';
                    if(currentContext && currentContext.scope && currentContext.scope.scopeName){
                        scopeName = currentContext.scope.scopeName;
                    }
                    return scopeName;
                };

                var _storeCurrentContexts = function (ctxt) {
                    currentContext = ctxt;
                    //let's store the roleName and scope so that when a user comes back we select this by default

                    $localStorage.roleName = _getRoleName();
                    $localStorage.scopeName = _getScopeName();
                    $rootScope.$broadcast('ContextSwitch');
                };

                var _clearCurrentContext = function (ctxt) {
                    currentContext = null;
                    // we will not delete it from localStorage to give us a chance
                    // to reuse the previously selected context when the user logs in
                    // delete $localStorage.currentContext;
                };

                var _clearContexts = function () {
                    contexts = null;
                    //delete $localStorage.contexts;
                    _clearCurrentContext();
                };

                var _storeToken = function (jwt) {
                    var tokenPayload = {};
                    if (jwt) {
                        try {
                            tokenPayload = jwtHelper.decodeToken(jwt);
                            $log.debug('logging token payload');
                            $log.debug(tokenPayload);
                            var expdate = jwtHelper.getTokenExpirationDate(jwt);
                            $log.debug('token expiry ' + expdate);
                            var expired = jwtHelper.isTokenExpired(jwt);
                            $log.debug('isExpired ' + expired);
                            if (expired) {
                                _reset();
                                $rootScope.$broadcast('needsAuthentication');
                            } else {
                                token = tokenPayload;
                                userName = tokenPayload.userName || "";
                                loggedin = true;
                                $localStorage.token = jwt;
                                $rootScope.$broadcast('AuthenticationSuccess');
                            }
                        } catch (e) {
                            _reset();
                            $rootScope.$broadcast('needsAuthentication');
                        }
                    }
                    return tokenPayload;
                };

                var _getContexts = function(){
                  return contexts;
                };

                var _findContexts = function () {
                    var message = "";
                    var deferred = $q.defer();
                    if (contexts && contexts.length>0) {
                        // we have contexts let's resolve the promise
                        deferred.resolve(contexts);
                        return deferred.promise;
                    }

                        //we have no contexts
                        //let's make sure we have a user first
                        return _findCurrentUser().then(
                            function (user) {
                                // We can try getting the contexts from the server based on what looks like a valid user
                                return resource.get().$promise.then(
                                    function (data) {
                                        $log.debug('got getContexts data', data);
                                        if (data.contextSet && data.contextSet.contexts) {
                                            _storeContexts(data.contextSet.contexts);
                                            deferred.resolve(contexts);
                                        } else {
                                            _clearContexts();
                                            deferred.reject("Failed to get Contexts");
                                        }
                                        return deferred.promise;
                                    },
                                    function (error) {
                                        $log.debug('_backendPing error response (1): '+ error);
                                        if (error && error.data && error.data.message) {
                                            message = 'Error: ' + error.data.message;
                                        } else {
                                            message = 'Failed';
                                        }
                                        _clearContexts();
                                        $log.error(error);
                                        deferred.reject(message);
                                        return deferred.promise;
                                    }
                                );

                            },
                            function (error) {
                                $log.debug('_findCurrentUser error response (1): '+ error);
                                if (error && error.data && error.data.message) {
                                    message = 'Error: ' + error.data.message;
                                } else {
                                    message = 'Failed';
                                }
                                _clearContexts();
                                $log.error(error);
                                deferred.reject(message);
                                return deferred.promise;
                            }
                        );

                    };


                var _findSelectedContext = function () {
                    var message = "";
                    var deferred = $q.defer();
                    if (currentContext) {
                        // we have a current context let's resolve the promise
                        deferred.resolve(currentContext);
                        return deferred.promise;
                    }
                    // to be able to select a context we must have some
                    return _findContexts().then(
                        function (selectableContexts) {
                            $log.debug('got contexts to choose from data', selectableContexts);
                            // We must ahve more then one context to choose from
                            if (selectableContexts.length === 0) {
                                _clearCurrentContext();
                                $log.error("No contexts to choose from");
                                deferred.reject("No contexts to choose from");
                                return deferred.promise;
                            } else if(selectableContexts.length === 1){
                                //only one context, let's select it
                                _storeCurrentContexts(selectableContexts[0]);
                                deferred.resolve(selectableContexts[0]);
                                return deferred.promise;
                            } else {
                                // we have several contexts
                                // we might have a previously set roleName and scope that matches one of these
                                var foundContext;
                                var roleName =  $localStorage.roleName || '';
                                var scopeName =  $localStorage.scopeName || '';

                                if (roleName) {
                                    //let's see if ot matches one of the selectable contexts
                                        for (var i = 0, len = selectableContexts.length; i < len; i++) {
                                            var ctxt = selectableContexts[i];
                                            if (ctxt.role.roleName === roleName) {
                                                //role names match, let's check scope
                                                if (
                                                    (scopeName && ctxt.scope && ctxt.scope.scopeName &&
                                                    scopeName === ctxt.scope.scopeName) ||
                                                    (!scopeName && !ctxt.scope)) {
                                                    foundContext = ctxt;
                                                    break;
                                                }
                                            }

                                        }

                                }
                                if (foundContext) {
                                    $log.debug('found a matching context in localStorage', foundContext);
                                    _storeCurrentContexts(foundContext);
                                    deferred.resolve(currentContext);
                                    return deferred.promise;
                                } else {
                                    //we have some contexts, and no previously stored context. Must select one
                                    $log.debug('No matching context in localStorage');

                                    return _switchContext().then(
                                        function (selectedContext) {

                                            deferred.resolve(selectedContext);
                                            return deferred.promise;
                                        },
                                        function (error) {
                                            $log.debug('_backendPing error response (2): '+ error);
                                            if (error && error.data && error.data.message) {
                                                message = 'Error: ' + error.data.message;
                                            } else {
                                                message = 'Failed';
                                            }

                                            $log.error(error);
                                            deferred.reject(message);
                                            return deferred.promise;
                                        }
                                    );
                                }
                            }
                        },
                        function (error) {
                            $log.debug('_backendPing error response (3): '+ error);
                            if (error && error.data && error.data.message) {
                                message = 'Error: ' + error.data.message;
                            } else {
                                message = 'Failed';
                            }
                            _clearCurrentContext();
                            $log.error(error);
                            deferred.reject(message);
                            return deferred.promise;
                        }
                    );
                };

                var _backendPing = function() {
                    $log.debug('_backendPing - returning an $http promise to ping the backend');
                    var deferred = $q.defer();
                    return $http(pingRequest)
                        .success(function (response) {
                            $log.debug('_backendPing Success response:', response);
                        })
                        .error(function (error) {
                            $log.debug('_backendPing error response (4): '+ error, pingRequest);
                            var message;
                            if (error && error.data && error.data.message) {
                                message = 'Error: ' + error.data.message;
                            } else {
                                message = 'Failed';
                            }
                            $log.debug('rejecting _backendPing promise (1): '+ message);
                            deferred.reject(message);
                            return deferred.promise;
                        }
                    );
                };

                var _findCurrentUser = function () {
                    $log.debug('_findCurrentUser() - Enter');
                    var message = "";
                    var deferred = $q.defer();
                    var loginPanelSuccess = function(result) {
                        $log.debug('_findCurrentUser - Login Panel resolved successfully : '+_getUserName());
                        deferred.resolve(_getUserName());
                        return deferred.promise;
                    };
                    var loginPanelError = function (error) {
                        $log.debug('_backendPing error response (5): '+ error);
                        var message;
                        if (error && error.data && error.data.message) {
                            message = 'Error: ' + error.data.message;
                        } else {
                            message = 'Failed';
                        }
                        $log.debug('_findCurrentUser - Login Panel was rejected with message' + message,error);
                        //clear all user information
                        $log.debug('_findCurrentUser - Clearing all user info using _logout()');
                        _logout();
                        $log.debug('_findCurrentUser - Rejecting with message : '+message);
                        deferred.reject(message);
                        return deferred.promise;
                    };

                    if(_isLoggedIn()) {
                        $log.debug('_findCurrentUser - Immediately Resolving with logged in user : '+_getUserName());
                        //logged in user, resolve immediately
                        deferred.resolve(_getUserName());
                        return deferred.promise;
                    }
                    $log.debug('No logged in user found');
                    if ($localStorage.token) {
                        $log.debug('Found token in localstorage, using it to log user in');
                        // Let's try storing it
                        var decodedToken = _storeToken($localStorage.token);
                        if (_isLoggedIn()) {
                            $log.debug('Token valid and decoded and stored.');
                            //looks like we have some valid info with the current token
                            // let's check that we can successfully ping the backend
                            return _backendPing().then(
                                function(response){
                                    $log.debug('_findCurrentUser - The ping promise returned successfully with message',response);
                                    if(response.status && response.status+"" === "200") {
                                        $log.debug('Resolving _backendPing with "Authenticated", response.status: '+ response.status);
                                        $log.debug('_findCurrentUser resolving with username : ',_getUserName());
                                        deferred.resolve(_getUserName());
                                    } else {
                                        var message = response.status;
                                        $log.debug('rejecting _backendPing promise (2): '+ message);
                                        deferred.reject(message);
                                    }
                                    return deferred.promise;
                                },
                                function(error){
                                    $log.debug('_backendPing error response (6): '+ error);
                                    var message;
                                    if (error && error.data && error.data.message) {
                                        message = 'Error: ' + error.data.message;
                                    } else {
                                        message = 'Failed';
                                    }
                                    $log.debug('_findCurrentUser - The ping promise was rejected with message' + message,error);
                                    $log.debug('_findCurrentUser - Clearing all user info using _logout()');
                                    //clear all user information
                                    _logout();
                                    $log.debug('_findCurrentUser - Showing login panel');
                                    return renewloginpanel.show().then(loginPanelSuccess,loginPanelError);
                                }
                            );
                        } else {
                            $log.debug('Token from localstorage was not valid. Open a login panel.');
                            // we are not logged in
                            return _backendPing().then(
                                function(response) {
                                    if(response.status && response.status+"" === "200") {
                                        $log.debug('Resolving _backendPing with "Authenticated", response.status: '+ response.status);
                                        $log.debug('_findCurrentUser resolving with username : ',_getUserName());
                                        deferred.resolve(_getUserName());
                                        return deferred.promise;
                                    } else {
                                        if (response.data && response.data.status && (response.data.status === "ECAS_AUTHENTICATION_REQUIRED" || response.data.status === "CAS_AUTHENTICATION_REQUIRED")){
                                            $log.debug('ECAS/CAS AUth needed : '+ response.data);
                                            return ecasloginpanel.show().then(loginPanelSuccess,loginPanelError);
                                        } else {
                                            $log.debug('rejecting _backendPing promise (3): '+ response);
                                            return renewloginpanel.show().then(loginPanelSuccess, loginPanelError);
                                        }
                                    }
                                },
                                function(error) {
                                    $log.debug('_backendPing error response (7): '+ error);
                                    var message;
                                    if (error && error.data && error.data.message) {
                                        message = 'Error: ' + error.data.message;
                                    } else {
                                        message = 'Failed';
                                    }
                                    return renewloginpanel.show().then(loginPanelSuccess, loginPanelError);
                                }
                            );
                        }
                    } else {
                        $log.debug('No token in localStorage. Open a login panel.');
                        //we have no token

                        return _backendPing().then(
                            function(response){
                                if(response.status && response.status+"" === "200"){
                                    $log.debug('Resolving _backendPing with "Authenticated", response.status: '+ response.status);
                                    $log.debug('_findCurrentUser resolving with username : ',_getUserName());
                                    deferred.resolve(_getUserName());

                                    return deferred.promise;
                                } else {
                                    if (response.data && response.data.status && (response.data.status === "ECAS_AUTHENTICATION_REQUIRED" || response.data.status === "CAS_AUTHENTICATION_REQUIRED")){
                                        $log.debug('ECAS AUth needed : '+ response.data);
                                        return ecasloginpanel.show().then(loginPanelSuccess,loginPanelError);
                                    } else{

                                        $log.debug('rejecting _backendPing promise (4): ', response);
                                        return renewloginpanel.show().then(loginPanelSuccess, loginPanelError);
                                    }
                                }

                            },function(error) {
                                $log.debug('_backendPing error response (8): ', error);
                                var message;
                                if (error && error.data && error.data.message) {
                                    message = 'Error: ' + error.data.message;
                                } else {
                                    message = 'Failed';
                                }
                                return renewloginpanel.show().then(loginPanelSuccess, loginPanelError);
                            });

                            // return renewloginpanel.show().then(loginPanelSuccess, loginPanelError);
                    }
                    $log.debug('_findCurrentUser() - Exit');
                };

                var _switchContext = function () {
                    return $modal.open({
                        templateUrl: 'usm/shared/services/auth/selectContext.html',
                        controller: 'selectContextController'
                    }).result.then(
                        function(selectedContext){
                            _storeCurrentContexts(selectedContext);
                        },
                        function(error){
                            _clearCurrentContext();
                            $log.error(error);
                        }
                    );
                };

                return {
                    getUserName: _getUserName,
                    getToken: _getToken,
                    login: _storeToken,
                    reset: _reset,
                    logout: _logout,
                    isLoggedIn: _isLoggedIn,
                    isAllowed: _isAllowed,
                    findContexts: _findContexts,
                    getContexts:_getContexts,
                    getCurrentContext:_getCurrentContext,
                    findSelectedContext:_findSelectedContext,
                    findCurrentUser: _findCurrentUser,
                    setCurrentContexts:_storeCurrentContexts,
                    clearContext:_clearCurrentContext,
                    getRoleName:_getRoleName,
                    getScopeName:_getScopeName,
                    switchContext:_switchContext,
                    testJWT:_backendPing
                };

            }
        ])
        .controller('selectContextController',['$scope', '$log', '$modalInstance','userService',
            function ($scope, $log, $modalInstance, userService) {
                $scope.selectableContexts = userService.getContexts();
                $scope.selectedItem = userService.getCurrentContext();
                $scope.selectContext = function (ctxt) {
                    $log.debug('selected context',ctxt);
                    $modalInstance.close(ctxt);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }
        ])
        .controller('renewLoginCtrl',['$scope', '$log', '$modalInstance', 'authenticateUser', 'userService','$state','$stateParams',
            function ($scope, $log, $modalInstance, authenticateUser,userService,$state,$stateParams) {
                $scope.retry = function (loginInfo) {
                    authenticateUser.authenticate(loginInfo).then(
                        function (response) {
                            $log.log("renewLoginCtrl: ",response);
                            if(response.token) {
                                userService.login(response.token);
                                //thought about going to the requested state but this is probably not the right place
                                $modalInstance.close();
                            } else {
                                $scope.messageDivClass = "container alert alert-danger";
                                $scope.actionMessage = "There was a problem logging you in.";
                            }
                        },
                        function (error) {
                            $scope.messageDivClass = "container alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }
        ])
        .controller('initLoginCtrl',['$scope', '$log', 'authenticateUser', 'userService','$state','$stateParams','routeProtection',
            function ($scope, $log, authenticateUser,userService,$state,$stateParams,routeProtection) {
                $log.debug('$stateParams.toState',$stateParams.toState);
                $scope.retry = function (loginInfo) {
                    authenticateUser.authenticate(loginInfo).then(
                        function (response) {
                            if(response.token) {
                                userService.login(response.token);
                            }
                            $state.go($stateParams.toState||routeProtection.getHome(),{},{relative:false});
                        },
                        function (error) {
                            $scope.messageDivClass = "container alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                };
            }
        ])
        .service('renewloginpanel', ['$window','$modal', '$log',
            function ($window, $modal,$log) {
                this.show = function () {
                    return $modal.open({
                        templateUrl: 'usm/shared/services/auth/renewLogin.html',
                        controller: 'renewLoginCtrl'
                    }).result;
                };
            }
        ])
        .factory('authenticateUser',['$http', '$q','$resource', '$log',
            function($http, $q, $resource, $log) {
                return {
                    authenticate : function(loginInfo) {

                        var message = "";
                        var deferred = $q.defer();
                        var resource = $resource('/usm-administration/rest/authenticate');
                        resource.save({},loginInfo).$promise.then(
                            function(data){
                                //$log.log(data);
                                if (data.authenticated) {
                                    deferred.resolve({
                                        authenticated: data.authenticated,
                                        status: data.statusCode,
                                        token: data.jwtoken
                                        });
                                } else {
                                    if(data.statusCode === 49) {
                                        message = "Error: Invalid crendentials";
                                    } else if(data.statusCode === 530) {
                                        message = "Error: Invalid time";
                                    } else if(data.statusCode === 533) {
                                        message = "Error: Account disabled";
                                    } else if(data.statusCode === 701) {
                                        message = "Error: Password expired";
                                    } else if(data.statusCode === 775) {
                                        message = "Error: Account locked";
                                    } else if(data.statusCode === 773) {
                                        message = "Error: Password must be changed";
                                    } else if(data.statusCode === 1) {
                                        message = "Error: Internal error";
                                    } else if(data.statusCode === 80) {
                                        message = "Error: Other";
                                    } else {
                                        message = "Error: User \'" + loginInfo.username + "\' cannot be authenticated.";
                                    }
                                    deferred.reject(message);
                                }
                            },
                            function(error) {
                                //$log.log(angular.fromJson(loginInfo));
                                $log.log(error);
                                message = "Error: "+ error.statusText +" Status: " + error.status;
                                deferred.reject(message);
                            }
                        );
                        return deferred.promise;
                        /*
                         resource.get(loginInfo, function(data, responseHeaders){
                         if (data.authenticated) {
                         deferred.resolve({
                         authenticated: data.authenticated,
                         status: data.statusCode
                         })
                         } else {
                         deferred.reject(data);
                         }
                         }, function(httpResponse) {
                         $log.log("Service: Error");
                         deferred.reject(httpResponse);
                         });
                         */
                        /*
                         var req = {
                         dataType: 'json',
                         method: 'POST',
                         url: 'http://localhost:8080/usm-authent/rest/authentication/user/authenticate',
                         headers: reqHeaders,
                         data: loginInfo
                         };
                         $http(req).success(
                         function(){
                         $log.log("SUCCESS");
                         }).error(function(){
                         $log.log("ERROR");

                         });

                         $http.post('http://localhost:8080/usm-authent/rest/authentication/user/authenticate', loginInfo).
                         success(function(data, status, headers, config) {
                         // this callback will be called asynchronously
                         // when the response is available
                         }).
                         error(function(data, status, headers, config) {
                         $log.log("ERROR");
                         });
                         */

                    }
                };

            }])
        .controller('ecaslogincontroller',['$scope', '$log', '$modalInstance', 'authenticateUser', 'userService','$state','$stateParams','$window',
            function ($scope, $log, $modalInstance, authenticateUser,userService,$state,$stateParams,$window) {
                var callback = $window.document.URL.split('#')[0]+'#/jwtcallback';
                var _url = "/usm-administration/rest/ping?jwtcallback="+callback;
                $scope.status = "unopened";
                var receiveMessage = function (event)
                {
                    $scope.status = "Event received";
                    console.log(event);
                };

                //credits: http://www.netlobo.com/url_query_string_javascript.html
                function gup(url, name) {
                    name = name.replace(/[[]/,"[").replace(/[]]/,"]");
                    var regexS = "[?&]"+name+"=([^&#]*)";
                    var regex = new RegExp( regexS );
                    var results = regex.exec( url );
                    if( results == null ) {
                        return "";
                    } else {
                        return results[1];
                    }
                }

                $scope.open = function() {
                    var loginWindow = $window.open(_url, "windowname1", 'width=800, height=600');
                    $scope.status = "window opened";
                    $window.addEventListener("loginWindow", receiveMessage, loginWindow);

                    var pollingtries = 0;
                    var pollTimer   =   $window.setInterval(function() {
                        pollingtries++;
                        if(pollingtries > 100) {
                            $scope.status = "could not get token";
                            $window.clearInterval(pollTimer);
                        }
                        console.log("starting poll "+loginWindow.document.URL);
                        try {
                            console.log(loginWindow.document.URL);
                            if (loginWindow.document.URL.indexOf("jwt=") > 0) {
                                $scope.status = "found token, logging in";
                             $window.clearInterval(pollTimer);
                                var url =   loginWindow.document.URL;
                                var token =   gup(url, 'jwt');
                                userService.login(token);
                                loginWindow.close();
                                $modalInstance.dismiss();
                            }

                        } catch(e) {
                        }
                    }, 400);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }
        ])
        .service('ecasloginpanel', ['$window','$modal', '$log',
            function ($window, $modal,$log) {
                this.show = function () {
                    return $modal.open({
                        templateUrl: 'usm/shared/services/auth/EcasLogin.html',
                        controller: 'ecaslogincontroller'
                    }).result;
                };
            }
        ]);

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

 angular.module('auth.jwt', [])
    .service('jwtHelper', function() {
        this.urlBase64Decode = function(str) {
            var output = str.replace(/-/g, '+').replace(/_/g, '/');
            switch (output.length % 4) {
                case 0: { break; }
                case 2: { output += '=='; break; }
                case 3: { output += '='; break; }
                default: {
                    throw 'Illegal base64url string!';
                }
            }
            return decodeURIComponent(encodeURI(window.atob(output))); //polifyll https://github.com/davidchambers/Base64.js
        };

        this.decodeToken = function(token) {
            var parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('JWT must have 3 parts');
            }

            var decoded = this.urlBase64Decode(parts[1]);
            if (!decoded) {
                throw new Error('Cannot decode the token');
            }

            return JSON.parse(decoded);
        };

        this.getTokenExpirationDate = function(token) {
            var decoded;
            decoded = this.decodeToken(token);

            if(typeof decoded.exp === "undefined") {
                return null;
            }

            var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
            d.setUTCSeconds(decoded.exp);
            return d;
        };

        this.isTokenExpired = function(token, offsetSeconds) {
            var d = this.getTokenExpirationDate(token);
            offsetSeconds = offsetSeconds || 0;
            if (d === null) {
                return false;
            }
            var isValid = d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000));
            // Token expired?
            return !isValid;
        };
    });
}());
