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
describe('vesselTile', function() {

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

	beforeEach(inject(function() {
    	scope.vesselDetails = {
			"role":"Master",
			"name":"Oleta Muller",
			"country":"GE",
			"storage":{
					"items":[
						{
								"idx":1,
								"label":"a1f08ab0",
								"value":"fcc7b68b-d9c5-5e99-b1ef-012f8f59d32f"
						},
						{
								"idx":2,
								"label":"78861d98",
								"value":"0b858888-7d6a-5403-9ffb-5224df3f893d"
						}
					],
					"title":"Vessel storage"
			},
			"authorizations":{
					"items":[
						{
								"idx":0,
								"label":"b88a3cc0",
								"value":"3ac8501d-0758-51ed-92b1-634eb588abb0"
						},
						{
								"idx":1,
								"label":"f2ce88d8",
								"value":"145826db-5ee1-5c93-8a11-51222f2bdf13"
						}
					],
					"title":"Authorizations"
			},
			"contactParties":[
					{
						"role":"Master",
						"contactPerson":{
								"firstName":"Catherine",
								"lastName":"Walters",
								"alias":"David Garcia",
								"characteristics":{
									"key1":"value1",
									"key2":"value2"
								}
						},
						"structuredAddress":[
								{
									"streetName":"Emula Avenue",
									"plotId":"d1e0d76e",
									"postCode":"C5A 2C0",
									"cityName":"Vuvasodet",
									"countryCode":"MG",
									"countryName":"British Virgin Islands",
									"characteristics":{
											"key1":"value1",
											"key2":"value2"
									}
								}
						],
						"type":"Master - David Garcia"
					},
					{
						"role":"Master",
						"contactPerson":{
								"firstName":"Gary",
								"lastName":"Morton",
								"alias":"Gertrude Mitchell",
								"characteristics":{
									"key1":"value1",
									"key2":"value2"
								}
						},
						"structuredAddress":[
								{
									"streetName":"Vazneg Drive",
									"plotId":"d0a55510",
									"postCode":"P9K 4F0",
									"cityName":"Hunenmu",
									"countryCode":"SS",
									"countryName":"Antarctica",
									"characteristics":{
											"key1":"value1",
											"key2":"value2"
									}
								},
								{
									"streetName":"Muglol Point",
									"plotId":"d81ce528",
									"postCode":"M8R 6K9",
									"cityName":"Boahefi",
									"countryCode":"CA",
									"countryName":"Kosovo",
									"characteristics":{
											"key1":"value1",
											"key2":"value2"
									}
								}
						],
						"type":"Master - Gertrude Mitchell"
					}
			],
			"vesselOverview":{
					"items":[
						{
								"idx":0,
								"label":"Role",
								"value":"Master"
						},
						{
								"idx":1,
								"label":"Name",
								"value":"Oleta Muller"
						},
						{
								"idx":2,
								"label":"Country",
								"value":"GE"
						},
						{
								"idx":3,
								"label":"EXT_MARK",
								"value":"EXT_MARK_desc"
						}
					]
			}
		};
	}));

	it('should render all the fieldsets', function() {
      var vesselTile = compile('<vessel-tile ng-model="vesselDetails"></vessel-tile>')(scope);
      scope.$digest();

      var isolatedScope = vesselTile.isolateScope();

			expect(vesselTile.find('.vessel-tile > .row > *').length).toEqual(4);
			expect(isolatedScope.colWidth).toEqual(3);
	});

});
