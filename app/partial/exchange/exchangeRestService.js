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
angular.module('unionvmsWeb')
    .factory('exchangeRestFactory', function($resource){
        return {
            getTransmissionStatuses : function(){
                return $resource('exchange/rest/plugin/list');
            },
            getPluginByCapability : function(){
                return $resource('exchange/rest/plugin/capability/:capability');
            },
            stopTransmission : function(){
                 return $resource('exchange/rest/plugin/stop/:serviceClassName',{},
                {
                    stop : { method: 'PUT'}
                });
            },
            startTransmission : function(){
                 return $resource('exchange/rest/plugin/start/:serviceClassName',{},
                {
                    start : { method: 'PUT'}
                });
            },
            getExchangeMessages : function(){
                return $resource('exchange/rest/exchange/list',{},
                {
                    list : { method : 'POST'}
                });
            },
            getRawExchangeMessage: function(){
                return $resource('exchange/rest/exchange/message/:guid');
            },
            getExchangeMessage: function() {
                return $resource('exchange/rest/exchange/:guid');
            },
            getPollMessages : function(){
                return $resource('exchange/rest/exchange/poll',{},
                {
                    list : { method : 'POST'}
                });
            },
            getPollMessage : function(){
                return $resource('exchange/rest/exchange/poll/:typeRefGuid');
            },
            sendQueuedMessages : function(){
                return $resource('exchange/rest/sendingqueue/send', {},
                {
                    put: {method: 'PUT'}
                });
            },
            getSendingQueue : function(){
                return $resource('exchange/rest/sendingqueue/list');
            },
            getExchangeConfig : function(){
                return $resource('exchange/rest/config');
            },
            getValidationResults: function(){
                return $resource('exchange/rest/exchange/validation/:guid');
            },
            getLogItem: function(){
                return $resource('exchange/rest/exchange/:guid');
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

                    /* response = {
                        "data":[
                            {
                                "recipient":"adas",
                                "pluginList":[
                                    {
                                        "name":"asdas",
                                        "sendingLogList":[
                                            {
                                            "messageId":1,
                                            "dateRecieved":"2017-05-21 10:23",
                                            "senderRecipient":"asdjlh",
                                            "properties":{
                                                "ads":"fds",
                                                "cc":"pec"
                                            }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "recipient":"adas",
                                "pluginList":[
                                    {
                                        "name":"asdas",
                                        "sendingLogList":[
                                            {
                                                "messageId":1,
                                                "dateRecieved":"2017-05-21 10:23",
                                                "senderRecipient":"asdjlh",
                                                "properties":{
                                                    "ads":"fds",
                                                    "cc":"pec"
                                                }
                                            },
                                            {
                                                "messageId":2,
                                                "dateRecieved":"2017-05-21 10:24",
                                                "senderRecipient":"asdjlh",
                                                "properties":{
                                                    "ads":"fds",
                                                    "cc":"pec"
                                                }
                                            },
                                            {
                                                "messageId":3,
                                                "dateRecieved":"2017-05-21 19:23",
                                                "senderRecipient":"asdjlh",
                                                "properties":{
                                                    "ads":"fds",
                                                    "cc":"pec"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "recipient":"adas",
                                "pluginList":[
                                    {
                                        "name":"asdas",
                                        "sendingLogList":[
                                            {
                                            "messageId":1,
                                            "dateRecieved":"2017-05-21 10:23",
                                            "senderRecipient":"asdjlh",
                                            "properties":{
                                                "ads":"fds",
                                                "cc":"pec"
                                            }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "recipient":"FA reports",
                                "pluginList":[
                                    {
                                        "sendingLogList":[
                                            {
                                            "messageId":2,
                                            "dateRecieved":"2017-05-21 10:23",
                                            "recipient":"asdjlh",
                                            "plugin":"FA Flux plugin",
                                            "properties":{
                                                "ads":"fds",
                                                "cc":"pec"
                                            }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        "code":200
                    }; */

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

        var getPluginByCapability = function(capability){
            var deferred = $q.defer();
            exchangeRestFactory.getPluginByCapability().query({capability : capability},
                function(response, header, status) {
                    if(status !== 200){
                        deferred.reject("Invalid response status");
                        return;
                    }
                    var services = [];
                    if(angular.isArray(response)){
                        for (var i = 0; i < response.length; i++){
                            services.push(ExchangeService.fromJson(response[i]));
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

        var getSendReportPlugins = function() {
            return getPluginByCapability('send_report');
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

    var escapeXmlString = function(xml){
        var escaped =  xml.replace(/(\\r\\n|\\n|\\r)/gm,"").replace(/\\"/g, '"');
        return escaped;
    };

    var getRawExchangeMessage = function(guid) {
        var deferred = $q.defer();
        exchangeRestFactory.getRawExchangeMessage().get({guid: guid}, function(response) {
            if (String(response.code) !== "200") {
                deferred.reject("Invalid response");
            }

            response.data = escapeXmlString(response.data);
            deferred.resolve(response.data);
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

    var getValidationResults = function(guid){
        var deferred = $q.defer();
        exchangeRestFactory.getValidationResults().get({guid: guid}, function(response) {
            if (String(response.code) !== "200") {
                deferred.reject("Invalid response");
            }
            if (angular.isUndefined(response.data) || response.data === null){
                deferred.reject("Invalid response");
            } else {
                response.data.msg = escapeXmlString(response.data.msg);
                deferred.resolve(response.data);
            }
        }, function(error) {
            deferred.reject("Failed to get Exchange message");
        });

        return deferred.promise;
    };

    var getLogItem = function(guid){
        var deferred = $q.defer();
        exchangeRestFactory.getLogItem().get({guid: guid},
        function(response){
            if (String(response.code) !== "200") {
                deferred.reject("Invalid response");
            }
            deferred.resolve(Exchange.fromLinkedMsgJson(response.data));
        }, function(error) {
            deferred.reject("Failed to get Exchange message");
        });

        return deferred.promise;
    };


    return {
        getTransmissionStatuses : getTransmissionStatuses,
        getPluginByCapability : getPluginByCapability,
        getSendReportPlugins : getSendReportPlugins,
        stopTransmission : stopTransmission,
        startTransmission : startTransmission,
        getMessages : getMessages,
        getPollMessage : getPollMessage,
        getPollMessages : getPollMessages,
        sendQueue: sendQueue,
        getSendingQueue : getSendingQueue,
        getExchangeMessage: getExchangeMessage,
        getExchangeConfig: getExchangeConfig,
        getRawExchangeMessage: getRawExchangeMessage,
        getValidationResults: getValidationResults,
        getLogItem: getLogItem
    };
});
