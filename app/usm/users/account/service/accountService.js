/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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
            "lockoutTo": user.lockoutTo ? moment.utc(user.lockoutTo).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            "lockoutReason": user.lockoutReason,
            "notes": user.notes,
            "activeFrom": user.activeFrom ? moment.utc(user.activeFrom).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
            "activeTo": user.activeTo ? moment.utc(user.activeTo).format("YYYY-MM-DDTHH:mm:ss.SSSZ") : null,
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