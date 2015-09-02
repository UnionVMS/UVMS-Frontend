
angular.module('unionvmsWeb')
    .factory('ruleRestFactory',function($resource) {

        return {
            rule : function(){
                return $resource('/rules/rest/rules/:id', {}, {
                    update: {method: 'PUT'}
                });
            }
        };
    })
.factory('ruleRestService', function($q, ruleRestFactory, Rule){

    var userName = "FRONTEND_USER";

    var createNewRule = function(rule){
        var deferred = $q.defer();
        ruleRestFactory.rule().save(rule.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Rule.fromJson(response.data));
        }, function(error) {
            console.error("Error creating rule");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateRule = function(rule){
        console.log("About to update rule:");
        console.log(rule);
        var deferred = $q.defer();
        ruleRestFactory.rule().update(rule.DTO(), function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Rule.fromJson(response.data));
        }, function(error) {
            console.error("Error updating rule");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };


    var deleteRule = function(rule) {
        console.log("About to delete rule:");
        console.log(rule);        
        var deferred = $q.defer();
        ruleRestFactory.rule().delete({id: rule.id}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(Rule.fromJson(response.data));
        },
        function(error) {
            console.error("Error when trying to delete a rule");
            console.error(error);
            deferred.reject(error);
        });
 
        return deferred.promise;
    };    

    return {
        updateRule: updateRule,
        createNewRule: createNewRule,
        deleteRule: deleteRule
    };
});
