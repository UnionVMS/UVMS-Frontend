describe('activityService', function() {
    var $q, actServ, mockActRestServ;
    var listSize = 25;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(function(){
        mockActRestServ = jasmine.createSpyObj('activityRestService', ['getUserPreferences', 'getActivityList']);
        
        module(function($provide){
            $provide.value('activityRestService', mockActRestServ);
        });
    });
    
    beforeEach(inject(function(activityService, $httpBackend, _$q_){
        $q = _$q_;
        actServ = activityService;
  
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
  
    }));
    
    function buildMocks(){
        mockActRestServ.getUserPreferences.andCallFake(function(){
            var deferred = $q.defer();
            deferred.resolve('Got User Preferences');
            return deferred.promise;

        });
        
        mockActRestServ.getActivityList.andCallFake(function(){
            var deferred = $q.defer();
            actServ.reportsList.pagination.totalPageCount = 10;
            actServ.activities = ['1', '2'];
            deferred.resolve('Got Activities List');
            return deferred.promise;
        });
        
    }
    
    function mockServiceProperties(){
        actServ.activities = ['1', '2', '3'];
        actServ.overview = {name: 'overview'};
        actServ.details = {name: 'detais'};
        
        actServ.reportsList = {
            isLoading: false,
            hasError: false,
            searchObject: {report: 'test'},
            tableState: {
                pagination: {
                    start: 0,
                    number: listSize,
                    numberOfPages: 10
                }
            },
            pagination: {
                page: 1,
                listSize: listSize,
                totalPageCount: 10
            },
            sortKey: {
                field: 'report',
                order: 'ASC',
            }
        };
    }
    
    function getInitialReportsListDef(){
        var data = {
            isLoading: false,
            hasError: false,
            searchObject: {},
            tableState: undefined,
            pagination: {
                page: 1,
                listSize: listSize,
                totalPageCount: undefined
            },
            sortKey: {
                field: undefined,
                order: undefined,
            }
        };
        
        return data;
    }

    it('should be properly initialized', function() {
        expect(actServ).toBeDefined();
        expect(actServ.breadcrumbPages).toEqual(jasmine.any(Array));
        expect(actServ.breadcrumbPages.length).toBe(3);
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.details).toEqual(jasmine.any(Object));
        expect(actServ.reportsList).toEqual(jasmine.any(Object));
    });
    
    it('should get activity list', function(){
        buildMocks();
        spyOn(actServ, 'clearAttributeByType');
        actServ.getActivityList();
        
        expect(actServ.clearAttributeByType).toHaveBeenCalled();
        expect(actServ.activities.length).toBe(2);
        
        var pag = {
            page: 1,
            listSize: 25,
            totalPageCount: 10
        };
        expect(actServ.reportsList.pagination).toEqual(pag);
    });
    
    it('should reset the state of the service properties', function(){
        mockServiceProperties();
        actServ.reset();
        
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
        expect(actServ.details).toEqual(jasmine.any(Object));
        expect(actServ.details).toEqual({});
        expect(actServ.reportsList).toEqual(jasmine.any(Object));
        expect(actServ.reportsList).toEqual(getInitialReportsListDef());
    });
    
    it('should clear activities by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('activities');
        
        expect(actServ.activities).toEqual(jasmine.any(Array));
        expect(actServ.activities.length).toEqual(0);
    });
    
    it('should clear overview by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('overview');
        
        expect(actServ.overview).toEqual(jasmine.any(Object));
        expect(actServ.overview).toEqual({});
    });
    
    it('should clear details by specifying the type', function(){
        mockServiceProperties();
        actServ.clearAttributeByType('details');
        
        expect(actServ.details).toEqual(jasmine.any(Object));
        expect(actServ.details).toEqual({});
    });
    
    it('should reset the reports list tableState', function(){
        mockServiceProperties();
        actServ.resetReportsListTableState();
        
        var initialState = getInitialReportsListDef();
        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
        
        var expectedTableState = {
            start: 0,
            number: listSize,
            numberOfPages: 1
        };
        expect(actServ.reportsList.tableState.pagination).toEqual(expectedTableState);
    });
    
    it('should reset the reports list tableState but not the smartTable state', function(){
        mockServiceProperties();
        actServ.reportsList.tableState = undefined;
        actServ.resetReportsListTableState();
        
        var initialState = getInitialReportsListDef();
        expect(actServ.reportsList.pagination).toEqual(initialState.pagination);
        
        var expectedTableState = {
            start: 0,
            number: listSize,
            numberOfPages: 1
        };
        expect(actServ.reportsList.tableState).not.toBeDefined();
    });
    
    it('should get activity user preferences and set visibility settings', function(){
        buildMocks();
        actServ.getUserPreferences();
        expect(mockActRestServ.getUserPreferences).toHaveBeenCalled();
    });

});
