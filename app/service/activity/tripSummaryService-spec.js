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
		actRestServSpy = jasmine.createSpyObj('activityRestService', ['getTripVessel','getTripReports', 'getTripCatchesEvolution', 'getTripMapData']);
		
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
    
    function getTripCatchesEvolution() {
        return {
            "catchEvolutionProgress": [
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 00:58:00 +0200",
                    "total": {
                        "LEZ": 36.0,
                        "HKE": 23.0,
                        "ANF": 175.0,
                        "HAD": 78.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 02:38:00 +0200",
                    "total": {
                        "LEZ": 12.0,
                        "HKE": 77.0,
                        "NEP": 9.0,
                        "ANF": 245.0,
                        "SQI": 42.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 02:52:00 +0200",
                    "total": {
                        "LEZ": 24.0,
                        "HKE": 59.0,
                        "NEP": 9.0,
                        "ANF": 105.0,
                        "SQI": 98.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 03:50:00 +0200",
                    "total": {
                        "LEZ": 84.01,
                        "HKE": 11.5,
                        "ANF": 210.0,
                        "HAD": 130.0,
                        "JOD": 11.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 06:39:52 +0200",
                    "total": {
                        "LEZ": 120.0,
                        "TUR": 13.0,
                        "LIN": 52.0,
                        "SOL": 13.0,
                        "GFB": 14.0,
                        "HKE": 158.0,
                        "SQC": 13.0,
                        "ANF": 245.0,
                        "COD": 26.0,
                        "SQI": 56.0,
                        "JOD": 22.0
                    }
                },
                {
                    "activityType": "AREA_EXIT",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 09:28:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 09:34:00 +0200",
                    "total": {
                        "LEZ": 24.0,
                        "HKE": 59.0,
                        "NEP": 9.0,
                        "ANF": 105.0,
                        "SQI": 98.0
                    }
                },
                {
                    "activityType": "ARRIVAL",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 10:34:00 +0200",
                    "loaded": {},
                    "onBoard": {
                        "LEZ": 1164.02,
                        "GFB": 314.0,
                        "HKE": 1090.5,
                        "SQC": 13.0,
                        "HAD": 649.99,
                        "SQI": 1988.0,
                        "POL": 26.0,
                        "POK": 26.0,
                        "LIN": 52.0,
                        "TUR": 13.0,
                        "SOL": 13.0,
                        "WHG": 78.0,
                        "NEP": 18.0,
                        "ANF": 3520.01,
                        "COD": 26.0,
                        "JOD": 176.0
                    },
                    "unLoaded": {
                        "LEZ": 1164.02,
                        "GFB": 314.0,
                        "HKE": 1090.5,
                        "SQC": 13.0,
                        "SQI": 1988.0,
                        "HAD": 649.99,
                        "POL": 26.0,
                        "POK": 26.0,
                        "TUR": 13.0,
                        "LIN": 52.0,
                        "SOL": 13.0,
                        "WHG": 78.0,
                        "NEP": 18.0,
                        "COD": 26.0,
                        "ANF": 3520.01,
                        "JOD": 176.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:34:00 +0200",
                    "total": {
                        "HKE": 24.5,
                        "ANF": 70.0,
                        "SQI": 28.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:38:00 +0200",
                    "total": {
                        "LEZ": 36.0,
                        "LIN": 26.0,
                        "GFB": 14.0,
                        "HKE": 92.0,
                        "ANF": 280.0,
                        "SQI": 28.0,
                        "POK": 26.0
                    }
                },
                {
                    "activityType": "AREA_EXIT",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 10:42:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:42:00 +0200",
                    "total": {
                        "HKE": 23.0,
                        "ANF": 105.0,
                        "SQI": 28.0
                    }
                },
                {
                    "activityType": "DISCARD",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:44:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:44:00 +0200",
                    "total": {
                        "LEZ": 48.0,
                        "WHG": 26.0,
                        "ANF": 420.0,
                        "JOD": 22.0
                    }
                },
                {
                    "activityType": "DISCARD",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 10:54:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:06:00 +0200",
                    "total": {
                        "LEZ": 60.0,
                        "HKE": 92.0,
                        "ANF": 210.0,
                        "HAD": 51.99,
                        "SQI": 84.0,
                        "JOD": 11.0
                    }
                },
                {
                    "activityType": "DISCARD",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:08:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:14:00 +0200",
                    "total": {
                        "LEZ": 12.0,
                        "HKE": 77.0,
                        "NEP": 9.0,
                        "ANF": 245.0,
                        "SQI": 42.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:24:00 +0200",
                    "total": {
                        "LEZ": 156.0,
                        "HKE": 69.0,
                        "ANF": 105.0,
                        "COD": 26.0,
                        "HAD": 208.0,
                        "SQI": 1260.0,
                        "JOD": 143.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:34:00 +0200",
                    "total": {
                        "HKE": 24.5,
                        "ANF": 70.0,
                        "SQI": 28.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:38:00 +0200",
                    "total": {
                        "LEZ": 72.0,
                        "ANF": 280.0,
                        "COD": 26.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:38:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 11:46:00 +0200",
                    "total": {
                        "LEZ": 72.0,
                        "HKE": 11.5,
                        "ANF": 175.01,
                        "HAD": 26.0,
                        "SQI": 14.0
                    }
                },
                {
                    "activityType": "AREA_EXIT",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 11:54:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:08:00 +0200",
                    "total": {
                        "LEZ": 48.0,
                        "HKE": 35.0,
                        "ANF": 105.0,
                        "HAD": 26.0,
                        "SQI": 42.0
                    }
                },
                {
                    "activityType": "DEPARTURE",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:10:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:18:00 +0200",
                    "total": {
                        "LEZ": 36.0,
                        "HKE": 11.5,
                        "WHG": 52.0,
                        "ANF": 315.0,
                        "POL": 26.0
                    }
                },
                {
                    "activityType": "AREA_ENTRY",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 12:20:00 +0200",
                    "total": {
                        "LEZ": 84.0,
                        "HKE": 11.5,
                        "WHG": 78.0,
                        "ANF": 735.0,
                        "POL": 26.0,
                        "JOD": 22.0
                    }
                },
                {
                    "activityType": "DISCARD",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:32:00 +0200",
                    "total": {}
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:44:00 +0200",
                    "total": {
                        "LEZ": 48.0,
                        "HKE": 126.5,
                        "ANF": 140.0,
                        "SQI": 350.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 12:50:00 +0200",
                    "total": {
                        "LEZ": 300.0,
                        "GFB": 300.0,
                        "HKE": 300.0,
                        "ANF": 300.0
                    }
                },
                {
                    "activityType": "AREA_ENTRY",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 13:04:00 +0200",
                    "total": {
                        "LEZ": 744.02,
                        "HKE": 632.5,
                        "WHG": 78.0,
                        "NEP": 18.0,
                        "ANF": 2975.01,
                        "COD": 26.0,
                        "HAD": 649.99,
                        "SQI": 1932.0,
                        "POL": 26.0,
                        "POK": 26.0,
                        "JOD": 176.0
                    }
                },
                {
                    "activityType": "FISHING_OPERATION",
                    "reportType": "DECLARATION",
                    "affectsCumulative": true,
                    "date": "2017-01-09 13:06:00 +0200",
                    "total": {
                        "LEZ": 84.01,
                        "HKE": 92.0,
                        "ANF": 140.0,
                        "SQI": 14.0,
                        "HAD": 130.0,
                        "JOD": 11.0
                    }
                },
                {
                    "activityType": "AREA_ENTRY",
                    "reportType": "NOTIFICATION",
                    "affectsCumulative": false,
                    "date": "2017-01-09 13:12:00 +0200",
                    "total": {
                        "LEZ": 1164.02,
                        "GFB": 314.0,
                        "HKE": 1090.5,
                        "SQC": 13.0,
                        "HAD": 649.99,
                        "SQI": 1988.0,
                        "POL": 26.0,
                        "POK": 26.0,
                        "LIN": 52.0,
                        "TUR": 13.0,
                        "SOL": 13.0,
                        "WHG": 78.0,
                        "NEP": 18.0,
                        "ANF": 3520.01,
                        "COD": 26.0,
                        "JOD": 176.0
                    }
                }
            ],
            "tripDetails": {
                "vesselDetails": {
                    "name": "Echo",
                    "country": "SVN",
                    "contactParties": [{
                        "role": "MASTER",
                        "contactPerson": {
                            "alias": "Master E",
                            "firstName": "Jake",
                            "lastName": "E"
                        },
                        "structuredAddress": [{
                            "cityName": "City L",
                            "streetName": "Street K",
                            "countryCode": "SVN"
                        }]
                    }],
                    "vesselIds": [{
                        "id": 2543,
                        "schemeId": "ICCAT"
                    },
                    {
                        "id": 87879,
                        "schemeId": "IRCS"
                    },
                    {
                        "id": 74334,
                        "schemeId": "EXT_MARK"
                    },
                    {
                        "id": 34434,
                        "schemeId": "CFR"
                    }
                    ]
                },
                "trips": [{
                    "tripId": [{
                        "id": 344,
                        "schemeId": "EU_TRIP_ID"
                    }],
                    "departureTime": "2017-06-22T07:30:00",
                    "arrivalTime": "2017-06-27T22:45:00"
                }]
            }
        }
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
        
        actRestServSpy.getTripCatchesEvolution.andCallFake(function(){
            return {
                then: function(callback){
                    return callback(getTripCatchesEvolution());
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
    expect(actRestServSpy.getTripCatchesEvolution).toHaveBeenCalled();
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
    expect(actRestServSpy.getTripCatchesEvolution).toHaveBeenCalled();
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
    expect(actRestServSpy.getTripCatchesEvolution).toHaveBeenCalled();
    expect(actRestServSpy.getTripMapData).toHaveBeenCalled();

  }));

});
