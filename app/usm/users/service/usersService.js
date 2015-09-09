var usersService = angular.module('usersService', []);

usersService.factory('UsersListService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    var _getUsers = function (criteria) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/users');
        resource.get(criteria).$promise.then(
            function (data) {
                deferred.resolve({
                    users: data.results,
                    total: data.total
                });
            },
            function (error) {
                message = 'Error: ' + error.data.message;
                deferred.reject(message);
            }
        );
        return deferred.promise;
    };

    var _getUsersNames = function (criteria) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('/usm-administration/rest/users/names');
        resource.get(criteria).$promise.then(
            function (data) {
                deferred.resolve({
                    users: data.results
                });
            },
            function (error) {
                message = 'Error: ' + error.data.message;
                deferred.reject(message);
            }
        );
        return deferred.promise;
    };

    return {
        getUsers: _getUsers,
		getUsersNames: _getUsersNames
    };

}]);

usersService.factory('userDetailsService', ['$resource', '$q', '$log', function ($resource, $q, $log) {
	var _copyUserPrefs = function (toUserName, arrComprehensiveUserContext) {
		var message = "";
		var usr = {};
		usr.toUserName = toUserName; //$q.activeUser.userName;
		var deferred = $q.defer();

		var resource = $resource('/usm-administration/rest/users/:toUserName/userPreferences', usr, {_copyUserPrefs: {method: 'PUT'}});
		resource._copyUserPrefs(arrComprehensiveUserContext).$promise.then(
			function (data) {
				deferred.resolve({
					updatedContext: data
				});
			},
			function (error) {
				message = error.data.message;
				deferred.reject(message);
			}
		);

		return deferred.promise;
	};
	
	var _getUser = function (userName) {	
		var message = "";
		var deferred = $q.defer();
		var resource = $resource('/usm-administration/rest/users/:userName', {'userName': userName});

		resource.get().$promise.then(
			function (data) {
		   //     $log.log(data); // commented by AM 20/06/15
				/* var orgName = data.organisation;
				if (!_.isNull(data.parent)&&! _.isUndefined(data.parent)&&!_.isEmpty(data.parent)) {
					var parentOrgName = data.parent;
					data.organisation_parent = parentOrgName + ' / ' + orgName;
				} else {
					data.organisation_parent = orgName;
				}*/
				deferred.resolve({
					user: data
				});
			},
			function (error) {
				message = "Error: " + error.data.message;
				deferred.reject(message);
			}
		);
		return deferred.promise;
	};

	return {
        getUser: _getUser,
		copyUserPrefs: _copyUserPrefs
    };	
}]);
