angular.module('unionvmsWeb')
    .controller('AdvancedSearchMobileTerminalFormCtrl', function($scope, $modal, searchService, vesselRestService){

        $scope.vesselGroupDropdownItems = [];
        $scope.selectedVesselGroup = "";

        //Watch for changes to the searchService criterias
        $scope.onSearchInputChange = function(){
            $scope.selectedVesselGroup = "";
        };

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

        //Reset the form
        $scope.resetAdvancedMobileSearchForm = function(){
            $scope.selectedVesselGroup = "";
            $scope.resetAdvancedSearchForm();    
        };        

        //Select a vessel group to search mobile terminals for
        $scope.searchSelectedGroup = function(selectedItem){
            var savedSearchGroup;
            //Find the selected group
            $.each($scope.vesselGroups, function(index, group){
                if(group.id === selectedItem.code){
                    savedSearchGroup = group;
                }
            });
            $scope.resetAdvancedSearchForm();
            console.log("search for group");
            console.log(savedSearchGroup);
            $scope.performSavedGroupSearch(savedSearchGroup);
        };

        init();
    }
);
