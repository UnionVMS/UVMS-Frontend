var organisationsModule = angular.module('organisations');

organisationsModule.controller('organisationsListCtrl', ['$scope', '$log', 'refData', '$stateParams', '$state', 'organisationsService',
    function ($scope, $log, refData, $stateParams, $state, organisationsService) {
        $scope.sort = {
            sortColumn: $stateParams.sortColumn || 'name', // Default Sort.
            sortDirection: $stateParams.sortDirection || 'asc'
        };
        $scope.showPagination = true;

        $scope.statusList = refData.statusesSearch;
        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";


        // 1. List Of Status
        $scope.status = {};
        $scope.statusSelected = "";

        // 2. List Of nations
        $scope.nation = {};
        $scope.getNations = function () {
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
        $scope.name = {};
        $scope.getOrganisations = function () {
            organisationsService.get().then(
                function (response) {
                    $scope.namesList = response.organisations;
                },
                function (error) {
                    $scope.namesList = [error];
                }
            );
        };

        $scope.getOrganisations();


        // Retrieve organisations. This method is executed by the pagination directive whenever the current page is changed
        // (also true for the initial loading).
        $scope.organisationsList = [];
        $scope.getPage = function (currentPage) {
            $scope.criteria = {
                name: $stateParams.name || '',
                nation: $stateParams.nation || '',
                status: $stateParams.status || 'all'
            };

            var criteria = $scope.criteria;

            criteria.offset = (currentPage - 1) * $scope.paginationConfig.itemsPerPage;
            criteria.limit = $scope.paginationConfig.itemsPerPage;
            criteria.sortColumn = $scope.sort.sortColumn;
            criteria.sortDirection = $scope.sort.sortDirection;

            //to replace the symbols from the URL for organisation
            var name = $scope.criteria.name;
            var searhName = $scope.criteria.name;
            var parentURL = name.search("%");

            if (parentURL !== -1) {
                //  name = criteria.name;
                name = name.replace("%2F", "/");
                $scope.criteria.name = name;

                searhName = name.split(' / ');
                searhName = searhName[1];
                criteria.name = searhName;
            }


            organisationsService.getOrganisations(criteria).then(
                function (response) {
                    $scope.organisationsList = response.organisations;
                    if (!_.isUndefined($scope.organisationsList) && $scope.organisationsList !== null && $scope.organisationsList !== '') {
                        $scope.displayedOrganisations = [].concat($scope.organisationsList);
                        $scope.isDataLoading = false;
                        $scope.emptyResult = false;
                        $scope.paginationConfig.totalItems = response.total;
                        $scope.paginationConfig.pageCount = Math.ceil($scope.paginationConfig.totalItems / $scope.paginationConfig.itemsPerPage);
                    } else {
                        $scope.emptyResult = true;
                        $scope.isDataLoading = false;
                        $scope.showPagination = false;
                    }
                    criteria.name = name;
                    $scope.criteria.name = name;

                    changeUrlParams();
                },

                function (error) {
                    $scope.isDataLoading = false;
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );
        };

        $scope.searchOrganisation = function (criteria) {
            // replace null with empty string because null breaks the stateParam application

            var name = $scope.criteria.name;
            var searchName = $scope.criteria.name;

            if (_.isNull(criteria.name)) {
                $scope.criteria.name = "";
                searchName = "";

            } else {
                searchName = $scope.criteria.name;

                var parent = $scope.criteria.name.search("/");

                if (parent !== -1) {
                    name = $scope.criteria.name.split(' / ');
                    name = name[1];
                    $scope.criteria.name = name;
                }

            }

            if (_.isNull(criteria.nation)) {
                $scope.criteria.nation = "";
            }

            $scope.paginationConfig.currentPage = 0;
            criteria.offset = 0;


            organisationsService.searchOrganisations(criteria).then(
                function (response) {
                    $scope.organisationsList = response.organisations;
                    if (!_.isUndefined($scope.organisationsList) && $scope.organisationsList !== null && $scope.organisationsList !== '') {
                        $scope.displayedOrganisations = [].concat($scope.organisationsList);
                        $scope.emptyResult = false;
                        $scope.showPagination = true;
                        $scope.paginationConfig.totalItems = response.total;
                        $scope.paginationConfig.pageCount = Math.ceil($scope.paginationConfig.totalItems / $scope.paginationConfig.itemsPerPage);
                        $scope.paginationConfig.currentPage = 1;
                    } else {
                        $scope.emptyResult = true;
                        $scope.isDataLoading = false;
                        $scope.showPagination = false;
                    }

                    $scope.criteria.name = searchName;

                    changeUrlParams();
                },
                function (error) {
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );
        };

        // Sorting columns
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
                sort.sortDirection = 'asc';
            }
            $scope.sort.sortColumn = column;
            $scope.sort.sortDirection = sort.sortDirection;
            $scope.getPage($scope.paginationConfig.currentPage);
        };

        $scope.sortIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };

        // change url parameters
        var changeUrlParams = function () {
            $state.transitionTo($state.current, {
                    page: $scope.paginationConfig.currentPage,
                    sortColumn: $scope.sort.sortColumn,
                    sortDirection: $scope.sort.sortDirection,
                    name: $scope.criteria.name,
                    nation: $scope.criteria.nation,
                    status: $scope.criteria.status
                },
                {notify: false});
        };

        $scope.resetForm = function () {
            $scope.sort.sortColumn = 'name';
            $scope.sort.sortDirection = 'asc';
            $scope.criteria.name = '';
            $scope.criteria.status = refData.statuses[0];
            $scope.criteria.nation = '';
            //$scope.criteria.organisation = '';
            $scope.searchOrganisation($scope.criteria);
        };

        $scope.paginationConfig =
        {
            currentPage: '',
            pageCount: '',
            totalItems: '',
            itemsPerPage: 8
        };

    }]);


