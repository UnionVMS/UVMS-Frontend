describe('fishingActivityNavigator', function() {
    beforeEach(module('unionvmsWeb'));
    
    var scope,compile,mockTimeline,mockFishServ,nav;
    
    beforeEach(function(){
        mockTimeline = {
            reports: [{
                id: 0,
                srcType: 'FISHING_OPERATION'
            }, {
                id: 1,
                srcType: 'FISHING_OPERATION'
            }, {
                id: 2,
                srcType: 'FISHING_OPERATION'
            }],
            currentItemIdx: undefined,
            previousItem: {
                idx: undefined,
                type: undefined
            },
            nextItem: {
                idx: undefined,
                type: undefined
            },
            setCurrentPreviousAndNextItem: function(){
                return true;
            }
        };
        
        mockFishServ = jasmine.createSpyObj('fishingActivityService', ['resetActivity', 'getData']);
        
        module(function($provide){
            $provide.value('tripReportsTimeline', mockTimeline);
            $provide.value('fishingActivityService', mockFishServ);
        });
    });
    
    beforeEach(inject(function($rootScope,$compile,$injector) {
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        $httpBackend.whenGET(/mock/).respond({data:[]});
        $httpBackend.whenPOST(/mock/).respond({data:[]});
        
        scope = $rootScope.$new();
        compile = $compile;
    }));
    
    afterEach(function(){
        angular.element('fishing-activity-navigator').remove();
    });
    
    function builMocks() {
        mockFishServ.resetActivity.andCallFake(function(){
            return true;
        });
        
        mockFishServ.getData.andCallFake(function(){
            return true;
        });
    }
    
    it('should render next arrow navigation only', function() {
        mockTimeline.currentItemIdx = 0;
        mockTimeline.nextItem = {
            idx: 1,
            type: 'FISHING_OPERATION'
        };
        
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('.slider-left').length).toBe(0);
        expect(angular.element('.slider-right').length).toBe(1);
    });
    
    it('should render previous arrow navigation only', function() {
        mockTimeline.currentItemIdx = 2;
        mockTimeline.previousItem = {
            idx: 1,
            type: 'FISHING_OPERATION'
        };
        
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('.slider-left').length).toBe(1);
        expect(angular.element('.slider-right').length).toBe(0);
    });
    
    it('should render previous and next arrow navigation only', function() {
        mockTimeline.currentItemIdx = 1;
        mockTimeline.previousItem = {
            idx: 0,
            type: 'FISHING_OPERATION'
        };
        mockTimeline.nextItem = {
            idx: 2,
            type: 'FISHING_OPERATION'
        }
        
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('.slider-left').length).toBe(1);
        expect(angular.element('.slider-right').length).toBe(1); 
    });
    
    it('should navigate to the previous item', function(){
        builMocks();
        spyOn(mockTimeline, 'setCurrentPreviousAndNextItem');
        mockTimeline.currentItemIdx = 2;
        mockTimeline.previousItem = {
            idx: 1,
            type: 'FISHING_OPERATION'
        };
        
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        
        angular.element('.container-left').trigger('click');
        
        expect(mockFishServ.resetActivity).toHaveBeenCalled();
        expect(mockTimeline.setCurrentPreviousAndNextItem).toHaveBeenCalledWith(mockTimeline.reports[1]);
    });
    
    it('should navigate to the next item', function(){
        builMocks();
        spyOn(mockTimeline, 'setCurrentPreviousAndNextItem');
        mockTimeline.currentItemIdx = 0;
        mockTimeline.nextItem = {
            idx: 1,
            type: 'FISHING_OPERATION'
        };
        
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        
        angular.element('.container-right').trigger('click');
        
        expect(mockFishServ.resetActivity).toHaveBeenCalled();
        expect(mockTimeline.setCurrentPreviousAndNextItem).toHaveBeenCalledWith(mockTimeline.reports[1]);
    });
    
    it('should not navigate to any item if the specified index is out of bounds', function(){
        mockTimeline.currentItemIdx = 2;
        nav = compile('<fishing-activity-navigator partial="partial/spatial/tripsPanel/tripDeparturePanel/tripDeparturePanel.html"></fishing-activity-navigator>')(scope);
        nav.appendTo('#parent-container');
        scope.$digest();
        var isolatedScope = nav.isolateScope();
        
        isolatedScope.goToNext();
        expect(mockFishServ.resetActivity).not.toHaveBeenCalled();
        
        mockTimeline.currentItemIdx = 0;
        isolatedScope.goToPrevious();
        expect(mockFishServ.resetActivity).not.toHaveBeenCalled();
        
        isolatedScope.$destroy();
    });
});