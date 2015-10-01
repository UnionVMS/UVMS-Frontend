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
    .controller('advancedSearchMovementCtrl', function($scope, locale, savedSearchService, configurationService, SearchField){

        var DATE_CUSTOM = "Custom";
        $scope.selectedSavedSearch = "";
        $scope.selectedVesselGroup = "";
        $scope.advancedSearch = false;
        $scope.timespan = {};
        $scope.advancedSearchObject.TIME_SPAN = $scope.timespan.code;

        $scope.toggleAdvancedSearch = function(){
            $scope.advancedSearch = !$scope.advancedSearch;
            $scope.resetSearch();
        };

        $scope.resetSearch = function(){
            //empty advancedSearchobject.
            $scope.SIMPLE_NAME = "";
            $scope.selectedSavedSearch = "";
            $scope.selectedVesselGroup = "";
            $scope.resetAdvancedSearchForm(false);
            $scope.advancedSearchObject.TIME_SPAN = $scope.timespan.code;
        };

        $scope.performSearch = function(){
            console.log("perform search");
        };

        $scope.openSaveSearchModal = function(){
            savedSearchService.openSaveSearchModal("MOVEMENT", true);
        };

        $scope.selectVesselGroup = function(savedSearchGroup){
            console.log("Select vessel group!");
            console.log("NOT IMPLEMENTED!");
            console.log(savedSearchGroup);
            console.log($scope.advancedSearchObject);

           $scope.advancedSearchObject.assetGroupCriterias = savedSearchGroup.searchFields;
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            console.log("performSavedSearch!");
            $scope.advancedSearch = true;
            $scope.performSavedGroupSearch(savedSearchGroup, true);
        };

        $scope.setSimpleSearchCriterias = function (value){

            if(!value)
            {
                delete $scope.advancedSearchObject.NAME;
                //delete $scope.advancedSearchObject.IRCS;
            } else {
                $scope.advancedSearchObject.NAME = value + "*";
                //$scope.advancedSearchObject.IRCS = value + "*";
            }
        };

          //Watch for changes to the START DATE input
        $scope.$watch(function () { return $scope.advancedSearchObject.TO_DATE;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
            }
        });
        //Watch for changes to the END DATE input
        $scope.$watch(function () { return $scope.advancedSearchObject.FROM_DATE;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.advancedSearchObject.TIME_SPAN = DATE_CUSTOM;
            }
        });
        //Watch for changes to the DATE DROPDOWN
        $scope.$watch(function () { return $scope.advancedSearchObject.TIME_SPAN;}, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined' && newVal !== DATE_CUSTOM) {
                //Reset start date and end date when changing to something else than custom
                $scope.advancedSearchObject.TO_DATE = undefined;
                $scope.advancedSearchObject.FROM_DATE = undefined;
            }
        });

        var init = function(){
            //Setup dropdowns
            $scope.flagStates = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'), 'FLAG_STATE', 'VESSEL' );
            $scope.carrierType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'VESSEL_TYPE'), 'CARRIER_TYPE', 'VESSEL');
            $scope.gearType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'GEAR_TYPE'), 'GEAR_TYPE', 'VESSEL');
            $scope.power = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_POWER_MAIN'));
            $scope.carrierLength = configurationService.setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'SPAN_LENGTH_LOA'));
            $scope.meassuredSpeed = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'SPEED_SPAN'), 'SPEED_SPAN', 'MOVEMENT');
            $scope.status = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'STATUS'),'STATUS','MOVEMENT');
            $scope.movementType = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'),'MESSAGE_TYPE','MOVEMENT');


            var tempTimeSpan = configurationService.setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'TIME_SPAN'), 'TIME_SPAN','MOVEMENT');
            tempTimeSpan.push({"text":locale.getString('config.MOVEMENT_TIME_SPAN_custom'), "code":DATE_CUSTOM});
            $scope.timeSpanDropDownItems = tempTimeSpan;

            $scope.timespan = tempTimeSpan[0];
            $scope.advancedSearchObject.TIME_SPAN = $scope.timespan.code;

            //TODO: Get from config
            $scope.mapArea = [{'text':'Area 1','code':'Area 1'},{'text':'Area 2','code':'Area 2'}];

            $scope.resetSearch();
            $scope.performAdvancedSearch();
        };

        init();

    });
