angular.module('unionvmsWeb').directive('search', function() {
    return {
        restrict: 'E',
        replace: true,
        controller : 'searchCtrl',
        scope: {
            resultscallback: "=",
            modeltype : "@",
            advanced : "@"
        },
        templateUrl: 'directive/common/search/search.html',
        link: function(scope, element, attrs, fn) {

        }
    };
});

angular.module('unionvmsWeb')
    .controller('searchCtrl', function($scope, savedSearchService, searchService, VesselListPage, vesselRestService){
    
    $scope.availableTypes = [];
    $scope.advancedSearchAvailable = $scope.advanced;
    $scope.advancedSearchVisible = false;
    $scope.freeText = "";
    $scope.searchFunc = undefined;

    //Init the directive
    var init = function(){
        if($scope.modeltype === 'VESSEL'){
            $scope.availableTypes = ['Vessel'];            
            $scope.searchFunc = $scope.searchVessel;
        }
    };

    //Handle Search results
    var onSearchSuccess = function(vesselListPage){
        $scope.resultscallback(vesselListPage);
    };
    var onSearchError = function(response){
        $scope.resultscallback(response);
    };

    //on click on item in saved search groups dropdown
    $scope.onSavedSearchGroupClick = function(savedSearchGroup){
        var toggleAdvancedSearch = true;
        $.each(savedSearchGroup.searchFields, function(key, searchField){
            if(searchField.key === 'INTERNAL_ID'){
                toggleAdvancedSearch = false;
                return false;
            }
        });

        //Show/hide advanced search fields
        $scope.advancedSearchVisible = toggleAdvancedSearch;

        performSavedGroupSearch(savedSearchGroup);
    };  

    //Search by a saved group
    var performSavedGroupSearch = function(savedSearchGroup){
        searchService.setDynamic(savedSearchGroup.dynamic);
        searchService.resetPage();
        //Set search criterias
        searchService.resetSearchCriterias();
        searchService.setSearchCriterias(savedSearchGroup.searchFields);

        //Do the search
        $scope.searchFunc();
    };  

    //Search by the text input field
    $scope.performFreeTextSearch = function(){
        searchService.resetPage();
        searchService.resetSearchCriterias();
        searchService.setDynamic(false);
        var searchValue = $scope.freeText +"*";
        searchService.addSearchCriteria("NAME", searchValue);
        searchService.addSearchCriteria("CFR", searchValue);
        searchService.addSearchCriteria("IRCS", searchValue);

        //Do the search
        $scope.searchFunc();
    };


    //Get list of VESSELS matching the search criterias
    $scope.searchVessel = function(){
        searchService.searchVessels()
                .then(onSearchSuccess, onSearchError);
    };

    //Toggle (show/hide) the advanced search
    $scope.toggleAdvancedSearch = function(){
        $scope.freeText = "";
        $scope.advancedSearchVisible = !$scope.advancedSearchVisible;

    };

    $scope.openSaveGroupModal = function(){
        savedSearchService.openSaveSearchModal("VESSEL", true);        
    };    

    init();
});

