var organisationsService = angular.module('organisationsService', ['ngResource']);


organisationsService.factory('organisationsService', ['$q', '$resource', '$log', function ($q, $resource, $log) {
    var _getOrganisations = function (criteria) {
        var message = "";
        var deferred = $q.defer();

        //to control if the organisation has a parent
        var parent = criteria.name.search("/");
    	if (parent !== -1) {
            var name = criteria.name.split(' / ');
            name = name[1];
            criteria.name = name;
    	}

        var resource = $resource('/usm-administration/rest/organisations');

        resource.get(criteria).$promise.then(
            function (data) {
                deferred.resolve({
                    organisations: data.results,
                    total: data.total
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _get = function () {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource("/usm-administration/rest/organisations/names");

        resource.get().$promise.then(
            function (data) {
                deferred.resolve({
                    organisations: data.results
                });
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var _getNations = function () {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource("/usm-administration/rest/organisations/nations/names");

        resource.get().$promise.then(
            function (data) {
                deferred.resolve({
                    nations: data.results
                });
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var _searchOrganisations = function (criteria) {

    	 //to control if the organisation has a parent
    	var parent = criteria.name.search("/");
    	if (parent !== -1) {
            var name = criteria.name.split(' / ');
            name = name[1];
            criteria.name = name;
    	}

        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations');

        resource.get(criteria).$promise.then(
            function (data) {
                deferred.resolve({
                    organisations: data.results,
                    total: data.total
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _getOrganisation = function (criteria) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations/:organisationId', criteria);

        resource.get(criteria).$promise.then(
            function (data) {
                deferred.resolve({
                    organisation: data,
                    endpoints: data.endpoints
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

	var _createChannel = function (channel) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/channel');

		resource.save(channel).$promise.then(
            function (data) {
                deferred.resolve({
                    newChannel: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
	};

    var _updateChannel = function (channel) {
        var message = "";
        var deferred = $q.defer();
		var resource = $resource('/usm-administration/rest/channel/', '', {updChannel: {method: 'PUT'}} );

		resource.updChannel(channel).$promise.then(
            function (data) {
                deferred.resolve({
                    updatedChannel: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

	var _deleteChannel = function (channel) {
		var message = "";
		var deferred = $q.defer();

		var resource = $resource('/usm-administration/rest/channel/:channelId/', channel);
		resource.delete().$promise.then(
			function (data) {
				deferred.resolve({
					deletedChannel: data
				});
				// refresh contexts list
			},
			function (error) {
				message = error.data.message;
				deferred.reject(message);
			}
		);

		return deferred.promise;
	};

	var _createEndPointContact = function (endPointContact) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/endpointcontact');

		resource.save(endPointContact).$promise.then(
            function (data) {
                deferred.resolve({
                    newEndPointContact: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
	};

	var _deleteEndPointContact = function (endPointContact) {
		var message = "";
		var deferred = $q.defer();

		var resource = $resource('/usm-administration/rest/endpointcontact/:endpointcontactId', endPointContact);
		resource.delete().$promise.then(
			function (data) {
				deferred.resolve({
					deletedChannel: data
				});
				// refresh contexts list
			},
			function (error) {
				message = error.data.message;
				deferred.reject(message);
			}
		);

		return deferred.promise;
	};


    var _getEndPointDetails = function (endPointId) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations/endpoint/:endPointId', endPointId);

        resource.get().$promise.then(
            function (data) {
                deferred.resolve({
                    endPointDetails: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _createOrganisation = function (org) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations');

        resource.save(org).$promise.then(
            function (data) {
                deferred.resolve({
                    newOrg: data
                });
            },
            function (error) {
                if (error.status = 405 && _.isUndefined(error.data)) {
                    message = error.statusText;
                } else {
                    message = error.data.message;
                }
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _updateOrganisation = function (org) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations/', {}, {updateOrganisation: {method: 'PUT'}});
        resource.updateOrganisation(org).$promise.then(
            function (data) {
                deferred.resolve({
                    updatedOrg: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _deleteOrganisation = function (org) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/organisations/:organisationId', {"organisationId": org.organisationId});

        resource.delete().$promise.then(
            function (data) {
                deferred.resolve({
                    deletedOrg: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _getParents = function (org) {
        var message = "";
        var organisationId = -1;
        if (!_.isUndefined(org.organisationId)) {
            organisationId = org.organisationId;
        }
        var deferred = $q.defer();
        var resource = $resource("/usm-administration/rest/organisations/:organisationId/parent/names", {"organisationId": organisationId});

        resource.get().$promise.then(
            function (data) {
                deferred.resolve({
                    organisations: data.results
                });
            },
            function (error) {
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };
    var _createEndPoint = function(endpoint){
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/endpoint');

        resource.save(endpoint).$promise.then(
            function (data) {
                deferred.resolve({
                    newEndPoint: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _updateEndPoint = function(endpoint){
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/endpoint/', '', {updEndpoint: {method: 'PUT'}} );

        resource.updEndpoint(endpoint).$promise.then(
            function (data) {
                deferred.resolve({
                    updatedEndpoint: data
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _deleteEndPoint = function(endpoint){
        var message = "";
        var deferred = $q.defer();

        var resource = $resource('/usm-administration/rest/endpoint/:endpointId/', endpoint);
        resource.delete().$promise.then(
            function (data) {
                deferred.resolve({
                    deletedEndpoint: data
                });
                // refresh contexts list
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };
    return {
        get: _get,
        getNations: _getNations,
        getOrganisations: _getOrganisations,
        searchOrganisations: _searchOrganisations,
        getEndPointDetails: _getEndPointDetails,
		createChannel: _createChannel,
		updateChannel: _updateChannel,
		deleteChannel: _deleteChannel,
		createEndPointContact: _createEndPointContact,
		deleteEndPointContact: _deleteEndPointContact,
        getOrganisation: _getOrganisation,
        createOrganisation: _createOrganisation,
        updateOrganisation: _updateOrganisation,
        deleteOrganisation: _deleteOrganisation,
        getParents: _getParents,
        createEndPoint:_createEndPoint,
        updateEndPoint:_updateEndPoint,
        deleteEndPoint:_deleteEndPoint
    };
}]);

