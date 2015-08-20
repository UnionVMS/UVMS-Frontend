var sharedServices = angular.module('sharedServices', ['ngResource']);

sharedServices.config(['$httpProvider',function($httpProvider) {

}]);

sharedServices.factory('authorisation', ['$resource', 
  function ($resource) {

}]);

sharedServices.factory('authenticateUser',['$http', '$q','$resource', '$log',
    function($http, $q, $resource, $log) {
    return {
        authenticate : function(loginInfo) {

            var message = "";
            var deferred = $q.defer();
            var resource = $resource('/usm-administration/rest/authenticate');
            resource.save({},loginInfo).$promise.then(
                function(data){
                    //$log.log(data);
                    if (data.authenticated) {
                        deferred.resolve({
                            authenticated: data.authenticated,
                            status: data.statusCode,
                            token: data.jwtoken
                        });
                    } else {
                        if(data.statusCode === 49) {
                            message = "Error: Invalid crendentials";
                        } else if(data.statusCode === 530) {
                            message = "Error: Invalid time";
                        } else if(data.statusCode === 533) {
                            message = "Error: Account disabled";
                        } else if(data.statusCode === 701) {
                            message = "Error: Password expired";
                        } else if(data.statusCode === 775) {
                            message = "Error: Account locked";
                        } else if(data.statusCode === 773) {
                            message = "Error: Password must be changed";
                        } else if(data.statusCode === 1) {
                            message = "Error: Internal error";
                        } else if(data.statusCode === 80) {
                            message = "Error: Other";
                        } else {
                            message = "Error: User \'" + loginInfo.username + "\' cannot be authenticated.";
                        }
                        deferred.reject(message);
                    }
                },
                function(error) {
                    //$log.log(angular.fromJson(loginInfo));
                    $log.log(error);
                    message = "Error: "+ error.statusText +" Status: " + error.status;
                    deferred.reject(message);
                }
            );
            return deferred.promise;
            /*
            resource.get(loginInfo, function(data, responseHeaders){
                if (data.authenticated) {
                    deferred.resolve({
                        authenticated: data.authenticated,
                        status: data.statusCode
                    })
                } else {
                    deferred.reject(data);
                }
            }, function(httpResponse) {
                $log.log("Service: Error");
                deferred.reject(httpResponse);
            });
*/
            /*
             var req = {
             dataType: 'json',
             method: 'POST',
             url: 'http://localhost:8080/usm-authent/rest/authentication/user/authenticate',
             headers: reqHeaders,
             data: loginInfo
             };
             $http(req).success(
             function(){
             $log.log("SUCCESS");
             }).error(function(){
             $log.log("ERROR");

             });

             $http.post('http://localhost:8080/usm-authent/rest/authentication/user/authenticate', loginInfo).
             success(function(data, status, headers, config) {
             // this callback will be called asynchronously
             // when the response is available
             }).
             error(function(data, status, headers, config) {
             $log.log("ERROR");
             });
             */

        }
    };

}]);

