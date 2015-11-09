var sharedModule = angular.module('shared');

sharedModule.controller('MenuCtrl', ['$rootScope', '$scope', '$state', '$translate', '$stateParams', '$log', '$cookies', 'userService', 'changesService',
    function ($rootScope, $scope, $state, $translate, $stateParams, $log, $cookies, userService, changesService) {

        var checkReviewContactDetails = function () {
            if(userService.isLoggedIn()){
                changesService.isReviewContactDetailsEnabled().then(
                    function (response) {
                        $scope.isReviewContactDetailsEnabled = response.isReviewContactDetailsEnabled;
                    }
                );
            } else {
                $scope.isReviewContactDetailsEnabled = false;
            }
        };

        $scope.init = function () {
            $scope.lang = $cookies.lang ? $cookies.lang : 'en';
            $translate.use($scope.lang);
            checkReviewContactDetails();
        };
        $scope.init();

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        $rootScope.$on("ReviewContactDetails", function() {
            checkReviewContactDetails();
        });

        $scope.switchLanguage = function (langKey) {
            $translate.use(langKey);
            $cookies.lang = langKey;
        };

    }]);
sharedModule.controller('FooterController', ['$scope', '$log', 'CFG',
    function ($scope, $log, CFG) {

        $scope.mavenversion = CFG.maven.version ? CFG.maven.version : '';
        $scope.buildTS = CFG.maven.timestamp ? CFG.maven.timestamp : CFG.gruntts;
        $scope.USM = CFG.USM;


    }]);
sharedModule.controller('userMenuController', ['$log','selectContextPanel','authRouter', '$scope', 'userService', 'renewloginpanel', '$rootScope', '$state', '$location',
    function ($log, selectContextPanel, authRouter, $scope, userService, renewloginpanel, $rootScope, $state, $location) {
    var init = function () {
        $scope.userName = userService.getUserName();
        $scope.authenticated = userService.isLoggedIn();
        $scope.contexts = userService.getContexts();
        $scope.currentContext = userService.getCurrentContext();
        $scope.logoutState = authRouter.getLogout();
    };
    init();
    $rootScope.$on('AuthenticationSuccess', function () {
        init();
    });
    $rootScope.$on('Logout', function () {
        init();
    });
    $rootScope.$on('ContextSwitch', function () {
        init();
    });

    /*$scope.logout = function () {
        $state.go(authRouter.getLogout(),{logoutMessage:"You have successfully logged out."});
        init();
        //$state.go('app.usm');
        //$state.go('login');
        //$scope.openlogin();
    };*/
    $scope.openlogin = function () {
        $state.go(authRouter.getLogin(),{toState:authRouter.getHome()});
        //renewloginpanel.show().then(function () {
        //    init();
        //});
    };
    $scope.switchContext = function () {
        selectContextPanel.show().then(
            function(selectedContext){
                userService.setCurrentContext(selectedContext);
            init();
            },
            function(error){

                init();
                $log.error(error);
        });
    };

}]);

