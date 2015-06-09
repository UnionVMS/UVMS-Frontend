angular.module('unionvmsWeb')
.factory('manualPositionRestFactory', function($resource, $q, restConstants){
    var baseUrl = restConstants.baseUrl;

    return {
        getMovementList : function(){
            return $resource(baseUrl + '/movement/rest/movement/list',{},
            { 
                list : { method : 'POST'}
            });
        }
    };
})
.factory('manualPositionRestService',function($q, manualPositionRestFactory, ManualPositionListPage, ManualPosition){
    var baseUrl, userName;
    userName = "FRONTEND_USER";

    var getManualPositionList = function(getListRequest){

        var deferred = $q.defer();
        manualPositionRestFactory.getMovementList().list(getListRequest.DTOForManualPosition(),
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var positions = [];
                
                if(angular.isArray(response.data.manualposition)){
                    for (var i = 0; i < response.data.manualposition.length; i++){
                        positions.push(ManualPosition.fromJson(response.data.manualposition[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var ManualPositionListPage = new ManualPositionListPage(positions, currentPage, totalNumberOfPages);
                deferred.resolve(ManualPositionListPage);
            },
            function(error){
                console.log("Error getting positions.", error);
                //TODO: Remove this when we can get data from backend.
                
                //******************************
                deferred.reject(error);
            }
        );
        return deferred.promise;
    
    };   
    
    return {
        getManualPositionList : getManualPositionList       
     };

});