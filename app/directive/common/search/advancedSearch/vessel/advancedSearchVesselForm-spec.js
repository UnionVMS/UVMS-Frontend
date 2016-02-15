describe('AdvancedSearchVesselFormCtrl', function() {

    var scope, createController;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            return $controller('AdvancedSearchVesselFormCtrl', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should setup dropdown values on init', inject(function() {
        var controller = createController();

        //Dropdown values should have been created
        expect(scope.flagStates).toBeDefined('flagStates should be defined');
        expect(scope.gearTypes).toBeDefined('gearTypes should be defined');
        expect(scope.powerSpans).toBeDefined('powerSpans should be defined');
        expect(scope.lengthSpans).toBeDefined('lengthSpans should be defined');
        expect(scope.activeTypes).toBeDefined('activeTypes should be defined');

    }));

    it('openSaveGroupModal should open modal with correct options set', inject(function($q, savedSearchService) {

        var saveModalSpy = spyOn(savedSearchService, "openSaveSearchModal").andCallFake(function(type, options){
            expect(type).toEqual("VESSEL");
            expect(options.dynamicSearch).toEqual(true);
            expect(options.selectedItems).toBeUndefined();
        });
        var controller = createController();
        scope.$digest();

        //Open save modal
        scope.openSaveGroupModal();
        expect(saveModalSpy).toHaveBeenCalled();
    }));


    it('performFreeTextSearch should search for NAME, CFR and IRCS', inject(function($q, searchService) {

        var addSearchCriteriaSpy = spyOn(searchService, 'addSearchCriteria');
        var controller = createController();
        scope.searchfunc = function(){};
        var doSearchSpy = spyOn(scope, 'searchfunc');
        scope.freeText = 'TEST';

        //Perform free text search
        scope.advancedSearch = false;
        scope.performSearch();

        expect(addSearchCriteriaSpy).toHaveBeenCalledWith('NAME', 'TEST');
        expect(addSearchCriteriaSpy).toHaveBeenCalledWith('CFR', 'TEST');
        expect(addSearchCriteriaSpy).toHaveBeenCalledWith('IRCS', 'TEST');
        expect(doSearchSpy).toHaveBeenCalled();
    }));

});