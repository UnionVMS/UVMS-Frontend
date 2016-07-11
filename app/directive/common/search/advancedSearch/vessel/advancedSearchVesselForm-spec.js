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