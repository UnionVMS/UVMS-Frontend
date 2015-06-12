angular.module('unionvmsWeb')
.factory('manualPositionRestFactory', function($resource, $q, restConstants){
    var baseUrl = restConstants.baseUrl;

    return {
        getMovementList : function(){
            return $resource(baseUrl + '/movement/rest/movement/list',{},
            { 
                list : { method : 'POST'}
            });
        },
        deleteManualPositionReport : function(){
            return $resource(baseUrl +'/movement/rest/movement/delete/:id');
        },        
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
                var manualPositionListPage = new ManualPositionListPage(positions, currentPage, totalNumberOfPages);
                deferred.resolve(manualPositionListPage);
            },
            function(error){
                console.log("Error getting positions.", error);
                //TODO: Remove this when we can get data from backend.
                var positions = [];
                for (var i = 0; i < 50 ; i++) {
    
                    var position = {}, movement = {}, vessel = {};
                    position.id = "1" + i;
                    
                    vessel.externalMarking = "VC_11" + i;
                    vessel.cfr = "1334" + i;
                    vessel.name = "Velo" + i;
                    vessel.ircs = "65" + Math.floor((Math.random() * 3) + 1) + i;

                    movement.time =  moment().format("YYYY-MM-DD HH:mm Z");
                    movement.latitude = 23 + i;
                    movement.longitude = 45 + i;
                    movement.measuredSpeed = 23 + i;
                    movement.course = Math.floor(3 * 10 * i / Math.floor((Math.random() * 3) + 10));

                    position.vessel = vessel;
                    position.movement = movement;

                    positions.push(ManualPosition.fromJson(position));
    
                }

                var currentPage = 1;
                var totalNumberOfPages = 10;
                var manualPositionListPage = new ManualPositionListPage(positions, currentPage, totalNumberOfPages);
                deferred.resolve(manualPositionListPage);
                
                
                //******************************
                //deferred.reject(error);
            }
        );
        return deferred.promise;
    
    };   

    var deleteManualPositionReport = function(manualPositionReport){
        var deferred = $q.defer();
        manualPositionRestFactory.deleteManualPositionReport().delete({id: manualPositionReport.id}, function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            console.error("Error when trying to delete a manual position report");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;  
    };     

    
    return {
        getManualPositionList : getManualPositionList,
        deleteManualPositionReport : deleteManualPositionReport       
     };

});