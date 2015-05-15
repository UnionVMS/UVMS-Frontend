angular.module('unionvmsWeb')
    .controller('AdvancedSearchMobileTerminalFormCtrl', function($scope){

        $scope.vesselGroupDropdownItems = [];
        $scope.selectedVesselGroup = "";

        //Watch for changes to the input fields
        $scope.onSearchInputChange = function(){
            $scope.selectedVesselGroup = "";
        };

        //Reset the form
        $scope.resetAdvancedMobileSearchForm = function(){
            $scope.selectedVesselGroup = "";
            $scope.resetAdvancedSearchForm(true);    
        };        

        //Select a vessel group to search mobile terminals for
        $scope.searchSelectedGroup = function(savedSearchGroup){
            $scope.resetAdvancedSearchForm(false);
            $scope.performSavedGroupSearch(savedSearchGroup);
        };

        $scope.displayVesselGroup = function(){
            return ($scope.selectedVesselGroup.lenght > 0) ? true : false;
        };

    }
);
