var userContextsServiceModule = angular.module('userContextsServiceModule', ['ngResource']);

userContextsServiceModule.factory('userContextsServices', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        getUserContextsServices: function (userName) {
            var message = "";
            var u={};
			 u.userName = userName;
			$q.activeUser = u;
            var deferred = $q.defer();

			var resource = $resource('/usm-administration/rest/users/:userName/userContexts', u);
            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        userContexts: data.results
                    });
                },
                function (error) {
                    $log.log(error);
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        createContext: function (context, context2) {
            var message = "";
			var usr = {};
			usr.userName = $q.activeUser.userName;
            var deferred = $q.defer();

			var postData = {
			  "userContextId": null,
			  "userName": $q.activeUser.userName,
			  "scopeId": context2 ? context2.scopeId : "",
			  "roleId": context.roleId
			};

			var resource = $resource('/usm-administration/rest/users/:userName/userContexts', usr);
            resource.save(postData).$promise.then(
                function (data) {
                    deferred.resolve({
                        newContext: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
        },
        updateContext: function (context) {
            var message = "";
			var usr = {};
			usr.userName = $q.activeUser.userName;
            var deferred = $q.defer();

			var resource = $resource('/usm-administration/rest/users/:userName/userContexts', usr, {updateContext: {method: 'PUT'}});
            resource.updateContext(context).$promise.then(
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
        },
        deleteContext: function (context) {
            var message = "";
			var usr = {};
			usr.userName = $q.activeUser.userName;
			usr.userContextId = context.userContextId;
            var deferred = $q.defer();

			var resource = $resource('/usm-administration/rest/users/:userName/userContexts/:userContextId/', usr);
            resource.delete().$promise.then(
                function (data) {
                    deferred.resolve({
                        deletedContext: data
                    });
					// refresh contexts list
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        }

	};
}]);
