var usersModule = angular.module('users');

usersModule.controller('usersListController', ['$scope', '$filter', '$http', '$location', '$resource', '$state', '$stateParams', '$cookies',
    'UsersListService', 'organisationsService', 'refData', '$log', 'userService', '$rootScope', 'orgNations', 'orgNames',
    function ($scope, $filter, $http, $location, $resource, $state, $stateParams, $cookies,
              UsersListService, organisationsService, refData, $log, userService, $rootScope, orgNations, orgNames) {
        //init();
        /* $rootScope.$on('ContextSwitch', function () {
         init();
         });*/
        $scope.search = {};
        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        var initLists = function () {
            //TODO: get the tooltip into the translated strings
            $scope.usernameTooltip = "This will look for a match anywhere in username, first name and last name";
//		// Retrieve users
//		$scope.usersList = [];

            //setting up the pagination directive configuration
            $scope.paginationConfig =
            {
                currentPage: '',
                pageCount: '',
                totalItems: '',
                itemsPerPage: 8
            };
            // flagging whether the loading message must be displayed
            $scope.isDataLoading = true;

            //To control the empty and loading table messages
            $scope.emptyResult = false;
            $scope.emptyResultMessage = "No results found. ";
            $scope.loadingMessage = "Loading... taking some time";

            // Criteria...
            $scope.criteria = {};

            $scope.sort = {
                sortColumn: $stateParams.sortColumn || 'userName', // Default Sort.
                sortDirection: $stateParams.sortDirection || 'desc'
            };

            //object to control the URL's changes
            $scope.pageData = {
                user: $stateParams.user || '',
                nation: $stateParams.nation || '',
                organisation: $stateParams.organisation || '',
                status: $stateParams.status || '',
                activeFrom: $stateParams.activeFrom || '',
                activeTo: $stateParams.activeTo || ''
            };

            // 1. List Of Status
            //$scope.status = 'all';
            $scope.statusList = refData.statusesDropDown;
            //$scope.statusSelected = "all";

            // 2. List Of nations
            $scope.nation = {};
            // transform to dropdown input
            var orgNationsDropDown = [];
            angular.forEach(orgNations, function(item){
                var nation = {};
                nation.label = item;
                nation.value = item;
                orgNationsDropDown.push(nation);
            });
            $scope.nationsList = orgNationsDropDown;

            // 3.List Of Organisations...
            $scope.organisation = {};
            // transform to dropdown input
            var organisationsDropDown = [];
            angular.forEach(orgNames, function(item){
                var organisation = {};
                organisation.label = item.parentOrgName;
                organisation.value = item.parentOrgName;
                organisationsDropDown.push(organisation);
            });
            $scope.organisationsList = organisationsDropDown;

            $scope.formatDate = function (date) {
                var d = new Date(date),
                    month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) {
                    month = '0' + month;
                }
                if (day.length < 2) {
                    day = '0' + day;
                }
                return [year, month, day].join('-');
            };

        };

        initLists();

        var changeUrlParams = function () {

            $state.go($state.current,
                {
                    page: $scope.paginationConfig.currentPage,
                    sortColumn: $scope.sort.sortColumn,
                    sortDirection: $scope.sort.sortDirection,
                    user: $scope.pageData.user,
                    nation: $scope.pageData.nation,
                    organisation: $scope.pageData.organisation,
                    status: $scope.pageData.status,
                    activeTo: $scope.pageData.activeTo,
                    activeFrom: $scope.pageData.activeFrom
                });
        };


        // getPaginated data...
        $scope.getPage = function () {
            var criteria = {};
            criteria.offset = ($scope.paginationConfig.currentPage - 1) * $scope.paginationConfig.itemsPerPage;
            criteria.limit = $scope.paginationConfig.itemsPerPage;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;


            if ($scope.pageData.organisation !== null && $scope.pageData.organisation !== '' && !_.isUndefined($scope.pageData.organisation)) {

                var organisation = $scope.pageData.organisation;
                //to replace the symbols from the URL for organisation
                var parentURL = organisation.search("%");

                if (parentURL !== -1) {
                    organisation = $scope.pageData.organisation.replace("%2F", "/");
                }

                for (var i = 0; i < _.size($scope.organisationsList); i++) {
                    if ($scope.organisationsList[i].value === organisation) {
                        $scope.search.organisation = $scope.organisationsList[i].value;
                        break;
                    }
                }


                //to extract the organisation parent and send only the organisation name to the Back End
                var parent = organisation.search("/");

                if (parent !== -1) {
                    organisation = organisation.split(' / ');
                    organisation = organisation[1];
                }

                criteria.organisation = organisation;
            }


            if ($scope.pageData.user !== null && $scope.pageData.user !== '' && !_.isUndefined($scope.pageData.user)) {
                criteria.user = $scope.pageData.user;
                $scope.search.user = $scope.pageData.user;
            }

            if ($scope.pageData.nation !== null && $scope.pageData.nation !== '' && !_.isUndefined($scope.pageData.nation)) {
                criteria.nation = $scope.pageData.nation;
                $scope.search.nation = $scope.pageData.nation;
            }

            if ($scope.pageData.status !== null && $scope.pageData.status !== '' && !_.isUndefined($scope.pageData.status)) {
                criteria.status = $scope.pageData.status;
                $scope.search.status = $scope.pageData.status;
            }

            if ($scope.pageData.activeTo !== null && $scope.pageData.activeTo !== '' && !_.isUndefined($scope.pageData.activeTo)) {
                criteria.activeTo = $scope.pageData.activeTo;
                $scope.search.activeTo = $scope.pageData.activeTo;
            }

            if ($scope.pageData.activeFrom !== null && $scope.pageData.activeFrom !== '' && !_.isUndefined($scope.pageData.activeFrom)) {
                criteria.activeFrom = $scope.pageData.activeFrom;
                $scope.search.activeFrom = $scope.pageData.activeFrom;
            }


            UsersListService.getUsers(criteria).then(
                function (response) {
                    $scope.userList = response.users;
                    if (!_.isUndefined($scope.userList) && $scope.userList !== null && $scope.userList !== '' && $scope.userList.length !== 0) {
                        $scope.displayedUsers = [].concat($scope.userList);
//				    $scope.totalItems = response.total;
                        $scope.isDataLoading = false;
                        $scope.emptyResult = false;
                        $scope.paginationConfig.totalItems = response.total;
                        $scope.paginationConfig.pageCount = Math.ceil($scope.paginationConfig.totalItems / $scope.paginationConfig.itemsPerPage);

                    } else {
                        $scope.emptyResult = true;
                        $scope.isDataLoading = false;
                        // $scope.showPagination = false;
                    }

                },
                function (error) {
                    $log.log("error");
                    $scope.isDataLoading = false;
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );

        };


        $scope.searchUsers = function () {

            $scope.currentPage = 1;
            $scope.paginationConfig.currentPage = 1;

            if ($scope.search.user !== null && $scope.search.user !== '' && !_.isUndefined($scope.search.user)) {
                $scope.pageData.user = $scope.search.user;

            } else {
                $scope.pageData.user = '';
            }

            if ($scope.search.nation !== null && $scope.search.nation !== '' && !_.isUndefined($scope.search.nation)) {
                $scope.pageData.nation = $scope.search.nation;
            } else {
                $scope.pageData.nation = '';
            }

            if ($scope.search.organisation !== null && $scope.search.organisation !== '' && !_.isUndefined($scope.search.organisation)) {
                $scope.pageData.organisation = $scope.search.organisation;
            } else {
                $scope.pageData.organisation = '';
            }

            if ($scope.search.status !== "all") {
                $scope.pageData.status = $scope.search.status;
            } else {
                $scope.pageData.status = '';
            }


            $scope.pageData.activeTo = $scope.search.activeTo;
            $scope.pageData.activeFrom = $scope.search.activeFrom;

            changeUrlParams();

        };

        /** This part is added to handle the sorting columns / direction and icon displayed */
        $scope.changeSorting = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                if (sort.sortDirection === 'desc') {
                    sort.sortDirection = 'asc';
                } else if (sort.sortDirection === 'asc') {
                    sort.sortDirection = 'desc';
                }
            } else {
                sort.sortColumn = column;
                sort.sortDirection = 'desc';
            }
            //$scope.getPage();
            changeUrlParams();
        };

        $scope.getIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };


        $scope.resetForm = function () {
            $scope.currentPage = 1;

            $scope.search.user = '';
            $scope.search.status = $scope.statusList[0];
            $scope.search.nation = '';
            $scope.search.organisation = '';
            $scope.search.activeFrom = '';
            $scope.search.activeTo = '';

            $scope.criteria = {};
            $scope.pageData = {};

            changeUrlParams();

        };

    }]);

