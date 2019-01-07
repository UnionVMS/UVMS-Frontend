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
describe('advancedSearchMovementCtrl', function() {

    var scope, createController;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(){
            //Mock functions (exists in parent scope)
            scope.resetAdvancedSearchForm = function(){};
            scope.performAdvancedSearch = function(){};
            scope.advancedSearchObject = {};
            scope.DATE_CUSTOM = 'CUSTOM';
            scope.DATE_TODAY = 'TODAY';
            return $controller('advancedSearchMovementCtrl', {$scope: scope});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should listen for searchMovements event and reset search form when it happens', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();

        var resetSpySearch = spyOn(scope, 'resetSearch');
        expect(resetSpySearch).not.toHaveBeenCalled();

        //Broadcast event
        scope.$broadcast("searchMovements");
        scope.$digest();

        expect(resetSpySearch).toHaveBeenCalled();

    }));

    it('should setup dropdown values on init', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();

        //Dropdown values should have been created
        expect(scope.flagStates).toBeDefined('flagStates should be defined');
        expect(scope.gearType).toBeDefined('gearType should be defined');
        expect(scope.power).toBeDefined('power should be defined');
        expect(scope.carrierLength).toBeDefined('carrierLength should be defined');
        expect(scope.meassuredSpeed).toBeDefined('meassuredSpeed should be defined');
        expect(scope.status).toBeDefined('status should be defined');
        expect(scope.movementType).toBeDefined('movementType should be defined');

    }));

    it('should remove FROM_DATE and TO_DATE when TIME_SPAN changes to something other than CUSTOM', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to something other than CUSTOM should remove FROM_DATE and TO_DATE from advancedSearchObject
        scope.advancedSearchObject.TIME_SPAN = 'UPDATED_VALUE';
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeFalsy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeFalsy()
    }));

    it('should not remove FROM_DATE and TO_DATE when TIME_SPAN changes to CUSTOM', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to CUSTOM, should keep FROM_DATE and TO_DATE
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_CUSTOM;
        scope.$digest();

        expect('FROM_DATE' in scope.advancedSearchObject).toBeTruthy()
        expect('TO_DATE' in scope.advancedSearchObject).toBeTruthy()
    }));

    it('should change TIME_SPAN to CUSTOM when FROM_DATE or TO_DATE changes', inject(function($q) {
        var deferred = $q.defer();
        var controller = createController();
        scope.$digest();

        scope.advancedSearchObject.FROM_DATE = 'A';
        scope.advancedSearchObject.TO_DATE = 'B';
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change FROM_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.FROM_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);

        //Change TIME_SPAN to TODAY
        scope.advancedSearchObject.TIME_SPAN = scope.DATE_TODAY;
        scope.$digest();

        //Change TO_DATE
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_TODAY);
        scope.advancedSearchObject.TO_DATE = 'UPDATED_VALUE';
        scope.$digest();
        expect(scope.advancedSearchObject.TIME_SPAN).toEqual(scope.DATE_CUSTOM);
    }));

    it('openSaveSearchModal should open modal with correct options set', inject(function($q, savedSearchService) {

        var saveModalSpy = spyOn(savedSearchService, "openSaveSearchModal").andCallFake(function(type, options){
            expect(type).toEqual("MOVEMENT");
            expect(options.dynamicSearch).toEqual(false);
            expect(options.selectedItems).toBeUndefined();
        });
        var controller = createController();
        scope.$digest();

        //Open save modal
        scope.openSaveSearchModal();
        expect(saveModalSpy).toHaveBeenCalled();
    }));

    it('selecting a vessel group should update ASSET_GROUP in advancedSearchObject', inject(function(SavedSearchGroup, SearchField) {

        var controller = createController();
        scope.$digest();

        //Mock vessel group
        var vesselGroup = new SavedSearchGroup();
        vesselGroup.searchFields = [new SearchField('TEST_KEY', 'TEST_VALUE')];
        expect(scope.advancedSearchObject['ASSET_GROUP']).toBeUndefined();

        //Select the vessel group
        scope.selectVesselGroup(vesselGroup);
        expect(scope.advancedSearchObject['ASSET_GROUP']).toEqual(vesselGroup.searchFields);

    }));

    it('should perform advanced movement search', inject(function(alertService, searchService) {
        var controller = createController();
        spyOn(alertService, 'hideMessage');
        spyOn(scope, 'resetSavedSearchDropdown');
        spyOn(searchService, 'resetPage');
        spyOn(searchService, 'resetSearchCriterias');
        spyOn(searchService, 'setDynamic');
        spyOn(searchService, 'setSearchCriteriasToAdvancedSearch');
        scope.searchfunc = jasmine.createSpy('searchfunc');

        scope.$digest();
        scope.performAdvancedMovementSearch();

        expect(alertService.hideMessage).toHaveBeenCalled();
        expect(searchService.resetPage).toHaveBeenCalled();
        expect(searchService.resetSearchCriterias).toHaveBeenCalled();
        expect(searchService.setDynamic).toHaveBeenCalledWith(false);
        expect(scope.resetSavedSearchDropdown).toHaveBeenCalled();
        expect(searchService.setSearchCriteriasToAdvancedSearch).toHaveBeenCalled();
        expect(scope.searchfunc).toHaveBeenCalled();
    }));

});