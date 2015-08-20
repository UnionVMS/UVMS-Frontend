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