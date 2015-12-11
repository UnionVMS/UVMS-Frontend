angular.module('unionvmsWeb')
    .controller('AdvancedSearchMobileTerminalFormCtrl', function($scope, vesselValidationService, locale){

        $scope.vesselGroupDropdownItems = [];
        $scope.selectedVesselGroup = "";

        //Validation
        $scope.mmsiRegExp = vesselValidationService.getMMSIPattern();
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };

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
            $scope.performSavedGroupSearch(savedSearchGroup, true, true);
        };

    }
);
