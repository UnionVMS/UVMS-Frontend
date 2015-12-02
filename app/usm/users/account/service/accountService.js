var accountServiceModule = angular.module('accountServiceModule', ['ngResource']);

accountServiceModule.factory('accountService', ['$q', '$resource', '$log', function ($q, $resource, $log) {
    	var _saveUser = function (user) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource("/usm-administration/rest/users");

            resource.save(user).$promise.then(
                function (data) {
                    $log.log(data);
                    deferred.resolve({
                        newUser: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
        };

        var _updateUser = function (contactDetails) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource("/usm-administration/rest/users", {}, {updateUser:{method:'PUT'}});

            resource.updateUser(contactDetails).$promise.then(
                function (data) {
                    $log.log(data);
                    deferred.resolve({
                        updatedUser: data
                    });
                },
                function (error) {
                    $log.log(error);
                    message = "Error: " + error.data.message;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
        };

        var _changePassword = function (user) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource("/usm-administration/rest/users/password",{},{changePassword:{method:'PUT'}});

            resource.changePassword(user).$promise.then(
                function (data) {
                    $log.log(data);
                    deferred.resolve({
                    	changePassword: data
                    });
                },
                function (error) {
                    $log.log(error);
                    message = "Error: " + error.data.message;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
        };

		var _changeUserPassword = function (user) {
		    var message = "";
		    var deferred = $q.defer();
		    var resource = $resource("/usm-administration/rest/profile/userPassword",{},{userUpdatePassword:{method:'PUT'}});

		    resource.userUpdatePassword(user).$promise.then(
		        function (data) {
		            $log.log(data);
		            deferred.resolve({
		            	changePassword: data
		            });
		        },
		        function (error) {
		            $log.log(error);
		            message = "Error: " + error.data.message;
		            deferred.reject(message);
		        }
		    );
		    return deferred.promise;
		};


		var _getLdapUser = function (userName) {
		    var message = "";
		    var deferred = $q.defer();
		    var resource = $resource('/usm-administration/rest/ldap/:userName', {'userName': userName});
		    resource.get().$promise.then(
		        function (data) {
		            deferred.resolve({
		            	ldapUser: data
		            });
		        },
		        function (error) {
		            message = error;
		            deferred.reject(message);
		        }
		    );
		    return deferred.promise;
		};

    var _createNewObject = function (user) {

        user.organisation={};
        if (user.organisationComplex.parentOrgName.indexOf('/') !== -1){
            user.organisation.parent=user.organisationComplex.parentOrgName.split('/')[0].trim();
            user.organisation.name = user.organisationComplex.parentOrgName.split('/')[1].trim();
        }else{
            user.organisation.name = user.organisationComplex.parentOrgName;
        }

        if (!_.isEmpty(user.organisation.parent)){
            user.organisation_parent=user.organisation.parent.concat(' / ').concat(user.organisation.name);
        }else{
            user.organisation_parent=user.organisation.name;
        }

        user.organisation.nation = user.organisationComplex.nation;

        var createdObject={
            "userName": user.userName,
            "person": user.person,
            "organisation_parent": user.organisation_parent,
            "lockoutTo": angular.isDefined(user.lockoutTo) ? moment.utc(user.lockoutTo).format('YYYY-MM-DD') : null,
            "lockoutReason": user.lockoutReason,
            "notes": user.notes,
            "activeFrom": angular.isDefined(user.activeFrom) ? moment.utc(user.activeFrom).format('YYYY-MM-DD') : null,
            "activeTo": angular.isDefined(user.activeTo) ? moment.utc(user.activeTo).format('YYYY-MM-DD') : null,
            "status": user.status,
            "organisation":user.organisation
        };

        return createdObject;
    };

	    return {
	    	saveUser: _saveUser,
	    	updateUser: _updateUser,
	    	getLdapUser: _getLdapUser,
	    	changePassword: _changePassword,
	    	changeUserPassword: _changeUserPassword,
            createNewObject:_createNewObject
	    };

}]);