usersModule.controller('userDetailsCtlr', ['$log', '$scope', '$modal', '$stateParams', 'refData',
    'userDetailsService', 'userContextsServices', 'userService', 'userPreferencesService',
    function ($log, $scope, $modal, $stateParams, refData, userDetailsService, userContextsServices, userService, userPreferencesService) {
        $scope.loadingMessage = "Loading...";
        $scope.emptyResultMessage = "No results found.";
        $scope.userName = $stateParams.userName;

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        userDetailsService.getUser($stateParams.userName).then(
            function (response) {
                $scope.user = response.user;
                if (_.isEqual($scope.user.status, 'E')) {
                    $scope.statusClass = 'label label-success';
                } else if (_.isEqual($scope.user.status, 'D')) {
                    $scope.statusClass = 'label label-danger';
                } else {
                    $scope.statusClass = 'label label-warning';
                }
            },
            function (error) {
                $log.log(error);
            }
        );
        userContextsServices.getUserContextsServices($stateParams.userName).then(
            function (response) {
                if (_.isUndefined(response.userContexts) || _.size(response.userContexts) < 1 || _.isNull(response.userContexts[0])) {
                    $scope.emptyResult = true;
                    $scope.isDataLoading = false;
                    $scope.userContextsList = [];
                    $scope.displayedUserContexts = [];
                }
                else {
                    $scope.emptyResult = false;
                    $scope.isDataLoading = false;

                    angular.forEach(response.userContexts, function (obj) {
                        if (obj.roleStatus === "E") {
                            obj.roleClass = "label label-success";
                        } else {
                            obj.roleClass = "label label-danger";
                        }
                        if (obj.scopeStatus === "E") {
                            obj.scopeClass = "label label-success";
                        }
                        else {
                            obj.scopeClass = "label label-danger";
                        }
                    });
                    $scope.userContextsList = response.userContexts;
                    $scope.$broadcast('event:loadContexts');
                }
            }, function (error) {
                $log.log(error);
            });

        userPreferencesService.getUserPreferences($stateParams.userName).then(
            function (response) {
                if (_.isUndefined(response.userPreferences) || _.size(response.userPreferences) < 1 || _.isNull(response.userPreferences[0])) {
                    $scope.emptyPreferenceResult = true;
                    $scope.isPreferencesLoading = false;
                    $scope.userPreferencesList = [];
                    $scope.displayedUserPreferences = [];
                }
                else {
                    $scope.emptyPreferenceResult = false;
                    $scope.isPreferencesLoading = false;
                    $scope.userPreferencesList = response.userPreferences;
                }
            }, function (error) {
                $scope.emptyPreferenceResult = true;
                $scope.isPreferencesLoading = false;
            });

        //to include setUserPassword in the 'userDetailsCtlr'
        $scope.manageUserPassword = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/users/partial/setUserPassword.html',
                controller: 'setUserPasswordModalInstanceCtrl',
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


usersModule.controller('manageUserCtlr', ['$log', '$scope', '$modal', '$stateParams', 'userDetailsService',
    function ($log, $scope, $modal, $stateParams, userDetailsService) {

        $scope.duplicateUserProfile = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/users/partial/duplicateUserProfile.html',
                controller: 'duplicateUserProfileModalInstanceCtrl',
                resolve: {
                    user: function () {
                        return angular.copy(user);
                    }
                }
            });

            modalInstance.result.then(function (result) {
                //angular.copy(returnedOrgContact, contact);
                //$scope.endpoint.persons.push(returnedOrgContact);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

        };

        $scope.editUser = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/users/partial/editUser.html',
                controller: 'editUserModalInstanceCtrl',
                resolve: {
                    user: function () {
                        var copyUser = angular.copy(user);
                        if (!_.isNull(copyUser.activeTo)) {
                            copyUser.activeTo = moment(copyUser.activeTo).format('YYYY-MM-DD');
                        }
                        if (!_.isNull(copyUser.activeFrom)) {
                            copyUser.activeFrom =  moment(copyUser.activeFrom).format('YYYY-MM-DD');
                        }
                        return copyUser;
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
                }
                //} else {//in any case the user_parent must be calculated
                if (returnedUser.organisation_parent.indexOf('/') !== -1) {
                    returnedUser.organisation.parent = returnedUser.organisation_parent.split('/')[0].trim();
                    returnedUser.organisation.name = returnedUser.organisation_parent.split('/')[1].trim();
                } else {
                    returnedUser.organisation.parent = null;
                }
                if (_.isNull(returnedUser.organisation.parent) || _.isEqual(returnedUser.organisation.parent, "null")) {
                    returnedUser.organisation_parent = returnedUser.organisation.name;
                }
                angular.copy(returnedUser, user);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

usersModule.controller('duplicateUserProfileModalInstanceCtrl', ['$scope', '$modalInstance', '$timeout', '$log', 'user', 'UsersListService',
    'userContextsServices', 'userDetailsService',
    function ($scope, $modalInstance, $timeout, $log, user, UsersListService, userContextsServices, userDetailsService) {
        $scope.formDisabled = false;
        $scope.editForm = true;
        $scope.actionSucceeded = false;
        $scope.showConfirmation = false;

        // current user
        $scope.user = user;
        $scope.destUserName = user.userName;
        $scope.selectedUsersName = "";

        // flagging whether the loading message must be displayed
        $scope.isDataLoading = true;

        var maxDisplayedLines = 5;
        var i = 0;

        //To control the empty and loading table messages
        $scope.emptyResult = true;
        $scope.classResultMessage = "alert alert-info";
        $scope.emptyResultMessage = "Select a \"Copy from User\"";
        $scope.loadingMessage = ""; // "Loading... taking some time";

        UsersListService.getUsersNames().then(
            function (response) {
                $scope.usersNames = response.users;
                //if($scope.usersNames.length > 0) {
                //	$scope.selectedUsersName = $scope.usersNames[0];
                //}
            },
            function (error) {
                $scope.messageDivClass = "alert alert-danger";
                $scope.actionMessage = error;
            }
        );

        $scope.showUserContext = function (usr) {
            $log.log(usr);

            $scope.selectedUsersName = usr;

            $scope.classResultMessage = "alert alert-warning";
            $scope.emptyResultMessage = "Loading... taking some time";

            userContextsServices.getUserContextsServices(usr).then(
                function (response) {
                    if (_.isUndefined(response.userContexts) || _.size(response.userContexts) < 1 || _.isNull(response.userContexts[0])) {
                        $scope.emptyResult = true;
                        $scope.isDataLoading = false;
                        $scope.userContextsList = [];
                        $scope.userContextsEmptyList = [];
                        for (i = 0; i < maxDisplayedLines; i++) {
                            $scope.userContextsEmptyList.push("");
                        }
                        $scope.classResultMessage = "alert alert-danger";
                        $scope.emptyResultMessage = "No results found. ";
                    } else {
                        $scope.emptyResult = false;
                        $scope.isDataLoading = false;
                        $scope.userContextsList = response.userContexts;
                        $scope.userContextsEmptyList = [];
                        for (i = 0; i < maxDisplayedLines - $scope.userContextsList.length; i++) {
                            $scope.userContextsEmptyList.push("");
                        }
                        $scope.classResultMessage = "alert alert-danger";
                        $scope.emptyResultMessage = "No results found. ";
                    }
                }, function (error) {
                    $log.log("Error: ", error);
                    $scope.userContextsList = [];
                    $scope.userContextsEmptyList = [];
                    for (i = 0; i < maxDisplayedLines; i++) {
                        $scope.userContextsEmptyList.push("");
                    }
                    $scope.emptyResult = true;
                    $scope.isDataLoading = false;
                    $scope.classResultMessage = "alert alert-danger";
                    $scope.emptyResultMessage = "No results found. ";
                }
            );
        };

        $scope.cancel = function () {
            $log.log("cancel");
            $modalInstance.dismiss();
        };

        $scope.duplicateProfile = function (user) {
            if ($scope.showConfirmation) {
                var arrComprehensiveUserContext = [];
                angular.forEach($scope.userContextsList, function (obj) {
                    arrComprehensiveUserContext.push({"userContextId": obj.userContextId, "roleId": obj.roleId, "scopeId": obj.scopeId});
                });
                userDetailsService.copyUserPrefs($scope.destUserName, arrComprehensiveUserContext).then(
                    function (response) {
                        $scope.messageDivClass = "alert alert-success";
                        $scope.actionMessage = "Profile copied";
                        $scope.actionSucceeded = true;
                        $timeout(function () {
                            $modalInstance.close($scope.destUserName);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            } else {
                $scope.showConfirmation = true;
                $scope.messageDivClass = "alert alert-warning";
                $scope.actionMessage = "Warning: If a context(s) already exist for the user " + $scope.destUserName + " the existing data will be erased and replaced by the new profile if the action is accepted";
            }
        };
    }]);

usersModule.controller('setUserPasswordModalInstanceCtrl', ['$log', '$timeout', '$location', '$scope', '$modalInstance', '$stateParams', 'refData',
    'userDetailsService', 'accountService', 'user',
    function ($log, $timeout, $location, $scope, $modalInstance, $stateParams, refData, userDetailsService, accountService, user) {
        $scope.formDisabled = true;
        $scope.editForm = true;
        $scope.showSubmit = false;
        $scope.showEdit = true;

        var initialStatusValue = user.status;
        $scope.user = user;

        //panel
        $scope.userPasswordUpdated = false;
        $scope.showConfirmation = false;

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.saveUserPassword = function (password, password2) {


            var objectToSubmit = passwordSubmitObject(password);

            accountService.changePassword(objectToSubmit).then(
                function (response) {
                    var updatedUser = objectToSubmit;

                    $scope.userPasswordUpdated = true;
                    $scope.messageDivClass = "alert alert-success";
                    $scope.actionMessage = "Password has been set";
                    $scope.user = user;
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
        };


        // Transformation to submit object
        var passwordSubmitObject = function (password) {
            var objectToSubmit = user;
            angular.copy(user);
            objectToSubmit.password = password;

            return {
                "userName": objectToSubmit.userName,
                "newPassword": objectToSubmit.password
            };
        };

    }]);


usersModule.controller('setUserPasswordCtlr', ['$log', '$scope', '$modal', '$stateParams', 'userDetailsService',
    function ($log, $scope, $modal, $stateParams, userDetailsService) {

        $scope.setUserPassword = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: 'static',
                keyboard: true,
                templateUrl: 'usm/users/partial/setUserPassword.html',
                controller: 'setUserPasswordModalInstanceCtrl',
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
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);


usersModule.controller('editUserModalInstanceCtrl', ['$log', '$timeout', '$location', '$scope', '$modalInstance', '$stateParams', 'refData',
    'userDetailsService', 'organisationsService', 'accountService', 'user',
    function ($log, $timeout, $location, $scope, $modalInstance, $stateParams, refData, userDetailsService, organisationsService, accountService, user) {
        $scope.formDisabled = true;
        $scope.editForm = true;
        $scope.showSubmit = false;
        $scope.showEdit = true;
        $scope.userUpdated = false;
        var initialStatusValue = user.status;
        $scope.user = user;

        // organisation dropdown
        organisationsService.get().then(
            function (response) {
                $scope.organisationsList = response.organisations;
            },
            function (error) {
                if (!_.isEqual(error.status, 404)) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            }
        ).then(
            function (response) {
                if (!_.isNull($scope.user.organisation.parent) && !_.isUndefined($scope.user.organisation.parent) && !_.isEqual($scope.user.organisation.parent, "null") ) {
                    $scope.user.organisation_parent = $scope.user.organisation.parent + ' / ' + $scope.user.organisation.name;
                } else {
                    $scope.user.organisation_parent = $scope.user.organisation.name;
                }

                for (var i = 0; i < _.size($scope.organisationsList); i++) {
                    if ($scope.organisationsList[i].parentOrgName === $scope.user.organisation_parent) {
                        $scope.user.organisationComplex = $scope.organisationsList[i];
                        break;
                    }
                }

                angular.copy($scope.user, user);
            },
            function (error) {
                if (!_.isEqual(error.status, 404)) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            });


        //activeFrom date configuration
        $scope.activeFromConfig =
        {
            id: 'activeFrom',
            name: 'activeFrom',
            dataModel: 'user.activeFrom',
            defaultValue: '',
            isDefaultValueWatched: true,
            isDisabled: $scope.formDisabled,
            isRequired: true,
            page: 'userDetails'
        };
        // activeTo date configuration
        $scope.activeToConfig =
        {
            id: 'activeTo',
            name: 'activeTo',
            dataModel: 'user.activeTo',
            defaultValue: '',
            isDefaultValueWatched: true,
            isDisabled: $scope.formDisabled,
            isRequired: true,
            page: 'userDetails'
        };
        // lockout datepicker
        $scope.lockout = {};
        $scope.openLockoutTo = function (event) {
            event.preventDefault();
            event.stopPropagation();
            $scope.lockout.opened = true;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

        $scope.activeFromConfig.defaultValue = user.activeFrom;
        $scope.activeToConfig.defaultValue = user.activeTo;
        if (!_.isUndefined($scope.user.activeFrom) && !_.isNull($scope.user.activeFrom)) {
            $scope.minDateTo = $scope.user.activeFrom;
        }


        // status dropdown
        $scope.statusList = refData.statusesNoAll;

        // Watch the lockout date value and update the status accordingly
        $scope.changeLockout = function (newValue) {
            if (angular.isUndefined(newValue) || _.isNull(newValue)) {
                if (!angular.isUndefined($scope.user)) {
                    if (initialStatusValue !== "L") {
                        $scope.user.status = initialStatusValue;
                    } else {
                        $scope.user.status = "E";
                    }
                }
            } else {
                $scope.user.status = "L";
            }
        };

        $scope.changeEditForm = function () {
            $scope.formDisabled = !$scope.formDisabled;
            $scope.showSubmit = !$scope.showSubmit;
            $scope.showEdit = !$scope.showEdit;
        };

        $scope.updateUser = function (user) {
            var objectToSubmit = accountService.createNewObject(user);
            accountService.updateUser(objectToSubmit).then(
                function (response) {
                    $scope.userUpdated = true;
                    $scope.messageDivClass = "alert alert-success";
                    $scope.actionMessage = "User Details Saved";
                    $timeout(function () {
                        $modalInstance.close(response.updatedUser);
                    }, 2000);
                },
                function (error) {
                    $scope.messageDivClass = "alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
        };

    }]);
