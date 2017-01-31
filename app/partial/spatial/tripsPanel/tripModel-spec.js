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
describe('tripModel', function() {

  beforeEach(module('unionvmsWeb'));

    var unitConversionService;

    var tripId = "NOR-TRP-20160517234053706";

    var locations = ["city", "country"];
    
    var tripOverview = {
      "ARRIVAL":{
          "date":"2014-05-27T10:47:31",
          "locations": null
      },
      "LANDING":{
          "date":"2014-05-28T07:47:31",
          "locations": locations
      }
    };

    var activityTypes = ["DEPARTURE","ARRIVAL","FISHING_OPERATION","LANDING","ENTRY","EXIT","RELOCATION","TRANSHIPMENT"];
    var documentTypes = ["DECLARATION","NOTIFICATION","OTHER"];

    var delimitedPeriod = [
      {
          "startDate":"2013-02-27T07:47:31",
          "endDate":"2016-06-27T07:47:31",
          "duration":3.0
      },
      {
          "startDate":"2016-06-27T07:47:31",
          "endDate":"2016-06-27T07:47:31",
          "duration":1.0
      },
      {
          "startDate":"2016-06-27T06:47:31",
          "endDate":"2016-06-27T07:47:31",
          "duration":3.0
      },
      {
          "startDate":"2009-04-27T05:47:31",
          "endDate":"2016-06-27T07:47:31",
          "duration":2.0
      }
    ];

    var vesselData = {
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
         },
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
         }
      ]
    };

    var cronologyData = {
      currentTrip: "NOR-TRP-20160517234053706",
      selectedTrip: "NOR-TRP-20160517234053706",
      previousTrips: ["NOR-TRP-20160517234053704","NOR-TRP-20160517234053705"],
      nextTrips: ["NOR-TRP-20160517234053707","NOR-TRP-20160517234053708"]
    };

    var catchData = {
      onboard:{
         speciesList:[
            {
               speciesCode: "BEAGLE",
               weight: 111.0
            },
            {
               speciesCode: "SEAFOOD",
               weight: 111.0
            },
            {
               speciesCode: "SEAFOOD_2",
               weight: 111.0
            },
            {
               speciesCode: "SEAFOOD_3",
               weight: 111.0
            },
            {
               speciesCode: "BEAGLE",
               weight: 111.0
            }
         ],
         total: 555.0
      },
      landed:{}
    };

    var messageCountData = {
      noOfReports: 1,
      noOfDeclarations: 1,
      noOfNotifications: 0,
      noOfCorrections: 0,
      noOfFishingOperations: 1,
      noOfDeletions: 0,
      noOfCancellations: 0
    };
    
    var mapData = {
        type: "FeatureCollection",
        features: [
            {
                type: Feature,
                geometry: {
                    type: "MultiPoint",
                    coordinates: [
                        [
                            15.86,
                            55.95
                        ],
                        [
                            17.66,
                            56.76
                        ]
                    ]
                },
                properties: {}
            }
        ]
    };


    var unitConvServSpy;
	
    beforeEach(function(){
      var mockDependency = {
        date: {
          convertToUserFormat: function(date){
            return date.replace('T',' ');
          }
        }
      };

      module(function($provide){
          $provide.value('unitConversionService', mockDependency);
      });
    });

    it('should parse transfer object', inject(function(Trip) {

      var reportsData = {
        fishingTripId: tripId,
        summary: tripOverview,
        activityReports: []
      };

      var reportId = 0;
      angular.forEach(activityTypes, function(actType) {
        angular.forEach(documentTypes, function(docType) {
          var actRep = {
            faReportID: reportId,
            activityType: actType,
            occurence: "2013-05-27T07:47:31",
            reason: "FISHING",
            locations: locations,
            fishingGears: [
              {
                  "gearTypeCode":"GEAR_TYPE"
              }
            ],
            delimitedPeriod: delimitedPeriod,
            faReportAcceptedDateTime: "2016-06-27T07:47:31",
            faReportDocumentType: docType,
            correction: reportId % 2 ? true : false
          };

          reportsData.activityReports.push(actRep);
          reportId++;
        });
      });

      var trip = new Trip(tripId);
      expect(trip.id).toEqual(tripId);
      
      trip.fromJson('vessel',vesselData);
      var tripVessel = angular.copy(vesselData);
		  delete tripVessel.contactPersons;
      expect(trip.tripVessel).toEqual(tripVessel);

      expect(trip.tripRoles.length).toEqual(vesselData.contactPersons.length);

      trip.fromJson('cronology',cronologyData);
      expect(trip.cronology.previousTrips).toEqual(cronologyData.previousTrips.reverse());
      expect(trip.cronology.nextTrips).toEqual(cronologyData.nextTrips.reverse());

      delete cronologyData.previousTrips;
      delete cronologyData.nextTrips;
      trip.fromJson('cronology',cronologyData);
      expect(trip.cronology).toEqual(cronologyData);

      trip.fromJson('catch',catchData);
      expect(trip.catchDetails.onboard.speciesList.length).toEqual(catchData.onboard.speciesList.length);
      expect(trip.catchDetails.landed).toEqual(catchData.landed);

      trip.fromJson('messageCount',messageCountData);
      expect(trip.messageCount).toEqual(messageCountData);

      trip.fromJson('reports',reportsData);
      expect(trip.reports.length).toEqual(reportsData.activityReports.length);

      angular.forEach(trip.activityReports,function(report,repKey){
        expect(report.nodes.length).toEqual(reportsData.activityReports[repKey].length);
      });
      
      trip.fromJson('mapData', mapData);
      expect(trip.mapData).toEqual(mapData);

    }));

});
