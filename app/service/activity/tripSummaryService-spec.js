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
describe('tripSummaryService', function() {

  var scope,ctrl,tripSumSpy,genMapServSpy,repNavSpy,timeout,actRestServSpy;

  beforeEach(module('unionvmsWeb'));

  beforeEach(function(){
		genMapServSpy = jasmine.createSpyObj('genericMapService',['setMapBasicConfigs']);
		repNavSpy = jasmine.createSpyObj('reportingNavigatorService',['goToPreviousView']);
		actRestServSpy = jasmine.createSpyObj('activityRestService', ['getTripVessel','getTripReports', 'getTripCatches', 'getTripMapData']);
		
		module(function($provide){
				$provide.value('genericMapService', genMapServSpy);
				$provide.value('reportingNavigatorService', repNavSpy);
				$provide.value('activityRestService', actRestServSpy);
		});
	});

  beforeEach(inject(function($httpBackend){
    $httpBackend.whenGET(/usm/).respond();
    $httpBackend.whenGET(/i18n/).respond();
    $httpBackend.whenGET(/globals/).respond({data : []});
  }));
  
  beforeEach(inject(function(_loadingStatus_, _$anchorScroll_, _locale_) {
      loadingStatus = _loadingStatus_;
      $anchorScroll = _$anchorScroll_;
      locale = _locale_;
  }));

  beforeEach(inject(function($rootScope, $controller, spatialConfigAlertService, _$timeout_, tripSummaryService, Trip) {
      timeout = _$timeout_;
      buildMocks();
      tripSummaryService.trip = new Trip('1');
      scope = $rootScope.$new();
      ctrl = $controller('TripspanelCtrl', {$scope: scope, spatialConfigAlertService: spatialConfigAlertService});
      scope.$digest();
  }));
  
//  beforeEach(inject(function($rootScope, $controller, Trip) {
//      buildMocks();
//      scope = $rootScope.$new();
//      scope.trip = new Trip('1');
//      //ctrl = $controller('TripsummaryCtrl', {$scope: scope, loadingStatus: loadingStatus, $anchorScroll: $anchorScroll});
//  }));

    function setMapBasicConfigs(){
    		return true;
    }

    function getTripVessel(){
        return {
            "data":{
                "name":"vesselGroup1",
                "nameEnriched":false,
                "exMark":"EXT_MARK123",
                "exMarkEnriched":false,
                "flagState":"COUNTRYID",
                "flagStateEnriched":false,
                "ircs":"IRCS123",
                "ircsEnriched":false,
                "cfr":"CFR123",
                "cfrEnriched":false,
                "uvi":null,
                "uviEnriched":false,
                "iccat":null,
                "iccatEnriched":false,
                "gfcm":null,
                "gfcmEnriched":false,
                "contactPersons":[
                    {
                        "isCaptain":false,
                        "roles":[
                            "SOMEROLE"
                        ],
                        "title":"Mr",
                        "givenName":"TOM",
                        "middleName":"DAVID",
                        "familyName":"BOSE",
                        "familyNamePrefix":"ARR",
                        "nameSuffix":"PI",
                        "gender":"MALE",
                        "alias":null,
                        "adresses":[
                            {
                                "blockName":"SDS",
                                "buildingName":"SDS",
                                "cityName":"CXV",
                                "citySubdivisionName":"VCVB",
                                "country":"CVCV",
                                "countryName":"GHH",
                                "countrySubdivisionName":"YUU",
                                "addressId":"JHJ",
                                "plotId":"JGH",
                                "postOfficeBox":"CVGH",
                                "postcode":"GHJ",
                                "streetname":"TYT"
                            }
                        ]
                    },
                    {
                        "isCaptain":true,
                        "roles":[
                            "MASTER"
                        ],
                        "title":"Mr",
                        "givenName":"JOHN",
                        "middleName":"DAVID",
                        "familyName":"BOSE",
                        "familyNamePrefix":"ARR",
                        "nameSuffix":"PI",
                        "gender":"MALE",
                        "alias":null,
                        "adresses":[
                            {
                                "blockName":"SDS",
                                "buildingName":"SDS",
                                "cityName":"CXV",
                                "citySubdivisionName":"VCVB",
                                "country":"CVCV",
                                "countryName":"GHH",
                                "countrySubdivisionName":"YUU",
                                "addressId":"JHJ",
                                "plotId":"JGH",
                                "postOfficeBox":"CVGH",
                                "postcode":"GHJ",
                                "streetname":"TYT"
                            }
                        ]
                    },
                    {
                        "isCaptain":true,
                        "roles":[
                            "MASTER"
                        ],
                        "title":"Mr",
                        "givenName":"MARK",
                        "middleName":"DAVID",
                        "familyName":"BOSE",
                        "familyNamePrefix":"ARR",
                        "nameSuffix":"PI",
                        "gender":"MALE",
                        "alias":null,
                        "adresses":[
                            {
                                "blockName":"SDS",
                                "buildingName":"SDS",
                                "cityName":"CXV",
                                "citySubdivisionName":"VCVB",
                                "country":"CVCV",
                                "countryName":"GHH",
                                "countrySubdivisionName":"YUU",
                                "addressId":"JHJ",
                                "plotId":"JGH",
                                "postOfficeBox":"CVGH",
                                "postcode":"GHJ",
                                "streetname":"TYT"
                            }
                        ]
                    }
                ]
            },
            "code":200
        };
    }

    function getTripReports() {
        return {
            "data":{
                    "fishingTripId":"NOR-TRP-20160517234053706",
                    "summary":{
                        "DEPARTURE":{
                                "date":"2014-05-27T07:47:31",
                                "locations":null
                        }
                    },
                    "activityReports":[
                        {
                            "faReportID":0,
                            "activityType":"DEPARTURE",
                            "occurence":"2014-05-27T07:47:31",
                            "reason":"FISHING",
                            "fishingGears":[
                                {
                                        "gearTypeCode":"GEAR_TYPE"
                                }
                            ],
                            "delimitedPeriod":[
                                {
                                        "startDate":"2007-02-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":3.0
                                },
                                {
                                        "startDate":"2012-02-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":3.0
                                },
                                {
                                        "startDate":"2009-04-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":2.0
                                },
                                {
                                        "startDate":"2010-05-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":1.0
                                },
                                {
                                        "startDate":"2008-02-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":3.0
                                },
                                {
                                        "startDate":"2011-02-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":3.0
                                },
                                {
                                        "startDate":"2013-02-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":3.0
                                },
                                {
                                        "startDate":"2010-06-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":1.0
                                }
                            ],
                            "faReportAcceptedDateTime":"2016-06-27T07:47:31",
                            "faReportDocumentType":"DECLARATION",
                            "correction":false
                        },
                        {
                            "faReportID":0,
                            "activityType":"DEPARTURE",
                            "occurence":"2016-06-27T07:47:31",
                            "reason":"FISHING",
                            "faReportAcceptedDateTime":"2016-06-27T07:47:31",
                            "faReportDocumentType":"DECLARATION",
                            "correction":false
                        },
                        {
                            "faReportID":0,
                            "activityType":"FISHING_OPERATION",
                            "occurence":"2013-05-27T07:47:31",
                            "reason":"FISHING",
                            "fishingGears":[
                                {
                                        "gearTypeCode":"GEAR_TYPE"
                                }
                            ],
                            "delimitedPeriod":[
                                {
                                        "startDate":"2010-05-27T07:47:31",
                                        "endDate":"2016-06-27T07:47:31",
                                        "duration":1.0
                                }
                            ],
                            "faReportAcceptedDateTime":"2016-06-27T07:47:31",
                            "faReportDocumentType":"DECLARATION",
                            "correction":false
                        }
                    ]
            },
            "code":200
        };
    }
    
    function getTripCatches (){
        return {
            "id": "NOR-TRP-20160517234053706",
            "tripVessel": {
                "name": "Test Name",
                "nameEnriched": false,
                "exMark": null,
                "exMarkEnriched": false,
                "flagState": "XEU",
                "flagStateEnriched": false,
                "ircs": null,
                "ircsEnriched": false,
                "cfr": "ID 1",
                "cfrEnriched": false,
                "uvi": null,
                "uviEnriched": false,
                "iccat": null,
                "iccatEnriched": false,
                "gfcm": null,
                "gfcmEnriched": false
            },
            "tripRoles": [{
                "isCaptain": true,
                "roles": ["MASTER"],
                "title": "MR",
                "givenName": "Test Name",
                "middleName": "Test Middle Name",
                "familyName": "Test Family Name",
                "familyNamePrefix": "Test Prefix",
                "nameSuffix": "Test Suffix",
                "gender": "Gender",
                "alias": "Test Alias",
                "adresses": [{
                    "blockName": "Test Block",
                    "buildingName": "Test Building",
                    "cityName": "Test City",
                    "citySubdivisionName": "Test city subdivision",
                    "country": "Test Country",
                    "countryName": "Test Country",
                    "countrySubdivisionName": "Test country subdivision",
                    "addressId": "ID type 1",
                    "plotId": "123",
                    "postOfficeBox": "548675",
                    "postcode": "Post code 1",
                    "streetname": "Test Street"
                }],
                "type": "MR Test Name Test Middle Name Test Family Name",
                "active": true
            }],
            "catchDetails": {
                "onboard": {
                    "total": 0,
                    "title": "On board",
                    "caption": "Total catches: Live weight: 0 kg"
                },
                "landed": {
                    "total": 0,
                    "title": "Landed",
                    "caption": "Total landed: Live weight equivalent: 0 kg"
                }
            }
        };
    }
    
    function getTripMapData(){
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "MultiPoint",
                        "coordinates": [[10,40],[40,30]]
                    },
                    "properties": {}
                }
            ]
        };
    }
    
  function buildMocks(){
		genMapServSpy.setMapBasicConfigs.andCallFake(function(){
			return {
					then: function(callback){
							return callback(setMapBasicConfigs());
					}
			};
		});

		repNavSpy.goToPreviousView.andCallFake(function(){
			return;
		});
		
		actRestServSpy.getTripVessel.andCallFake(function(){
            return {
                then: function(callback){
                        return callback(getTripVessel());
                }
            };
        });

        actRestServSpy.getTripReports.andCallFake(function(){
            return {
                then: function(callback){
                        return callback(getTripReports());
                }
            };
        });
        
        actRestServSpy.getTripCatches.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getTripCatches());
                }
            };
        });
        
        actRestServSpy.getTripMapData.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getTripMapData());
                }
            };
        });
	}

  it('should manage the trip summary tab system', inject(function(tripSummaryService) {
    
    expect(tripSummaryService.tabs).toBeUndefined();

    tripSummaryService.openNewTrip('1');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(1);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(true);
    expect(actRestServSpy.getTripVessel).toHaveBeenCalled();
    expect(actRestServSpy.getTripReports).toHaveBeenCalled();
    expect(actRestServSpy.getTripCatches).toHaveBeenCalled();
    expect(actRestServSpy.getTripMapData).toHaveBeenCalled();

    tripSummaryService.openNewTrip('2');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(2);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(false);
    expect(tripSummaryService.tabs[1].title).toEqual('2');
    expect(tripSummaryService.tabs[1].active).toBe(true);
    expect(actRestServSpy.getTripVessel).toHaveBeenCalled();
    expect(actRestServSpy.getTripReports).toHaveBeenCalled();
    expect(actRestServSpy.getTripCatches).toHaveBeenCalled();
    expect(actRestServSpy.getTripMapData).toHaveBeenCalled();

    tripSummaryService.openNewTrip('1');
    timeout.flush(1);
    expect(tripSummaryService.tabs.length).toEqual(2);
    expect(tripSummaryService.tabs[0].title).toEqual('1');
    expect(tripSummaryService.tabs[0].active).toBe(true);
    expect(tripSummaryService.tabs[1].title).toEqual('2');
    expect(tripSummaryService.tabs[1].active).toBe(false);
    expect(actRestServSpy.getTripVessel).toHaveBeenCalled();
    expect(actRestServSpy.getTripReports).toHaveBeenCalled();
    expect(actRestServSpy.getTripCatches).toHaveBeenCalled();
    expect(actRestServSpy.getTripMapData).toHaveBeenCalled();

  }));

});
