angular.module('unionvmsWeb')
    .controller('AdvancedSearchMobileTerminalFormCtrl', function($scope, $modal, vesselRestService){

        $scope.vesselGroupDropdownItems = [];

        //Init form
        var init = function(){
            //Get all vesselGroups for the user
            getVesselGroupsForUser();
        };

        //Get all vessel groups that belongs to the user
        var getVesselGroupsForUser = function(){
            //Load list of VesselGroups
            vesselRestService.getVesselGroupsForUser()
            .then(onVesselGroupListSuccess, onVesselGroupListError);

            $scope.channelTypes =[{'text':'VMS','code':'VMS'}, {'text':'ELOG','code':'ELOG'}];
        };

        //Success getting vesselGroups for the user
        var onVesselGroupListSuccess = function(savedSearchGroups){
            $.each(savedSearchGroups, function(index, group){
                $scope.vesselGroupDropdownItems.push({'text': group.name, 'code': group.id});
            });
            $scope.vesselGroups = savedSearchGroups;
        };

        //Handle error when getting vesselGroups for the user
        var onVesselGroupListError = function(response){
           console.error("Failed to load list of saved searches.");
        };

        $scope.searchSelectedGroup = function(groupId){
            console.log("SELECTED GROUP: " +groupId);
            console.log("TODO: IMPLEMENT SEARCH");
        };

        init();
    }
);
