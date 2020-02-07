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
angular.module('auth.interceptor', ['ngStorage','ui.bootstrap'])

/**
 * @ngdoc object
 * @name auth.interceptor.authInterceptor
 *
 * @requires ngStorage
 * @requires ui.bootstrap
 *
 * @description
 * `authInterceptor` is responsible for adding the authrisation headers to http requests made to the backend.
 */
	.provider('authInterceptor', function() {

		this.urlParam = null;
		this.authHeader = 'Authorization';
		this.roleHeader = 'roleName';
		this.scopeHeader = 'scopeName';
		this.authPrefix = '';
        /**
         * @ngdoc boolean
         * @name authInterceptor#injectPanel
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * Property to configure automatic loginpanel injection
         * On false, 403 error response will simply broadcast an "authenticationNeeded" event.
         *
         */
        this.injectPanel = true;

        /**
         * @ngdoc function
         * @name authInterceptor#tokenGetter
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * Overridable function that returns the authorisation token that the interceptor will add to the header
         * for each request
         *
         */
		this.tokenGetter = ['$localStorage','$log', function($localStorage,$log) {
			//myService.doSomething();
			return $localStorage.token;
		}];

        /**
         * @ngdoc function
         * @name authInterceptor#contextGetter
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * Overridable function that returns the an object containing the role and scope
         * identifying the current context. These will be added as headers to each request
         *
         */
		this.contextGetter = ['userService','$log', function(userService,$log) {
			var role = userService.getRoleName();
            var scope = userService.getScopeName();
			return {role:role,scope:scope};
		}];

        /**
         * @ngdoc function
         * @name authInterceptor#authFilter
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * Overridable function to filter some requests from getting an auth header. These could be fixed html
         * or json resources. The function will be passed the request config object. No Authorisation header
         * will be added to requests for which the filter returns true.
         * The default implementation returns always false meaning that the authorisation header gets added to
         * every request.
         *
         */
		this.authFilter = function() {
			return false;
		};

        /**
         * @ngdoc function
         * @name authInterceptor#responseErrFilter
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * Overridable function to filter some error response from getting intercepted. The error responses for which
         * the filter returns false will get the default handling of the interceptor (see responseError)
         * Those for which it returns true will not get intercepted and the rejection will be returned.
         * The default implementation returns always false meaning that the authorisation header gets added to
         * every request.
         *
         */
		this.responseErrFilter = ['config','$log', function(config,$log) {
			var skipPattern = /usm-administration\/rest\/(ping|sessions)/i;
			return skipPattern.test(config.url);
		}];

        /**
         * @ngdoc object
         * @name authInterceptor#rebaseApiList
         * @methodOf auth.interceptor.authInterceptor
         *
         * @description
         * An array of rebase urlpatterns and the new API Base.
         * Each element of the ´rebaseApiList´ should have a urlPatterns array and an apibase string
         * example:
         * this.rebaseApiList = [{urlPatterns:['/vessel/rest',
            '/mobileterminal/rest',
            '/exchange/rest',
            '/movement/rest',
            '/audit/rest',
            '/rules/rest',
            '/reporting/rest'],apibase:"https://bob.com/"},
         {urlPatterns:["/usm-administration/rest/roles"],apiBase:'https://cygnus-test.athens.intrasoft-intl.private:28443'}];
         *
         */
        this.rebaseApiList = [];

		var config = this,
		unauth = false;

		this.$get = ["$q", "$injector", "$rootScope","$localStorage",'$timeout','$log', function ($q, $injector, $rootScope,$localStorage,$timeout,$log) {
			var isAuth = function(response){
				$log.debug('isAuth response '+response);
			};
            var _log = $log;

			return {
				request: function (request) {
                    _log.debug("authInterceptor request handling",request);
					var skipFilter = $injector.invoke(config.authFilter, this, {
						config: request
					});
                    //when authenticating we don't want to send the authorisation header
                    //todo: make the authenticate rest url configurable
                    skipFilter = skipFilter || /usm-administration\/rest\/authenticate/i.test(request.url);
					if (request.skipAuthorization ||skipFilter) {
                        _log.debug("authInterceptor skipping request");
						return request;
					}
                    /*
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
                    */

                    var isRebaseApiRequest = false;
                    for (var i = 0, leni = config.rebaseApiList.length; i < leni; i++) {
                        var rebaseApi = config.rebaseApiList[i];
                        for (var j = 0, lenj = rebaseApi.urlPatterns.length; j < lenj; j++) {
                            var pattern = rebaseApi.urlPatterns[j];
                            if (request.url.indexOf(pattern) === 0) {
                                isRebaseApiRequest = true;
                                break;
                            }
                        }
                        if (isRebaseApiRequest) {
                            var newUrl = rebaseApi.apiBase + request.url;
                            _log.debug("Rebase request from " + request.url + " to " + newUrl);
                            request.url = newUrl;
                            break;
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
                                _log.debug("authInterceptor appending auth token to url");
                                request.params[config.urlParam] = token;
                            } else {
                                _log.debug("authInterceptor appending auth token to headers");
                                request.headers[config.authHeader] = config.authPrefix + token;
                            }
                        }
                        request.headers['X-Requested-With'] = 'XMLHttpRequest';
                        return contextPromise.then(function (context) {
                            _log.debug("authInterceptor appending context identifiers ("+context.role+", "+context.scope+") to headers");
                            if (context) {
                                request.headers[config.roleHeader] = config.authPrefix + context.role;
                                request.headers[config.scopeHeader] = config.authPrefix + context.scope;
                            }
                            return request;
                        });
                    });
				},
				response: function (response) {
					$q.when(response).then(
						function (response) {
							if (!_.isUndefined(response.headers()["authorization"])) {
                                _log.debug("got an updated token. Let's store it");
								$localStorage.token = response.headers()["authorization"];
                                unauth = false;
							}
                            //TODO: handle expired password status
                            if (!_.isUndefined(response.headers()["extstatus"])) {
                                _log.debug("extstatus header",response.headers()["extstatus"]);
                                if (response.headers()["extstatus"] === "701") {
                                    $log.debug("User authenticated but password expired (701). User should change password NOW!");
                                    $rootScope.$broadcast('NeedChangePassword');
                                } else if (response.headers()["extstatus"] === "773") {
                                    $log.debug("User authenticated but password is about to expire (773). Should suggest to change password.");
                                    $rootScope.$broadcast('WarningChangePassword');
                                }
                            }

						}
					);
					return response;
				},
				responseError: function (rejection) {

                    _log.debug("request was rejected");
					var skipErrFilter = $injector.invoke(config.responseErrFilter, this, {
                        config: rejection.config
					});

					if(skipErrFilter){
						return rejection;
					}
                    var userService = $injector.get('userService');
                    var globalSettings = $injector.get('globalSettingsService');

                    var forbidden = function(error) {
                        _log.log("Request rejected with status 403 and panel injection true");
                        unauth = true;
                        // Inject services
                        var $state = $injector.get('$state');
                        var authRouter = $injector.get('authRouter');
                        _log.debug("Current State",$state.current);
                        if($state.current && $state.current.name !== authRouter.getLogin() && $state.current.name !== ""){

                        _log.log("injecting renewLoginPanel");

                        var Retry = $injector.get('renewloginpanel');
                        var $http = $injector.get('$http');
                        var $uibModalStack = $injector.get('$uibModal');

                        return $timeout(angular.noop, 200).then(function () {
                            return Retry.show();
                        }).then(function () {
                            _log.log("retry request succeeded?");
                            unauth = false;
                            _log.debug($state.current);
                            $uibModalStack.dismissAll();
                            $state.reload($state.current);
                            $state.go($state.current, {}, {reload: true});
                            if (rejection.config.headers[config.authHeader]) {
                                rejection.config.headers[config.authHeader] = null;
                            }
                                return $http(rejection.config);
                        }, function () {
                            if (unauth) {
                                $log.log("retry request failed?");
                                unauth = true;
                                userService.logout();
                                $uibModalStack.dismissAll();
                                $rootScope.$broadcast('authenticationNeeded');
                                return $q.reject(rejection);
                            }
                        });
                        }
                    };

                    if (rejection.status === 403 && config.injectPanel && !unauth) {
                        if (rejection.config.url.indexOf('config/rest/globals') !== -1) {
                            forbidden();
                        }
                    	globalSettings.getSettingsFromServerWithoutUpdate().then(function(response){
							return $q.reject(rejection);
                    	}, forbidden);
                    } else if (rejection.status === 403 && !unauth) {
                        _log.log("Request rejected with status 403");
                        unauth = true;
                        userService.logout();
                        $rootScope.$broadcast('authenticationNeeded');
                        return $q.reject(rejection);
					} else {
						return $q.reject(rejection);
					}
				}
			};
		}]; // this.$get
	});
