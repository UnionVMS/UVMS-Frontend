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
    .controller('advancedSearchMovementCtrl', function($scope, locale, savedSearchService, configurationService){
    
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
        };

        $scope.performSavedSearch = function(savedSearchGroup){
            console.log("performSavedSearch!");
            $scope.advancedSearch = true;
            $scope.performSavedGroupSearch(savedSearchGroup, true);
        };

        var setTextAndCodeForDropDown = function(valueToSet){
            var valueList = [];
            _.find(valueToSet, 
                function(val){
                    valueList.push({'text': translateTextForDropdowns(val), 'code': val});
                });
            return valueList;
        };

        var translateTextForDropdowns = function(textToTranslate){
            if (textToTranslate.indexOf('+') !== -1) {
                textToTranslate = textToTranslate.replace("+"," plus");
            }
            return locale.getString('config.' + textToTranslate);
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
            $scope.flagStates = setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'FLAG_STATE'));
            $scope.carrierType =setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'VESSEL_TYPE'));
            $scope.gearType = setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'GEAR_TYPE'));
            $scope.power = setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'POWER_SPAN'));
            $scope.carrierLength = setTextAndCodeForDropDown(configurationService.getValue('VESSEL', 'LENGTH_SPAN'));

            var tempTimeSpan = setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'TIME_SPAN'));
            tempTimeSpan.push({"text":locale.getString('config.custom'), "code":DATE_CUSTOM});
            $scope.timeSpanDropDownItems = tempTimeSpan;
            
            $scope.timespan = tempTimeSpan[0];
            $scope.advancedSearchObject.TIME_SPAN = $scope.timespan.code;
            
            $scope.meassuredSpeed = setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'SPEED_SPAN'));
            $scope.status = setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'STATUS'));
            $scope.messageType = setTextAndCodeForDropDown(configurationService.getValue('MOVEMENT', 'MESSAGE_TYPE'));
            $scope.productOwner = [{'text':'P.O. 1','code':'46'},{'text':'P.O. 2','code':'49'}];
            $scope.userOrg = [{'text':'U.O. 1','code':'111'},{'text':'U.O. 2','code':'222'}];
            $scope.groups = [{'text':'Group1','code':'Group1'},{'text':'Group2','code':'Group2'}];
            $scope.mapArea = [{'text':'Area 1','code':'Area 1'},{'text':'Area 2','code':'Area 2'}];                

            $scope.resetSearch();
            $scope.performAdvancedSearch();
        };

        init();

    }); 
