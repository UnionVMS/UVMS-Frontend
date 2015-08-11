angular.module('unionvmsWeb')
    .factory('exchangeRestFactory', function($resource, $q, restConstants){
        var baseUrl = restConstants.baseUrl;
        return {
            getExchangeMessages : function(){
                return $resource(baseUrl + '/exchange/rest/messages/list',{},
                {
                    list : { method : 'GET'}
                });
            },
            resendExchangeMessage : function(){
                return $resource(baseUrl + '/exchange/rest/message/resend',{},
                {
                    list : { method : 'POST'}
                });
            }
        };
    })
    .factory('exchangeRestService', function($q, exchangeRestFactory, GetListRequest, Exchange, ExchangeListPage){
        var baseUrl, userName;
        userName = "FRONTEND_USER";

        var getExchangeMessages = function(getListRequest){

            var deferred = $q.defer();
            exchangeRestFactory.getExchangeMessages().get(getListRequest.DTOForExchangeMessageList(),
            
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
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
                var exchangeListPage = new ExchangeListPage(exchangeMessages, currentPage, totalNumberOfPages);
                deferred.resolve(exchangeListPage);
            },
            
            function(error){
                console.log("Error getting exchange messages.", error);
                deferred.reject(error);
            }
        );
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
                var exchangeListPage = new ExchangeListPage(exchangeMessages, currentPage, totalNumberOfPages);
                defer.resolve(exchangeListPage);

            },
            function(error){
                console.error("Error forwarding message", error);
                defer.reject(error);
            }
        );
        return defer.promise;
    };

    return {
        getExchangeMessages : getExchangeMessages,
        resendExchangeMessage : resendExchangeMessage
    };
});