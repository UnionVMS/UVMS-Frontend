angular.module('unionvmsWeb').factory('savedSearchService',function($q, $modal, SavedSearchGroup, vesselRestService, movementRestService, userService) {

    var checkAccessToFeature = function(moduleName, feature) {
        return userService.isAllowed(feature, moduleName, true);
    };

    var vesselGroups = [];
    var movementSearches = [];

    var init = function(){
        if(checkAccessToFeature('Union-VMS', 'viewVesselsAndMobileTerminals')){
            getVesselGroupsForUser();
        }

        if(checkAccessToFeature('Movement','viewMovements')){
            getMovementSearches();
        }
    };

    function getVesselGroup(id) {
        for (var i = 0; i < vesselGroups.length; i++) {
            if (vesselGroups[i].id === id) {
                return vesselGroups[i];
            }
        }        
    }

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
        //Get the vessel group with the specified id
        getVesselGroupForUserById : function(id){
            var found;
            $.each(vesselGroups, function(index, savedSearchGroup){
                if(savedSearchGroup.id === id){
                    found = savedSearchGroup;
                    return false;
                }
            });
            return found;
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
            .then(function(group) {
                getVesselGroupsForUser();
                defer.resolve(group);
            }, function(error){
                defer.reject(error);
            });

            return defer.promise;
        },
        deleteVesselGroup : function(savedSearchGroup){
            var defer = $q.defer();
            vesselRestService.deleteVesselGroup(savedSearchGroup)
            .then(function(deletedGroup) {
                console.log("Vesselgroup removed from list!");
                getVesselGroupsForUser();
                defer.resolve(deletedGroup);
            }, function(){
                console.log("Vesselgroup not removed from list!");
                defer.reject();
            });

            return defer.promise;
        },
        removeVesselsFromGroup: function(savedSearchGroupGuid, vesselGuids) {
            var group = getVesselGroup(savedSearchGroupGuid);
            if (angular.isUndefined(group)) {
                return $q.reject('The selected group does not exist.');
            }

            group = group.copy();
            group.searchFields = group.searchFields.filter(function(searchField) {
                // Remove any search field with key = GUID and value in vesselGuids array.
                return searchField.key !== 'GUID' || vesselGuids.indexOf(searchField.value) < 0;
            });

            return savedSearchService.updateVesselGroup(group);
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

        openSaveSearchModal :function(searchType, options){
            var modalInstance = $modal.open({
              templateUrl: 'partial/common/saveSearchModal/saveSearchModal.html',
              controller: 'SaveSearchModalInstanceCtrl',
              windowClass : "saveSearchModal",
              size: "small",
              resolve: {
                    searchType : function(){
                        return searchType;
                    },
                    options: function(){
                        return options;
                    }
                }
            });
        }
    };

    init();

    return savedSearchService;
});


