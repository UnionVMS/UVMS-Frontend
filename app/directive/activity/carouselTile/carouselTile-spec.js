describe('carouselTile', function() {
    var scope,compile,tile,$httpBackend,controller;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    function buildMockData(withActiveStatus){
        return [{
            type: 'TBB: Trowling Beam',
            role: 'On board',
            meshSize: '80mm',
            beamLength: '6m',
            numBeams: 4,
            active: withActiveStatus ? true : undefined
        },{
            type: 'SSC: Scottish Seines',
            role: 'On board',
            meshSize: '80mm',
            beamLength: '6m',
            numBeams: 4,
            active: withActiveStatus ? false : undefined
        },{
            type: 'GND: Driftnets',
            role: 'On board',
            meshSize: '80mm',
            beamLength: '6m',
            numBeams: 4,
            active: withActiveStatus ? false : undefined
        }];
    }
    
    describe('testing the directive: carouselTile', function(){
        afterEach(function(){
            angular.element('carousel-tile').remove();
        });
        
        it('should properly render the carousel tile', function(){
            scope.ngModel = buildMockData();
            tile = compile('<carousel-tile tile-title="test" ng-model="ngModel" template-url="directive/activity/carouselTile/templates/gearTile/gearTile.html"></carousel-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            expect(angular.element('legend').find('a').first().text()).toEqual('test');
            expect(angular.element('legend').find('li').length).toBe(3);
            expect(angular.element('legend').find('li').children().eq(0).attr('class').indexOf('active-menu')).not.toBe(-1);
            expect(angular.element('.gear-tile').length).toBe(scope.ngModel.length);
        });
        
        it('should render the no data message template', function(){
            scope.ngModel = [];
            tile = compile('<carousel-tile tile-title="test" ng-model="ngModel" template-url="directive/activity/carouselTile/templates/gearTile/gearTile.html"></carousel-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            expect(angular.element('legend').find('a').first().text()).toEqual('test');
            expect(angular.element('legend').find('li').length).toBe(0);
            expect(angular.element('.no-data').length).toBe(1);
        });
    });
    
    describe('testing the controller: CarouselTileCtrl', function(){
        beforeEach(inject(function($controller) {
            controller = $controller('CarouselTileCtrl', {
                $scope: scope
            });
        }));
        
        it('should properly initialize and process the input data', function(){
            scope.ngModel = buildMockData();
            var formatedData = buildMockData(true);
            
            scope.init()
            expect(scope.ngModel).toEqual(formatedData);
        });
        
        it('should check if the item is active or not', function(){
            scope.ngModel = buildMockData();
            scope.init();
            
            var test = scope.isItemActive(0);
            expect(test).toBeTruthy();
            
            test = scope.isItemActive(1);
            expect(test).toBeFalsy();
        });
        
        it('should set the specified item as active', function(){
            scope.ngModel = buildMockData();
            scope.init();
            
            scope.setActiveItem(1);
            expect(scope.ngModel[1].active).toBeTruthy();
        });
        
    });
});