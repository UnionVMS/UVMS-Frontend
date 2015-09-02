angular.module('unionvmsWeb')
.factory('manualPositionRestFactory', function($resource){

    return {
        getMovementList : function(){
            return $resource('/movement/rest/movement/list',{},
            {
                list : { method : 'POST'}
            });
        },
        manualMovement: function() {
            return $resource('/movement/rest/tempmovement', {}, {
                update: { method: 'PUT' }
            });
        },
        manualMovements: function() {
            return $resource('/movement/rest/tempmovement/list', {}, {
                list: { method: 'POST' }
            });
        },
        deleteManualPositionReport : function(){
            return $resource('/movement/rest/tempmovement/remove/:guid', {}, {
                removePut: { method: 'PUT' }
            });
        },
        sendMovement: function() {
            return $resource( '/movement/rest/tempmovement/send/:guid', {}, {
                send: { method: 'PUT' }
            });
        }
    };
})
.factory('manualPositionRestService',function($q, manualPositionRestFactory, ManualPositionListPage, ManualPosition){
    var userName = "FRONTEND_USER";

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

    var updateManualMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.manualMovement().update(movement.getDto(), function(response) {
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
        getListRequest.listSize = 1000;
        manualPositionRestFactory.manualMovements().list(getListRequest.DTOForManualPosition(),
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var positions = [];
                
                if(angular.isArray(response.data.movement)){
                    for (var i = 0; i < response.data.movement.length; i++){
                        positions.push(ManualPosition.fromJson(response.data.movement[i]));
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

    var sendMovement = function(movement) {
        var deferred = $q.defer();
        manualPositionRestFactory.sendMovement().send({guid: movement.guid}, movement, function(response) {
            if (response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        },
        function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var saveAndSendMovement = function(movement) {
        // Update or create movement
        var createUpdatePromise;
        if (movement.guid) {
            createUpdatePromise = updateManualMovement(movement);
        }
        else {
            createUpdatePromise = createManualMovement(movement);
        }

        // Send the saved movement
        var deferred = $q.defer();
        createUpdatePromise.then(function(savedMovement) {
            sendMovement(savedMovement).then(function(sentMovement) {
                deferred.resolve(sentMovement);
            },
            function(sendError) {
                deferred.reject(sendError);
            });
        },
        function(createUpdateError) {
            deferred.reject(createUpdateError);
        });

        return deferred.promise;
    };

    return {
        createManualMovement: createManualMovement,
        updateManualMovement: updateManualMovement,
        getManualPositionList : getManualPositionList,
        deleteManualPositionReport : deleteManualPositionReport,
        saveAndSendMovement: saveAndSendMovement
     };

});