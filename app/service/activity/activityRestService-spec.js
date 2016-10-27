describe('activityRestService', function() {
    var scope, callback, actRestServ, userPrefSpy, actListSpy;
    
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
        //Mock successful responses
        userPrefSpy = createSpy('userPrefSpy', false);
        actListSpy = createSpy('actListSpy', true);
        
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
        actRestServ.getUserPreferences().then(callback);
        expect(userPrefSpy).toHaveBeenCalled();
        scope.$digest();
        expect(callback).toHaveBeenCalled();
    });
    
    it('should get a list of fishing activities', function(){
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

});
