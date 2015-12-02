describe('ManualPositionReportModalCtrl', function() {

	var scope, ctrl;

	beforeEach(module('unionvmsWeb'));

	var getPositions;

	var strings = {
		'movement.table_header_external_marking': 'fakeMarking',
		'movement.table_header_ircs': 'fakeIrcs',
		'movement.table_header_cfr': 'fakeCfr',
		'movement.table_header_name': 'fakeName',
		'movement.table_header_time': 'fakeTime',
		'movement.table_header_latitude': 'fakeLatitude',
		'movement.table_header_longitude': 'fakeLongitude',
		'movement.table_header_measured_speed': 'fakeSpeed',
		'movement.table_header_course': 'fakeCourse'
	};

	var mockLocale = {
		getString: function(code) {
			return strings[code] || 'fakeString';
		}
	};

	var mockLongPolling = {
		poll: function() {}
	};

	var mockSearchService;

    beforeEach(inject(function($rootScope, $controller, ManualPosition, $httpBackend, $q) {

        getPositions = function(suffixes) {
            return suffixes.map(function(suffix) {
                var p = new ManualPosition();

                p.carrier = {
                    cfr: 'cfr' + suffix,
                    externalMarking: 'ext' + suffix,
                    ircs: 'ircs' + suffix,
                    name: 'name' + suffix
                },
                p.course = suffix % 360,
                p.guid = suffix,
                p.speed = suffix % 15,
                p.position = {
                    latitude: suffix % 90,
                    longitude: suffix % 180
                },
                p.time = 1234567890
                return p;
            });
        };

        // Block backend REST calls
        $httpBackend.whenGET(/^usm\//).respond({});
        $httpBackend.whenGET(/^i18n\//).respond({});
        $httpBackend.whenGET(/config/).respond({});

    	mockSearchService = {
			searchManualPositions: function() {
				return $q.defer().promise;
			},
			reset: function() {}
		};

		spyOn(mockLongPolling, 'poll');

        scope = $rootScope.$new();
        ctrl = $controller('ManualPositionReportsCtrl', {
            $scope: scope,
            locale: mockLocale,
            searchService: mockSearchService,
            longPolling: mockLongPolling
		});
    }));

    var getSomeManualPositions;

    it('should start long-polling on init', inject(function() {
    	expect(mockLongPolling.poll).toHaveBeenCalledWith("/movement/activity/movement/manual", jasmine.any(Function));
    }));

    it('should remove a report from search results', inject(function(ManualPosition) {
    	scope.currentSearchResults.items = getPositions([123,149]);
    	expect(scope.currentSearchResults.items.length).toBe(2);
    	scope.removeFromSearchResults(scope.currentSearchResults.items[1]);
    	expect(scope.currentSearchResults.items.length).toBe(1);
    	scope.removeFromSearchResults(new ManualPosition());
    	expect(scope.currentSearchResults.items.length).toBe(1);
    }));

    it('should show confirmation dialog on delete, and remove from search results', inject(function(ManualPosition, confirmationModal, manualPositionRestService, $q) {
    	var pos = new ManualPosition();
    	spyOn(manualPositionRestService, 'deleteManualPositionReport').andReturn($q.defer().promise);
    	spyOn(confirmationModal, 'open').andCallFake(function(fn, options) {
    		fn();
    	});

		scope.deletePosition(pos);
		expect(confirmationModal.open).toHaveBeenCalled();
		expect(manualPositionRestService.deleteManualPositionReport).toHaveBeenCalledWith(pos);
    }));

    it('should open modal with existing position', inject(function(ManualPosition, ManualPositionReportModal, $q) {
    	var pos = new ManualPosition();

    	var deferred = $q.defer();
        var modalInstance = {
            result : deferred.promise
        };
    	spyOn(ManualPositionReportModal, 'show').andReturn(modalInstance);
    	scope.editPosition(pos, false);

    	expect(ManualPositionReportModal.show).toHaveBeenCalled();

    	deferred.resolve({
    		addAnother: true,
    		ircs: 'ircs123',
    		cfr: 'cfr123',
    		externalMarking: 'ext123',
    		name: 'name123'
    	});

    	var expectedPosition = new ManualPosition();
    	expectedPosition.carrier.ircs = 'ircs123';
    	expectedPosition.carrier.cfr = 'cfr123';
    	expectedPosition.carrier.externalMarking = 'ext123';
    	expectedPosition.carrier.name = 'name123';

    	spyOn(scope, 'editPosition');
    	scope.$digest();
    	expect(scope.editPosition).toHaveBeenCalledWith(expectedPosition, true);
    }));

    it('should open modal with a new position', inject(function(ManualPosition, ManualPositionReportModal, $q) {
        var modalInstance = {
            result : $q.defer().promise
        };
    	spyOn(ManualPositionReportModal, 'show').andReturn(modalInstance);
    	scope.editPosition(undefined, false);
    	expect(ManualPositionReportModal.show).toHaveBeenCalledWith(new ManualPosition(), {
    		addAnother: false,
    		reloadFunction: scope.searchManualPositions
    	});
    }));

    it('should search manual positions', inject(function($q, SearchResultListPage, longPolling) {
    	var deferred = $q.defer();
    	spyOn(mockSearchService, 'searchManualPositions').andReturn(deferred.promise);
    	spyOn(scope.currentSearchResults, 'setLoading');

    	scope.searchManualPositions();
    	expect(scope.currentSearchResults.setLoading).toHaveBeenCalledWith(true);
    	expect(mockSearchService.searchManualPositions).toHaveBeenCalled();

    	var ps = getPositions([123,149]);
    	var page = new SearchResultListPage(ps, 1, 1);
    	spyOn(scope.currentSearchResults, 'updateWithNewResults');
    	deferred.resolve(page);
    	scope.$digest();

		expect(scope.currentSearchResults.updateWithNewResults).toHaveBeenCalledWith(page);
    }));

    it('should show error if search fails', inject(function($q, SearchResultListPage, longPolling) {
    	var deferred = $q.defer();
    	spyOn(mockSearchService, 'searchManualPositions').andReturn(deferred.promise);
    	spyOn(scope.currentSearchResults, 'setLoading');

    	scope.searchManualPositions();
    	expect(scope.currentSearchResults.setLoading).toHaveBeenCalledWith(true);
    	expect(mockSearchService.searchManualPositions).toHaveBeenCalled();

    	spyOn(scope.currentSearchResults, 'updateWithNewResults');
    	spyOn(scope.currentSearchResults, 'setErrorMessage');
    	deferred.reject();
    	scope.$digest();

    	expect(scope.currentSearchResults.setLoading).toHaveBeenCalledWith(false);
		expect(scope.currentSearchResults.updateWithNewResults).not.toHaveBeenCalled();
		expect(scope.currentSearchResults.setErrorMessage).toHaveBeenCalledWith('fakeString');
    }));

    it('should clear selection', inject(function() {
    	scope.selectedMovements = getPositions([123,149]);
    	expect(scope.selectedMovements.length).toBe(2);
    	scope.clearSelection();
    	expect(scope.selectedMovements.length).toBe(0);
    }));


    it('should add to selection', inject(function(ManualPosition) {
    	scope.selectedMovements = getPositions([123,149]);
    	expect(scope.selectedMovements.length).toBe(2);
    	scope.addToSelection(new ManualPosition());
    	expect(scope.selectedMovements.length).toBe(3);
    }));

    it('should remove from selection', inject(function(ManualPosition) {
    	scope.selectedMovements = getPositions([123,149]);
    	expect(scope.selectedMovements.length).toBe(2);
    	scope.removeFromSelection(scope.selectedMovements[1]);
    	expect(scope.selectedMovements.length).toBe(1);
    }));

    it('should clear selection if all checked', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "123";
    	var p2 = new ManualPosition();
    	p2.guid = "149";
    	scope.currentSearchResults.items = [p1, p2];

    	spyOn(scope, 'isAllChecked').andReturn(true);
    	spyOn(scope, 'clearSelection');
    	spyOn(scope, 'addToSelection');

    	scope.checkAll();
    	expect(scope.clearSelection).toHaveBeenCalled();
    	expect(scope.addToSelection).not.toHaveBeenCalled();
    }));

    it('should select all if not all checked', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "123";
    	var p2 = new ManualPosition();
    	p2.guid = "149";
    	scope.currentSearchResults.items = [p1, p2];

    	spyOn(scope, 'isAllChecked').andReturn(false);
    	spyOn(scope, 'clearSelection');
    	spyOn(scope, 'addToSelection');

    	scope.checkAll();
    	expect(scope.clearSelection).toHaveBeenCalled();
    	expect(scope.addToSelection).toHaveBeenCalledWith(p1);
    	expect(scope.addToSelection).toHaveBeenCalledWith(p2);
    }));

    it('should select item', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	p1.Selected = false;
    	scope.selectedMovements = [];

    	spyOn(scope, 'addToSelection');
    	scope.checkItem(p1);
    	expect(p1.Selected).toBe(true);
    	expect(scope.addToSelection).toHaveBeenCalledWith(p1);
    }));

    it('should deselect item', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	p1.Selected = true;
    	scope.selectedMovements = [p1];

    	spyOn(scope, 'removeFromSelection');
    	scope.checkItem(p1);
    	expect(p1.Selected).toBe(false);
    	expect(scope.removeFromSelection).toHaveBeenCalledWith(p1);
    }));

    it('should return true if all position are selected', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	var p2 = new ManualPosition();
    	p2.guid = "xyz789";

    	scope.currentSearchResults.items = [p1, p2];
    	scope.selectedMovements = [p1, p2];
    	expect(scope.isAllChecked()).toBe(true);
    }));

    it('should return false if not all position are selected', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	var p2 = new ManualPosition();
    	p2.guid = "xyz789";

    	scope.currentSearchResults.items = [p1, p2];
    	scope.selectedMovements = [p1];
    	expect(scope.isAllChecked()).toBe(false);
    }));

    it('should return false if no positions are selected', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	var p2 = new ManualPosition();
    	p2.guid = "xyz789";

    	scope.currentSearchResults.items = [p1, p2];
    	scope.selectedMovements = [];
    	expect(scope.isAllChecked()).toBe(false);
    }));

    it('should return false if no search results are defined', inject(function(ManualPosition) {
    	scope.currentSearchResults.items = undefined;
    	expect(scope.isAllChecked()).toBe(false);
    }));

    it('should return true if position is selceted', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	var p2 = new ManualPosition();
    	p2.guid = "xyz789";

    	scope.selectedMovements = [p1, p2];
    	expect(scope.isChecked(p1)).toBe(true);
    }));

    it('should return false if position is not selected', inject(function(ManualPosition) {
    	var p1 = new ManualPosition();
    	p1.guid = "abc123";
    	var p2 = new ManualPosition();
    	p2.guid = "xyz789";

    	scope.selectedMovements = [p1];
    	expect(scope.isChecked(p2)).toBe(false);
    }));

	it('should export data for CSV', inject(function(csvService) {
		scope.currentSearchResults.items = getPositions([1, 2, 3]);
		spyOn(csvService, 'downloadCSVFile').andCallFake(function(data, header, filename) {
			expect(header).toEqual(['fakeMarking', 'fakeIrcs', 'fakeCfr', 'fakeName', 'fakeTime', 'fakeLatitude', 'fakeLongitude', 'fakeSpeed', 'fakeCourse']);
			expect(filename).toEqual('manualPositionReports.csv');
			expect(data).toEqual([
				['ext1', 'ircs1', 'cfr1', 'name1', '13 Feb 2009 23:31 UTC', '1.000', '1.000', 1, 1],
				['ext2', 'ircs2', 'cfr2', 'name2', '13 Feb 2009 23:31 UTC', '2.000', '2.000', 2, 2],
				['ext3', 'ircs3', 'cfr3', 'name3', '13 Feb 2009 23:31 UTC', '3.000', '3.000', 3, 3]
			]);
		});

		scope.exportAsCSVFile(false);
		expect(csvService.downloadCSVFile).toHaveBeenCalled();
	}));

	it('should export selected data for CSV', inject(function(csvService) {
		scope.selectedMovements = getPositions([1, 2, 3]);
		spyOn(csvService, 'downloadCSVFile').andCallFake(function(data, header, filename) {
			expect(header).toEqual(['fakeMarking', 'fakeIrcs', 'fakeCfr', 'fakeName', 'fakeTime', 'fakeLatitude', 'fakeLongitude', 'fakeSpeed', 'fakeCourse']);
			expect(filename).toEqual('manualPositionReports.csv');
			expect(data).toEqual([
				['ext1', 'ircs1', 'cfr1', 'name1', '13 Feb 2009 23:31 UTC', '1.000', '1.000', 1, 1],
				['ext2', 'ircs2', 'cfr2', 'name2', '13 Feb 2009 23:31 UTC', '2.000', '2.000', 2, 2],
				['ext3', 'ircs3', 'cfr3', 'name3', '13 Feb 2009 23:31 UTC', '3.000', '3.000', 3, 3]
			]);
		});

		scope.exportAsCSVFile(true);
		expect(csvService.downloadCSVFile).toHaveBeenCalled();
	}));

});