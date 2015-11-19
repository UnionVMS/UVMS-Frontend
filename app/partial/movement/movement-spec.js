describe('MovementCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, movementRestDeferred, movement;

    var mockManualPositionReportModal = {
        show: jasmine.createSpy('show')
    };

    var mockMovementRestService = {
        getMovement: function() {},
        searchMovements: function() {}
    };

    var mockLongPolling = {
        poll: function() {}
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
        'movement.table_header_source': 'source'
    };

    var mockLocale = {
        getString: function(code) {
            return strings[code] || 'fakeString';
        }
    }

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
        ctrl = $controller('MovementCtrl', {
            $scope: scope,
            ManualPositionReportModal: mockManualPositionReportModal,
            $stateParams: {
                id: '123'
            },
            movementRestService: mockMovementRestService,
            longPolling: mockLongPolling,
            locale: mockLocale
        });

        scope.selectedMovements = [m1, m2];
    }));

    it('should convert movement to manual position', inject(function() {
        movementRestDeferred.resolve(movement);
        scope.$digest();
        expect(mockManualPositionReportModal.show).toHaveBeenCalledWith({
            guid: 'guid123',
            speed: 14,
            course: 187,
            time: '2009-02-13 23:31:30',
            updatedTime: undefined,
            status: '101',
            archived: undefined,
            carrier: {
                cfr: 'cfr123',
                name: 'name123',
                externalMarking: 'ext123',
                ircs: 'ircs123',
                flagState: 'fs123'
            },
            position: {
                longitude: 78,
                latitude: 5
            }
        }, {readOnly: true});
    }));

    it('should start long-polling', inject(function(searchService) {
        expect(mockLongPolling.poll).toHaveBeenCalledWith("/movement/activity/movement", jasmine.any(Function), jasmine.any(Function));
    }));

    it('should search movements', inject(function(searchService, $q, SearchResultListPage) {
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
        spyOn(searchService, 'setPage');
        spyOn(scope, 'searchMovements');
        scope.gotoPage(76);
        expect(searchService.setPage).toHaveBeenCalledWith(76);
        expect(scope.searchMovements).toHaveBeenCalled();
    }));

    it('should clear selection', function() {
        scope.clearSelection();
        expect(scope.selectedMovements).toEqual([]);
    });

    it('should add to selection', inject(function(Movement) {
        var m3 = new Movement();
        scope.addToSelection(m3);
        expect(scope.selectedMovements).toEqual([m1, m2, m3]);
    }));

    it('should remove from selection', inject(function(Movement) {
        var m1 = new Movement();
        scope.selectedMovements = [m1];
        scope.removeFromSelection(m1);
        expect(scope.selectedMovements).toEqual([]);
    }));

    it('should show on map', inject(function(alertService) {
        spyOn(alertService, 'showInfoMessageWithTimeout');
        scope.editSelectionCallback({code: 'MAP'});
        expect(alertService.showInfoMessageWithTimeout).toHaveBeenCalledWith("See on map is not implemented yet. 2 movements were selected");
    }));

    it('should exprot as CSV', function() {
        spyOn(scope, 'exportAsCSVFile');
        scope.editSelectionCallback({code: 'EXPORT'});
        expect(scope.exportAsCSVFile).toHaveBeenCalledWith(true);
    });

    it('should inactivate', inject(function(alertService) {
        spyOn(alertService, 'showInfoMessageWithTimeout');
        scope.editSelectionCallback({code: 'INACTIVATE'});
        expect(alertService.showInfoMessageWithTimeout).toHaveBeenCalledWith("not implemented");
    }));

    it('should not do anything if no items selected', inject(function(alertService) {
        scope.selectedMovements = [];
        spyOn(alertService, 'showInfoMessageWithTimeout')
        scope.editSelectionCallback();
        expect(alertService.showInfoMessageWithTimeout).toHaveBeenCalledWith('no items selected');
    }));

    it('should export as CSV', inject(function(csvService) {

        function createVessel(suffix) {
            return { state: 'state' + suffix, externalMarking: 'ext' + suffix, ircs: 'ircs' + suffix, name: 'name' + suffix }
        };

        function createMovement(suffix) {
            return { status: '101', reportedSpeed: 10 + suffix, reportedCourse: 100 + suffix, reportedSpeedCourse: suffix, movemenType: suffix, source: suffix };
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
            ['state1', 'ext1', 'ircs1', 'name1', undefined, undefined, undefined, '101', '11 fakeString', 'undefined fakeString', 1, undefined, ''],
            ['state2', 'ext2', 'ircs2', 'name2', undefined, undefined, undefined, '101', '12 fakeString', 'undefined fakeString', 2, undefined, ''] 
        ];

        spyOn(csvService, 'downloadCSVFile');
        scope.exportAsCSVFile(true);
        expect(csvService.downloadCSVFile).toHaveBeenCalledWith(expectedCsv, expectedHeader, 'positionReports.csv');
    }));

});
