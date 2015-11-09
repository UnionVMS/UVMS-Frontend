var userContextsModule = angular.module('userContexts');

userContextsModule.controller('userContextsControllerCtrl', ['$scope', '$stateParams', 'userContextsServices','userService',
	function ($scope, $stateParams, userContextsServices,userService) {
		//$scope.isDataLoading = true;
	//	$scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";


        $scope.checkAccess = function(feature) {
            return userService.isAllowed(feature,"USM",true);
        };

       $scope.$on('event:loadContexts', function(){
                $scope.emptyResult = false;
                $scope.isDataLoading = false;
        });

		$scope.$on('event:addedContext', function(event, data) {
			$scope.emptyResult = false;
            $scope.isDataLoading = false;
            $scope.userContextsList = data;
		});

		$scope.$on('event:deletedContext', function(event, data) {
			if (_.size(data) ===0) {
				$scope.emptyResult = true;
                $scope.isDataLoading = false;
          	}
			$scope.userContextsList = data;

		});

	}]);

userContextsModule.controller('manageUserContextsCtrl', ['$log', '$scope', '$modal',
    function ($log, $scope, $modal) {
		$scope.manageUserContext = function (mode, user_context) {
			var modalInstance = $modal.open({
				animation: true,
				backdrop: 'static',
				keyboard: true,
				templateUrl: 'usm/users/userContexts/partial/manageUserContexts.html',
				controller: 'userContextsModalInstanceCtrl',
				resolve: {
					mode: function () {
						return mode;
					},
					scope: function () {
						return angular.copy(user_context);
					}
				}
			});

            modalInstance.result.then(function (returnedUserContext) {
                if (mode === 'new') {
                	if(angular.isUndefined($scope.userContextsList)){
                		$scope.userContextsList = [];
                	}
                    $scope.userContextsList.push(returnedUserContext);

                    angular.copy(returnedUserContext, user_context);
					$scope.$emit('event:addedContext', $scope.userContextsList);

                }
                if (mode === 'edit') {
					angular.copy(returnedUserContext, user_context);

                }
                if (mode === 'delete') {

                    var deleteIndex = $scope.userContextsList.indexOf(user_context);

                    $scope.userContextsList.splice(deleteIndex, 1);

                    //$scope.displayedUserContexts = [].concat($scope.userContextsList);
					$scope.$emit('event:deletedContext', $scope.userContextsList);
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });

		};
	}]);

userContextsModule.controller('userContextsModalInstanceCtrl', ['$scope', '$modalInstance', '$log', '$q', '$timeout', 'rolesServices', 'scopeServices', 'userContextsServices', 'mode', 'scope',
		function ($scope, $modalInstance, $log, $q, $timeout, rolesServices, scopeServices, userContextsServices, mode, scope) {
			var confirmCreate = false;
			$scope.mode = mode;
			$scope.actionMessage = "";
			$scope.selectedStatus = "";
			$scope.organisation = {};
			$scope.contextCreated = false;
			$scope.showConfirmation = false;
			$scope.formDisabled = false;
			$scope.initialScopeId = undefined;
			$scope.initialRoleId  = undefined;

			if (!_.isEmpty(scope)) {
				$scope.scope = scope;
			} else {
				$scope.scope = {status: 'E'};
			}

			// Retrieve roles
			$scope.roleList = [];

			rolesServices.getRoles({offset: 0, limit: 100}).then(
				function (response) {
					$scope.roleList = response.roles;
					if (_.isEqual(mode, "new")) {
						$scope.selectedRole = $scope.roleList[0];
					} else if (_.isEqual(mode, "edit") || _.isEqual(mode, "delete")) {
						for(var i = 0; i < $scope.roleList.length; i++)
						{
							if($scope.roleList[i].name === scope.role) {
								$scope.selectedRole = $scope.roleList[i];
								$scope.initialRoleId = $scope.selectedRole.roleId;
								break;
							}
						}
					}
				},
				function (error) {
					$scope.messageDivClass = "alert alert-danger";
					$scope.actionMessage = error;
				}
			);

			// Retrieve scopes
			$scope.scopeList = [];
			scopeServices.getScopes({offset: 0, limit: 100}).then(
				function (response) {
					$scope.scopeList = response.scopes;
					if (_.isEqual(mode, "new")) {

					} else if (_.isEqual(mode, "edit") || _.isEqual(mode, "delete")) {
						for(var i = 0; i < $scope.scopeList.length; i++)
						{
							if($scope.scopeList[i].name === scope.scope) {
								$scope.selectedScope = $scope.scopeList[i];
								$scope.initialScopeId = $scope.selectedScope.scopeId;
								break;
							}
						}
					}
				},
				function (error) {
					$scope.messageDivClass = "alert alert-danger";
					$scope.actionMessage = error;
				}
			);

			if (_.isEqual(mode, "delete")) {
				$scope.formDisabled = true;
			}

			$scope.saveUpdateDelete = function (selectedRole, selectedScope) {
				if (mode === 'new') {
					userContextsServices.createContext(selectedRole, selectedScope).then(
						function (response) {
							var newUserContext = {
								role : selectedRole.name,
								roleId: selectedRole.roleId,
								roleClass : selectedRole.status === "E" ? "label label-success" : "label label-danger",
								roleDescription : selectedRole.description,
								roleStatus : selectedRole.status,
								scope : selectedScope ? selectedScope.name : null,
								scopeClass : selectedScope && selectedScope.status === "E" ? "label label-success" : "label label-danger",
								scopeDescription : selectedScope ? selectedScope.description : null,
								scopeStatus : selectedScope ? selectedScope.status : null,
								userContextId : response.newContext.userContextId,
							};

							//$log.info("role: " + newUserContext.role + " " + newUserContext.roleId);

							$scope.contextCreated = true;
							$scope.messageDivClass = "alert alert-success";
							$scope.actionMessage = "New User Context created";

							$timeout(function () {
								$modalInstance.close(newUserContext);
							}, 2000);
						},
						function (error) {
							$scope.messageDivClass = "alert alert-danger";
							$scope.actionMessage = error;
						}
					);
				}
				if (mode === 'edit') {
					if (scope.activeUsers === 0 || $scope.showConfirmation) {

						var updatedUserContext = {
							userContextId: scope.userContextId,
							userName: $q.activeUser.userName,
							scopeId: selectedScope ? selectedScope.scopeId : null,
							roleId: selectedRole.roleId
						};
						userContextsServices.updateContext(updatedUserContext).then(
							function (response) {
								updatedUserContext.role 			= selectedRole.name;
								updatedUserContext.roleClass		= selectedRole.status === "E" ? "label label-success" : "label label-danger";
								updatedUserContext.roleDescription = selectedRole.description;
								updatedUserContext.roleStatus		= selectedRole.status;
								updatedUserContext.scope			= selectedScope ? selectedScope.name : null;
								updatedUserContext.scopeClass		= selectedScope && selectedScope.status === "E" ? "label label-success" : "label label-danger";
								updatedUserContext.scopeDescription = selectedScope ? selectedScope.description : null;
								updatedUserContext.scopeStatus		= selectedScope ? selectedScope.status : null;

								$scope.contextCreated = true;
								$scope.messageDivClass = "alert alert-success";
								$scope.actionMessage = "Context Changes Saved";
								$timeout(function () {
									$modalInstance.close(updatedUserContext);
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
						$scope.actionMessage = "<strong>Warning: </strong>This scope is assigned to " + scope.activeUsers + " active user(s). Saving this change may have important impact!";
					}
				}
				if (mode === 'delete') {
					if ($scope.showConfirmation) {

						var deletedUserContext = {
							role : selectedRole.name,
							roleClass : "label label-success",
							roleDescription : selectedRole.description,
							roleStatus : selectedRole.status,
							scope : selectedScope ? selectedScope.name : null,
							scopeClass : "label label-success",
							scopeDescription : selectedScope ? selectedScope.description : null,
							scopeStatus : selectedScope ? selectedScope.status : "E",
							userContextId : scope.userContextId,
						};

						userContextsServices.deleteContext(deletedUserContext).then(
							function (response) {
								$scope.contextCreated = true;
								$scope.messageDivClass = "alert alert-success";
								$scope.actionMessage = "Context deleted";

								$timeout(function () {
									$modalInstance.close(deletedUserContext);
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
						$scope.actionMessage = "<strong>Warning: </strong>This will remove the context from user";
					}
				}
			};

			$scope.cancel = function () {
				$modalInstance.dismiss();
			};
    }]);
