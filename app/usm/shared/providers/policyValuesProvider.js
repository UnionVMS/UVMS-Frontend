var sharedModule = angular.module('shared');

function policyMethods (name, subject, $http) {
    this.getAllPolicyValues = function() {
        return $http.get("/usm-administration/rest/policies").then(
            function(response) {
                return response.data;
            }
        );
    };

    this.getPolicyValue = function() {
        return $http.get("/usm-administration/rest/policies", {params: {name:name, subject:subject}}).then(
            function(response) {
                return response.data;
            }
        );
    };
}

sharedModule.provider("policyValues", function PolicyValuesProvider() {

    var policyName, policySubject = "";

    this.setPolicyName = function(name){
        policyName = name;
    };

    this.setPolicySubject = function(subject){
        policySubject = subject;
    };


    this.$get = ['$http', function policyFactory($http) {
        return new policyMethods(policyName, policySubject, $http);
    }];

});
