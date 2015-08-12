angular.module('unionvmsWeb')
    .factory('exchangeRestFactory', function($resource, $q, restConstants){
        var baseUrl = restConstants.baseUrl;
        return {
            getExchangeMessages : function(){
                return $resource(baseUrl + '/exchange/rest/messages/list',{},
                {
                    list : { method : 'POST'}
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
            exchangeRestFactory.getExchangeMessages().list(getListRequest.DTOForExchangeMessageList(),
            
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
                //deferred.reject(error);
                
                //dummydata  until backend delivers data.
                var exchangeMessages = []; 
                 for (var i = 10; i > 0; i--){
                    var ex = new Exchange();
                    
                    ex.dateForward = ex.getFormattedDateForward();
                    ex.dateRecieved = ex.getFormattedDateRecieved();
                    ex.forwardRule = "RR";
                    ex.id = i;
                    ex.message = [
                        pickOne(["sd", "kz", "ab", "ww"]),
                        pickOne(["ss", "aa", "cl", "xa"]),
                        pickOne([12, 144, 24, 8]),
                        pickOne(["bipbap", "zipzap", "mipmap"])
                    ].join("//");
                    ex.outgoing = randomOutgoing();
                    ex.recipient = "Somebody";
                    ex.sentBy = "Somebodys mum";        
                    ex.status = randomStatus();

                    exchangeMessages.push(ex);
                 }
                var currentPage = 1;
                var totalNumberOfPages = 1;
                var exchangeListPage = new ExchangeListPage(exchangeMessages, currentPage, totalNumberOfPages);
                deferred.resolve(exchangeListPage);
            }
        );
        return deferred.promise;
    };

    function pickOne(array) {
        return array[rand(array.length)];
    }

    function rand(mod) {
        return Math.floor(Math.random() * mod);
    }

    //DUMMYDATA USES THIS DELETE WHEN BACKEND DELIVERS DATA
    function randomStatus() {
        var text = ["SUCCESSFUL", "PENDING", "ERROR"];
        var number = Math.floor(Math.random() * 3);
        return text[number];
    }

    //DUMMYDATA USES THIS DELETE WHEN BACKEND DELIVERS DATA
    function randomOutgoing() {
        var ran = [true,false];
        return ran[Math.floor(Math.random() * 2)];
    }

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