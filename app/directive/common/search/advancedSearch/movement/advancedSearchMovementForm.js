angular.module('unionvmsWeb').directive('advancedSearchMovementForm', function() {
    return {
        restrict: 'E',
        replace: true,
        scope: {

        },
        templateUrl: 'directive/common/search/advancedSearch/movement/advancedSearchMovementForm.html',
        link: function(scope, element, attrs, fn) {

        }
    };
});

angular.module('unionvmsWeb')
    .controller('advancedSearchMovementCtrl', function($log, $scope, locale, searchService, savedSearchService, alertService, configurationService, SearchField){

        $scope.$on("searchMovements", function(event, pingCount) {
            $scope.resetSearch();
        });

        $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;

        var ASSET_GROUP_ID_SEARCH_KEY = 'ASSET_GROUP_ID';

        $scope.selectedSavedSearch = undefined;
        $scope.selectedVesselGroup = undefined;
        $scope.advancedSearch = false;

        var resetSearchForm = function(){
            alertService.hideMessage();
            //empty advancedSearchobject.
            $scope.selectedSavedSearch = undefined;
            $scope.selectedVesselGroup = undefined;
            $scope.resetAdvancedSearchForm(false);

            //Reset timespan dropdown and search!
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;
        };

        function backupSearchObjectValues(keys) {
            var values = {};
            $.each(keys, function(index, key) {
                if (angular.isDefined($scope.advancedSearchObject[key])) {
                    values[key] = $scope.advancedSearchObject[key];
                }
            });

            return values;
        }

        function restoreSearchObjectValues(values) {
            $.each(values, function(key, value) {
                $scope.advancedSearchObject[key] = value;
            });
        }

        $scope.toggleAdvancedSearch = function(){
            var timeSpanBackup = backupSearchObjectValues(["TIME_SPAN", "FROM_DATE", "TO_DATE"]);
            $scope.advancedSearch = !$scope.advancedSearch;
            resetSearchForm();
            restoreSearchObjectValues(timeSpanBackup);
        };

        $scope.resetSearch = function(){
            resetSearchForm();
            $scope.performAdvancedSearch();
        };

        $scope.openSaveSearchModal = function(){
            var options = {
                dynamicSearch : $scope.advancedSearch
            };
            //Asset group selected?
            if(angular.isDefined($scope.selectedVesselGroup)){
                options.extraSearchFields = [new SearchField(ASSET_GROUP_ID_SEARCH_KEY, $scope.selectedVesselGroup)];
            }
            savedSearchService.openSaveSearchModal("MOVEMENT", options);
        };

        $scope.selectVesselGroup = function(savedSearchGroup){
            console.log(savedSearchGroup);
            $scope.resetSavedSearchDropdown();
            //Set search criterias
            if(angular.isDefined(savedSearchGroup.searchFields)){
                $scope.advancedSearchObject['ASSET_GROUP'] = savedSearchGroup.searchFields;
            }else{
                delete $scope.advancedSearchObject['ASSET_GROUP'];
            }
        };

        //Reset the saved search dropdown
        $scope.resetSavedSearchDropdown = function(){
            $scope.selectedSavedSearch = undefined;
        };

        //Search by the advanced search form inputs
        $scope.performAdvancedMovementSearch = function(){
            alertService.hideMessage();
            //Restet saved search dropdown
            $scope.resetSavedSearchDropdown();

            //Create criterias
            searchService.resetPage();
            searchService.resetSearchCriterias();
            searchService.setDynamic($scope.advancedSearch);
            //Asset group selected?
            if(angular.isDefined($scope.selectedVesselGroup)){
                var savedAssetGroup = savedSearchService.getVesselGroupForUserById($scope.selectedVesselGroup);
                $scope.advancedSearchObject['ASSET_GROUP'] = savedAssetGroup.searchFields;
                delete $scope.advancedSearchObject[ASSET_GROUP_ID_SEARCH_KEY];
            }

                searchService.setSearchCriteriasToAdvancedSearch();

            //Do the search
            $scope.searchfunc();
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            //Inital text selected?
            if(angular.isUndefined(savedSearchGroup.searchFields)){
                return;
            }

            alertService.hideMessage();
            $scope.resetAdvancedSearchForm(false);
            $scope.performSavedGroupSearch(savedSearchGroup, true, false);

            $scope.advancedSearch = savedSearchGroup.dynamic;

            //Saved search includes an asset group?
            var foundAssetGroup = false;
            $.each(savedSearchGroup.searchFields, function(index, searchField){
                if(searchField.key === ASSET_GROUP_ID_SEARCH_KEY){
                    var savedAssetGroup = savedSearchService.getVesselGroupForUserById(searchField.value);
                    if(angular.isDefined(savedAssetGroup)){
                        foundAssetGroup = true;

                        //Set selected vessel group, so the dropdown gets updated
                        $scope.selectedVesselGroup = savedAssetGroup.id;
                        //Add search criterias from asset group
                        $.each(savedAssetGroup.searchFields, function(index, searchField){
                            searchService.addSearchCriteria(searchField.key, searchField.value);
                        });

                    }else{
                        //Show warning that the asset group has been deleted
                        alertService.showErrorMessage(locale.getString('movement.saved_search_asset_group_deleted_message', {name: savedSearchGroup.name}));
                    }

                    //Remove ASSET_GROUP_ID from search criterias
                    searchService.removeSearchCriteria(ASSET_GROUP_ID_SEARCH_KEY);
                    //Remove ASSET_GROUP_ID from advancedSearchObject
                    delete $scope.advancedSearchObject[ASSET_GROUP_ID_SEARCH_KEY];

                    return false;
                }
            });
            //Reset asset group dropdown
            if (!foundAssetGroup) {
                $scope.selectedVesselGroup = undefined;
            }

            //Do the search
            $scope.searchfunc();
        };

          //Watch for changes to the START DATE input
        $scope.$watch(function () { return $scope.advancedSearchObject.TO_DATE;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
            }
        });
        //Watch for changes to the END DATE input
        $scope.$watch(function () { return $scope.advancedSearchObject.FROM_DATE;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_CUSTOM;
            }
        });
        //Watch for changes to the DATE DROPDOWN
        $scope.$watch(function () { return $scope.advancedSearchObject.TIME_SPAN;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined' && newVal !== $scope.DATE_CUSTOM) {
                //Remove start date and end date when changing to something else than custom
                delete $scope.advancedSearchObject.TO_DATE;
                delete $scope.advancedSearchObject.FROM_DATE;
            }
        });

        function getAreaDropdownItems(areas) {
            if (angular.isUndefined(areas)) {
                return [];
            }

            return areas.map(function(area) {
                return {
                    text: area.areaName,
                    code: area.areaId
                };
            });
        }

        var init = function(){
            //Setup dropdowns
            $scope.flagStates = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL' );
            $scope.gearType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'GEAR_TYPE'), 'GEAR_TYPE', 'VESSEL');
            $scope.power = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_POWER_MAIN'));
            $scope.carrierLength = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_LENGTH_LOA'));
            $scope.meassuredSpeed = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'SPEED_SPAN'), 'SPEED_SPAN', 'MOVEMENT');
            $scope.status = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'STATUS'),'STATUS','MOVEMENT');
            $scope.movementType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');
            $scope.movementSourceTypes = configurationService.setTextAndCodeForDropDown(configurationService.getConfig('MOVEMENT_SOURCE_TYPES'),'MOVEMENT_SOURCE_TYPES','MOVEMENT');
            $scope.advancedSearchObject.TIME_SPAN = $scope.DATE_TODAY;

            var areas = configurationService.getConfig('MOVEMENT_AREAS');
            $scope.mapArea = getAreaDropdownItems(areas);

            $scope.resetSearch();
        };

        init();

    });
