
angular.module('unionvmsWeb')
    .factory('ruleRestFactory',function($resource) {

        return {
            rule : function(){
                return $resource('/rules/rest/customrules/:id', {}, {
                    update: {method: 'PUT'}
                });
            },
            getAllRules : function(){
                return $resource('/rules/rest/customrules/listAll');
            },
            getRulesByQuery : function(){
                return $resource('/rules/rest/customrules/listByQuery',{},{
                    list : { method: 'POST'}
                });
            },
            getConfig : function(){
                return $resource('/rules/rest/config');
            },
        };
    })
.factory('ruleRestService', function($q, $log, ruleRestFactory, Rule, SearchResultListPage, userService){

    var getConfigFromResource = function(configResource){
        var deferred = $q.defer();
        configResource.get({}, function(response) {
            if(response.code !== 200){
                deferred.reject("Invalid response status");
                return;
            }
            //Return config data
            deferred.resolve(response.data);
        }, function(error) {
            $log.error("Error getting config for rules", error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getConfig = function(){
        return getConfigFromResource(ruleRestFactory.getConfig());
    };


    var getAllRules = function(){
        var deferred = $q.defer();

        //Get list of all rules
        ruleRestFactory.getAllRules().get({}, function(response){
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
                $log.error("Error getting list of rules", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var getRulesByQuery = function(getListRequest){
        var deferred = $q.defer();
        ruleRestFactory.getRulesByQuery().list(getListRequest.DTOForRules(), function(response){
                if(parseInt(response.code) !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }
                var rules = [],
                    searchResultListPage;

                if(angular.isArray(response.data.customRules)) {
                    for (var i = 0; i < response.data.customRules.length; i++) {
                        rules.push(Rule.fromDTO(response.data.customRules[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                searchResultListPage = new SearchResultListPage(rules, currentPage, totalNumberOfPages);
                deferred.resolve(searchResultListPage);
            },
            function(error) {
                $log.error("Error getting list of rules by query", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var createNewRule = function(rule){
        var deferred = $q.defer();
        //Set setUpdatedBy to the current user
        rule.setUpdatedBy(userService.getUserName());
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
        //Set setUpdatedBy to the current user
        rule.setUpdatedBy(userService.getUserName());
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
        ruleRestFactory.rule().delete({guid: rule.guid}, function(response) {
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
        getConfig: getConfig,
        getAllRules: getAllRules,
        getRulesByQuery: getRulesByQuery,
        updateRule: updateRule,
        createNewRule: createNewRule,
        deleteRule: deleteRule
    };
});