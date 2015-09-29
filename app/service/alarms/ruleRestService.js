
angular.module('unionvmsWeb')
    .factory('ruleRestFactory',function($resource) {

        return {
            rule : function(){
                return $resource('/rules/rest/customrules/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            getRules : function(){
                return $resource('/rules/rest/customrules/list');
            }
        };
    })
.factory('ruleRestService', function($q, $log, ruleRestFactory, Rule, SearchResultListPage){

    var getRulesList = function(){
        var deferred = $q.defer();

        //Get list of all rules
        ruleRestFactory.getRules().get({}, function(response){
                if(parseInt(response.code) !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var rules = [],
                    searchResultListPage;

                if(angular.isArray(response.data)) {
                    for (var i = 0; i < response.data.length; i++) {
                        rules.push(Rule.fromDTO(response.data[i]));
                    }
                }
                var currentPage = 0,
                    totalNumberOfPages = 0;

                if(rules.length > 0){
                    currentPage = totalNumberOfPages = 1;
                }

                searchResultListPage = new SearchResultListPage(rules, currentPage, totalNumberOfPages);

                deferred.resolve(searchResultListPage);
            },
            function(error) {
                $log.error("Error getting list of rules");
                $log.error(error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var createNewRule = function(rule){
        var deferred = $q.defer();
        ruleRestFactory.rule().save(rule.DTO(), function(response) {
            if(parseInt(response.code) !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Rule.fromDTO(response.data));
        }, function(error) {
            $log.error("Error creating rule");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateRule = function(rule){
        $log.debug("About to update rule:");
        $log.debug(rule);
        var deferred = $q.defer();
        ruleRestFactory.rule().update(rule.DTO(), function(response) {
            if(parseInt(response.code) !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(Rule.fromDTO(response.data));
        }, function(error) {
            $log.error("Error updating rule");
            $log.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };


    var deleteRule = function(rule) {
        $log.debug("About to delete rule:");
        $log.debug(rule);
        var deferred = $q.defer();
        ruleRestFactory.rule().delete({id: rule.id}, function(response) {
            if (response.code !== 200) {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(Rule.fromDTO(response.data));
        },
        function(error) {
            $log.error("Error when trying to delete a rule");
            $log.error(error);
            deferred.reject(error);
        });

        return deferred.promise;
    };

    return {
        getRulesList: getRulesList,
        updateRule: updateRule,
        createNewRule: createNewRule,
        deleteRule: deleteRule
    };
});
