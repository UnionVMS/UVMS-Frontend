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
angular.module('unionvmsWeb').controller('AssignvesselCtrl',function($scope, $location, GetListRequest, vesselRestService, mobileTerminalRestService, alertService, locale, modalComment, SearchResults){

    var getListRequest;

    //Watch for toggle (show) of AssignVessel partial and reset search and selectedVessel when that happens
    $scope.$watch(function () {
        if(angular.isDefined($scope.isVisible)){
            return $scope.isVisible.assignVessel;
        }
    }, function (newVal, oldVal) {
        if (newVal) {
            resetSearch();
            $scope.selectedVessel = undefined;
        }
    });


    //Reset the search for assign vessel
    var resetSearch = function() {
        $scope.currentSearchResults = new SearchResults('name', false, locale.getString('vessel.search_zero_results_error'));

        $scope.assignVesselFreeText = "";
        $scope.assignVesselSearchType = "ALL";
        $scope.assignVesselSearchInProgress = false;
        getListRequest = new GetListRequest(1, 5, false, []);
    };

    //Search objects and results
    $scope.assignVesselSearchTypes = [{
        text: [locale.getString('vessel.ircs'), locale.getString('vessel.name'), locale.getString('vessel.cfr')].join('/'),
        code: 'ALL'
    }, {
        text: locale.getString('vessel.ircs'),
        code: 'IRCS'
    }, {
        text: locale.getString('vessel.name'),
        code: 'NAME'
    }, {
        text: locale.getString('vessel.cfr'),
        code: 'CFR'
    }];

    var init = function() {
        resetSearch();
    };

    //Perform the serach
    $scope.assignVesselSearch = function(){
        //Create new request
        getListRequest = new GetListRequest(1, 5, false, []);
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);

        //Set search criterias
        var searchValue = $scope.assignVesselFreeText;
        if($scope.assignVesselSearchType === "ALL"){
            getListRequest.addSearchCriteria("NAME", searchValue);
            getListRequest.addSearchCriteria("CFR", searchValue);
            getListRequest.addSearchCriteria("IRCS", searchValue);
        }else{
            getListRequest.addSearchCriteria($scope.assignVesselSearchType, searchValue);
        }

        //Do the search
        vesselRestService.getVesselList(getListRequest)
            .then(onSearchVesselSuccess, onSearchVesselError);
    };

    //Search success
    var onSearchVesselSuccess = function(vesselListPage){
        $scope.currentSearchResults.updateWithNewResults(vesselListPage);
    };

    //Search error
    var onSearchVesselError = function(response){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            getListRequest.setPage(page);
            $scope.currentSearchResults.setLoading(true);
            vesselRestService.getVesselList(getListRequest)
                .then(onSearchVesselSuccess, onSearchVesselError);
        }
    };

    //Handle click event on select vessel button
    $scope.selectVessel = function(vessel){
        $scope.selectedVessel = vessel;
        $scope.newVesselObj = vessel;
    };

    $scope.assignToSelectedVesselWithComment = function(comment) {
        var validAssignment = angular.isDefined($scope.currentMobileTerminal) && angular.isDefined($scope.selectedVessel.getGuid());
        if (!validAssignment) {
            alertService.showErrorMessage(locale.getString('mobileTerminal.assign_vessel_message_on_missing_guid_error'));
            return;
        }

        mobileTerminalRestService.assignMobileTerminal($scope.currentMobileTerminal, $scope.selectedVessel.getGuid(), comment).then(function() {
            $scope.currentMobileTerminal.assignToVesselByVesselGuid($scope.selectedVessel.getGuid());
            $scope.currentMobileTerminal.associatedVessel = $scope.selectedVessel;
            $scope.toggleAssignVessel();
            $scope.goBackToAssignVesselSearchResultsClick();
            $scope.mergeCurrentMobileTerminalIntoSearchResults();
            resetSearch();

            alertService.showSuccessMessageWithTimeout(locale.getString('mobileTerminal.assign_vessel_message_on_success'));
        },
        function() {
            alertService.showErrorMessage(locale.getString('mobileTerminal.assign_vessel_message_on_error'));
        });
    };

    $scope.assignToSelectedVessel = function() {
        modalComment.open($scope.assignToSelectedVesselWithComment, {
            titleLabel: locale.getString("mobileTerminal.assigning_to_vessel", [$scope.currentMobileTerminal.getSerialNumber(), $scope.selectedVessel.name]),
            saveLabel: locale.getString('mobileTerminal.assign')
        });
    };

    //Go back to search results
    $scope.goBackToAssignVesselSearchResultsClick = function(){
        $scope.selectedVessel = undefined;
    };

    //Create new vessel
    $scope.gotoCreateNewVessel = function(){
        $location.path("/vessel");
    };

    init();

});