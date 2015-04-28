angular.module('unionvmsWeb').directive('advancedSearch', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'AdvancedSearchCtrl',
        scope: {
            modeltype : "=",
            searchfunc : "=",
            advancedsearchvisible : "=",

        },
        templateUrl: 'directive/common/search/advancedSearch/advancedSearch.html',
        link: function(scope, element, attrs, fn) {
        }
    };
});

angular.module('unionvmsWeb')
    .controller('AdvancedSearchCtrl', function($scope, searchService, SearchField){


    //Set form partial depending on modelType
    switch($scope.modeltype) {
        case "VESSEL":
            $scope.formPartial = 'directive/common/search/advancedSearch/vessel/advancedSearchVesselForm.html';
            break;
        case "MOBILE_TERMINAL":
            $scope.formPartial = 'directive/common/search/advancedSearch/mobileTerminal/advancedSearchMobileTerminalForm.html';
            break;
        case "POLLING_MOBILE_TERMINAL":
            $scope.formPartial = 'directive/common/search/advancedSearch/pollingMobileTerminal/searchpollingMobileTerminalForm.html';
            break;
        default:
            console.error("ModelType is missing for advanced search.");
    }

    $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();

    $scope.updateAdvancedSearchObject = function(key, value){
        if(value === undefined || (typeof value === 'string' && value.trim().length === 0) ){
            delete $scope.advancedSearchObject[key];
        }else{
            $scope.advancedSearchObject[key] = value;
        }
    };

    //Search by the advanced search form inputs
    $scope.performAdvancedSearch = function(){
        //Create criterias
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(true);
        searchService.setSearchCriteriasToAdvancedSearch();

        //Do the search
        $scope.searchfunc();        
    };

    //Search by a saved group
    $scope.performSavedGroupSearch = function(savedSearchGroup){
        searchService.resetPage();
        searchService.resetSearchCriterias();
        //Set search criterias
        searchService.setDynamic(savedSearchGroup.dynamic);
        searchService.setSearchCriterias(savedSearchGroup.searchFields);

        //Do the search
        $scope.searchfunc();
    };  

    //Reset the advacned search form inputs and do a search if sendSearchRequest is set to true
    $scope.resetAdvancedSearchForm = function(sendSearchRequest){
        searchService.resetAdvancedSearch();    
        $scope.advancedSearchObject  = searchService.getAdvancedSearchObject();
        if(sendSearchRequest){
            $scope.performAdvancedSearch();
        }
    };

    //TODO: Remove when advanced search form for vessel has been updated to use datepicker-input directive
    $scope.datePicker = (function () {
        var method = {};
        method.instances = [];

        method.open = function ($event, instance) {
            $event.preventDefault();
            $event.stopPropagation();
            method.instances[instance] = true;
        };

        method.options = {
            'show-weeks': false,
            startingDay: 0
        };

        var formats = ['MM/dd/yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        method.format = formats[4];
        return method;
    }());     
});
