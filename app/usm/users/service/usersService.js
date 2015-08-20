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

    return {
        getUsers: _getUsers
    };

}]);

usersService.factory('userDetailsService', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        getUser: function (userName) {
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
        }
    };

}]);
