/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @ngdoc object
 * @name auth.controllers
 *
 * @requires ui.bootstrap
 * @requires ui.router
 *
 * @description
 * The `auth.controllers` module contains the controllers and services needed for the auth module.
 *
 */

angular.module('auth.controllers', ['ui.bootstrap', 'ui.router'])
/**
 * @ngdoc object
 * @name auth.controllers.selectContextController
 *
 * @description
 * Controller for the switch context modal dialog.
 * Has the array of selectable contexts in `$scope.selectableContexts` and the currently selected context in
 * `$scope.selectedItem`.
 * Loops through the contexts in `$scope.selectableContexts` and sets a `selected` boolean property to true for the
 * currently selected one.
 * This allows using these in the template like this:
 * <pre>
 *   <li ng-repeat="item in selectableContexts" id="selectableContext">
 *     <a ng-if="!item.selected" ng-click="selectContext(item)">{{ item.role.roleName }} - {{ item.scope.scopeName||"(no scope)" }}</a>
 *     <b ng-if="item.selected">{{ item.role.roleName }} - {{ item.scope.scopeName||"(no scope)" }}</b>
 *   </li>
 * </pre>
 *
 */
    .controller('selectContextController', ['$scope', '$log', '$modalInstance', 'userService', '$state',
        function ($scope, $log, $modalInstance, userService, $state) {
            $scope.selectableContexts = userService.getContexts();
            $scope.selectedItem = userService.getCurrentContext();
            var toState = null;
            if ($state.params.toState) {
                toState = {state: $state.params.toState, params: $state.params.toParams};
            }
            for (var i = 0, len = $scope.selectableContexts.length; i < len; i++) {
                var ctxt = $scope.selectableContexts[i];
                if ($scope.selectedItem && $scope.selectedItem.role && ctxt.role.roleName === $scope.selectedItem.role.roleName) {
                    //role names match, let's check scope
                    if (
                        ($scope.selectedItem.scope && ctxt.scope && ctxt.scope.scopeName &&
                        $scope.selectedItem.scope.scopeName === ctxt.scope.scopeName) ||
                        (!$scope.selectedItem.scope && !ctxt.scope)) {
                        ctxt.selected = true;
                    } else {
                        ctxt.selected = false;
                    }
                            } else {
                    ctxt.selected = false;
                            }

                    }
            $scope.selectContext = function (ctxt) {
                $log.debug('selected context', ctxt);
                $modalInstance.close(ctxt);
                if (toState) {
                    $state.go(toState.state, toState.params);
                } else {
                $state.reload($state.current);
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss();
        };
        }
    ])
    .controller('modalLoginController', ['$scope', '$log', '$modalInstance', 'authenticateUser', 'userService', '$state', '$stateParams', '$modal', '$rootScope',
        function ($scope, $log, $modalInstance, authenticateUser, userService, $state, $stateParams, $modal, $rootScope) {
            $scope.infoMessage = $stateParams.message;
			if (!_.isUndefined($stateParams.toState)) {
                $log.debug('Login required before accessing state ' + $stateParams.toState.name);
			} else {
				$log.debug('Login required before accessing state <undefined>');
            }
            $scope.retry = function (loginInfo) {
                authenticateUser.authenticate(loginInfo).then(
                    function (response) {
                        $log.log("renewLoginCtrl: ", response);
                        if (response.token) {
							userService.login(response.token);
                            //thought about going to the requested state but this is probably not the right place
                            $modalInstance.close();
                            } else {
							$scope.messageDivClass = "alert alert-danger";
							$scope.actionMessage = "There was a problem logging you in. No token received";
                        }

                        if (response.status === 701) {
							$log.log("_storeToken - status: ", status);
							//userService.hasToChangePwd = true;
							$rootScope.$broadcast('NeedChangePassword');
                        } else if (response.status === 773) {
							$log.log("_storeToken - status: ", status);
							$rootScope.$broadcast('WarningChangePassword');
                                    }

					},
					function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                                }
                                );
                    };

            $scope.resetPassword = function () {

                    return $modal.open({
                    templateUrl: 'service/common/auth/templates/resetPassword.html',
                    controller: 'resetPasswordController'
                    }).result.then(
                    function (error) {
                            $log.error(error);
                    }
                    );
                };

				$scope.cancel = function () {
                $log.debug('Dismissing login panel');
					$modalInstance.dismiss();
                };

                                }
		])

    .controller('loginController', ['$scope', '$log', 'authenticateUser', 'userService', '$state', '$stateParams', 'authRouter', '$modal',
        function ($scope, $log, authenticateUser, userService, $state, $stateParams, authRouter, $modal) {
            $log.debug('$stateParams.toState', $stateParams.toState);
            var toState = $stateParams.toState;
            var toParams = $stateParams.toParams;
                $scope.retry = function (loginInfo) {
					authenticateUser.authenticate(loginInfo).then(
						function (response) {
                        if (response.token) {
								userService.login(response.token);
                            $state.go(toState, toParams);
                        } else {
								$scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = "There was a problem logging you in. No token received";
                        }
						},
						function (error) {
							$scope.messageDivClass = "alert alert-danger";
							$scope.actionMessage = error;
                    }
					);
                };
                $scope.resetPassword = function () {

                  return $modal.open({
                    templateUrl: 'service/common/auth/templates/resetPassword.html',
                        controller: 'resetPasswordController'
                     }).result.then(
                    function (error) {
                         $log.error(error);
                        }
                     );
                };
        }
    ])

    .controller('logoutController', ['$scope', '$log', '$state', '$stateParams', 'userService',
        function ($scope, $log, $state, $stateParams, userService) {

            $scope.loginState = $stateParams.loginState;
            $scope.logoutMessage = $stateParams.logoutMessage;
            userService.logout();


                    }
    ])
    .controller('accessErrorController', ['$scope', '$log', '$state', '$stateParams', 'userService',
        function ($scope, $log, $state, $stateParams, userService) {

            $scope.loginState = $stateParams.loginState;
            $scope.message = $stateParams.message;


                    }
    ])
    .service('renewloginpanel', ['$window', '$modal', '$log',
        function ($window, $modal, $log) {
            this.show = function () {
                return $modal.open({
                    templateUrl: 'service/common/auth/templates/renewLogin.html',
                    controller: 'modalLoginController',
                    backdrop: 'static'
                }).result;
                };
                    }
    ])
    .service('selectContextPanel', ['$window', '$modal', '$log',
        function ($window, $modal, $log) {
            this.show = function () {
                return $modal.open({
                    templateUrl: 'service/common/auth/templates/selectContext.html',
                    controller: 'selectContextController'
                }).result;
                };
			}
		])


    .controller('resetPasswordController', ['$scope', '$log', '$modalInstance', 'resetPasswordServices', '$state', '$stateParams', '$modal', '$timeout',
        function ($scope, $log, $modalInstance, resetPasswordServices, $state, $stateParams, $modal, $timeout) {

                $scope.formDisabled = true;
                $scope.editForm = true;
                $scope.showSubmit = false;
                $scope.showEdit = true;

                $scope.securityQuestionsList = [];
            $scope.securityQuestions = {};
                //  securityQuestionsList = []

                //panel
                $scope.resetPasswordUpdated = false;
                $scope.showConfirmation = false;

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };

                $scope.resetPasswordUser = function (userNameInfo) {
                    resetPasswordServices.resetPassword(userNameInfo).then(
                        function (response) {

                            var updatedResetPassword = response;

                            $scope.securityQuestionsList  = response.challengeInformationResponse;

                        $log.log("resetPasswordController: ", response);

                        if ($scope.securityQuestionsList !== null && $scope.securityQuestionsList !== '' && $scope.securityQuestionsList.length !== 0) {

                                $scope.resetPasswordUpdated = true;
                                $scope.messageDivClass = "alert alert-success";

                                $timeout(function () {
                                    $modalInstance.close(updatedResetPassword);
                                }, 2000);

                                var modalInstance = $modal.open({
                                    animation: true,
                                backdrop: 'static',
                                    keyboard: true,
                                templateUrl: 'service/common/auth/templates/resetPasswordSecurityQuestions.html',
                                    controller: 'resetPasswordSecurityQuestionsModalInstanceCtrl',
                                    resolve: {
                                    resetPasswordSecurityQuestions: function () {
                                            var resetPassword = {
                                            userName: userNameInfo,
                                            securityQuestionsList: $scope.securityQuestionsList
                    };

                                            return resetPassword;
                                                }
                                            }
                                });

                                modalInstance.result.then(function () {
                                    $log.info('Trace: Modal closed');

                                }, function () {
                                    $log.info('Trace: Modal dismissed');
                                });

                                } else {
                            if (response.challengeInformationResponse.length === 0) {

                                    $scope.resetPasswordUpdated = true;
                                    $scope.messageDivClass = "alert alert-success";
                                    $scope.actionMessage = "A new password has been sent to your email address.";

                                    $timeout(function () {
                                        $modalInstance.close(updatedResetPassword);
                                    }, 2000);

                            } else {
                                    $scope.messageDivClass = "alert alert-danger";
                                    $scope.actionMessage = "There was a problem by resetting the password.";
                                }
                            }
                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );

                };
                        }
        ])


    .controller('resetPasswordSecurityQuestionsModalInstanceCtrl', ['$scope', '$log', '$modalInstance', 'resetPasswordSecurityQuestions', 'resetPasswordServices', '$timeout',
        function ($scope, $log, $modalInstance, resetPasswordSecurityQuestions, resetPasswordServices, $timeout) {

                $scope.formDisabled = true;
                $scope.editForm = true;
                $scope.showSubmit = false;
                $scope.showEdit = true;

                //To initialize the object $scope.mySecurityQuestions of the html template
            $scope.mySecurityQuestions = {
                    results: [],
                    userPassword: ''
                };

            for (var i = 0; i < resetPasswordSecurityQuestions.securityQuestionsList.length; i++) {
                    $scope.mySecurityQuestions.results.push({
                    challenge: resetPasswordSecurityQuestions.securityQuestionsList[i],
                    response: ''
                    });
                                }

                //To establish the number of questions/answers to display in the panel
            if ($scope.mySecurityQuestions.results.length === 2) {
                    $scope.show2questions = true;
                    $scope.show3questions = false;
            } else {
                if ($scope.mySecurityQuestions.results.length === 1) {
                        $scope.show2questions = false;
                        $scope.show3questions = false;
                } else {
                        $scope.show2questions = true;
                        $scope.show3questions = true;
                    }
                        }

                //Panel
                $scope.securityQuestionsUpdated = false;
                $scope.showConfirmation = false;

                $scope.cancel = function () {
                    $log.info('Modal dismissed at');
                    $modalInstance.dismiss();
                };

                $scope.saveMySecurityAnswer = function (mySecurityQuestions) {
                $log.info('resetPasswordServices.resetPasswordSecurityAnswers: ', resetPasswordSecurityQuestions.userName);

                resetPasswordServices.resetPasswordSecurityAnswers(resetPasswordSecurityQuestions.userName, $scope.mySecurityQuestions).then(
                        function (response) {

                            var updatedResetPasswordSecurityQs = response;

                        $log.log("resetPasswordSecurityAnswers: ", response);

                            $scope.resetPasswordUpdated = true;
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "The new password has been set.";

                            $scope.securityQuestionsUpdated = true;

                            $timeout(function () {
                                $modalInstance.close(updatedResetPasswordSecurityQs);
                            }, 2000);

                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );

                };
            }
        ])

		.service('changepasswordpanel', ['$window','$modal', '$log',
			function ($window, $modal,$log) {
				this.show = function () {
					return $modal.open({
						templateUrl: 'usm/users/partial/changeMyPassword.html',
						controller: 'setMyPasswordModalInstanceCtrl',
						backdrop : 'static',
						keyboard: false,
                        resolve: {
                            expiredPwd : function(){return true;}
                        }
					}).result;
                };
            }
        ])
		.service('warningpasswordpanel', ['$window','$modal', '$log',
			function ($window, $modal, $log) {
                this.show = function () {
                    return $modal.open({
						templateUrl: 'usm/users/partial/warningPassword.html',
						controller: 'warningPasswordModalInstanceCtrl'
                    }).result;
                };
            }
        ])

    .factory('authenticateUser', ['$http', '$q', '$resource', '$log', '$localStorage',
        function ($http, $q, $resource, $log, $localStorage) {
                return {
                authenticate: function (loginInfo) {

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
                                                    token: data.jwtoken,
                                        sessionId: data.sessionId
                                                });
                                    $localStorage.sessionId = data.sessionId;
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
                                        var desc = (data.errorDescription && data.errorDescription !== "null")?" - "+data.errorDescription:"";
                                        message = "Error: Account locked" + desc;
                                    } else if(data.statusCode === 773) {
                                        message = "Error: Password must be changed";
                                    } else if(data.statusCode === 774) {
                                        message = "Error: Maximum number of sessions exceeded";
                                    }
                                    else if(data.statusCode === 1) {
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
    .controller('ecaslogincontroller', ['$scope', '$log', '$modalInstance', 'authenticateUser', 'userService', '$state', '$stateParams', '$window',
        function ($scope, $log, $modalInstance, authenticateUser, userService, $state, $stateParams, $window) {
            var callback = $window.document.URL.split('#')[0] + '#/jwtcallback';
            var _url = "/usm-administration/rest/ping?jwtcallback=" + callback;
                $scope.status = "unopened";
            var receiveMessage = function (event) {
                    $scope.status = "Event received";
                    $log.log(event);
                };

                //credits: http://www.netlobo.com/url_query_string_javascript.html
                function gup(url, name) {
                name = name.replace(/[[]/, "[").replace(/[]]/, "]");
                var regexS = "[?&]" + name + "=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(url);
                if (results == null) {
                        return "";
                    } else {
                        return results[1];
                    }
                }

            $scope.open = function () {
                    var loginWindow = $window.open(_url, "windowname1", 'width=800, height=600');
                    $scope.status = "window opened";
                    $window.addEventListener("loginWindow", receiveMessage, loginWindow);

                    var pollingtries = 0;
                var pollTimer = $window.setInterval(function () {
                        pollingtries++;
                    if (pollingtries > 100) {
                            $scope.status = "could not get token";
                            $window.clearInterval(pollTimer);
                        }
                    $log.log("starting poll " + loginWindow.document.URL);
                        try {
                            $log.log(loginWindow.document.URL);
                            if (loginWindow.document.URL.indexOf("jwt=") > 0) {
                                $scope.status = "found token, logging in";
                             $window.clearInterval(pollTimer);
                                var url =   loginWindow.document.URL;
                                var token =   gup(url, 'jwt');
                                userService.login(token);
                                loginWindow.close();
                                $modalInstance.dismiss();
                            }

                    } catch (e) {
                        }
                    }, 400);
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss();
                };
            }
        ])
    .service('ecasloginpanel', ['$window', '$modal', '$log',
        function ($window, $modal, $log) {
                this.show = function () {
                    return $modal.open({
                    templateUrl: 'service/common/auth/templates/EcasLogin.html',
                        controller: 'ecaslogincontroller'
                    }).result;
                };
            }
        ]);