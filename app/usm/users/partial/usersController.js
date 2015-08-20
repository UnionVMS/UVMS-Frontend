var usersModule = angular.module('users');

usersModule.controller('usersListController', ['$scope', '$filter', '$http', '$location', '$resource', '$state', '$stateParams', '$cookies',
                        'UsersListService', 'organisationsService', 'refData','$log','userService','$rootScope',
    function ($scope, $filter, $http, $location, $resource, $state, $stateParams, $cookies,
              UsersListService, organisationsService, refData, $log,userService,$rootScope) {

        var init = function(){
            //access:

            $scope.access = {
                manageUsers :userService.isAllowed("manageUsers","USM",true),
                viewUsers :userService.isAllowed("viewUsers","USM",true)
            };
        };
        init();
        $rootScope.$on('ContextSwitch', function () {
            init();
        });
        var initLists = function(){
        //TODO: get the tooltip into the translated strings
        $scope.usernameTooltip = "This will look for a match anywhere in username, first name and last name";
//		// Retrieve users
//		$scope.usersList = [];

        //setting up the pagination directive configuration
        $scope.paginationConfig =
        {
            currentPage: parseInt($stateParams.page) || 1,
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
        $scope.statusList = refData.statuses;
        //$scope.statusSelected = "all";

        // 2. List Of nations
        $scope.nation = {};
        $scope.getNations = function(){
          organisationsService.getNations().then(
              function (response) {
                  $scope.nationsList = response.nations;
              },
              function (error) {
                  $scope.nationsList = [error];
              }
          );
        };
        $scope.getNations();

        // 3.List Of Organisations...
        $scope.organisation = {};
        $scope.getOrganisations = function(){
          organisationsService.get().then(
              function (response) {
                  $scope.organisationsList = response.organisations;
              },
              function (error) {
                  $scope.organisationsList = [error];
              }
          );
        };
        $scope.getOrganisations();

        $scope.formatDate = function(date){
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2){
                month = '0' + month;
            }
            if (day.length < 2){
                day = '0' + day;
            }
            return [year, month, day].join('-');
        };

        };
        initLists();

        var changeUrlParams = function(){

            var organisation = '';

            if ($scope.pageData.organisation !== null && $scope.pageData.organisation !== '' && !_.isUndefined($scope.pageData.organisation) ){
            	organisation = $scope.pageData.organisation;

            	//to take off the symbols from the URL for organisation
            	var parentURL = organisation.search("%");
                if(parentURL!== -1){
                	organisation = organisation.replace("%20%252F%20"," / ");
                    organisation = organisation.replace("%2F","/");
                 }
            }

        	$scope.search.user = $scope.pageData.user;

            $scope.search.status = $scope.pageData.status || 'all';

            $scope.search.user = $scope.pageData.user;

            $scope.search.nation = $scope.pageData.nation;

            $scope.search.organisation = organisation;

            //$scope.search.status = $scope.pageData.status;

            if ($scope.pageData.activeFrom !== null && $scope.pageData.activeFrom !== '' && !_.isUndefined($scope.pageData.activeFrom) ){
               $scope.search.activeFrom = $scope.formatDate($scope.pageData.activeFrom);
            }else{
            	$scope.pageData.activeFrom = '';
            	$scope.search.activeFrom = '';
            }

            if ($scope.pageData.activeTo !== null && $scope.pageData.activeTo !== '' && !_.isUndefined($scope.pageData.activeTo) ){
                $scope.search.activeTo = $scope.formatDate($scope.pageData.activeTo);
            }else{
            	$scope.pageData.activeTo = '';
            	$scope.search.activeTo = '';
            }

			$state.transitionTo($state.current,
	    		{
			 		page: $scope.paginationConfig.currentPage,
			 		sortColumn: $scope.sort.sortColumn,
			 		sortDirection: $scope.sort.sortDirection,
                    user:$scope.pageData.user,
                    nation: $scope.pageData.nation,
                    organisation:$scope.pageData.organisation,
                    status:$scope.pageData.status,
                    activeTo: $scope.pageData.activeTo,
                    activeFrom: $scope.pageData.activeFrom
                },
                {notify: false}
			);
		};

		// getPaginated data...
		$scope.getPage = function(){
			var criteria = {};
			criteria.offset = ($scope.paginationConfig.currentPage - 1)  * $scope.paginationConfig.itemsPerPage;
			criteria.limit = $scope.paginationConfig.itemsPerPage;
			criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;

            var organisation =  "";

            if ($scope.pageData.organisation!== null && $scope.pageData.organisation !== ''&& !_.isUndefined($scope.pageData.organisation)) {

                organisation =  $scope.pageData.organisation;
                //to replace the symbols from the URL for organisation
                var parentURL = organisation.search("%");

                if(parentURL!== -1){
                    organisation =$scope.pageData.organisation.replace("%20%252F%20"," / ");
                    organisation = $scope.pageData.organisation.replace("%2F","/");
                }

                //to extract the organisation parent and send only the organisation name to the Back End
                var parent = organisation.search("/");

                if(parent!== -1){
                    organisation = organisation.split(' / ');
                    organisation = organisation[1];
                }
            }

            if ($scope.pageData.user!== null && $scope.pageData.user !== ''&& !_.isUndefined($scope.pageData.user)) {
                criteria.user = $scope.pageData.user;
            }

            if ($scope.pageData.nation!== null && $scope.pageData.nation !== ''&& !_.isUndefined($scope.pageData.nation)) {
                criteria.nation = $scope.pageData.nation;
           }

            if ($scope.pageData.organisation!== null && $scope.pageData.organisation !== ''&& !_.isUndefined($scope.pageData.organisation)) {
            	criteria.organisation = organisation;
            }

            if ($scope.pageData.status!== null && $scope.pageData.status !== ''&& !_.isUndefined($scope.pageData.status)) {
                criteria.status = $scope.pageData.status;
            }

            if ($scope.pageData.activeTo!== null && $scope.pageData.activeTo !== ''&& !_.isUndefined($scope.pageData.activeTo)) {
                criteria.activeTo = $scope.pageData.activeTo;
            }

            if ($scope.pageData.activeFrom!== null && $scope.pageData.activeFrom !== ''&& !_.isUndefined($scope.pageData.activeFrom)) {
                criteria.activeFrom = $scope.pageData.activeFrom;
            }


            UsersListService.getUsers(criteria).then(
				function (response) {
				    $scope.userList = response.users;
				  if (!_.isUndefined($scope.userList) && $scope.userList !== null && $scope.userList !== '' && $scope.userList.length!== 0 ) {
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

					changeUrlParams();
				},
				function (error) {
				    $log.log("error");
				    $scope.isDataLoading = false;
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
				}
            );

        };
		//	Search users
        $scope.searchUsers = function (search, searchActiveFrom, searchActiveTo) {
        	$scope.criteria = {};
//        	$scope.currentPage = 1;
        	$scope.paginationConfig.currentPage = 1;

            if (search.user !== null && search.user !== '' && !_.isUndefined(search.user) ){
			    $scope.criteria.user = search.user;
                $scope.pageData.user = $scope.criteria.user;

			}else{

                $scope.pageData.user = '';
            }

			if (search.nation !== null && !_.isUndefined(search.nation)){
			    $scope.criteria.nation = search.nation;
                $scope.pageData.nation = search.nation;
			}else{
                $scope.pageData.nation = '';
            }

			if (search.organisation !== null && search.organisation !== ''){
			    $scope.criteria.organisation = search.organisation;
                $scope.pageData.organisation = search.organisation;
			}else{
                $scope.pageData.organisation = '';
            }

			if (search.status !== "all") {
			    $scope.criteria.status = search.status;
                $scope.pageData.status = search.status;
            }else{
                $scope.pageData.status = '';
            }


			$scope.criteria.activeFrom = new Date(searchActiveFrom).toJSON();
			$scope.criteria.activeTo = new Date(searchActiveTo).toJSON();

            $scope.pageData.activeTo = new Date(searchActiveTo).toJSON();
            $scope.pageData.activeFrom = new Date(searchActiveFrom).toJSON();

            $scope.getPage();

            changeUrlParams();
        };

        /** This part is added to handle the sorting columns / direction and icon displayed */
		$scope.changeSorting = function(column) {
			var sort = $scope.sort;
			if (sort.sortColumn === column) {
				if(sort.sortDirection === 'desc'){
					sort.sortDirection = 'asc';
				}else if (sort.sortDirection === 'asc'){
					sort.sortDirection = 'desc';
				}
			} else {
			  sort.sortColumn = column;
			  sort.sortDirection = 'desc';
			}
			$scope.getPage();
			changeUrlParams();
		};

		$scope.getIcon = function(column) {
			var sort = $scope.sort;
			if (sort.sortColumn === column) {
				var sortDirection = sort.sortDirection;
			    return sortDirection === 'desc' ?'fa-sort-desc':'fa-sort-asc';
			  }
			return 'fa-sort';
		};

		// searchActiveFrom date configuration
		$scope.searchActiveFromConfig =
		{
		    id: 'searchActiveFrom',
		    dataModel: 'search.searchActiveFrom',
		    defaultValue: ''
		};
		// searchActiveTo date configuration
		$scope.searchActiveToConfig =
		{
		    id: 'searchActiveTo',
		    dataModel: 'search.searchActiveTo',
		    defaultValue: ''
		};

        $scope.resetForm = function(){
            $scope.currentPage = 1;

            $scope.search.user = '';
            $scope.search.status = $scope.statusList[0];
            $scope.search.nation = '';
            $scope.search.organisation = '';
            $scope.search.searchActiveFrom = '';
            $scope.search.searchActiveTo = '';

            $scope.criteria = {};
            $scope.pageData = {};
            $scope.getPage();

            changeUrlParams();
        };

    }]);

usersModule.controller('userDetailsCtlr', ['$log', '$scope', '$modal', '$stateParams', 'refData', 'userDetailsService','userContextsServices',
    function ($log, $scope, $modal, $stateParams, refData, userDetailsService,userContextsServices) {
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
                    $scope.userContextsList=[];
                    $scope.displayedUserContexts=[];
                }
                else
                {
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
            },function (error) {
            $log.log(error);
        });


        /*$scope.editUser = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/users/partial/editUser.html',
                controller: 'editUserModalInstanceCtrl',
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
                if (_.isEqual(returnedUser.status, 'E')) {
                    $scope.statusClass = 'label label-success';
                } else if (_.isEqual($scope.user.status, 'D')) {
                    $scope.statusClass = 'label label-danger';
                } else {
                    $scope.statusClass = 'label label-warning';
                }
                //angular.copy(returnedUser, user);
                    if (returnedUser.organisation_parent.indexOf('/') !== -1) {
                        returnedUser.organisation.parent = returnedUser.organisation_parent.split('/')[0].trim();
                        returnedUser.organisation.name = returnedUser.organisation_parent.split('/')[1].trim();
                    } else {
                        returnedUser.organisation.parent = null;
                        returnedUser.organisation.name = returnedUser.organisation_parent;
                    }
            },function (error) {
            $log.log(error);
        });
        };*/

		//to include setUserPassword in the 'userDetailsCtlr'
        $scope.manageUserPassword = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
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


usersModule.controller('manageUserCtlr', ['$log', '$scope', '$modal','$stateParams','userDetailsService',
    function ($log, $scope, $modal,$stateParams,userDetailsService) {

        $scope.editUser = function (user) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                size: 'lg',
                templateUrl: 'usm/users/partial/editUser.html',
                controller: 'editUserModalInstanceCtrl',
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
                //} else {//in any case the user_parent must be calculated
                    if (returnedUser.organisationComplex.parentOrgName.indexOf('/') !== -1) {
                        returnedUser.organisation.parent = returnedUser.organisationComplex.parentOrgName.split('/')[0].trim();
                        returnedUser.organisation.name = returnedUser.organisationComplex.parentOrgName.split('/')[1].trim();
                    } else {
                        returnedUser.organisation.parent = null;
                        returnedUser.organisation.name = returnedUser.organisationComplex.parentOrgName;
                    }
                returnedUser.organisation_parent = returnedUser.organisationComplex.parentOrgName;
                returnedUser.organisation.nation=returnedUser.organisationComplex.nation;
                angular.copy(returnedUser, user);
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);


usersModule.controller('setUserPasswordModalInstanceCtrl', ['$log', '$timeout', '$location', '$scope', '$modalInstance', '$stateParams', 'refData',
                                                     'userDetailsService',  'accountService', 'user',
          function ($log, $timeout, $location, $scope, $modalInstance, $stateParams, refData, userDetailsService,  accountService, user) {
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

                   $scope.saveUserPassword = function (password,password2) {


                       var objectToSubmit = passwordSubmitObject(password);

                       accountService.changePassword(objectToSubmit).then(
                           function (response) {
                       	      var updatedUser = objectToSubmit;

                               $scope.userPasswordUpdated = true;
                               $scope.messageDivClass = "container alert alert-success";
                               $scope.actionMessage = "Password has been set";

                               $timeout(function () {
                                $modalInstance.close(updatedUser);
                             }, 2000);
                           },
                           function (error) {
                               $scope.messageDivClass = "container alert alert-danger";
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


usersModule.controller('setUserPasswordCtlr', ['$log', '$scope', '$modal','$stateParams','userDetailsService',
       function ($log, $scope, $modal,$stateParams,userDetailsService) {

       $scope.setUserPassword= function (user) {
              var modalInstance = $modal.open({
                       animation: true,
                       backdrop: true,
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
        $scope.user =user;

        // organisation dropdown
        organisationsService.get().then(
            function (response) {
                $scope.organisationsList = response.organisations;
            },
            function (error) {
                $scope.messageDivClass = "container alert alert-danger";
                $scope.actionMessage = error;
            }

        ).then(
                function(response){
                if (!_.isNull($scope.user.organisation.parent)&&!_.isUndefined($scope.user.organisation.parent)) {
                    $scope.user.organisation_parent = $scope.user.organisation.parent + ' / ' + $scope.user.organisation.name;
                }else{
                    $scope.user.organisation_parent = $scope.user.organisation.name;
                }

                for (var i=0;i< _.size($scope.organisationsList);i++){
                    if ($scope.organisationsList[i].parentOrgName===$scope.user.organisation_parent)
                    {
                        $scope.user.organisationComplex=$scope.organisationsList[i];
                        break;
                    }
                }

                angular.copy($scope.user,user);
            },
            function (error) {
                $scope.messageDivClass = "container alert alert-danger";
                $scope.actionMessage = error;
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
                    $scope.messageDivClass = "container alert alert-success";
                    $scope.actionMessage = "User Details Saved";
                    $timeout(function () {
                        $modalInstance.close(user);
                    }, 2000);
                },
                function (error) {
                    $scope.messageDivClass = "container alert alert-danger";
                    $scope.actionMessage = error;
                }
            );
        };

    }]);
