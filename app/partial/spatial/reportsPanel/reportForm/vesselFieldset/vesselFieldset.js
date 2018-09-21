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
angular.module('unionvmsWeb').controller('VesselfieldsetCtrl',function($scope, locale, $timeout, $modal, vesselRestService, GetListRequest, $filter){
    $scope.selectedVesselMenu = 'SIMPLE';
    $scope.vesselSearchLoading = false;
    $scope.hasError = false;
    $scope.errorMessage = undefined;
    
    $scope.isVesselMenuVisible = function(type){
        return $scope.selectedVesselMenu === type;
    };
    
    $scope.toggleVesselMenuType = function(type){
        $scope.selectedVesselMenu = type;
    };
    
    //Hide error message
    $scope.hideError = function(){
        $timeout(function(){
            $scope.hasError = false;
            $scope.errorMessage = undefined;
        }, 5000);
    };
    
    //CURRENT SELECTION TABLE
    $scope.vesselsSelectionTable = {};
    
    //Table config
    $scope.vesselsSelectionByPage = 10;
    
    $scope.vesselTable = {};
    $scope.vesselPagination = {
        vesselsByPage: 10,
        page: undefined
    };
    
    //Check if vessel record was already added to the report current selection
    $scope.checkVesselIsSelected = function(vesselSrc){
        var response = false;
        for (var i = 0; i < $scope.report.vesselsSelection.length; i++){
            if (angular.isDefined(vesselSrc.id) && $scope.report.vesselsSelection[i].type === 'asset' && vesselSrc.historyId === $scope.report.vesselsSelection[i].id){
                response = true;
            } else if (angular.isDefined(vesselSrc.id) && $scope.report.vesselsSelection[i].type === 'vgroup' && vesselSrc.id === $scope.report.vesselsSelection[i].id){
                response = true;
            }
        }
        return response;
    };
    
    $scope.viewDetails = function(idx, source){
        var modalInstance = $modal.open({
            templateUrl: 'partial/spatial/reportsPanel/reportForm/vesselFieldset/detailsModal/detailsModal.html',
            controller: 'DetailsmodalCtrl',
            size: '',
            resolve: {
                itemForDetail: function(){
                    if (source === 'SEARCH'){
                    	idx = $scope.shared.vessels.indexOf($scope.displayedRecords[idx]);
                        var item = $scope.shared.vessels[idx];
                        item.type = $scope.shared.vesselSearchBy;
                        if (item.type === 'asset'){
                            item.guid = $scope.shared.vessels[idx].id;
                            //FIXME when getting details from asset history
                            //item.guid = $scope.shared.vessels[idx].historyId;
                        }
                        
                        return item;
                    } else {
                    	idx = $scope.report.vesselsSelection.indexOf($scope.displayedRecordsSelection[idx]);
                        return $scope.report.vesselsSelection[idx];
                    }
                }
            }
        });
    };
    
    //Just for display purposes
    $scope.translateSelectionType = function(type){
        var searchString = 'spatial.reports_form_vessel_selection_type_' + type;
        return locale.getString(searchString);
    };
    
    $scope.toggleVesselSelection = function(index){
    	$scope.reportBodyForm.$setDirty();
        var vessel = $scope.displayedRecords[index];
        var guid;

        if (!vessel.selected){
            vessel.selected = true;

            guid = $scope.shared.vesselSearchBy === 'asset'? vessel.historyId : vessel.id;
            if(_.where($scope.report.vesselsSelection,{guid: guid}).length === 0){
                var record = {
                    name: vessel.name
                };
                
                if ($scope.shared.vesselSearchBy === 'asset'){
                    record.guid = vessel.historyId;
                    record.type = 'asset';
                } else {
                    record.guid = vessel.id;
                    record.user = vessel.user;
                    record.type = 'vgroup';
                }
                
                $scope.report.vesselsSelection.push(record);
            }
        }else{
            delete vessel.selected;
            guid = $scope.shared.vesselSearchBy === 'asset'? vessel.historyId : vessel.id;
            $scope.removeSelection(guid,$scope.report.vesselsSelection.indexOf(_.where($scope.report.vesselsSelection, {guid: guid})[0]));
        }
    };
    
    $scope.searchVessels = function(){
        if ($scope.shared.searchVesselString !== ''){
            $scope.vesselSearchLoading = true;
            $scope.shared.vessels = [];
            var searchableFields = ['FLAG_STATE', 'EXTERNAL_MARKING', 'NAME', 'IRCS', 'CFR'];
            var getVesselListRequest = new GetListRequest($scope.vesselPagination.page, $scope.vesselPagination.vesselsByPage, false, []);
            
            for (var i = 0; i < searchableFields.length; i++){
                var searchString = $scope.shared.searchVesselString;
                if (angular.isUndefined(searchString)){
                    searchString = '*';
                } else {
                    searchString += '*';
                }
                getVesselListRequest.addSearchCriteria(searchableFields[i], searchString);
            }
            
            vesselRestService.getVesselList(getVesselListRequest).then(getVesselsSuccess, getVesselsError);
        }
    };
    
    var getVesselsSuccess = function(response){
        $scope.vesselSearchLoading = false;
        $scope.shared.vessels = response.items;
        $scope.displayedRecords = [].concat($scope.shared.vessels);
        sortTableData($scope.stTableState.sort.predicate, $scope.stTableState.sort.reverse);
        $scope.vesselPagination.page = response.currentPage;
        $scope.stTableState.pagination.numberOfPages = response.totalNumberOfPages;
    };

    $scope.tableCallback = function(tableState){
        $scope.stTableState = tableState;
        var pageNumber = $scope.stTableState.pagination.start / $scope.vesselPagination.vesselsByPage;

        if (angular.isDefined($scope.vesselPagination.page) && pageNumber + 1 !== $scope.vesselPagination.page){
            $scope.vesselPagination.page = pageNumber + 1;
            $scope.searchVessels();
        } else {
            if (angular.isDefined(tableState.sort.predicate) && angular.isDefined($scope.displayedRecords) && $scope.displayedRecords.length > 0){
                sortTableData(tableState.sort.predicate, tableState.sort.reverse);
            }
        }
    };

    var sortTableData = function(predicate, reverse){
        $scope.displayedRecords = $filter('orderBy')($scope.displayedRecords, predicate, reverse);
    };
    
    var getVesselsError = function(error){
        $scope.vesselSearchLoading = false;
        $scope.hasError = true;
        $scope.errorMessage = locale.getString('spatial.reports_form_vessel_get_vessel_list_error');
        $scope.hideError();
    };
    
    $scope.$watch('shared.vesselSearchBy', function(newVal, oldVal){
        if (angular.isDefined($scope.shared)){
            $scope.shared.searchVesselString = '';
            $scope.shared.selectAll = false;
            $scope.shared.selectedVessels = 0;
            $scope.shared.vessels = [];
        }
        
        if (newVal === 'vgroup'){
            $scope.vesselSearchLoading = true;
            vesselRestService.getVesselGroupsForUser().then(getVesselGroupsSuccess, getVesselsGroupError);
        }
    });
    
    $scope.buildGroupRecords = function(data){
        var records = [];
        for (var i = 0; i < data.length; i++){
            records.push({
                guid: data[i].id,
                name: data[i].name,
                user: data[i].user
            });
        }
        
        return records;
    };
    
    var getVesselGroupsSuccess = function(response){
        $scope.vesselSearchLoading = false;
        $scope.shared.vessels = $scope.buildGroupRecords(response);
        $scope.displayedRecords = [].concat($scope.shared.vessels);
    };
    
    var getVesselsGroupError = function(error){
        $scope.vesselSearchLoading = false;
        $scope.hasError = true;
        $scope.errorMessage = locale.getString('spatial.reports_form_vessel_get_vgroup_list_error');
        $scope.hideError();
    };
    
    $scope.removeSelections = function(){
        $scope.reportBodyForm.$setDirty();
        angular.forEach($scope.shared.vessels, function(item){
            delete item.selected;
        });
        $scope.report.vesselsSelection = [];
    };

    var checkSelectedAssets = function(group){
        angular.forEach($scope.shared.vessels, function(item){
            var itemGuid = group ? item.id : item.historyId;
            if(_.where($scope.report.vesselsSelection, { guid: itemGuid }).length > 0){
                item.selected = true;
            }
        });
        
    };
    
    $scope.removeSelection = function(guid,index){
        $scope.reportBodyForm.$setDirty();
        $scope.report.vesselsSelection.splice(index,1);
        angular.forEach($scope.shared.vessels, function(item){
            if(($scope.shared.vesselSearchBy === 'asset' && item.historyId === guid) || item.id === guid){
                delete item.selected;
            }
        });
    };

    $scope.$watch('displayedRecords', function(){
        if(angular.isDefined($scope.shared)){
            var group;
            if($scope.shared.vesselSearchBy !== 'asset'){
                group = true;
            }
            checkSelectedAssets(group);
        }
    });

    $scope.selectAllAssets = function(){
        angular.forEach($scope.displayedRecords, function(value,key){
            value.selected = false;
            $scope.toggleVesselSelection(key);
        });
    };

    $scope.clearSearchProps = function(){
        $scope.shared.searchVesselString = undefined;
        $scope.shared.vessels = [];
        $scope.displayedRecords = [];
    };

    $scope.countSelectedItems = function(type){
        if(angular.isDefined($scope.report) && angular.isDefined($scope.report.vesselsSelection)){
            return _.where($scope.report.vesselsSelection, {type: type}).length;
        }
    };
    
});
