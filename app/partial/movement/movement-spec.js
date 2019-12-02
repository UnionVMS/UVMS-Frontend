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
describe('MovementCtrl', function() {

    var scope, createController, movementRestDeferred, movement;

    var mockPositionReportModal = {
        showReport: jasmine.createSpy('showReport'),
        showReportWithGuid: jasmine.createSpy('showReportWithGuid'),
    };

    var mockMovementRestService = {
        getMovement: function() {},
        searchMovements: function() {}
    };

    var mockLongPolling = {
        poll: function() {},
        cancel: function() {}
    };
    
    var strings = {
        'common.not_implemented': 'not implemented',
        'common.no_items_selected': 'no items selected',
        'movement.table_header_flag_state': 'flag state',
        'movement.table_header_external_marking': 'external marking',
        'movement.table_header_ircs': 'ircs',
        'movement.table_header_name': 'name',
        'movement.table_header_time': 'time',
        'movement.table_header_latitude': 'lat',
        'movement.table_header_longitude': 'lng',
        'movement.table_header_status': 'status',
        'movement.table_header_ms': 'measured speed',
        'movement.table_header_cs': 'calculated speed',
        'movement.table_header_course': 'course',
        'movement.table_header_movement_type': 'movement type',
        'movement.table_header_source': 'source',
        'movement.file_movements_csv': 'positionReports.csv'
    };

    var mockLocale = {
        getString: function(code) {
            return strings[code] || 'fakeString';
        }
    }

    beforeEach(module('unionvmsWeb', function($provide) {
        $provide.service('locale', function() {
            return mockLocale;
        });
    }));

    var m1, m2;

    beforeEach(inject(function($rootScope, $controller, $q, Movement, $httpBackend) {
        var json = {
            guid: 'guid123',
            connectId: 'connectId123',
            time: 1234567890,
            reportedSpeed: 14,
            reportedCourse: 187,
            status: '101',
            position: {
                latitude: 5,
                longitude: 78
            }
        };

        movement = Movement.fromJson(json);
        movement.vessel = {
            cfr: 'cfr123',
            name: 'name123',
            externalMarking: 'ext123',
            ircs: 'ircs123',
            state: 'fs123'
        };

        $httpBackend.whenGET(/^usm\//).respond({});
        $httpBackend.whenGET(/^i18n\//).respond({});
        $httpBackend.whenGET(/config/).respond({});

        scope = $rootScope.$new();
        m1 = new Movement();
        m2 = new Movement();

        movementRestDeferred = $q.defer();
        spyOn(mockMovementRestService, 'getMovement').andReturn(movementRestDeferred.promise);
        spyOn(mockLongPolling, 'poll');
        createController = function(stateparams){
            if(angular.isUndefined(stateparams)){
                stateparams = {};
            }
            return $controller('MovementCtrl', {
                $scope: scope,
                PositionReportModal: mockPositionReportModal,
                $stateParams: stateparams,
                movementRestService: mockMovementRestService,
                longPolling: mockLongPolling,
                locale: mockLocale
            });
        }

    }));

    it('should open position report modal when id paramter is provided', inject(function() {
        var ctrl = createController({id:'TEST'});
        scope.$digest();
        expect(mockPositionReportModal.showReportWithGuid).toHaveBeenCalledWith('TEST');
    }));

    it('should start long-polling', inject(function(searchService) {
        var ctrl = createController();
        expect(mockLongPolling.poll).toHaveBeenCalledWith("/movement/activity/movement", jasmine.any(Function), jasmine.any(Function));
    }));

    it('should search movements', inject(function(searchService, $q, SearchResultListPage) {
        var ctrl = createController();
        var deferred = $q.defer();
        spyOn(searchService, 'searchMovements').andReturn(deferred.promise);
        spyOn(scope, 'clearSelection');
        spyOn(scope.currentSearchResults, 'clearErrorMessage');
        spyOn(scope.currentSearchResults, 'setLoading');

        scope.searchMovements();

        expect(searchService.searchMovements).toHaveBeenCalled();
        expect(scope.clearSelection).toHaveBeenCalled();
        expect(scope.currentSearchResults.clearErrorMessage).toHaveBeenCalled();
        expect(scope.currentSearchResults.setLoading).toHaveBeenCalled();

        var page = new SearchResultListPage();
        deferred.resolve(page);
        spyOn(scope.currentSearchResults, 'updateWithNewResults');

        scope.$digest();
        expect(scope.currentSearchResults.updateWithNewResults).toHaveBeenCalledWith(page);
    }));

    it('should go to page', inject(function(searchService) {
        var ctrl = createController();
        spyOn(searchService, 'setPage');
        spyOn(scope, 'searchMovements');
        scope.gotoPage(76);
        expect(searchService.setPage).toHaveBeenCalledWith(76);
        expect(scope.searchMovements).toHaveBeenCalled();
    }));

    it('should clear selection', function() {
        var ctrl = createController();
        scope.clearSelection();
        expect(scope.selectedMovements).toEqual([]);
    });

    it('should add to selection', inject(function(Movement) {
        var ctrl = createController();
        scope.selectedMovements = [m1, m2];
        expect(scope.selectedMovements).toEqual([m1, m2]);
        var m3 = new Movement();
        scope.addToSelection(m3);
        expect(scope.selectedMovements).toEqual([m1, m2, m3]);
    }));

    it('should remove from selection', inject(function(Movement) {
        var ctrl = createController();
        var m1 = new Movement();
        scope.selectedMovements = [m1];
        scope.removeFromSelection(m1);
        expect(scope.selectedMovements).toEqual([]);
    }));

    it('should show positions on map', inject(function(Movement, PositionsMapModal) {
        var ctrl = createController();
        scope.selectedMovements = [m1, m2];
        spyOn(PositionsMapModal, 'show');
        scope.editSelectionCallback({code: 'MAP'});
        var positionReport = new Movement();
        scope.selectedMovements.push(positionReport);
        expect(PositionsMapModal.show).toHaveBeenCalledWith(scope.selectedMovements);
    }));

    it('should export as CSV', function() {
        var ctrl = createController();
        scope.selectedMovements = [m1, m2];
        spyOn(scope, 'exportAsCSVFile');
        scope.editSelectionCallback({code: 'EXPORT'});
        expect(scope.exportAsCSVFile).toHaveBeenCalledWith(true);
    });

    it('should not do anything if no items selected', inject(function(alertService) {
        var ctrl = createController();
        scope.selectedMovements = [];
        spyOn(alertService, 'showInfoMessageWithTimeout')
        scope.editSelectionCallback();
        expect(alertService.showInfoMessageWithTimeout).toHaveBeenCalledWith('no items selected');
    }));

    it('should export as CSV with correct data', inject(function(csvService, Vessel, unitScaleFactors) {
        var ctrl = createController();
        scope.selectedMovements = [m1, m2];

        spyOn(unitScaleFactors, 'getSpeedScaleFactor').andReturn(1);

        function createVessel(suffix) {
            var vessel = new Vessel();
            vessel.flagStateCode  = 'state' + suffix;
            vessel.externalMarking = 'ext' + suffix;
            vessel.ircs = 'ircs' + suffix;
            vessel.name = 'name' + suffix;
            return vessel;
        };

        function createMovement(suffix) {
            return { status: '101', reportedSpeed: 10 + suffix, reportedCourse: 100 + suffix, calculatedSpeed: suffix, movemenType: suffix, source: suffix, longitude: 11, latitude: 58 };
        };

        scope.selectedMovements = [1,2].map(function(suff) {
            return {vessel: createVessel(suff),  movement: createMovement(suff)};
        });

        var expectedHeader = [
            'flag state',
            'external marking',
            'ircs',
            'name',
            'time',
            'lat',
            'lng',
            'status',
            'measured speed',
            'calculated speed',
            'course',
            'movement type',
            'source'
        ];

        var expectedCsv = [
            ['state1', 'ext1', 'ircs1', 'name1', '', '58.000', '11.000', '101', '11.00 fakeString', '1.00 fakeString', '101°', '', 'fakeString'],
            ['state2', 'ext2', 'ircs2', 'name2', '', '58.000', '11.000', '101', '12.00 fakeString', '2.00 fakeString', '102°', '', 'fakeString']
        ];

        spyOn(csvService, 'downloadCSVFile').andCallFake(function(data, header, name){
            expect(data).toEqual(expectedCsv, "Incorrect data");
            expect(header).toEqual(expectedHeader, "Incorrect header");
            expect(name).toEqual('positionReports.csv');
        });
        scope.exportAsCSVFile(true);
        expect(csvService.downloadCSVFile).toHaveBeenCalled();
    }));

});