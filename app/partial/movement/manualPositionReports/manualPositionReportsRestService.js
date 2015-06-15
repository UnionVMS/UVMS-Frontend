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
        manualMovement: function() {
            return $resource(baseUrl + '/movement/rest/tempmovement');
        },
        deleteManualPositionReport : function(){
            return $resource(baseUrl +'/movement/rest/tempmovement/remove/:guid', {}, {
                removePut: { method: 'PUT' }
            });
        },
    };
})
.factory('manualPositionRestService',function($q, manualPositionRestFactory, ManualPositionListPage, ManualPosition){
    var baseUrl, userName;
    userName = "FRONTEND_USER";

    var createManualMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.manualMovement().save(movement.getDto(), function(response) {
            if(response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

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
                for (var i = 0; i < 40 ; i++) {
                    var _mp = new ManualPosition(); 
                    _mp.position.longitude = 23 + i;
                    _mp.position.latitude = 45 + i;
                    _mp.speed = 23 + i;
                    _mp.course = Math.floor(3 * 10 * i / Math.floor((Math.random() * 3) + 10));
                    _mp.id = 1 + i;
                    _mp.guid = "12345-qwert-12345-qwert-12345";
                    _mp.time = moment().format("YYYY-MM-DD HH:mm Z");
                    _mp.archived = false;
                    _mp.status = "";
                    _mp.updatedTime = "";

                    _mp.carrier.extMarking = "VC_11" + i;
                    _mp.carrier.cfr = "1334" + i;
                    _mp.carrier.name = "Velo " + i;
                    _mp.carrier.ircs = "65" + Math.floor((Math.random() * 3) + 1) + i;
                    _mp.carrier.flagState = "SWE";

                    positions.push(_mp);
    
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
        manualPositionRestFactory.deleteManualPositionReport().removePut({guid: manualPositionReport.guid}, {}, function(response) {
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
        createManualMovement: createManualMovement,
        getManualPositionList : getManualPositionList,
        deleteManualPositionReport : deleteManualPositionReport       
     };

});