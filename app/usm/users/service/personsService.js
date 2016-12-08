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
var personsService = angular.module('personsService', []);

personsService.factory('personsService', ['$resource', '$q', '$log', function ($resource, $q, $log) {

    var _getPersons = function () {
      var message = "";
      var deferred = $q.defer();
      var resource = $resource('/usm-administration/rest/persons/names');
      resource.get().$promise.then(
              function (data) {
                deferred.resolve({
                  persons: data.results
                });
              },
              function (error) {
                message = 'Error: ' + error.data.message;
                deferred.reject(message);
              }
      );
      return deferred.promise;
    };

    var _getPersonDetail = function (personId) {
      var message = "";
      var deferred = $q.defer();
      var resource = $resource('/usm-administration/rest/persons/:personId', {'personId': personId});

      resource.get().$promise.then(
              function (data) {
                deferred.resolve({
                  personDetails: data
                });
              },
              function (error) {
                message = "Error: " + error.data.message;
                deferred.reject(message);
              }
      );
      return deferred.promise;
    };

    var _getContactDetails = function (userName) {
      var message = "";
      var deferred = $q.defer();
      var resource = $resource('/usm-administration/rest/persons/contactDetails/:userName', {'userName': userName});

      resource.get().$promise.then(
              function (data) {
                deferred.resolve(data);
              },
              function (error) {
                message = "Error: " + error.data.message;
                deferred.reject(message);
              }
      );
      return deferred.promise;
    };

    var _updateContactDetails = function (contactDetails) {
      var message = "";
      var deferred = $q.defer();
      var resource = $resource("/usm-administration/rest/persons/contactDetails",
              {},
              {updateContactDetails: {method: 'PUT'}});

      resource.updateContactDetails(contactDetails).$promise.then(
              function (data) {
                $log.log(data);
                deferred.resolve(data);
              },
              function (error) {
                $log.log(error);
                message = "Error: " + error.data.message;
                deferred.reject(message);
              }
      );
      return deferred.promise;
    };



    return {
      getPersons: _getPersons,
      getPersonDetail: _getPersonDetail,
      getContactDetails: _getContactDetails,
      updateContactDetails: _updateContactDetails
    };

  }]);