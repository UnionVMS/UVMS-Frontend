angular.module('unionvmsWeb').factory('savedVesselGroupService',function(vesselRestService, $q) {

    var items = [];

    var init = function(){  
        getVesselGroupsForUser();
    };
    
    var getVesselGroupsForUser = function(){
    //Load list of VesselGroups
    vesselRestService.getVesselGroupsForUser()
    .then(onVesselGroupListSuccess, onVesselGroupListError);
     };

    //Success getting vesselGroups for the user
    var onVesselGroupListSuccess = function(groups){
        items = groups;
    };

    //Handle error when getting vesselGroups for the user
    var onVesselGroupListError = function(response){
        items = [];
        console.error("We are sorry... To err is human but to arr is pirate!!");
    };

    var savedVesselGroupService = {
        //Get all vessel groups that belongs to the user
        getVesselGroupsForUser : function(){
            //Load list of VesselGroups
            return items;          
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
        }
    };

    init();

    return savedVesselGroupService;
});


 