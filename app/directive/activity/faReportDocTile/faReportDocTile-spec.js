/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
        
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        $httpBackend.whenPOST(/mock/).respond([
              {
                "code": "1",
                "description": "Cancellation"
              },
              {
                "code": "3",
                "description": "Delete"
              },
              {
                "code": "5",
                "description": "Replacement (correction)"
              },
              {
                "code": "9",
                "description": "Original report"
              }
         ]);
        
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
        expect(angular.element('.item-container').children().eq(11).text()).toEqual(scope.reportDoc.purposeCode + ' - ' + scope.reportDoc.purposeCode);
        expect(angular.element('.item-container').children().eq(13).text()).toEqual(scope.reportDoc.purpose);
    }));
});