organisationsModule.controller('manageOrganisationCtrl', ['$scope', '$modal', '$log', '$state', 'organisationsService',
    function ($scope, $modal, $log, $state, organisationsService) {

        $scope.manageOrganisation = function (mode, org) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                templateUrl: 'usm/organisations/partial/manageOrganisations.html',
                controller: 'manageOrgModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    org: function () {
                        return angular.copy(org);
                    }
                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedOrg) {
                if (mode === 'new') {
                    $scope.organisationsList.push(returnedOrg);
                    $scope.displayedOrganisations = [].concat($scope.organisationsList);
                    $state.reload();
                }
                // Update the model (org)
                if (mode === 'edit') {
                    angular.copy(returnedOrg, org);
                }
                // Remove the deleted role from the list
                if (mode === 'delete') {
                    var deleteIndex = $scope.organisationsList.indexOf(org);
                    $scope.organisationsList.splice(deleteIndex, 1);
                    $scope.displayedOrganisations = [].concat($scope.organisationsList);
                    $state.reload();
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

organisationsModule.controller('manageOrgModalInstanceCtrl', ['$scope', '$modalInstance', '$log', '$timeout', '$location', 'refData', 'getApplications',
    'organisationsService', 'mode', 'org', '$stateParams',
    function ($scope, $modalInstance, $log, $timeout, $location, refData, getApplications, organisationsService, mode, org, $stateParams) {
        var confirmCreate = false;
        $scope.mode = mode;
        $scope.actionMessage = "";
        $scope.selectedStatus = "";
        $scope.organisation = {};
        $scope.actionSucceeded = false;
        $scope.showConfirmation = false;

        //$log.log(org);
        if (!_.isEmpty(org)) {
            $scope.org = org;
        } else {
            $scope.org = {status: 'E'};
        }
        // status dropdown
        $scope.statusList = refData.statusesEnDis;

        organisationsService.getNations().then(
            function (response) {
                $scope.nationsList = response.nations;
            },
            function (error) {
                $scope.messageDivClass = "container alert alert-danger";
                $scope.actionMessage = error;
            }
        ).then(		
			function(response){
				for (var i=0;i< _.size($scope.nationsList);i++){
					if ($scope.nationsList[i]===$scope.org.nation)
					{
						$scope.org.nation_selected=$scope.nationsList[i];
						break;
					}
				}

            },
            function (error) {
                $scope.messageDivClass = "container alert alert-danger";
                $scope.actionMessage = error;
            });

        organisationsService.getParents(org).then(
            function (response) {
                $scope.parentsList = response.organisations;
            },
            function (error) {
                $scope.messageDivClass = "container alert alert-danger";
                $scope.actionMessage = error;
            }
        );

        $scope.saveUpdateDelete = function (org) {
            //$log.log(org);
            if (mode === 'new') {
                organisationsService.createOrganisation(org).then(
                    function (response) {
                        $scope.messageDivClass = "container alert alert-success";
                        $scope.actionMessage = "New Organisation Created";
                        // Close modal by passing the new user to update the table
                        //$scope.newOrg = response.newOrg;
                        $scope.actionSucceeded = true;
                        $timeout(function () {
                            $modalInstance.close(response.newOrg);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "container alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            }
            if (mode === 'edit') {
                organisationsService.updateOrganisation(org).then(
                        function (response) {
                            $scope.messageDivClass = "container alert alert-success";
                            $scope.actionMessage = "Organisation Changes Saved";
                            // Close modal by passing the new user to update the table
                            //$scope.updatedOrg = response.updatedOrg;
                            $scope.actionSucceeded = true;
                            $timeout(function () {
                                $modalInstance.close(response.updatedOrg);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "container alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
            }
            if (mode === 'delete') {
                if ($scope.showConfirmation) {
                    organisationsService.deleteOrganisation(org).then(
                        function (response) {
                            $scope.messageDivClass = "container alert alert-success";
                            $scope.actionMessage = "Organisation deleted";
                            // Close modal by passing the new user to update the table
                            $scope.actionSucceeded = true;
                            $timeout(function () {
                                $modalInstance.close(org);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "container alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                } else {
                    $scope.showConfirmation = true;
                    $scope.messageDivClass = "container alert alert-warning";
                    $scope.actionMessage = "<strong>Warning: </strong>This will delete this organisation and related endpoints including channels.";
                }
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss();
        };

    }]);

organisationsModule.controller('endPointsDetailsCtrl',
    ["$scope", '$filter', "$http", "$location", "$resource",
        "$state", "$stateParams", "$log", "$translate", "organisationsService",
        'refData', 'uiGridConstants',
        function ($scope, $filter, $http, $location, $resource,
                  $state, $stateParams, $log, $translate, organisationsService,
                  refData, uiGridConstants) {
            $scope.isDataLoading = true;

            $scope.emptyResultContacts = false;
            $scope.emptyResultChannels = false;

            $scope.emptyResultMessage = "No results found. ";
            $scope.loadingMessage = "Loading... taking some time";

            organisationsService.getEndPointDetails($stateParams).then(
                function (response) {
                    $scope.endpoint = {};
                    $scope.endpoint = response.endPointDetails;
                    //$scope.endpoint.status = response.endPointDetails.status === "E" ? "label label-success" : "label label-danger";
                    //$scope.endpoint.organisationName = organisationsModule.currentOrganisation ? organisationsModule.currentOrganisation.name : "";

                    $scope.isDataLoading = false;

                    if (_.isUndefined($scope.endpoint.channelList)) {
						$scope.emptyResultChannels = true;
						$scope.endpoint.channelList = {};
                    } else {
                        if (_.size($scope.endpoint.channelList) !== 0) {
                            $scope.displayedChannels = [].concat($scope.endpoint.channelList);
                            $scope.emptyResultChannels = false;
                        } else {
                            $scope.emptyResultChannels = true;
                        }
                    }

                    if (_.isUndefined($scope.endpoint.persons)) {
						$scope.emptyResultContacts = true;
						$scope.endpoint.persons = {};
                    } else {
                        if (_.size($scope.endpoint.persons) !== 0) {
                            $scope.displayedContacts = [].concat($scope.endpoint.persons);
                            $scope.emptyResultContacts = false;
                        } else {
                            $scope.emptyResultContacts = true;
                        }
                    }
                },
                function (error) {
                    $scope.isDataLoading = false;
                    $scope.emptyResultContacts = true;
                    $scope.emptyResultChannels = true;
                    $scope.emptyResultMessage = error;
                }
            );

			$scope.$on('event:addedChannel', function () {
				$scope.emptyResultChannels = false;
			});
			$scope.$on('event:deletedChannel', function () {
				if (_.size($scope.endpoint.channelList) === 0) {
					$scope.emptyResultChannels = true;
				}
			});
			$scope.$on('event:addedContact', function () {
				$scope.emptyResultContacts = false;
			});
			$scope.$on('event:deletedContact', function () {
				if (_.size($scope.endpoint.persons) === 0) {
					$scope.emptyResultContacts = true;
				}
			});
        }]);

organisationsModule.controller('organisationDetailsCtrl', ['$rootScope','$log', '$scope', '$modal', '$stateParams', 'refData', 'organisationsService',
    function ($rootScope,$log, $scope, $modal, $stateParams, refData, organisationsService) {
        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";

        $scope.$on('event:addedEndpoint', function () {
            $scope.emptyResult = false;
        });

        $scope.$on('event:deletedEndpoint', function () {
            if (_.size($scope.organisation.endpoints) === 0) {
                $scope.emptyResult = true;
            }
        });

        organisationsService.getOrganisation($stateParams).then(
            function (response) {

                if (_.size(response.endpoints) !== 0) {
                    $scope.emptyResult = false;
                } else {
                    $scope.emptyResult = true;
                }

                // saving organisation name in the controller (quick and dirty) it will be retrieved in the
                // endpoint detail controller -> endPointsDetailsCtrl
                organisationsModule.currentOrganisation = {};
                organisationsModule.currentOrganisation.name = response.organisation.organisationName;
                //
                $scope.organisation = response.organisation;
                $log.log($scope.organisation);

                $scope.isDataLoading = false;
            },
            function (error) {
                $scope.isDataLoading = false;
                $scope.emptyResult = true;
                $scope.emptyResultMessage = error;
            }
        );
    }]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

organisationsModule.controller('manageOrganisationEndpointsCtrl', ['$log', '$scope', '$modal','$state',
	function ($log, $scope, $modal,$state) {
		$scope.manageEndpoint = function (mode, endpoint,organisationName) {
			var modalInstance = $modal.open({
				animation: true,
				backdrop: true,
				keyboard: true,
				templateUrl: 'usm/organisations/partial/manageOrgEndpoints.html',
				controller: 'organisationEndpointsModalInstanceCtrl',
				resolve: {
					mode: function () {
						return mode;
					},
					endpoint: function () {
                        return angular.copy(endpoint);
					},
                    organisationName:function(){
                        return angular.copy(organisationName);
                    }

				}
			});



            modalInstance.result.then(function (returnedEndPoint) {
                if (mode === 'new') {
                    angular.copy(returnedEndPoint, endpoint);
                    if(_.isNull($scope.organisation.endpoints)){
                        $scope.organisation.endpoints=[];
                    }
                    $scope.organisation.endpoints.push(returnedEndPoint);
                    $scope.displayedOrganisationEndpoints = [].concat($scope.organisation.endpoints);
                    $scope.$emit('event:addedEndpoint');
                }
                // Update the model (org)
                if (mode === 'edit') {
                    angular.copy(returnedEndPoint, endpoint);
                 }
                if (mode === 'delete') {
                    var deleteIndex = $scope.organisation.endpoints.indexOf(endpoint);
                    $scope.organisation.endpoints.splice(deleteIndex, 1);
                    $scope.displayedOrganisationEndpoints = [].concat($scope.organisation.endpoints);
                    $scope.$emit('event:deletedEndpoint');
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
		};
	}]);

organisationsModule.controller('organisationEndpointsModalInstanceCtrl', ['$rootScope','$scope', '$modalInstance', '$log', '$q', '$timeout','$stateParams', 'refData', 'organisationsService', 'mode','organisationName','endpoint',
	function ($rootScope,$scope, $modalInstance, $log, $q, $timeout,$stateParams, refData, organisationsService, mode,organisationName, endpoint) {
		var confirmCreate = false;
		$scope.mode = mode;
		$scope.actionMessage = "";
		$scope.selectedStatus = "";
		$scope.organisation = {};
		$scope.contextCreated = false;
		$scope.showConfirmation = false;
		$scope.formDisabled = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";


        //status dropdown
        $scope.statusList = refData.statusesEnDis;

		if (!_.isEmpty(endpoint)) {
			$scope.endpoint = endpoint;
		} else {
			$scope.endpoint = {status: 'E'};
		}
        if (_.isEqual(mode, "delete")) {
			$scope.formDisabled = true;
            $scope.endpoint = endpoint;
		}

        $scope.saveUpdateDelete = function (endpoint) {
            if (_.isEqual(mode,"new")) {
               endpoint.organisationName = organisationName;
                    organisationsService.createEndPoint(endpoint).then(
                    function (response) {
                        $scope.messageDivClass = "container alert alert-success";
                        $scope.actionMessage = "New EndPoint Created";
                        $scope.actionSucceeded = true;
                        $scope.showConfirmation = true;
                        $timeout(function () {
                            $modalInstance.close(response.newEndPoint);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "container alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            }
            if (_.isEqual(mode,"edit")) {
              endpoint.organisationName = organisationName;
                organisationsService.updateEndPoint(endpoint).then(
                    function (response) {
                        $scope.messageDivClass = "container alert alert-success";
                        $scope.actionMessage = "EndPoint Changes Saved";
                        // Close modal by passing the new user to update the table
                        //$scope.updatedOrg = response.updatedOrg;
                        $scope.actionSucceeded = true;
                        $timeout(function () {
                            $modalInstance.close(response.updatedEndpoint);
                        }, 2000);
                    },
                    function (error) {
                        $scope.messageDivClass = "container alert alert-danger";
                        $scope.actionMessage = error;
                    }
                );
            }
            if (_.isEqual(mode,"delete")) {

                if ($scope.showConfirmation) {
                    organisationsService.deleteEndPoint(endpoint).then(
                        function (response) {
                            $scope.messageDivClass = "container alert alert-success";
                            $scope.actionMessage = "EndPoint deleted";
                            // Close modal by passing the new user to update the table
                            $scope.actionSucceeded = true;
                            $timeout(function () {
                                $modalInstance.close(endpoint);
                            }, 2000);
                        },
                        function (error) {
                            $scope.messageDivClass = "container alert alert-danger";
                            $scope.actionMessage = error;
                        }
                    );
                } else {
                    $scope.showConfirmation = true;
                    $scope.messageDivClass = "container alert alert-warning";
                    $scope.actionMessage = "<strong>Warning: </strong>This will delete this endpoint and its channels.";
                }
            }
        };

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
    }]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

organisationsModule.controller('manageOrganisationChannelsCtrl', ['$log', '$scope', '$modal',
    function ($log, $scope, $modal) {
        $scope.manageOrgEndpointsChannel = function (mode, channel) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                templateUrl: 'usm/organisations/partial/manageOrgChannels.html',
                controller: 'organisationChannelsModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    scope: function () {
                        return angular.copy(channel);
                    }
                }
            });

            modalInstance.result.then(function (returnedOrgChannel) {
                if (mode === 'new') {
                    angular.copy(returnedOrgChannel, channel);
                    $scope.endpoint.channelList.push(returnedOrgChannel);
					$scope.$emit('event:addedChannel');
                }
                // Update the model (org)
                if (mode === 'edit') {
                    angular.copy(returnedOrgChannel, channel);
                }
                if (mode === 'delete') {
                    var deleteIndex = $scope.endpoint.channelList.indexOf(channel);
                    $scope.endpoint.channelList.splice(deleteIndex, 1);
					$scope.$emit('event:deletedChannel');
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

organisationsModule.controller('organisationChannelsModalInstanceCtrl', [
				'$scope', '$modalInstance', '$stateParams',
				'$log', '$q', '$timeout', 'refData', 'mode', 'scope', 'organisationsService',
	function ($scope, $modalInstance, $stateParams,
				$log, $q, $timeout, refData, mode, scope, organisationsService) {
		var confirmCreate = false;
		$scope.mode = mode;
		$scope.actionMessage = "";
		$scope.selectedStatus = "";
		$scope.organisation = {};
		$scope.channelCreated = false;
		$scope.showConfirmation = false;
		$scope.formDisabled = false;
        $scope.isDataLoading = true;
        $scope.emptyResult = true;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";

		$scope.channels = $scope.responseChannels;

		// Setting defaults for new and saving ids for delete
		if (_.isEqual(mode, "new")) {
			//$scope.selectedChannel = $scope.channels[0];
		} else if (_.isEqual(mode, "edit")) {
			$scope.selectedChannel = scope;
		} else if (_.isEqual(mode, "delete")) {
			$scope.selectedChannel = scope;
		}

		if (_.isEqual(mode, "delete")) {
			$scope.formDisabled = true;
		}

		$scope.saveUpdateDelete = function (selectedChannel) {
			if (mode === 'new') {
				selectedChannel.endpointId = $stateParams.endPointId;
				organisationsService.createChannel(selectedChannel).then(
					function (response) {
						$scope.actionSucceeded = true;
						$scope.showConfirmation = true;
						$scope.channelCreated = true;
						$scope.actionDivClass = "container alert alert-success";
						$scope.actionMessage = "New Channel Created";

						$timeout(function () {
							$modalInstance.close(response.newChannel); /*selectedChannel*/
						}, 2000);
					},
					function (error) {
						$scope.messageDivClass = "container alert alert-danger";
						$scope.successMessage = error;
					}
				);
			}
			if (mode === 'edit') {
				organisationsService.updateChannel(selectedChannel).then(
					function (response) {
						$scope.actionSucceeded = true;
						$scope.showConfirmation = true;
						$scope.channelCreated = true;
						$scope.actionDivClass = "container alert alert-success";
						$scope.actionMessage = "Channel Changes Saved";

						$timeout(function () {
							$modalInstance.close(response.updatedChannel); /*selectedChannel*/
						}, 2000);
					},
					function (error) {
						$scope.messageDivClass = "container alert alert-danger";
						$scope.successMessage = error;
					}
				);
			}
			if (mode === 'delete') {
				if ($scope.showConfirmation) {
					organisationsService.deleteChannel(selectedChannel).then(
						function (response) {
							$scope.actionSucceeded = true;
							$scope.channelCreated = true;
							$scope.actionDivClass = "container alert alert-success";
							$scope.actionMessage = "Channel deleted";

							$scope.successMessage = "";
							$scope.messageDivClass = "";

							$timeout(function () {
								$modalInstance.close(selectedChannel); /* response.deletedChannel */
							}, 2000);
						},
						function (error) {
							$scope.messageDivClass = "container alert alert-danger";
							$scope.successMessage = error;
						}
					);
				} else {
					$scope.showConfirmation = true;
					$scope.messageDivClass = "container alert alert-warning";
					$scope.successMessage = "<strong>Warning: </strong>This will delete the channel";
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};

    }]);

organisationsModule.directive('numbersOnly', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, modelCtrl) {
			modelCtrl.$parsers.push(function (inputValue) {
			   // this next if is necessary for when using ng-required on your input.
			   // In such cases, when a letter is typed first, this parser will be called
			   // again, and the 2nd time, the value will be undefined
				if (inputValue === undefined) {
					return '';
				}
				var transformedInput = inputValue.replace(/[^0-9]/g, '');
				if (transformedInput !== inputValue) {
					modelCtrl.$setViewValue(transformedInput);
					modelCtrl.$render();
				}
				return transformedInput;
			});
		}
	};
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

organisationsModule.controller('manageOrganisationContactsCtrl', ['$log', '$scope', '$modal',
    function ($log, $scope, $modal) {
        $scope.manageOrgEndpointsContact = function (mode, contact) {
            var modalInstance = $modal.open({
                animation: true,
                backdrop: true,
                keyboard: true,
                templateUrl: 'usm/organisations/partial/manageOrgContacts.html',
                controller: 'organisationContactsModalInstanceCtrl',
                resolve: {
                    mode: function () {
                        return mode;
                    },
                    scope: function () {
                        return angular.copy(contact);
                    }
                }
            });

            modalInstance.result.then(function (returnedOrgContact) {
                if (mode === 'new') {
                    angular.copy(returnedOrgContact, contact);
                    $scope.endpoint.persons.push(returnedOrgContact);
                    //$scope.displayedContacts = [].concat($scope.endpoint.persons);
					$scope.$emit('event:addedContact');
                }
                if (mode === 'delete') {
                    var deleteIndex = $scope.endpoint.persons.indexOf(contact);
                    $scope.endpoint.persons.splice(deleteIndex, 1);
                    //$scope.displayedContacts = [].concat($scope.endpoint.persons);
					$scope.$emit('event:deletedContact');
                }
            }, function () {
                //$log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);

organisationsModule.controller('organisationContactsModalInstanceCtrl', ['$scope', '$modalInstance', '$log', '$q', '$timeout', '$stateParams', 'refData', 'mode', 'scope', 'organisationsService', 'personsService',
	function ($scope, $modalInstance, $log, $q, $timeout, $stateParams, refData, mode, scope, organisationsService, personsService) {
		var confirmCreate = false;
		$scope.mode = mode;
		$scope.actionMessage = "";
		$scope.selectedStatus = "";
		$scope.organisation = {};
		$scope.contactCreated = false;
		$scope.showConfirmation = false;
		$scope.formDisabled = false;

		$scope.isDataLoading = true;
		$scope.emptyResult = true;
		$scope.emptyResultMessage = "No results found. ";
		$scope.loadingMessage = "Loading... taking some time";

		/*
		organisationsService.getEndPointDetails($stateParams).then(
			function (response) {
				$scope.endpoint = {};
				$scope.endpoint = response.endPointDetails;
				$scope.contacts = [];
				personsService.getPersons().then(
					function (response) {
						$scope.responseContacts = response.persons;
						angular.forEach($scope.responseContacts, function(obj) {
							var result = $.grep($scope.endpoint.persons, function(e){
								return e.personId === obj.personId;
							});
							//$log.log('len: ' + result.length + ' ' + obj.personId + ' ' + obj.firstName + ' ' + obj.firstName + ' ' + obj.email);
							if(result.length === 0) {
								if(obj.firstName !== null && obj.lastName !== null && obj.email !== null) {
									obj.fullName = obj.firstName + ' ' + obj.lastName;
									obj.fullNameAndEmail = obj.firstName + ' ' + obj.lastName + ' ' + obj.email;
									$scope.contacts.push(obj);
								}
							}
						});

						// Setting defaults for new and saving ids for delete
						if (_.isEqual(mode, "new")) {
							$scope.selectedContact = $scope.contacts[0];
						} else if (_.isEqual(mode, "delete")) {
							for(var i = 0; i < $scope.responseContacts.length; i++) {
								if($scope.responseContacts[i].personId === scope.personId) {
									$scope.selectedContact = scope;
									break;
								}
							}
						}

						if (_.isEqual(mode, "delete")) {
							$scope.formDisabled = true;
						}

					},
					function (error) {
						$log.log("error");
					}
				);

			},
			function (error) {
				$log.log("error");
			}
		);
		*/

		// Retrieve org endpoint contacts
		//rolesServices.getOrgEndpointContacts().then(
		//);
		// ... Mock data ...
		//$scope.responseContacts = [
		//	{endPointContactId: 100001, personId: 0, firstName: "Mary", lastName: "Flux", phoneNumber: "+33212345678", email: "mary.flux@mail.eu"},
		//	{endPointContactId: 100002, personId: 1, firstName: "Jean", lastName: "Flux", phoneNumber: "+33212345679", email: "jean.flux@mail.eu"},
		//	{endPointContactId: 100003, personId: 2, firstName: "Kostas", lastName: "Flux", phoneNumber: "+33212345680", email: "kostas.flux@mail.eu"},
		//];
		//$scope.contacts = [];
		//angular.forEach($scope.responseContacts, function(obj) {
			/*
			var result = $.grep($scope.displayedContacts, function(e){
					return e.personId == obj.personId;
			});
			if (result.length == 0) {
			*/
			//	obj.fullName = obj.firstName + ' ' + obj.lastName;
			//	obj.fullNameAndEmail = obj.firstName + ' ' + obj.lastName + ' ' + obj.email;
			//	$scope.contacts.push(obj);
			/*
			//}
			*/
		//});

		$scope.contacts = [];
		personsService.getPersons().then(
			function (response) {
				$scope.responseContacts = response.persons;
				angular.forEach($scope.responseContacts, function(obj) {
					/*
					var result = $.grep($scope.endpoint.persons, function(e){
						return e.personId === obj.personId;
					});
					//$log.log('len: ' + result.length + ' ' + obj.personId + ' ' + obj.firstName + ' ' + obj.firstName + ' ' + obj.email);
					if(result.length === 0) {
					*/
						if(obj.firstName !== null && obj.lastName !== null && obj.email !== null) {
							obj.fullName = obj.firstName + ' ' + obj.lastName;
							obj.fullNameAndEmail = obj.firstName + ' ' + obj.lastName + ' ' + obj.email;
							$scope.contacts.push(obj);
						}
					/*
					}
					*/
				});

				// Setting defaults for new and saving ids for delete
				if (_.isEqual(mode, "new")) {
					$scope.selectedContact = $scope.contacts[0];
				} else if (_.isEqual(mode, "delete")) {
					for(var i = 0; i < $scope.contacts.length; i++) {
						if($scope.contacts[i].personId === scope.personId) {
							$scope.selectedContact = scope;
							break;
						}
					}
				}
			},
			function (error) {
				$log.log("error");
			}
		);

		if (_.isEqual(mode, "delete")) {
			$scope.formDisabled = true;
		}

		$scope.saveUpdateDelete = function (selectedContact) {
			if (mode === 'new') {
				var newRequest = { endPointId: $stateParams.endPointId, personId: selectedContact.personId } ;
				organisationsService.createEndPointContact(newRequest).then( /*selectedContact*/
					function (response) {
						$scope.showConfirmation = true;
						$scope.contactCreated = true;
						$scope.messageDivClass = "container alert alert-success";
						$scope.actionMessage = "Contact assigned";

						$timeout(function () {
							$modalInstance.close(response.newEndPointContact); /*selectedContact*/
						}, 2000);
					},
					function (error) {
						$scope.messageDivClass = "container alert alert-danger";
						$scope.actionMessage = error;
					}
				);
			}
			if (mode === 'delete') {
				if ($scope.showConfirmation) {
					var delRequest = { endpointcontactId: selectedContact.endPointContactId } ;
					organisationsService.deleteEndPointContact(delRequest).then(
						function (response) {
							$scope.contactCreated = true;
							$scope.messageDivClass = "container alert alert-success";
							$scope.actionMessage = "Contact removed";

							$timeout(function () {
								$modalInstance.close(selectedContact);
							}, 2000);
						},
						function (error) {
							$scope.messageDivClass = "container alert alert-danger";
							$scope.actionMessage = error;
						}
					);
				} else {
					$scope.showConfirmation = true;
					$scope.messageDivClass = "container alert alert-warning";
					$scope.actionMessage = "<strong>Warning: </strong>This will remove the contact from endpoint";
				}
			}
		};

		$scope.cancel = function () {
			$modalInstance.dismiss();
		};
    }]);
