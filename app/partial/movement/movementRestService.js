angular.module('unionvmsWeb')
.factory('movementRestFactory', function($resource, $q, restConstants){
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
        savedSearch : function() {
            return $resource(baseUrl + '/movement/rest/search/group/:groupId', {}, {
                update: {method: 'PUT'}
            });
        },
        getSavedSearches : function() {
            return $resource(baseUrl + '/movement/rest/search/groups');
        }
    };
})
.factory('movementRestService',function($q, movementRestFactory, MovementListPage, Movement, SavedSearchGroup, ManualPosition){
    var baseUrl, userName;
    userName = "FRONTEND_USER";

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

    var createManualMovement = function(movement) {
        var deferred = $q.defer();
        movementRestFactory.manualMovement().save(movement.getDto(), function(response) {
            if(response.code !== "200"){
                deferred.reject("Invalid response status");
                return;
            }

            deferred.resolve(ManualPosition.fromJson(response.data));
        }, function(error) {
            deferred.reject(error);
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

    return {
        getMovementList : getMovementList,
        createManualMovement: createManualMovement,
        getSavedSearches : getSavedSearches,
        createNewSavedSearch : createNewSavedSearch,
        updateSavedSearch : updateSavedSearch,
        deleteSavedSearch : deleteSavedSearch
    };

});