angular.module('unionvmsWeb').factory('savedSearchService',function($q, $modal, SavedSearchGroup, vesselRestService, movementRestService, userService) {

    var checkAccessToFeature = function(feature) {
        return userService.isAllowed(feature, 'Union-VMS', true);
    };

    var vesselGroups = [];
    var movementSearches = [];

    var init = function(){
        if(checkAccessToFeature('viewVesselsAndMobileTerminals')){
            getVesselGroupsForUser();
        }

        if(checkAccessToFeature('viewMovements')){
            getMovementSearches();
        }
    };
    
    //Load list of VesselGroups
    var getVesselGroupsForUser = function(){
        vesselRestService.getVesselGroupsForUser().then(
            function(groups){
                vesselGroups = groups;
            },
            function(response){
                vesselGroups = [];
                console.error("Error getting saved vessel groups");
            }
        );
    };

    //Load list of Movement searches
    var getMovementSearches = function(){
        movementRestService.getSavedSearches().then(
            function(groups){
                movementSearches = groups;
            },
            function(response){
                movementSearches = [];
                console.error("Error getting saved movement searches");
            }
        );
    };

    var savedSearchService = {
        //Get all vessel groups that belongs to the user
        getVesselGroupsForUser : function(){
            //Load list of VesselGroups
            return vesselGroups;
        },
        createNewVesselGroup : function(savedSearchGroup){
            var defer = $q.defer();
            vesselRestService.createNewVesselGroup(savedSearchGroup)
            .then(function() {
                getVesselGroupsForUser();
                defer.resolve();
            }, function(){
                defer.reject();
            });

            return defer.promise;
        
        },
        updateVesselGroup : function(savedSearchGroup){
            var defer = $q.defer();
            vesselRestService.updateVesselGroup(savedSearchGroup)
            .then(function() {
                getVesselGroupsForUser();
                defer.resolve();
            }, function(){
                defer.reject();
            });

            return defer.promise;
        },
        deleteVesselGroup : function(savedSearchGroup){
            var defer = $q.defer();
            vesselRestService.deleteVesselGroup(savedSearchGroup)
            .then(function() {
                console.log("Vesselgroup removed from list!");
                getVesselGroupsForUser();
                defer.resolve();
            }, function(){
                console.log("Vesselgroup not removed from list!");
                defer.reject();
            });

            return defer.promise;
        },


        //Get all saved Movement searches
        getMovementSearches : function(){
            return movementSearches;          
        },
        createNewMovementSearch : function(savedSearchGroup){
            var defer = $q.defer();
            movementRestService.createNewSavedSearch(savedSearchGroup)
            .then(function() {
                getMovementSearches();
                defer.resolve();
            }, function(){
                defer.reject();
            });

            return defer.promise;
        
        },
        updateMovementSearch : function(savedSearchGroup){
            var defer = $q.defer();
            movementRestService.updateSavedSearch(savedSearchGroup)
            .then(function() {
                getMovementSearches();
                defer.resolve();
            }, function(){
                defer.reject();
            });

            return defer.promise;
        },
        deleteMovementSearch : function(savedSearchGroup){
            var defer = $q.defer();
            movementRestService.deleteSavedSearch(savedSearchGroup)
            .then(function() {
                console.log("Movement search removed from list!");
                getMovementSearches();
                defer.resolve();
            }, function(){
                console.log("Movement search not removed from list!");
                defer.reject();
            });

            return defer.promise;
        },

        openSaveSearchModal :function(searchType, dynamicSearch, selectedItems){
            var modalInstance = $modal.open({
              templateUrl: 'partial/common/saveSearchModal/saveSearchModal.html',
              controller: 'SaveSearchModalInstanceCtrl',
              windowClass : "saveSearchModal",
              size: "small",
              resolve: {
                    searchType : function(){
                        return searchType;
                    },
                    dynamicSearch: function(){
                        return dynamicSearch;
                    },
                    selectedItems: function(){
                        return selectedItems;
                    },
                }
            });
        }
    };

    init();

    return savedSearchService;
});


 