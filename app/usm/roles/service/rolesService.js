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
var rolesServiceModule = angular.module('rolesServiceModule', ['ngResource']);

rolesServiceModule.factory('rolesServices', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        getRoles: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        roles: data.results,
                        total: data.total
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getRolesNamesList: function () {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/names');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        roles: data.results
                        //total: data.total
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        searchRoles: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        roles: data.results,
                        total: data.total
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getRoleDetails: function (roleId) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/:roleId', {'roleId': roleId});

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        roleDetails: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        createRole: function (role) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles');
            resource.save(role).$promise.then(
                function (data) {
                    deferred.resolve({
                        newRole: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        updateRole: function (role) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles', {}, {updateRole: {method: 'PUT'}});
            resource.updateRole(role).$promise.then(
                function (data) {
                    deferred.resolve({
                        newRole: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        deleteRole: function (role) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/:roleId', {"roleId": role.roleId});
            resource.delete().$promise.then(
                function (data) {
                    deferred.resolve({
                        newRole: data
                    });
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

rolesServiceModule.factory('permissionServices', ['$resource', '$q', '$log', function ($resource, $q, $log) {
    return {
        searchFeature: function (criteria) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles');

            resource.get(criteria).$promise.then(
                function (data) {
                    deferred.resolve({
                        roles: data.results
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        addPermission: function (permission) {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/:roleId/feature/:featureId',
                {"roleId" : permission.roleId, "featureId" : permission.featureId});
            resource.save().$promise.then(
                function (data) {
                    deferred.resolve({
                        newPermission: data
                    });
                },
                function (error) {
                    message = error.data.message;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        deletePermission: function (permission) {
            var message = "";
            var deferred = $q.defer();
            //$log.log(permission);
            var resource = $resource('/usm-administration/rest/roles/:roleId/feature/:featureId',
                {"roleId": permission.roleId, "featureId": permission.featureId});
            resource.delete().$promise.then(
                function (data) {
                    deferred.resolve({
                        response: {}
                    });
                    $log.log("Feature deleted");
                },
                function (error) {
                    message = error.statusText;
                    deferred.reject(message);
                }
            );

            return deferred.promise;
        },
        getGroups: function () {
            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/roles/features/group/names');

            resource.get().$promise.then(
                function (data) {
                    deferred.resolve({
                        groups: data.results
                    });
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