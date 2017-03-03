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
describe('faDetailsPanel', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile;

  beforeEach(inject(function($rootScope,$compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

  function buildMocks(){
    scope.summary = {
      title: "title",
      subTitle: "subTitle",
      items: {
        fishery_type: "Demersal",
        no_operations: 163,
        occurence: "2017-07-30T05:40:25",
        targetted_species: ["GADUS"],
        vessel_activity: "FSH - Fishing"
      },
      subItems: {
        duration: "10d 8h"
      }
    };
  }

  it('should compile and present the model content', function() {
    buildMocks();

    var faDetailsPanel = compile('<fa-details-panel class="col-md-12 summary-section" ng-model="summary"></fa-details-panel>')(scope);
    scope.$digest();

    var nrItems = 0;
    var nrSubItems = 0;

    angular.forEach(scope.summary.items, function(item){
      nrItems++;
    });

    angular.forEach(scope.summary.subItems, function(item){
      nrSubItems++;
    });

    expect(angular.element(faDetailsPanel).find('> .fa-details-fieldset > .item-container').length).toEqual(nrItems);
    expect(angular.element(faDetailsPanel).find('.fa-details-fieldset > .fa-details-fieldset > .item-container').length).toEqual(nrSubItems);

    expect(angular.element(faDetailsPanel).find('> .fa-details-fieldset > legend > a').text()).toEqual(scope.summary.title);
    expect(angular.element(faDetailsPanel).find('.fa-details-fieldset > .fa-details-fieldset > legend > a').text()).toEqual(scope.summary.subTitle);

    faDetailsPanel.isolateScope().$destroy();
  });
});