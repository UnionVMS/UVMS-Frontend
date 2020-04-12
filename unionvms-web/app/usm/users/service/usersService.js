/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
var usersService = angular.module('usersService', []);

usersService.factory('UsersListService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    var _getUsers = function (criteria) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('usm-administration/rest/users');
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
        var resource = $resource('usm-administration/rest/users/names');
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

		var resource = $resource('usm-administration/rest/users/:toUserName/userPreferences', usr, {_copyUserPrefs: {method: 'PUT'}});
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
		var resource = $resource('usm-administration/rest/users/:userName', {'userName': userName});

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

usersService.factory('userChallengesService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    var _setChallenges = function (userName, challengeInformationResponse) {
        var message = "";
        var usr = {};
        usr.userName = userName; //$q.activeUser.userName;
        var deferred = $q.defer();

        var resource = $resource('usm-administration/rest/users/:userName/challenges', usr, {_setChallenges: {method: 'PUT'}});
        resource._setChallenges(challengeInformationResponse).$promise.then(
            function (data) {
                deferred.resolve({
                    challengeInformationResponse: data.results
                });
            },
            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    var _getChallenges = function (userName) {
        var message = "";
        var deferred = $q.defer();
        var resource = $resource('usm-administration/rest/users/:userName/challenges', {'userName': userName});

        resource.get().$promise.then(
            function (data) {

                deferred.resolve({
                    challengeInformationResponse: data.results
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
        setChallenges: _setChallenges,
        getChallenges: _getChallenges
    };
}]);

usersService.factory('resetPasswordServices', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    var _resetPassword = function (userName) {
        var message = "";
        var deferred = $q.defer();

         var resource = $resource('usm-administration/rest/users/resetUserPassword',{},{
              get:{method: 'GET',headers: { 'userName': userName }} });

        resource.get().$promise.then(
            function (data) {
        		deferred.resolve({
                    challengeInformationResponse: data.results
        					});
            },
        	function (error) {
        		message = error.data.message;
        		deferred.reject(message);
            }
        );
        	return deferred.promise;
    };


    var _resetPasswordSecurityAnswers = function (userName, challengeInformationResponse) {
        var message = "";
        var usr = {};
        usr.userName = userName; //$q.activeUser.userName;
        var deferred = $q.defer();
        var isTemporaryPassword = false;

        var resource = $resource('usm-administration/rest/users/resetUserPassword',{}, {
          //  put:{ _setSecurityAnswers: {method: 'PUT', headers: { 'userName': userName }}} });
            update:{method: 'PUT', headers: { 'userName': userName, 'isTemporaryPassword' : isTemporaryPassword } , body: { 'challengeInformationResponse': challengeInformationResponse }  } });

        resource.update(userName , challengeInformationResponse).$promise.then(
            function (data) {
                deferred.resolve({
                    challengeInformationResponse: data
                });
            },

            function (error) {
                message = error.data.message;
                deferred.reject(message);
            }
        );

        return deferred.promise;
    };

    return {
    	resetPassword: _resetPassword,
        resetPasswordSecurityAnswers: _resetPasswordSecurityAnswers
    };
}]);