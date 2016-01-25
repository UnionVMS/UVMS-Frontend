angular.module('auth.user-service', ['auth.router'])
    //todo: remove $state dependency
    .factory('userService', ['selectContextPanel', '$resource', '$q', '$log', '$localStorage', 'jwtHelper', '$rootScope', '$http', '$state', '$timeout',
        function (selectContextPanel, $resource, $q, $log, $localStorage, jwtHelper, $rootScope, $http, $state, $timeout) {
                var userName,
                    token,
                    contexts,
                    loggedin,
                currentContext,
                expired;

                var _reset = function () {
                    userName = "";
                    token = {};
                    loggedin = false;
                expired = null;
                    contexts = null;
                    currentContext = null;
                };

                _reset();

            var userContextResource = $resource('/usm-administration/rest/userContexts', {}, {
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
								if ((feat.featureName === feature || feat.name === feature ) && (feat.applicationName === app || !app)) {
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

            var _logout = function (toState, toParams) {
                var continueLogout = function(){
                    _reset();
                    delete $localStorage.token;
                    //do not wait for the success or failure of the call to delete sessions
                    delete $localStorage.sessionId;
                        _clearContexts();
                    if (toState) {
                        $state.go(toState, toParams);
                    }
                    $rootScope.$broadcast('UserLogoutDone');
                };
                // only call delete for sessionID if we still have a session.
                // the reason is that deleting the session requires to be authenticated.
                // if we have already been logged out that call will be rejected anyway
                // and this might in turn lead to a loop.
                if($localStorage.sessionId){
                    var resource = $resource('/usm-administration/rest/sessions/:sessionId',
                        {sessionId: $localStorage.sessionId});
                    resource.delete().$promise.finally(
                        function (data) {
                            continueLogout();
                        }
                    );
                } else {
                    continueLogout();
                }

            };

            var _isLoggedIn = function () {
                return loggedin;
            };
            var _isExpired = function () {
                return expired;
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

            var _storeCurrentContext = function (ctxt) {
                    currentContext = ctxt;
                    //let's store the roleName and scope so that when a user comes back we select this by default

                    $localStorage.roleName = _getRoleName();
                    $localStorage.scopeName = _getScopeName();
                    $rootScope.$broadcast('ContextSwitch');
                };

            var _clearCurrentContext = function () {
                    currentContext = null;
                    // we will not delete it from localStorage to give us a chance
                    // to reuse the previously selected context when the user logs in
                };

                var _clearContexts = function () {
                    contexts = null;
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
                return _isUserIdentifiedPromise().then(
                            function (user) {
                                // We can try getting the contexts from the server based on what looks like a valid user
                        return userContextResource.get().$promise.then(
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
                        $log.debug('_isUserIdentifiedPromise error response (1): '+ error);
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
                $log.debug("_findSelectedContext Starts");
                    var message = "";
                    var deferred = $q.defer();
                    if (currentContext) {
                        // we have a current context let's resolve the promise
                    $log.debug("_findSelectedContext resolving immediately");
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
                            deferred.resolve(
                                {}
                            );
                                return deferred.promise;
                            } else if(selectableContexts.length === 1){
                            $log.debug("single context, selecting it");
                                //only one context, let's select it
                            _storeCurrentContext(selectableContexts[0]);
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
                                _storeCurrentContext(foundContext);
                                    deferred.resolve(currentContext);
                                    return deferred.promise;
                                } else {
                                    //we have some contexts, and no previously stored context. Must select one
                                    $log.debug('No matching context in localStorage');

                                return selectContextPanel.show().then(
                                        function (selectedContext) {
                                        _storeCurrentContext(selectedContext);
                                            deferred.resolve(selectedContext);
                                            return deferred.promise;
                                        },
                                        function (error) {
                                        $log.debug('authRouter.selectContext() rejected promise: '+ error);
                                            if (error && error.data && error.data.message) {
                                                message = 'Error: ' + error.data.message;
                                            } else {
                                                message = 'Failed';
                                            }

                                            $log.error(error);
                                        //let's select the first context
                                        _storeCurrentContext(selectableContexts[0]);
                                        deferred.resolve(selectableContexts[0]);
                                            return deferred.promise;
                                        }
                                    );
                                }
                            }
                        },
                        function (error) {
                        $log.debug('_findContexts error response ', error);
                            if (error && error.data && error.data.message) {
                                message = 'Error: ' + error.data.message;
                            } else {
                                message = 'Failed';
                            }
                            _clearCurrentContext();
                            $log.error(error);
                        $log.error("No contexts to choose from");
                        deferred.resolve(
                            {}
                        );
                            return deferred.promise;
                        }
                    );
                };

                var _backendPing = function(retval) {
                    $log.debug('_backendPing - returning an $http promise to ping the backend');
                    var deferred = $q.defer();
                    $rootScope.$broadcast('UserPingStart');
                    //Timeout in 15 seconds
                    var pingTimeout = $timeout(function(){
                        $rootScope.$broadcast('UserPingError');
                    }, 15000);
                    return $http(pingRequest)
						.success(function(response, status, headers, config) {
                            $timeout.cancel(pingTimeout);
                            $rootScope.$broadcast('UserPingSuccess');
                            $log.debug('_backendPing Success response:', response," - extstatus: ",headers()['extstatus']);
							//if(headers()['extstatus'] === '701') {
								//$rootScope.$broadcast('NeedChangePassword');
								//deferred.headers['extMessage'] = "'User authenticated but password expired. User should change password NOW!'"; //{ 'extMessage' : 'User authenticated but password expired. User should change password NOW!' };
								//deferred.headers['extstatus'] = "701"; //{ 'extstatus' : '701' };
							//}
                        })
						.error(function(error, status, headers, config) {
                            $timeout.cancel(pingTimeout);
                            $rootScope.$broadcast('UserPingError');
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

            /*
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
             */

            var _isUserIdentifiedPromise = function () {
                $log.debug('_isUserIdentifiedPromise() - Enter');
                var message = "";
                var deferred = $q.defer();

                if (_isLoggedIn()) {
                    $log.debug('_isUserIdentifiedPromise - Immediately Resolving with logged in user : ' + _getUserName());
                    //logged in user, resolve immediately
                    deferred.resolve(_getUserName());
                    return deferred.promise;
            }
                $log.debug('No logged in user found');
                var validToken = $localStorage.token;
                if (validToken) {
                    $log.debug('Found token in localstorage, using it to log user in');
                    // Let's try storing it
                    var decodedToken = _storeToken(validToken);
                    if (_isLoggedIn()) {
                        $log.debug('Token valid and decoded and stored.');
                        //looks like we have some valid info with the current token
                        // let's check that we can successfully ping the backend
                        return _backendPing().then(
                        function (response) {
								if (!_.isUndefined(response.headers()["extstatus"])) {
                                    expired = false;
                                    if (response.headers()["extstatus"] === "701") {
                                        expired = true;
										$rootScope.$broadcast('NeedChangePassword');
										$log.debug("User authenticated but password expired (701). User should change password NOW!");
                                    } else if (response.headers()["extstatus"] === "773") {
										$log.debug("User authenticated but password is about to expire (773). User is suggested to change password.");
									}
								}
                                $log.debug('_isUserIdentifiedPromise - The ping promise returned successfully with message', response);
                                if (response.status && response.status + "" === "200") {
                                    $log.debug('Resolving _backendPing with "Authenticated", response.status: ' + response.status);
                                    $log.debug('_isUserIdentifiedPromise resolving with username : ', _getUserName());
                                    deferred.resolve(_getUserName());
                            } else {
                                    var message = response.status;
                                    $log.debug('rejecting _backendPing promise (5): ' + message);
                                    deferred.reject(message);
                            }
                                return deferred.promise;
                        },
                        function (error) {
                                $log.debug('_backendPing error response (9): ' + error);
                                var message;
                                if (error && error.data && error.data.message) {
                                    message = 'Error: ' + error.data.message;
                                } else {
                                    message = 'Failed';
						}
                                $log.debug('_isUserIdentifiedPromise - The ping promise was rejected with message' + message, error);
                                $log.debug('_isUserIdentifiedPromise - Clearing all user info using _logout()');
                                //clear all user information
                                _logout();
                                $log.debug('rejecting _backendPing promise (6): ' + message);
                                deferred.reject(message);
                                return deferred.promise;
                        }
                    );
                    } else {
                        validToken = false;
            }
                            }
                if (!validToken) {
                        $log.debug('Token from localstorage was not valid. do a backend ping in case this is a CAS/ECAS handled session.');
                        // we are not logged in
                        return _backendPing().then(
                        function (response) {
                            expired = false;
								if (!_.isUndefined(response.headers()["extstatus"])) {

                                if (response.headers()["extstatus"] === "701") {
                                    expired = true;
                                    $rootScope.$broadcast('NeedChangePassword');
										$log.debug("User authenticated but password expired (701). User should change password NOW!");
                                } else if (response.headers()["extstatus"] === "773") {
										$log.debug("User authenticated but password is about to expire (773). User is suggested to change password.");
                        }
            }
                            if (response.status && response.status + "" === "200") {
                                $log.debug('Resolving _backendPing with "Authenticated", response.status: ' + response.status);
                                $log.debug('_isUserIdentifiedPromise resolving with username : ', _getUserName());
                                    deferred.resolve(_getUserName());
                                    return deferred.promise;
                                } else {
                                if (response.data && response.data.status && (response.data.status === "ECAS_AUTHENTICATION_REQUIRED" || response.data.status === "CAS_AUTHENTICATION_REQUIRED")) {
                                    $log.debug('ECAS/CAS AUth needed : ' + response.data);
                                    $log.debug('rejecting _backendPing promise (7): ' + response);
                                        deferred.reject(message);
                                    } else {
                                    $log.debug('rejecting _backendPing promise (8): ' + response);
                                        deferred.reject(message);
                                    }
                                    return deferred.promise;
                                }
                            },
                        function (error) {
                            $log.debug('_backendPing error response (10): ' + error);
                                var message;
                                if (error && error.data && error.data.message) {
                                    message = 'Error: ' + error.data.message;
                                } else {
                                    message = 'Failed';
                        }
                            $log.debug('rejecting _backendPing promise (9): ' + message);
                                deferred.reject(message);
                                return deferred.promise;
                            }
                        );
                         }

                $log.debug('_isUserIdentifiedPromise() - Exit');
				};
            var _getIdentifiedUser = function () {
                        var deferred = $q.defer();
                return _isUserIdentifiedPromise().then(
                    function (user) {
                        deferred.resolve(user);
                        return deferred.promise;
                                        },
                    function (error) {
                        deferred.resolve('');
                        return deferred.promise;
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
                isExpired: _isExpired,
                isAllowed: _isAllowed,
                findContexts: _findContexts,
                getContexts: _getContexts,
                getCurrentContext: _getCurrentContext,
                findSelectedContext: _findSelectedContext,
                findCurrentUser: _getIdentifiedUser,
                isUserIdentified: _isUserIdentifiedPromise,
                setCurrentContext: _storeCurrentContext,
                clearContext: _clearCurrentContext,
                getRoleName: _getRoleName,
                getScopeName: _getScopeName,
                testJWT: _backendPing
                };
            }
        ]);
