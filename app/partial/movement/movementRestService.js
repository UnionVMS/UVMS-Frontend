angular.module('unionvmsWeb')
.factory('movementRestFactory', function($resource){

    return {
        getMovementList : function(){
            return $resource('/movement/rest/movement/list',{},
            { 
                list : { method : 'POST'}
            });
        },
        getMovement: function() {
            return $resource('/movement/rest/movement/:id');
        },
        savedSearch : function() {
            return $resource('/movement/rest/search/group/:groupId', {}, {
                update: {method: 'PUT'}
            });
        },
        getSavedSearches : function() {
            return $resource('/movement/rest/search/groups');
        },
        getConfigForMovements : function(){
            return $resource('/movement/rest/config');  
        }
    };
})
.factory('movementRestService',function($q, movementRestFactory, MovementListPage, Movement, SavedSearchGroup, GetListRequest){
    var userName = "FRONTEND_USER";

    var getMovementList = function(getListRequest){

        var deferred = $q.defer();
        movementRestFactory.getMovementList().list(getListRequest.DTOForMovement(),
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var movements = [];
                
                if(angular.isArray(response.data.movement)){
                    for (var i = 0; i < response.data.movement.length; i++){
                        movements.push(Movement.fromJson(response.data.movement[i]));
                    }
                }
                var currentPage = response.data.currentPage;
                var totalNumberOfPages = response.data.totalNumberOfPages;
                var movementListPage = new MovementListPage(movements, currentPage, totalNumberOfPages);
                deferred.resolve(movementListPage);
            },
            function(error){
                console.log("Error getting movements.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var getMovement = function(movementId) {
        var deferred = $q.defer();
        movementRestFactory.getMovement().get({id: movementId}, function(response) {
            if (response.code !== "200") {
                console.log("Invalid response code");

                var m = Movement.fromJson({
                    id: movementId,
                    connectId: "12345",
                    positionTime: "2015-08-01 01:01:01",
                    messageType: "1",
                    source: "A",
                    measuredSpeed: 12,
                    course: 180,
                    status: "OK",
                    position: {
                        latitude: 58.34123,
                        longitude: 11.443,
                        calculatedSpeed: 12
                    }
                });

                m.vessel = {
                    name: "Name",
                    ircs: "aep",
                    state: "SWE",
                    externalMarking: "a"
                };

                deferred.resolve(m);

                return;
            }

            deferred.resolve(Movement.fromJson(response.data));
        },
        function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var getLastMovement = function(vesselGuid) {
        var query = new GetListRequest(1, 1, true, [{"key": "CONNECT_ID", "value": vesselGuid}]);
        var deferred = $q.defer();
        movementRestFactory.getMovementList().list(query.DTOForMovement(), function(response) {
            if (response.code !== "200") {
                deferred.reject("Invalid response status");
                return;
            }

            var movements = response.data.movement;
            var movement = (movements && movements.length > 0) ? Movement.fromJson(movements[0]) : undefined;
            deferred.resolve(movement);
        }, function() {
            deferred.reject();
        });

        return deferred.promise;
    };

    var getSavedSearches = function (){
        var deferred = $q.defer();
        movementRestFactory.getSavedSearches().get({user: 'FRONTEND_USER'}, 
            function(response) {

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var groups = [];
                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i ++) {
                        groups.push(SavedSearchGroup.fromJson(response.data[i]));
                    }
                }
                deferred.resolve(groups);
            },
            function(err){
                deferred.reject(err);
            }
        );
        return deferred.promise;
    };

    var createNewSavedSearch = function(savedSearchGroup){
        var deferred = $q.defer();
        movementRestFactory.savedSearch().save(savedSearchGroup.toJson(), function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromJson(response.data));
        }, function(error) {
            console.error("Error creating vessel group");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateSavedSearch = function(savedSearchGroup){
        var deferred = $q.defer();
        movementRestFactory.savedSearch().update(savedSearchGroup.toJson(), function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromJson(response.data));
        }, function(error) {
            console.error("Error updating saved movement search");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };     

    var deleteSavedSearch = function(savedSearchGroup){
        var deferred = $q.defer();
        movementRestFactory.savedSearch().delete({ groupId: savedSearchGroup.id }, function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromJson(response.data));
        }, function(error) {
            console.error("Error when trying to delete a saved movement search");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getConfiguration = function(){
    var deferred = $q.defer();
    movementRestFactory.getConfigForMovements().get({},
        function(response){
            if(response.code !== "200"){
                deferred.reject("Not valid movement configuration status.");
                return;
            }
            deferred.resolve(response.data);
        }, function(error){
            console.error("Error geting configuration values for movement.");
            deferred.reject(error);
        });
    return deferred.promise;
    };

    return {
        getMovementList : getMovementList,
        getMovement: getMovement,
        getLastMovement: getLastMovement,
        getSavedSearches : getSavedSearches,
        createNewSavedSearch : createNewSavedSearch,
        updateSavedSearch : updateSavedSearch,
        deleteSavedSearch : deleteSavedSearch,
        getConfig : getConfiguration
    };

});