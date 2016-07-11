/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').controller('MovementCtrl',function($scope, $timeout, $filter, alertService, searchService, locale, $stateParams, PositionReportModal, PositionsMapModal, movementCsvService, SearchResults, $resource, longPolling, ManualPosition, ManualPositionReportModal){

    //Current filter and sorting for the results table
    $scope.sortFilter = '';
    $scope.editSelectionDropdownItems = [{'text':locale.getString('movement.editselection_see_on_map'),'code':'MAP'}, {'text':locale.getString('common.export_selection'),'code':'EXPORT'}];
    $scope.newMovementsCount = 0;
    var longPollingId;
    var modalInstance;

    //Search objects and results
    $scope.currentSearchResults = new SearchResults('time', true, locale.getString('movement.movement_search_error_result_zero_pages'));

    //Selected by checkboxes
    $scope.selectedMovements = [];

    //Used for the submenu
    $scope.isManualMovement = false;

    var updateSearchWithGuid = function(guid) {
        searchService.searchMovements().then(function(page) {
            if (page.hasItemWithGuid(guid)) {
                $scope.clearSelection();
                retriveMovementsSuccess(page);
            }
            else {
                $scope.newMovementsCount++;
            }
        });
    };

    $scope.resetSearch = function() {
        $scope.$broadcast("searchMovements");
    };

    var init = function(){
         if ($stateParams.id) {
            modalInstance = PositionReportModal.showReportWithGuid($stateParams.id);
         }

         longPollingId = longPolling.poll("/movement/activity/movement", function(response) {
            if (response.ids.length > 0) {
                updateSearchWithGuid(response.ids[0]);
            }
         }, function(error) {
            console.log("movement long-polling was interrupted with error: " + error);
         });
    };

    $scope.searchMovements = function(){
        $scope.newMovementsCount = 0;
        $scope.clearSelection();
        $scope.currentSearchResults.clearErrorMessage();
        $scope.currentSearchResults.setLoading(true);
        searchService.searchMovements()
            .then(retriveMovementsSuccess, retriveMovementsError);
    };

    var retriveMovementsSuccess = function(searchResultListPage){
        console.info("Success in retrieveing movements..");
        $scope.currentSearchResults.updateWithNewResults(searchResultListPage);
    };

    var retriveMovementsError = function(error){
        $scope.currentSearchResults.removeAllItems();
        $scope.currentSearchResults.setLoading(false);
        $scope.currentSearchResults.setErrorMessage(locale.getString('common.search_failed_error'));
    };

    //Goto page in the search results
    $scope.gotoPage = function(page){
        if(angular.isDefined(page)){
            searchService.setPage(page);
            $scope.searchMovements();
        }
    };

   //Clear the selection
    $scope.clearSelection = function(){
        $scope.selectedMovements = [];
    };

    //Add a mobile terminal to the selection
    $scope.addToSelection = function(item){
        $scope.selectedMovements.push(item);
    };

    //Remove a mobile terminal from the selection
    $scope.removeFromSelection = function(item){
        $.each($scope.selectedMovements, function(index, movement){
            if(movement.isEqualMovement(item)){
                $scope.selectedMovements.splice(index, 1);
                return false;
            }
        });
    };

    //Callback function for the "Edit selection" dropdown
    $scope.editSelectionCallback = function(selectedItem){
        if($scope.selectedMovements.length){
            //SEE ON MAP
            if(selectedItem.code === 'MAP'){
                if($scope.selectedMovements.length === 1){
                    //If only selected one position report, then show detailed modal
                    $scope.viewItemDetails($scope.selectedMovements[0]);
                }else{
                    //Multiple position report, then show simple map modal
                    PositionsMapModal.show($scope.selectedMovements);
            }
            }
            //EXPORT SELECTION
            else if(selectedItem.code === 'EXPORT'){
                $scope.exportAsCSVFile(true);
            }
        }else{
            alertService.showInfoMessageWithTimeout(locale.getString('common.no_items_selected'));
        }
        $scope.editSelection = "";
    };

    $scope.newPosition = function() {
        var modalOptions = {
            openedFromMovementPage : true
        };
        var reportObj = new ManualPosition();
        reportObj.draft();
        modalInstance = ManualPositionReportModal.show(reportObj, modalOptions);
    };


    //View item details
    $scope.viewItemDetails = function(item){
        modalInstance = PositionReportModal.showReport(item);
    };

    function getSelectedMovements() {
        if ($scope.selectedMovements.length > 0) {
            return $scope.selectedMovements;
        }
        else {
            return $scope.currentSearchResults.items;
        }
    }

    $scope.exportAsCSVFile = function() {
        movementCsvService.exportMovements(getSelectedMovements());
    };

    $scope.$on("$destroy", function() {
        alertService.hideMessage();
        longPolling.cancel(longPollingId);
        if(angular.isDefined(modalInstance)){
            modalInstance.dismiss();
        }
    });


    init();

});