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
describe('groupedCombobox', function() {

    beforeEach(module('unionvmsWeb'));
  
    var $compile, $scope, $timeout;
  
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_) {
        $compile = _$compile_;
        $scope = _$rootScope_.$new();
        $timeout = _$timeout_;
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});

        $scope.advancedSearchObject = {
            gearType: null,
            
        };
        $scope.codeLists = {
            gearTypes: [
                {code: "DRM", text: "DRM", category: "DREDGES", desc: "http://www.fao.org/fishery/geartype/search/en"},
                {code: "DRX", text: "DRX", category: "DREDGES", desc: "http://www.fao.org/fishery/geartype/search/en"},
                {code: "FCN", text: "FCN", category: "FALLING GEAR", desc: "http://www.fao.org/fishery/geartype/search/en"},
                {code: "FCO", text: "FCO", category: "FALLING GEAR", desc: "http://www.fao.org/fishery/geartype/search/en"}
            ]
        };
    }));

    afterEach(function() {
        $scope.$destroy();
    });

   

    it('should compile', function() {
        var element = $compile('<grouped-combobox ng-model="$scope.advancedSearchObject.gearType" items="$scope.codeLists.gearTypes" initialtext="INITIAL TEXT"></grouped-combobox>')($scope);
        $scope.$digest();
        var textElement = element.find('.dropdowntext').attr('title');
        var textElement2 = element.find('.dropdowntext span:first-of-type').text();
        expect(textElement).toEqual('INITIAL TEXT');
        expect(textElement2).toEqual('INITIAL TEXT');
    });
});