sharedModule.controller('setMyPasswordModalInstanceCtrl', ['$state', '$log', '$timeout', '$location', '$scope', '$modalInstance', '$localStorage', '$stateParams',
    'accountService', 'userService',
    function ($state, $log, $timeout, $location, $scope, $modalInstance, $localStorage, $stateParams, accountService, userService) {

        $scope.formDisabled = true;
        $scope.editForm = true;
        $scope.showSubmit = false;
        $scope.showEdit = true;

        //panel
        $scope.userPasswordUpdated = false;
        $scope.showConfirmation = false;
		$scope.mustChangePassword = false; //userService.hasToChangePwd;

        $scope.cancel = function () {
			$log.log("changepasswordpanel Closed in controller");
			if(userService.hasToChangePwd) {
				$log.log("Password HAS to be changed and cannot be deferred, go back to login");	
				$state.go("app.usm.logout");				
			}
			userService.hasToChangePwd = false;
            $modalInstance.dismiss();
        };

        $scope.saveMyPassword = function (passwordData) {

            if (userService.getUserName()) {
                var objectToSubmit = passwordSubmitObject(passwordData, userService.getUserName());
                accountService.changeUserPassword(objectToSubmit).then(
                    function (response) {
                        var updatedUser = objectToSubmit;

                        $scope.userPasswordUpdated = true;
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "Password has been set";

                        $timeout(function () {
                            $modalInstance.close(updatedUser);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;

                        $log.log(error);
                    }
                );
            }
        };

        // Transformation to submit object
        var passwordSubmitObject = function (passwordData, userName) {
            return {
                "userName": userName,
                "currentPassword": passwordData.currentPassword,
                "newPassword": passwordData.newPassword
            };
        };
    }]);

sharedModule.controller('ModifyPassword', ['$log', '$scope', '$modal', '$stateParams',
    function ($log, $scope, $modal, $stateParams) {

        $scope.modifyMyPassword = function () {
            $scope.passwordData = {
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            };
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/users/partial/changeMyPassword.html',
                controller: 'setMyPasswordModalInstanceCtrl',
                resolve: {
                    passwordData: function () {
                        return $scope.passwordData;
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedUser) {
                // Update the model (user)
                $log.log(returnedUser);
                $scope.user = returnedUser;
                if (_.isEqual($scope.user.status, 'E')) {
                    $scope.statusClass = 'label label-success';
                } else if (_.isEqual($scope.user.status, 'D')) {
                    $scope.statusClass = 'label label-danger';
                } else {
                    $scope.statusClass = 'label label-warning';
                }
                //angular.copy(returnedUser, user);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };
    }]);

sharedModule.controller('WarningPassword', ['$log', '$scope', '$modal', '$stateParams',
    function ($log, $scope, $modal, $stateParams) {
		$scope.expDays = $scope.expirationDays;
        $scope.messageDivClass = "alert alert-danger";
		//$scope.actionMessage = "Password is about to expire in <strong>" + $scope.expDays + "</strong> days!";
		$scope.actionMessage = "Password is about to expire in few days. Please change it";
    }]);

sharedModule.controller('warningPasswordModalInstanceCtrl', ['$log', '$timeout', '$location', '$scope', '$modalInstance', '$localStorage', '$stateParams',
    'accountService', 'userService',
    function ($log, $timeout, $location, $scope, $modalInstance, $localStorage, $stateParams, accountService, userService) {

        $scope.formDisabled = true;
        $scope.editForm = true;
        $scope.showSubmit = false;
        $scope.showEdit = true;

        //panel
        $scope.showConfirmation = false;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    }]);

sharedModule.controller('setModifySecurityAnswersModalInstanceCtrl',
    ['$log', '$timeout', '$scope', '$modalInstance', 'personsService', 'userService','userChallengesService','refData','mySecurityQuestions',
        function ($log, $timeout, $scope, $modalInstance, personsService, userService, userChallengesService, refData, mySecurityQuestions) {

            $scope.securityQuestionsList = refData.securityQuestions;

            $scope.formDisabled = true;
            $scope.editForm = true;
            $scope.showSubmit = false;
            $scope.showEdit = true;

            $scope.mySecurityQuestions={};
            $scope.mySecurityQuestions.results = mySecurityQuestions.challengeInformationResponse;
            $scope.mySecurityQuestions.currentPassword = '';

            //to control the number of questions/answer that must be filled
            if($scope.mySecurityQuestions.results.length===2){
                $scope.show2questions = true;
                $scope.show3questions = false;
            }else{
                if($scope.mySecurityQuestions.results.length===1) {
                    $scope.show2questions = false;
                    $scope.show3questions = false;
                }else{
                    $scope.show2questions = true;
                    $scope.show3questions = true;
                }
            }

            //panel
            $scope.securityQuestionsUpdated = false;
            $scope.showConfirmation = false;

            $scope.cancel = function () {
                $log.info('Modal dismissed at');
                $modalInstance.dismiss();
            };

            $scope.saveMySecurityAnswer = function (mySecurityQuestions) {
                $log.info('userService.getUserName(): ' + userService.getUserName());

                if (userService.getUserName()) {
                    var objectToSubmit = securityQuestionsSubmitObject(mySecurityQuestions);

                    userChallengesService.setChallenges(userService.getUserName(),objectToSubmit).then(
                        function (response) {
                            var updatedSecurityAnswers = response;

                            $scope.securityQuestionsUpdated = true;
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Security questions/answers have been saved";

                            $timeout(function () {
                                $modalInstance.close(updatedSecurityAnswers);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;

                            $log.log(error);
                        }
                    );
                }
            };

            // Transformation to submit object
            var securityQuestionsSubmitObject = function (mySecurityQuestions) {

               var questions = [];
                if($scope.show3questions){
                    questions = mySecurityQuestions.results;
                }else{
                    if($scope.show2questions){
                        questions[0]= mySecurityQuestions.results[0];
                        questions[1]= mySecurityQuestions.results[1];
                    }else{
                        questions[0]= mySecurityQuestions.results[0];
                    }
                }
                return {
                    //  "userName": userName,
                    "results":  questions,
                    "userPassword": mySecurityQuestions.currentPassword
                };
            };
        }]);

sharedModule.controller('ModifySecurityAnswer',
    ['$log', '$scope', '$modal', 'userChallengesService', 'userService',
        function ($log, $scope, $modal, userChallengesService, userService ) {

            $scope.modifySecurityAnswer = function () {
                $scope.SecurityQuestionData= {
                    results: [],
                    confirmPassword: ''
                };

                $log.log('Trace: userService.getUserName(): ' + userService.getUserName());
                if (userService.getUserName()) {
                    userChallengesService.getChallenges(userService.getUserName()).then(
                        function (response) {
                            $log.log("Trace: getChallenges:response: ", response);

                            $scope.securityQuestionData = response.challengeInformationResponse;

                            $log.log($scope.securityQuestionData);

                        },
                        function (error) {
                            $log.log("getChallenges:error: " + error);
                        }
                    );
                }

                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    keyboard: true,
                    templateUrl: 'usm/users/partial/modifySecurityAnswer.html',
                    controller: 'setModifySecurityAnswersModalInstanceCtrl',
                    resolve: {
                        mySecurityQuestions: function() {
                            return userChallengesService.getChallenges(userService.getUserName());
                        }
                    }
                });

                modalInstance.result.then(function () {
                    $log.info('Trace: Modal closed');
                }, function () {
                    $log.info('Trace: Modal dismissed');
                });

            };
        }]);





sharedModule.controller('setMyContactDetailsModalInstanceCtrl',
    ['$log', '$timeout', '$scope', '$modalInstance', 'personsService', 'userService', 'myContactDetails',
        function ($log, $timeout, $scope, $modalInstance, personsService, userService, myContactDetails) {

            $scope.formDisabled = true;
            $scope.editForm = true;
            $scope.showSubmit = false;
            $scope.showEdit = true;
            $scope.myContactDetails = myContactDetails;
            $scope.myContactDetails.currentPassword = '';

            //panel
            $scope.contactDetailsUpdated = false;
            $scope.showConfirmation = false;

            $scope.cancel = function () {
                $log.info('Modal dismissed at');
                $modalInstance.dismiss();
            };

            $scope.saveMyContactDetails = function (contactDetailsData) {
                $log.info('userService.getUserName(): ' + userService.getUserName());

                if (userService.getUserName()) {
                    var objectToSubmit = contactDetailsSubmitObject(contactDetailsData, userService.getUserName());
                    personsService.updateContactDetails(objectToSubmit).then(
                        function (response) {
                            var updatedDetails = response;

                            $scope.contactDetailsUpdated = true;
                            $scope.messageDivClass = "alert alert-success";
                            $scope.actionMessage = "Contact Details have been saved";

                            $timeout(function () {
                                $modalInstance.close(updatedDetails);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "alert alert-danger";
                            $scope.actionMessage = error;

                            $log.log(error);
                        }
                    );
                }
            };

            // Transformation to submit object
            var contactDetailsSubmitObject = function (contactDetailsData, userName) {
                return {
                    "userName": userName,
                    "password": contactDetailsData.currentPassword,
                    "email": contactDetailsData.email,
                    "phoneNumber": contactDetailsData.phoneNumber,
                    "mobileNumber": contactDetailsData.mobileNumber,
                    "faxNumber": contactDetailsData.faxNumber
                };
            };
        }]);

sharedModule.controller('ModifyContactDetails',
    ['$log', '$scope', '$modal', 'personsService', 'userService',
        function ($log, $scope, $modal, personsService, userService) {

            $scope.modifyMyContactDetails = function () {

                $scope.contactDetailsData = {
                    currentPassword: '',
                    email: '',
                    phoneNumber: '',
                    mobileNumber: '',
                    faxNumber: ''
                };

                $log.log('Trace: userService.getUserName(): ' + userService.getUserName());
                if (userService.getUserName()) {
                    personsService.getContactDetails(userService.getUserName()).then(
                        function (response) {
                            $log.log("Trace: getContactDetails:response: " + response);
                            $scope.contactDetailsData.email = response.email;
                            $scope.contactDetailsData.phoneNumber = response.phoneNumber;
                            $scope.contactDetailsData.mobileNumber = response.mobileNumber;
                            $scope.contactDetailsData.faxNumber = response.faxNumber;
                            $log.log("Trace: received contactDetails: " +
                            $scope.contactDetailsData.email + ", " +
                            $scope.contactDetailsData.faxNumber + ", " +
                            $scope.contactDetailsData.mobileNumber + ", " +
                            $scope.contactDetailsData.phoneNumber);
                        },
                        function (error) {
                            $log.log("getContactDetails:error: " + error);
                        }
                    );
                }

                var modalInstance = $modal.open({
                    animation: true,
                    backdrop: 'static',
                    keyboard: true,
                    templateUrl: 'usm/users/partial/updateMyContactDetails.html',
                    controller: 'setMyContactDetailsModalInstanceCtrl',
                    resolve: {
                        myContactDetails: function () {
                            $log.log("Trace: resolved myContactDetails: " +
                            $scope.contactDetailsData.email + ", " +
                            $scope.contactDetailsData.faxNumber + ", " +
                            $scope.contactDetailsData.mobileNumber + ", " +
                            $scope.contactDetailsData.phoneNumber);
                            return $scope.contactDetailsData;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    $log.info('Trace: Modal closed');
                }, function () {
                    $log.info('Trace: Modal dismissed');
                });

            };
        }]);


sharedModule.controller('changeMyPasswordCtlr', ['$log', '$scope', '$modal', '$stateParams', 'userDetailsService',
    function ($log, $scope, $modal, $stateParams, userDetailsService) {

        $scope.setUserPassword = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'users/partial/changeMyPassword.html',
                controller: 'setMyPasswordModalInstanceCtrl',
                resolve: {
                    user: function () {
                        return angular.copy(user);
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedUser) {
                // Update the model (user)
                $log.log(returnedUser);
                if (!_.isUndefined($stateParams.userName)) {
                    $scope.user = returnedUser;
                    if (_.isEqual($scope.user.status, 'E')) {
                        $scope.statusClass = 'label label-success';
                    } else if (_.isEqual($scope.user.status, 'D')) {
                        $scope.statusClass = 'label label-danger';
                    } else {
                        $scope.statusClass = 'label label-warning';
                    }
                } else {
                    var copyUser = {
                        userName: returnedUser.userName,
                        firstName: returnedUser.contactDetails.firstName,
                        lastName: returnedUser.contactDetails.lastName,
                        activeTo: returnedUser.activeTo,
                        activeFrom: returnedUser.activeFrom,
                        status: returnedUser.status,
                        organisation: returnedUser.organisation.name,
                        nation: returnedUser.nation
                    };
                    angular.copy(copyUser, user);
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);
