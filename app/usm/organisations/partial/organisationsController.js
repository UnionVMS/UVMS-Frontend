/**
 * Controller for the main page of Organisations
 *
 */
var organisationsModule = angular.module('organisations');

organisationsModule.controller('organisationsListCtrl', ['$scope', '$log', 'refData', '$stateParams',
    '$state', 'organisationsService', 'userService', 'orgNations', 'orgNames',
    function ($scope, $log, refData, $stateParams, $state, organisationsService, userService, orgNations, orgNames) {
        $scope.search = {};
        $scope.sort = {
            sortColumn: $stateParams.sortColumn || 'name', // Default Sort.
            sortDirection: $stateParams.sortDirection || 'asc'
        };

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        $scope.showPagination = true;
        $scope.statusList = refData.statusesSearchDropDown;
        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";

        //To fill out the combos in the Search panel
        // 1. List Of Status
        $scope.status = {};
        $scope.statusSelected = "";

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

        // $scope.getNations();

        // 3.List Of Organisations...
        $scope.organisation = {};
        $scope.name = {};
        $scope.namesList = [];
        // transform to dropdown input
        var organisationsDropDown = [];
        angular.forEach(orgNames, function(item){
            var organisation = {};
            organisation.label = item.parentOrgName;
            organisation.value = item.parentOrgName;
            organisationsDropDown.push(organisation);
        });
        $scope.namesList = organisationsDropDown;

        //$scope.getOrganisations();

        // Retrieve the records of organisations in the main table. This method is executed by the pagination directive whenever the current page is changed
        // (also true for the initial loading).
        $scope.organisationsList = [];

        $scope.getPage = function (currentPage) {

            $scope.pageData = {
                name: $stateParams.name || '',
                nation: $stateParams.nation || '',
                status: $stateParams.status || 'all'
            };

            // To establish the object Criteria to fill the table for the first time...
            $scope.criteria = {};

            $scope.criteria.offset = (currentPage - 1) * $scope.paginationConfig.itemsPerPage;
            $scope.criteria.limit = $scope.paginationConfig.itemsPerPage;
            $scope.criteria.sortColumn = $scope.sort.sortColumn;
            $scope.criteria.sortDirection = $scope.sort.sortDirection;

            var organisation = "";

            if ($scope.pageData.name !== null && $scope.pageData.name !== '' && !_.isUndefined($scope.pageData.name)) {

                organisation = $scope.pageData.name;

                //to replace the symbols from the URL for organisation
                var parentURL = organisation.search("%");
                if (parentURL !== -1) {
                    //  organisation =$scope.pageData.name.replace("%20%252F%20"," / ");
                    organisation = $scope.pageData.name.replace("%2F", "/");
                }

                //To fill the search.name field (organisation name field) it is necessary to find the element of the list
                for (var i = 0; i < _.size($scope.namesList); i++) {
                    if ($scope.namesList[i].value === organisation) {
                        $scope.search.name = $scope.namesList[i].value;
                        break;
                    }
                }

            }

            $scope.criteria.name = organisation;

            if ($scope.pageData.status !== null && $scope.pageData.status !== '' && !_.isUndefined($scope.pageData.status)) {
                $scope.criteria.status = $scope.pageData.status;
                $scope.search.status = $scope.pageData.status;
            }

            if ($scope.pageData.nation !== null && $scope.pageData.nation !== '' && !_.isUndefined($scope.pageData.nation)) {
                $scope.criteria.nation = $scope.pageData.nation;
                $scope.search.nation = $scope.pageData.nation;
            }

            //to call the service with the criteria to retrieve the records of the organisations table
            organisationsService.searchOrganisations($scope.criteria).then(
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

                },

                function (error) {
                    $scope.isDataLoading = false;
                    $scope.emptyResult = true;
                    $scope.emptyResultMessage = error;
                }
            );

        };


        $scope.searchOrganisation = function (search) {

            if ($scope.search.name !== null && $scope.search.name !== '' && !_.isUndefined($scope.search.name)) {

                $scope.pageData.name = $scope.search.name;

            } else {
                $scope.pageData.name = "";
            }

            if ($scope.search.nation !== null && $scope.search.nation !== "" && !_.isUndefined($scope.search.nation)) {
                $scope.pageData.nation = $scope.search.nation;
            } else {
                $scope.pageData.nation = "";

            }

            if (search.status !== "all") {
                $scope.pageData.status = search.status;
            } else {
                $scope.pageData.status = "";
            }

            changeUrlParams();
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

            $state.go($state.current, {
                page: $scope.paginationConfig.currentPage,
                sortColumn: $scope.sort.sortColumn,
                sortDirection: $scope.sort.sortDirection,

                name: $scope.pageData.name,
                nation: $scope.pageData.nation,
                status: $scope.pageData.status
            });
        };


        $scope.resetForm = function () {
            $scope.sort.sortColumn = 'name';
            $scope.sort.sortDirection = 'asc';

            $scope.criteria = {};
            $scope.pageData = {};

            $scope.search.name = '';
            $scope.search.nation = '';
            $scope.search.status = refData.statuses[0];

            changeUrlParams();

        };

        $scope.paginationConfig =
        {
            currentPage: '',
            pageCount: '',
            totalItems: '',
            itemsPerPage: 8
        };

    }]);


