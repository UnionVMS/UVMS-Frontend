/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').factory('savedSearchService',function($q, $uibModal, SavedSearchGroup, vesselRestService, movementRestService, userService) {

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
            var modalInstance = $uibModal.open({
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
