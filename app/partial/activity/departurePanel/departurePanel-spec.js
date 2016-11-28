angular.module('stateMock',[]);
angular.module('stateMock').service("$state", function($q){
    this.current = {
        name: ''
    };
    
    this.go = function(stateName){
        this.current.name = stateName;
    };
});

describe('DeparturepanelCtrl', function() {
	beforeEach(module('unionvmsWeb'));
	beforeEach(module('stateMock'));

	var scope,ctrl,mockState, $httpBackend, $state, mockTripSumServ, appStates;
	
	beforeEach(function(){
	    appStates = ['','app.reporting', 'app.reporting-id'];
	    
	    mockTripSumServ = {
            withMap: false
        };
        
        module(function($provide){
            $provide.value('tripSummaryService', mockTripSumServ);
        });
	});

    beforeEach(inject(function($rootScope, $controller, _$state_, $injector) {
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        $httpBackend.whenGET(/movement/).respond();
        
        $state = _$state_;
        scope = $rootScope.$new();
        ctrl = $controller('DeparturepanelCtrl', {$scope: scope});
    }));
    
    function setWithMap(newState){
        mockTripSumServ.withMap = newState;
    }

	it('should allow a location to be clickable when report has map and the application is on the reporting router', inject(function() {
	    setWithMap(true);
	    appStates.splice(0,1);
	    var test;
	    angular.forEach(appStates, function(state) {
	        $state.go(state);
	        test = scope.isLocationClickable();
	        expect(test).toBeTruthy();
	    });
	}));
	
	it('should not allow a location to be clickable if report has no map', function(){
	   var test;
       angular.forEach(appStates, function(state) {
           $state.go(state);
           test = scope.isLocationClickable();
           expect(test).toBeFalsy();
       });
	});
	
	it('should not allow a location to be clickable if the application is not on the reporting router', function(){
	    setWithMap(true);
	    $state.go(appStates[0]);
	    var test = scope.isLocationClickable();
	    expect(test).toBeFalsy();
	});

});