organisationsModule.controller('manageOrganisationCtrl', ['$scope', '$modal', '$log', '$state', 'organisationsService', 'refData',
    function ($scope, $modal, $log, $state, organisationsService, refData) {

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
                    },
                    nations: function () {
                        return refData.nations;
                        /*
                         return organisationsService.getNations().then(
                         function (response) {
                         return response.nations;
                         },
                         function (error) {
                         return [];
                         }
                         );
                         */
                    },
                    parents: function () {
                        return organisationsService.getParents(org).then(
                            function (response) {
                                return response.organisations;
                            },
                            function (error) {
                                return [];
                            }
                        );
                    }

                }
            });

            // It is a promise that resolves when modal is closed and rejected when modal is dismissed
            modalInstance.result.then(function (returnedOrg) {
                if (mode === 'new') {
                    if (_.isUndefined($scope.organisationsList)) {
                        $scope.organisationsList = [];
                    }
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
            });
        };
    }]);

organisationsModule.controller('manageOrgModalInstanceCtrl', ['$scope', '$modalInstance', '$log', '$timeout', '$location', 'refData', 'getApplications',
    'organisationsService', 'mode', 'org', '$stateParams', 'nations', 'parents',
    function ($scope, $modalInstance, $log, $timeout, $location, refData, getApplications, organisationsService,
              mode, org, $stateParams, nations, parents) {
        var confirmCreate = false;
        $scope.nations = nations;
        $scope.parentsList = parents;
        $scope.mode = mode;
        $scope.actionMessage = "";
        $scope.selectedStatus = "";
        $scope.organisation = {};
        $scope.actionSucceeded = false;
        $scope.showConfirmation = false;

        if (!_.isEmpty(org)) {
            $scope.org = org;
        } else {
            $scope.org = {status: 'E'};
        }

        // status dropdown
        $scope.statusList = refData.statusesEnDis;

        $scope.saveUpdateDelete = function (org) {
            if (mode === 'new') {
                var newOrg = {
                    name: $scope.org.name,
                    description: $scope.org.description,
                    nation: $scope.org.nation,
                    status: $scope.org.status,
                    parent: $scope.org.parent,
                    email: $scope.org.email,
                    organisationId: $scope.org.organisationId
                };

                organisationsService.createOrganisation(newOrg).then(
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
                var edtOrg = {
                    name: $scope.org.name,
                    description: $scope.org.description,
                    nation: $scope.org.nation,
                    status: $scope.org.status,
                    parent: $scope.org.parent,
                    email: $scope.org.email,
                    organisationId: $scope.org.organisationId
                };

                organisationsService.updateOrganisation(edtOrg).then(
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
        "$state", "$stateParams", "$log", "$translate", "organisationsService", "userService",
        function ($scope, $filter, $http, $location, $resource,
                  $state, $stateParams, $log, $translate, organisationsService, userService) {
            $scope.selectedTab = "Channels";
            $scope.isDataLoading = true;

            $scope.emptyResultContacts = false;
            $scope.emptyResultChannels = false;

            $scope.emptyResultMessage = "No results found. ";
            $scope.loadingMessage = "Loading... taking some time";

            $scope.checkAccess = function (feature) {
                return userService.isAllowed(feature, "USM", true);
            };

            //Sets tabs
            $scope.tabMenu = [
                {'tab': 'Channels', 'title': 'COMMUNICATION CHANNELS'},
                {'tab': 'Contacts', 'title': "CONTACTS"}
            ];
            $scope.selectTab = function (tab) {
                $scope.selectedTab = tab;
            };

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

organisationsModule.controller('organisationDetailsCtrl', ['$rootScope', '$log', '$scope', '$modal', '$stateParams', 'refData', 'organisationsService', 'userService',
    function ($rootScope, $log, $scope, $modal, $stateParams, refData, organisationsService, userService) {
        $scope.isDataLoading = true;
        $scope.emptyResult = false;
        $scope.emptyResultMessage = "No results found. ";
        $scope.loadingMessage = "Loading... taking some time";


        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

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

        $scope.sort = {
            sortColumn: 'name', // Default Sort.
            sortDirection: 'asc'
        };

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
            //$scope.getPage($scope.paginationConfig.currentPage);
        };

        $scope.sortIcon = function (column) {
            var sort = $scope.sort;
            if (sort.sortColumn === column) {
                var sortDirection = sort.sortDirection;
                return sortDirection === 'desc' ? 'fa-sort-desc' : 'fa-sort-asc';
            }
            return 'fa-sort';
        };

    }]);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

organisationsModule.controller('manageOrganisationEndpointsCtrl', ['$log', '$scope', '$modal', '$state', 'userService',
    function ($log, $scope, $modal, userService) {

        $scope.checkAccess = function (feature) {
            return userService.isAllowed(feature, "USM", true);
        };

        $scope.manageEndpoint = function (mode, endpoint, organisationName) {
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
                    organisationName: function () {
                        return angular.copy(organisationName);
                    }

                }
            });


            modalInstance.result.then(function (returnedEndPoint) {
                if (mode === 'new') {
                    angular.copy(returnedEndPoint, endpoint);
                    if (_.isNull($scope.organisation.endpoints)) {
                        $scope.organisation.endpoints = [];
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

organisationsModule.controller('organisationEndpointsModalInstanceCtrl', ['$rootScope', '$scope', '$modalInstance', '$log', '$q', '$timeout', '$stateParams', 'refData', 'organisationsService', 'mode', 'organisationName', 'endpoint',
    function ($rootScope, $scope, $modalInstance, $log, $q, $timeout, $stateParams, refData, organisationsService, mode, organisationName, endpoint) {
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
            if (_.isEqual(mode, "new")) {
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
            if (_.isEqual(mode, "edit")) {
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
            if (_.isEqual(mode, "delete")) {

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
                            $modalInstance.close(response.newChannel);
                            /*selectedChannel*/
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
                            $modalInstance.close(response.updatedChannel);
                            /*selectedChannel*/
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
                                $modalInstance.close(selectedChannel);
                                /* response.deletedChannel */
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

organisationsModule.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, modelCtrl) {
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


        $scope.contacts = [];
        personsService.getPersons().then(
            function (response) {
                $scope.responseContacts = response.persons;
                angular.forEach($scope.responseContacts, function (obj) {
                    /*
                     var result = $.grep($scope.endpoint.persons, function(e){
                     return e.personId === obj.personId;
                     });
                     //$log.log('len: ' + result.length + ' ' + obj.personId + ' ' + obj.firstName + ' ' + obj.firstName + ' ' + obj.email);
                     if(result.length === 0) {
                     */
                    if (obj.firstName !== null && obj.lastName !== null && obj.email !== null) {
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
                    for (var i = 0; i < $scope.contacts.length; i++) {
                        if ($scope.contacts[i].personId === scope.personId) {
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
                var newRequest = {endPointId: $stateParams.endPointId, personId: selectedContact.personId};
                organisationsService.createEndPointContact(newRequest).then(/*selectedContact*/
                    function (response) {
                        $scope.showConfirmation = true;
                        $scope.contactCreated = true;
                        $scope.messageDivClass = "container alert alert-success";
                        $scope.actionMessage = "Contact assigned";

                        $timeout(function () {
                            $modalInstance.close(response.newEndPointContact);
                            /*selectedContact*/
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
                    var delRequest = {endpointcontactId: selectedContact.endPointContactId};
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
