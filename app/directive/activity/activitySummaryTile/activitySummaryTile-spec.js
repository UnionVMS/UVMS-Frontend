describe('activitySummaryTile', function() {
    var scope,compile,tile,$httpBackend;
    
    beforeEach(module('unionvmsWeb'));
    
    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    afterEach(function(){
        angular.element('activity-summary-tile').remove();
    });

    function buildMockData() {
        return {
            occurence: '2014-05-27T07:47:31',
            reason: 'Fishing',
            fisheryType: 'Demersal',
            targetedSpecies: ['COD', 'SOL', 'COD', 'SOL', 'COD']
        };
    }
    
    it('should render the activity summary tile', inject(function($filter) {
        scope.summary = buildMockData();
        scope.faType = 'fa_type_departure';
        
        tile = compile('<activity-summary-tile fa-type="faType" summary="summary"></activity-summary-tile>')(scope); 
        tile.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('activity-summary-tile').length).toBe(1);
        expect(angular.element('.item-container').children().eq(1).text()).toEqual($filter('stDateUtc')(scope.summary.occurence));
        expect(angular.element('.item-container').children().eq(3).text()).toEqual(scope.summary.reason);
        expect(angular.element('.item-container').children().eq(5).text()).toEqual(scope.summary.fisheryType);
        expect(angular.element('.item-container').children().eq(7).text()).toEqual($filter('stArrayToString')(scope.summary.targetedSpecies, ', '));
    }));
});