describe('movementRestService', function() {

	var mockListRequest = {
		DTOForMovement: function() {
			return { 'length': '>15m' };
		}
	};

	var mockSavedSearch = {
		toMovementDTO: function() {
			return { 'length': '>15m' };
		}
	};

	var movementListPagedSpy, movementListSpy, singleMovementSpy, updateMovementSpy, savedSearchListSpy;
	var expectedPage;
	var callback;
	var getConfigSpy;
	var savedSearchGroup;

	var movementData = [{ guid: '123' }, { guid: '456' }, { guid: '789' }];

	var savedSearchGroupData = {
		id: '123',
		name: 'groupName',
		user: 'groupUser',
		dynamic: true,
		searchFields: [{
			key: 'groupSearchKey',
			value: 'groupSearchValue',
			type: 'MOVEMENT'
		}]
	};

	beforeEach(module('unionvmsWeb'))

	beforeEach(module(function($provide) {

		// Mocking the 200 OK response with paged movements
		movementListPagedSpy = jasmine.createSpy('movementListPagedSpy').andCallFake(function(data, callback) {
			callback({
				code: '200',
				data: {	currentPage: 3,	totalNumberOfPages: 87,	movement: movementData }
			});
		});

		// Mocking the 200 OK response with a single movement
		singleMovementSpy = jasmine.createSpy('singleMovementSpy').andCallFake(function(parms, callback) {
			callback({
				code: '200',
				data: movementData[0]
			});
		});

		// Mocking the 200 OK response with a list of movements
		movementListSpy = jasmine.createSpy('movementListSpy').andCallFake(function(data, callback) {
			callback({
				code: '200',
				data: movementData
			})
		});

		// Mocking the 200 OK response with data for any resource returning a single saved search
		singleSavedSearchCallbackSpy = jasmine.createSpy('singleSavedSearchCallbackSpy').andCallFake(function(data, callback) {
			callback({
				code: '200',
				data: savedSearchGroupData
			});
		});

		// Mocking the 200 OK response for lists of saved searches
		savedSearchListSpy = jasmine.createSpy('savedSearchListSpy').andCallFake(function(data, callback) {
			callback({
				code: '200',
				data: [savedSearchGroupData]
			});
		});

		// Mocking the 200 OK response for get config
		getConfigSpy = jasmine.createSpy('getConfigSpy').andCallFake(function(params, callback) {
			callback({
				code: '200',
				data: { configKey: 'configValue' }
			});
		});

		// Spy on resolved promises
		callback = jasmine.createSpy('callback');

		$provide.value('movementRestFactory', {
			getMovementList: function() {
				return {
					list: movementListPagedSpy
				};
			},
			getLatestMovementsByConnectIds: function() {
				return {
					list: movementListSpy
				};
			},
			getMovement: function() {
				return {
					get: singleMovementSpy
				};
			},
			getSavedSearches: function() {
				return {
					get: savedSearchListSpy
				};
			},
			savedSearch: function() {
				return {
					save: singleSavedSearchCallbackSpy,
					update: singleSavedSearchCallbackSpy,
					delete: singleSavedSearchCallbackSpy
				};
			},
			getConfigForMovements: function() {
				return {
					get: getConfigSpy
				};
			}
		});
	}));

	beforeEach(inject(function(Movement, SearchResultListPage, SavedSearchGroup) {
		var m1 = new Movement();
		m1.guid = '123';
		var m2 = new Movement();
		m2.guid = '456';
		var m3 = new Movement();
		m3.guid = '789';
		expectedPage = new SearchResultListPage([m1,m2,m3], 3, 87);

		savedSearchGroup = SavedSearchGroup.fromMovementDTO({
			id: '123',
			name: 'groupName',
			user: 'groupUser',
			dynamic: true,
			searchFields: [{
				key: 'groupSearchKey',
				value: 'groupSearchValue'
			}]
		});
	}));

	// Mock
	beforeEach(inject(function($httpBackend) {
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	it('should fetch movement list page', inject(function(movementRestService, $rootScope) {
		movementRestService.getMovementList(mockListRequest).then(callback);
		expect(movementListPagedSpy).toHaveBeenCalledWith({'length': '>15m'}, jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(expectedPage);
	}));

	it('should fetch latest movements by connect IDs', inject(function(movementRestService, $rootScope) {
		movementRestService.getLatestMovementsByConnectIds([1,2,3]).then(callback);
		expect(movementListSpy).toHaveBeenCalledWith([1,2,3], jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expectedPage.currentPage = 1;
		expectedPage.totalNumberOfPages = 1;
		expect(callback).toHaveBeenCalledWith(expectedPage);
	}));

	it('should get movement', inject(function(movementRestService, $rootScope) {
		movementRestService.getMovement('123').then(callback);
		expect(singleMovementSpy).toHaveBeenCalledWith({ id: '123' }, jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(expectedPage.items[0]);
	}));

	it('should get last movement', inject(function(movementRestService, $rootScope) {
		movementRestService.getLastMovement('123').then(callback);
		expect(movementListPagedSpy).toHaveBeenCalled();
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(expectedPage.items[0]);
	}));

	it('should get saved searches', inject(function(movementRestService, $rootScope, SavedSearchGroup) {
		movementRestService.getSavedSearches().then(callback);
		expect(savedSearchListSpy).toHaveBeenCalled();
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith([savedSearchGroup]);
	}));

	it('should create new saved search', inject(function(movementRestService, $rootScope) {
		movementRestService.createNewSavedSearch(savedSearchGroup).then(callback);
		expect(singleSavedSearchCallbackSpy).toHaveBeenCalledWith(savedSearchGroupData, jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(savedSearchGroup);
	}));

	it('should update saved search', inject(function(movementRestService, $rootScope) {
		movementRestService.updateSavedSearch(savedSearchGroup).then(callback);
		expect(singleSavedSearchCallbackSpy).toHaveBeenCalledWith(savedSearchGroupData, jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(savedSearchGroup);
	}));

	it('should delete saved search', inject(function(movementRestService, $rootScope) {
		movementRestService.deleteSavedSearch(savedSearchGroup).then(callback);
		expect(singleSavedSearchCallbackSpy).toHaveBeenCalledWith({	groupId: '123' }, jasmine.any(Function), jasmine.any(Function));
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith(savedSearchGroup);
	}));

	it('should get configuration', inject(function($rootScope, movementRestService) {
		movementRestService.getConfig().then(callback);
		expect(getConfigSpy).toHaveBeenCalled();
		$rootScope.$digest();
		expect(callback).toHaveBeenCalledWith({ configKey: 'configValue' });
	}));

});
