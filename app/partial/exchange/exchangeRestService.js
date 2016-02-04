angular.module('unionvmsWeb')
    .factory('exchangeRestFactory', function($resource){
        return {
            getTransmissionStatuses : function(){
                return $resource('/exchange/rest/plugin/list');
            },
            stopTransmission : function(){
                 return $resource('/exchange/rest/plugin/stop/:serviceClassName',{},
                {
                    stop : { method: 'PUT'}
                });
            },
            startTransmission : function(){
                 return $resource('/exchange/rest/plugin/start/:serviceClassName',{},
                {
                    start : { method: 'PUT'}
                });
            },
            getExchangeMessages : function(){
                return $resource( '/exchange/rest/exchange/list',{},
                {
                    list : { method : 'POST'}
                });
            },
            getExchangeMessage: function() {
                return $resource('/exchange/rest/exchange/:guid');
            },
            getPollMessages : function(){
                return $resource( '/exchange/rest/exchange/poll',{},
                {
                    list : { method : 'POST'}
                });
            },
            getPollMessage : function(){
                return $resource( '/exchange/rest/exchange/poll/:typeRefGuid');
            },
            sendQueuedMessages : function(){
                return $resource('/exchange/rest/sendingqueue/send', {},
                {
                    put: {method: 'PUT'}
                });
            },
            getSendingQueue : function(){
                return $resource( '/exchange/rest/sendingqueue/list');
            },
            getExchangeConfig : function(){
                return $resource('/exchange/rest/config');
            }
        };
    })
    .factory('exchangeRestService', function($q, exchangeRestFactory, Exchange, ExchangePoll, ExchangeService, ExchangeSendingQueue, SearchResultListPage){


        var sendQueue = function(messages){
            var def = $q.defer();
            exchangeRestFactory.sendQueuedMessages().put(messages, function(response){
                if(response.code !== 200){
                    def.reject("Invalid response status");
                    return;
                }
                def.resolve();
                //do something...??
            },
            function(error){
                console.log("Error sending queued messages.");
                def.reject(error);
            });
            return def.promise;
        };

        var getSendingQueue = function(){
            var def = $q.defer();
            exchangeRestFactory.getSendingQueue().get({},
                function(response){
                    if (response.code !== 200) {
                        def.reject("Invalid response status");
                        return;
                    }
                    var queue = [];

                    if (angular.isArray(response.data)){
                        for(var i = 0; i < response.data.length; i++){
                            queue.push(ExchangeSendingQueue.fromJson(response.data[i]));
                        }
                    }
                    def.resolve(queue);
                },
                function(error){
                    console.log("Error gettint sendingqueue", error);
                    def.reject(error);
                }
                );
            return def.promise;
        };

        var stopTransmission = function(serviceClassName){
            var deferred = $q.defer();

            exchangeRestFactory.stopTransmission().stop({serviceClassName: serviceClassName},{},
                function(response){
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve();
                },
                function(error){
                    console.log("Error stoping plugin: " + serviceClassName, error);
                    deferred.reject(error);
                }
            );
             return deferred.promise;
        };

         var startTransmission = function(serviceClassName){
            var deferred = $q.defer();

            exchangeRestFactory.startTransmission().start({serviceClassName: serviceClassName}, {},
                function(response){
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    deferred.resolve();
                },
                function(error){
                    console.log("Error starting plugin: " + serviceClassName, error);
                    deferred.reject(error);
                }
            );
             return deferred.promise;
        };


        var getTransmissionStatuses = function(){
            var deferred = $q.defer();
            exchangeRestFactory.getTransmissionStatuses().get({},
                function(response) {
                    if(response.code !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }

                    var services = [];

                    if(angular.isArray(response.data)){
                        for (var i = 0; i < response.data.length; i++){
                            services.push(ExchangeService.fromJson(response.data[i]));
                        }
                    }
                    deferred.resolve(services);
                },
                function(error){
                    console.log("Error getting exchange services.", error);
                    deferred.reject(error);
                }
            );
            return deferred.promise;
        };

        var getMessages = function(getListRequest){
             var deferred = $q.defer();
             exchangeRestFactory.getExchangeMessages().list(getListRequest.DTOForExchangeMessageList(),
             function(response){
                  if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var exchangeMessages = [];

                if(angular.isArray(response.data.logList)){
                    for (var i = 0; i < response.data.logList.length; i++){
                        exchangeMessages.push(Exchange.fromJson(response.data.logList[i]));
                    }
                }

                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var searchResultListPage = new SearchResultListPage(exchangeMessages, currentPage, totalNumberOfPages);

                deferred.resolve(searchResultListPage);
             },
             function(error){
                console.log("Error getting exchange messages.", error);
                deferred.reject(error);
            }
            );
            return deferred.promise;
        };

        var getPollMessage = function(typeRefGuid){
            var deferred = $q.defer();
            exchangeRestFactory.getPollMessage().get({typeRefGuid : typeRefGuid},
            function(response){
                if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var pollMessage = ExchangePoll.fromDTO(response.data);
                deferred.resolve(pollMessage);

            },
            function(error){
                console.log("Error getting exchange poll message.", error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

        var getPollMessages = function(getListRequest){
            var deferred = $q.defer();
            exchangeRestFactory.getPollMessages().list(getListRequest.DTOForExchangePollList(),
            function(response){
                if(response.code !== 200){
                    deferred.reject("Invalid response status");
                    return;
                }

                var pollMessages = [];

                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i++){
                        pollMessages.push(ExchangePoll.fromDTO(response.data[i]));
                    }
                }

                var searchResultListPage = new SearchResultListPage(pollMessages, 1, 1);

                deferred.resolve(searchResultListPage);

            },
            function(error){
                console.log("Error getting exchange poll messages.", error);
                deferred.reject(error);
            });
            return deferred.promise;
        };

    var resendExchangeMessage = function(exchangeMessage){
        var defer = $q.defer();
        exchangeRestFactory.resendExchangeMessage.list(exchangeMessage,
            function(response){
                if(response.code !== "200"){
                    defer.reject("Invalid response status");
                    return;
                }
                var exchangeMessages = [];

                if(angular.isArray(response.data.exchange)){
                    for (var i = 0; i < response.data.exchange.length; i++){
                        exchangeMessages.push(Exchange.fromJson(response.data.exchange[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var searchResultListPage = new SearchResultListPage(exchangeMessages, currentPage, totalNumberOfPages);
                defer.resolve(searchResultListPage);

            },
            function(error){
                console.error("Error forwarding message", error);
                defer.reject(error);
            }
        );
        return defer.promise;
    };

    var getExchangeMessage = function(guid) {
        var deferred = $q.defer();
        exchangeRestFactory.getExchangeMessage().get({guid: guid}, function(response) {
            if (String(response.code) !== "200") {
                deferred.reject("Invalid response");
            }

            deferred.resolve(Exchange.fromJson(response.data));
        }, function(error) {
            deferred.reject("Failed to get Exchange message");
        });

        return deferred.promise;
    };

    var getExchangeConfig = function(){
        var deferred = $q.defer();
        exchangeRestFactory.getExchangeConfig().get(
            function(response){
                if (response.code !== 200) {
                    deferred.reject("Invalid response");
                }
                deferred.resolve(response.data);
            },
            function(error) {
                deferred.reject("Failed to get Exchange config");
            }
        );
        return deferred.promise;
    };


    return {
        getTransmissionStatuses : getTransmissionStatuses,
        stopTransmission : stopTransmission,
        startTransmission : startTransmission,
        getMessages : getMessages,
        getPollMessage : getPollMessage,
        getPollMessages : getPollMessages,
        sendQueue: sendQueue,
        getSendingQueue : getSendingQueue,
        getExchangeMessage: getExchangeMessage,
        getExchangeConfig: getExchangeConfig
    };
});