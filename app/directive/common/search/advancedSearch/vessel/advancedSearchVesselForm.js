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
angular.module('unionvmsWeb')
    .controller('AdvancedSearchVesselFormCtrl', function($scope, $modal, searchService, savedSearchService, configurationService, vesselValidationService, locale, unitTransformer){

        $scope.advancedSearch = false;
        $scope.selectedVesselGroup = undefined;

        //Validation
        $scope.mmsiRegExp = vesselValidationService.getMMSIPattern();
        $scope.mmsiValidationMessages = {
            'pattern' : locale.getString('vessel.vessel_details_mmsi_pattern_validation_message')
        };

        var init = function(){
            //Setup dropdowns
            $scope.flagStates = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), undefined, 'VESSEL', true);
            $scope.gearTypes = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FISHING_TYPE'), undefined,'VESSEL', true);
            $scope.powerSpans = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_POWER_MAIN'));
            $scope.lengthSpans = toLengthUnitView(configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_LENGTH_LOA')));

            //TODO: Need this from backend?
            $scope.activeTypes = [{'text':'Yes','code':'true'},{'text':'No','code':'false'}];
        };

        var toLengthUnitView = function(spans) {
            $.each(spans, function(index, span) {
                span.text = unitTransformer.length.toLengthUnitRangeString(span.text);
            });

            return spans;
        };

        //Reset all search fields
        var resetSearchFields = function(){
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(false);
        };

        //On click on the reset link
        $scope.resetSearch = function(){
            $scope.resetSelectedVesselGroup();
            $scope.freeText = "";
            $scope.resetAdvancedSearchForm(true);
        };

        //Reset the saved search dropdown
        $scope.resetSelectedVesselGroup = function(){
            $scope.selectedVesselGroup = undefined;
        };

        $scope.toggleAdvancedSearch = function(){
            $scope.advancedSearch = !$scope.advancedSearch;
            resetSearchFields();
        };

        $scope.performSearch = function(){
            $scope.resetSelectedVesselGroup();
            if($scope.advancedSearch){
                $scope.performAdvancedSearch();
            }else{
                performFreeTextSearch();
            }
        };

        //Search by the text input field
        var performFreeTextSearch = function(){
            console.log("performFreeTextSearch");
            searchService.resetPage();
            searchService.resetSearchCriterias();
            searchService.setDynamic(true);
            //Add search criterias
            if(typeof $scope.freeText === 'string' && $scope.freeText.trim().length > 0){
                var searchValue = $scope.freeText;
                searchService.addSearchCriteria("NAME", searchValue);
                searchService.addSearchCriteria("CFR", searchValue);
                searchService.addSearchCriteria("IRCS", searchValue);
                searchService.setDynamic(false);
            }

            //Do the search
            $scope.searchfunc();
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            //Inital text selected?
            if(angular.isUndefined(savedSearchGroup.searchFields)){
                return;
            }

            //Check if advanced search should be shown or hidden
            var toggleAdvancedSearch = true;
            $.each(savedSearchGroup.searchFields, function(key, searchField){
                if(searchField.key === 'GUID'){
                    toggleAdvancedSearch = false;
                    return false;
                }
            });

            //Show or hide advanced search
            $scope.advancedSearch = toggleAdvancedSearch;
            resetSearchFields();
            $scope.performSavedGroupSearch(savedSearchGroup, true, true);
        };

        $scope.$on('refreshSavedSearch', function(event, group) {
            if (angular.isDefined(group) && angular.isDefined(group.searchFields)) {
                $scope.performSavedSearch(group);
            }
        });

        $scope.openSaveGroupModal = function(){
            var options = {
                dynamicSearch : true,
            };
            savedSearchService.openSaveSearchModal("VESSEL", options);
        };

        init();
    }
);