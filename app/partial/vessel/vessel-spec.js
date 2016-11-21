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
describe('VesselCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, createController;

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        createController = function(stateparams){
            if(angular.isUndefined(stateparams)){
                stateparams = {};
            }
            return $controller('VesselCtrl', {$scope: scope, $stateParams:stateparams});
        }
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));



    it('should search for vessels on init', inject(function(Vessel, $q, searchService) {
        var deferred = $q.defer();
        var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);
        var controller = createController();

        expect(searchVesselSpy).toHaveBeenCalled();
    }));

    it('should get vessel by id on init if state param id is available', inject(function(Vessel, $q, searchService, vesselRestService) {
        var deferred = $q.defer();
        var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);

        var deferred2 = $q.defer();
        var foundVessel = new Vessel();
        deferred2.resolve(foundVessel);
        var getVesselByIdSpy = spyOn(vesselRestService, "getVessel").andReturn(deferred2.promise);

        var controller = createController({id:'TEST'});
        expect(scope.waitingForVesselDataResponse).toBeTruthy();
        expect(scope.isVisible.vesselForm).toBeTruthy();
        expect(scope.isVisible.search).toBeFalsy();
        scope.$digest();

        //getVessel should have been called
        expect(getVesselByIdSpy).toHaveBeenCalled();
    }));

    it('should get vessel by id on init if state param id is available should handle error', inject(function(Vessel, $q, searchService, vesselRestService, alertService) {
        var deferred = $q.defer();
        var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);

        var deferred2 = $q.defer();
        deferred2.reject("ERROR");
        var getVesselByIdSpy = spyOn(vesselRestService, "getVessel").andReturn(deferred2.promise);
        var showErrorAlertSpy = spyOn(alertService, "showErrorMessage");

        var controller = createController({id:'TEST'});
        scope.$digest();

        //getVessel should have been called
        expect(getVesselByIdSpy).toHaveBeenCalled();
        //alertService.showErrorMessage should have been called after failing to get the vessel
        expect(showErrorAlertSpy).toHaveBeenCalled();
    }));

    it('allowedToEditVessel should return true when user has feature manageVessels', inject(function(Vessel, userService) {
        var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(true);
        var controller = createController();

        expect(scope.allowedToEditVessel()).toEqual(true);

        expect(userAllowedSpy).toHaveBeenCalledWith('manageVessels', 'Union-VMS', true);
    }));

    it('allowedToEditVessel should return false  when user is missing the feature manageVessels', inject(function(Vessel, userService) {
        var userAllowedSpy = spyOn(userService, "isAllowed").andReturn(false);
        var controller = createController();

        expect(scope.allowedToEditVessel()).toEqual(false);

        expect(userAllowedSpy).toHaveBeenCalledWith('manageVessels', 'Union-VMS', true);
    }));

    it('selecting save search in edit selection dropdown should open save modal', inject(function(Vessel, savedSearchService) {
        var saveModalSpy = spyOn(savedSearchService, "openSaveSearchModal").andCallFake(function(type, options){
            expect(type).toEqual("VESSEL");
            expect(options.dynamicSearch).toEqual(false);
            expect(options.selectedItems.length).toEqual(1);
        });
        var controller = createController();

        scope.selectedVessels = [new Vessel()];
        var selection = {code:'SAVE'};
        scope.editSelectionCallback(selection);

        expect(saveModalSpy).toHaveBeenCalled();
    }));


    it('selecting export in edit selection dropdown should export as csv', inject(function(Vessel) {
        var controller = createController();
        var exportSpy = spyOn(scope, "exportVesselsAsCSVFile").andCallFake(function(onlySelectedItems){
            expect(onlySelectedItems).toEqual(true);
        });

        scope.selectedVessels = [new Vessel()];
        var selection = {code:'EXPORT'};
        scope.editSelectionCallback(selection);

        expect(exportSpy).toHaveBeenCalled();
    }));

    it('exportVesselsAsCSVFile should call service for exporting to csv file', inject(function(Vessel, csvService) {
        var controller = createController();

        //Create fake result
        var vessel = new Vessel();
        scope.currentSearchResults.items.push(vessel);

        var csvSpy = spyOn(csvService, "downloadCSVFile").andCallFake(function(data, header, filename){
            expect(filename).toEqual('assets.csv');
            expect(data.length).toEqual(1);
            expect(header.length).toBeGreaterThan(1, "Should be at least 1 column");
            expect(header.length).toEqual(data[0].length, "Header and data should have equal number of columns");
        });

        scope.exportVesselsAsCSVFile(false);

        expect(csvSpy).toHaveBeenCalled();
    }));


    describe('search vessels', function() {

        it('searchVessels should get vessels from the server', inject(function($rootScope, $q, Vessel, searchService, VesselListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchVessels").andReturn(deferred.promise);
            var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);
            var vessel = new Vessel();
            vessel.name = "ABCD-123";
            var items = [vessel];
            var results = new VesselListPage(items, 1, 10);
            deferred.resolve(results);

            var controller = createController();

            scope.searchVessels();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(searchVesselSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items[0]).toEqual(vessel);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).toEqual('');
        }));


        it('searchVessels should handle search error', inject(function($rootScope, $q, Vessel, searchService, locale, VesselListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchVessels").andReturn(deferred.promise);
            var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);
            var localeSpy = spyOn(locale, "getString").andReturn("TRANSLATED_TEXT");
            deferred.reject();

            var controller = createController();

            scope.searchVessels();
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();
            expect(searchSpy).toHaveBeenCalled();
            expect(searchVesselSpy).toHaveBeenCalled();
            expect(scope.currentSearchResults.items.length).toEqual(0);
            expect(scope.currentSearchResults.loading).toBeFalsy();
            expect(scope.currentSearchResults.errorMessage).not.toEqual('');
        }));

        it('gotoPage should update search page and do a new search', inject(function($rootScope, $q, Vessel, searchService, VesselListPage) {

            var deferred = $q.defer();
            var searchSpy = spyOn(searchService, "searchVessels").andReturn(deferred.promise);
            var searchVesselSpy = spyOn(searchService, "searchLatestMovements").andReturn(deferred.promise);
            var setPageSpy = spyOn(searchService, "setPage");
            deferred.reject();

            var controller = createController();

            var page = 4;
            scope.gotoPage(page);
            expect(scope.currentSearchResults.loading).toBeTruthy();
            scope.$digest();

            expect(setPageSpy).toHaveBeenCalledWith(page);
            expect(searchSpy).toHaveBeenCalled();
            expect(searchVesselSpy).toHaveBeenCalled();
        }));
    });


    it('should clean up on scope destroy', inject(function($rootScope, alertService, searchService) {
        var controller = createController();
        var alertSpy = spyOn(alertService, "hideMessage");
        scope.$destroy();
        expect(alertSpy).toHaveBeenCalled();
    }));

});
