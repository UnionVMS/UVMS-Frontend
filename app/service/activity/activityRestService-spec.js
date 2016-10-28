describe('activityRestService', function() {
    var scope, callback, actRestServ, userPrefSpy, actListSpy, tripCronSpy, tripVesselSpy, tripMsgSpy, tripCatchesSpy, tripRepSpy;
    
    beforeEach(module('unionvmsWeb'));
  
    function createSpy(name, withData){
        var spy;
        if (withData){
            spy = jasmine.createSpy(name).andCallFake(function(data, callback){
                callback({
                    code: '200',
                    data: {}
                });
            }); 
        } else {
            spy = jasmine.createSpy(name).andCallFake(function(callback){
                callback({
                    code: '200',
                    data: {}
                });
            });
        }
        return spy
    }
    
    beforeEach(module(function($provide){
        //Spy on resolved promises
        callback = jasmine.createSpy('callback');
        
        $provide.value('activityRestFactory', {
            getUserPreferences: function() {
                return {
                    get: userPrefSpy
                };
            },
            getActivityList: function(){
                return {
                    get: actListSpy
                }
            },
            getTripCronology: function(){
                return {
                    get: tripCronSpy
                }
            },
            getTripVessel: function(){
                return {
                    get: tripVesselSpy
                }
            },
            getTripMessageCount: function(){
                return {
                    get: tripMsgSpy
                }
            },
            getTripCatches: function(){
                return {
                    get: tripCatchesSpy
                }
            },
            getTripReports: function(){
                return {
                    get: tripRepSpy
                }
            }
        });
    }));
    
    beforeEach(inject(function($httpBackend, $rootScope, activityRestService) {
        actRestServ = activityRestService;
        scope = $rootScope;
        
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should get user preferences for the activity module', function() {
        userPrefSpy = createSpy('userPrefSpy', false);
        actRestServ.getUserPreferences().then(callback);
        expect(userPrefSpy).toHaveBeenCalled();
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get a list of fishing activities', function(){
        actListSpy = createSpy('actListSpy', true);
        var payload = {
            pagination: {
                page: 1,
                listSize:25
            },
            sortKey: {
                field: 'ACTIVITY_TYPE',
                order: 'DESC'
            },
            searchCriteriaMap: {}
        }
        
        actRestServ.getActivityList(payload).then(callback);
        expect(actListSpy).toHaveBeenCalledWith(angular.toJson(payload), jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get the trip cronology', function(){
        tripCronSpy = createSpy('tripCronSpy', true);
        actRestServ.getTripCronology(1, 5).then(callback);
        expect(tripCronSpy).toHaveBeenCalledWith({id: 1, nrItems: 5}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get the vessel details through the trip id', function(){
        tripVesselSpy = createSpy('tripVesselSpy', true);
        actRestServ.getTripVessel('NOR-TRIP').then(callback);
        expect(tripVesselSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get messages count through the trip id', function(){
        tripMsgSpy = createSpy('tripMsgSpy', true);
        actRestServ.getTripMessageCount('NOR-TRIP').then(callback);
        expect(tripMsgSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get all catches of trip through its id', function(){
        tripCatchesSpy = createSpy('tripCatchesSpy', true);
        actRestServ.getTripCatches('NOR-TRIP').then(callback);
        expect(tripCatchesSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get all catches of trip through its id', function(){
        tripRepSpy = createSpy('tripRepSpy', true);
        actRestServ.getTripReports('NOR-TRIP').then(callback);
        expect(tripRepSpy).toHaveBeenCalledWith({id: 'NOR-TRIP'}, jasmine.any(Function), jasmine.any(Function));
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
});
