describe('faReportDocTile', function() {
    beforeEach(module('unionvmsWeb'));
    
    var scope,compile,$httpBackend,tile;
    
    beforeEach(inject(function($rootScope,$compile,$injector) {
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
        angular.element('fa-report-doc-tile').remove();
    });
    
    function buildMockData(){
        return {
            type: 'Declaration',
            dateAccepted: '2014-05-27T07:47:31',
            id: 'b2c32a5d-417c-a44a-00c827b4be32',
            refId: 'b999ef58-4343-946c-31219e75e39d',
            creationDate: '2014-05-27T07:47:31',
            purposeCode: 5,
            purpose: 'Altered departure port'
        };
    }
    
    it('should render the fishing activity report document tile', inject(function($filter) {
        scope.reportDoc = buildMockData();
        
        tile = compile('<fa-report-doc-tile fa-report="reportDoc"></fa-report-doc-tile>')(scope);
        tile.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('fa-report-doc-tile').length).toBe(1);
        expect(angular.element('.item-container').children().eq(1).text()).toEqual(scope.reportDoc.type);
        expect(angular.element('.item-container').children().eq(3).text()).toEqual($filter('stDateUtc')(scope.reportDoc.dateAccepted));
        expect(angular.element('.item-container').children().eq(5).text()).toEqual(scope.reportDoc.id);
        expect(angular.element('.item-container').children().eq(7).text()).toEqual(scope.reportDoc.refId);
        expect(angular.element('.item-container').children().eq(9).text()).toEqual($filter('stDateUtc')(scope.reportDoc.creationDate));
        expect(angular.element('.item-container').children().eq(11).text()).toEqual(scope.reportDoc.purposeCode + ' - ' + $filter('stPurposeCode')(scope.reportDoc.purposeCode));
        expect(angular.element('.item-container').children().eq(13).text()).toEqual(scope.reportDoc.purpose);
    }));
});