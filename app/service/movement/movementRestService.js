angular.module('unionvmsWeb')
.factory('movementRestFactory', function($resource){

    return {
        getMovementList : function(){
            return $resource('/movement/rest/movement/list',{},
            {
                list : { method : 'POST'}
            });
        },
        getLatestMovementsByConnectIds : function(){
            return $resource('/movement/rest/movement/latest',{},
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
        },
        getConfigForSourceTypes : function(){
            return $resource('/movement/rest/config/movementSourceTypes');
        },
        areas: function() {
            return $resource('/movement/rest/areas');
        }
    };
})
.factory('movementRestService',function($q, movementRestFactory, SearchResultListPage, Movement, SavedSearchGroup, GetListRequest , userService){

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
                var searchResultListPage = new SearchResultListPage(movements, currentPage, totalNumberOfPages);
                deferred.resolve(searchResultListPage);
            },
            function(error){
                console.log("Error getting movements.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var getLatestMovementsByConnectIds = function(listOfConnectIds){

        var deferred = $q.defer();
        movementRestFactory.getLatestMovementsByConnectIds().list(listOfConnectIds,
            function(response){

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var movements = [];
                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i++){
                        movements.push(Movement.fromJson(response.data[i]));
                    }
                }
                var searchResultListPage = new SearchResultListPage(movements, 1, 1);
                deferred.resolve(searchResultListPage);
            },
            function(error){
                console.log("Error getting latest movements for list with connectIds.", error);
                deferred.reject(error);
            }
        );
        return deferred.promise;
    };

    var getMovement = function(movementId) {
        var deferred = $q.defer();
        movementRestFactory.getMovement().get({id: movementId}, function(response) {
            if (response.code !== "200") {
               deferred.reject("Invalid response status");
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
        var userName = userService.getUserName();
        movementRestFactory.getSavedSearches().get({user: userName},
            function(response) {

                if(response.code !== "200"){
                    deferred.reject("Invalid response status");
                    return;
                }

                var groups = [];
                if(angular.isArray(response.data)){
                    for (var i = 0; i < response.data.length; i ++) {
                        groups.push(SavedSearchGroup.fromMovementDTO(response.data[i]));
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
        movementRestFactory.savedSearch().save(savedSearchGroup.toMovementDTO(), function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromMovementDTO(response.data));
        }, function(error) {
            console.error("Error creating vessel group");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var updateSavedSearch = function(savedSearchGroup){
        var deferred = $q.defer();
        movementRestFactory.savedSearch().update(savedSearchGroup.toMovementDTO(), function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }
            deferred.resolve(SavedSearchGroup.fromMovementDTO(response.data));
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
            deferred.resolve(SavedSearchGroup.fromMovementDTO(response.data));
        }, function(error) {
            console.error("Error when trying to delete a saved movement search");
            console.error(error);
            deferred.reject(error);
        });
        return deferred.promise;
    };

    var getConfigFromResource = function(resource){
        var deferred = $q.defer();
        resource.get({},
            function(response){
                if(response.code !== "200"){
                    deferred.reject("Not valid movement configuration status.");
                    return;
                }
                deferred.resolve(response.data);
            }, function(error){
                console.error("Error getting configuration values for movement.");
                deferred.reject(error);
            });
        return deferred.promise;
    };

    var getConfiguration = function(){
        return getConfigFromResource(movementRestFactory.getConfigForMovements());
    };

    var getConfigForSourceTypes = function(){
        return getConfigFromResource(movementRestFactory.getConfigForSourceTypes());
    };

    var getAreas = function() {
        return getConfigFromResource(movementRestFactory.areas());
    };

    return {
        getMovementList : getMovementList,
        getLatestMovementsByConnectIds : getLatestMovementsByConnectIds,
        getMovement: getMovement,
        getLastMovement: getLastMovement,
        getSavedSearches : getSavedSearches,
        createNewSavedSearch : createNewSavedSearch,
        updateSavedSearch : updateSavedSearch,
        deleteSavedSearch : deleteSavedSearch,
        getConfig : getConfiguration,
        getConfigForSourceTypes : getConfigForSourceTypes,
        getAreas: getAreas
    };

});