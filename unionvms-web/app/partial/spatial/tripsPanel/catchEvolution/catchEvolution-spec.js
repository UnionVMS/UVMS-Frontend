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
describe('CatchEvolutionCtrl', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, activityRestServiceSpy, $httpBackend, tripSummaryServiceSpy;

    beforeEach(function () {
        activityRestServiceSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchesEvolution']);
        tripSummaryServiceSpy = jasmine.createSpyObj('tripSummaryService', ['trip']);

        module(function ($provide) {
            $provide.value('activityRestService', activityRestServiceSpy);
        });
        module(function ($provide) {
            $provide.value('tripSummaryService', tripSummaryServiceSpy);
        });
    });


    beforeEach(inject(function ($rootScope, $controller, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });

        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('CatchEvolutionCtrl', { $scope: scope });
    }));

    function buildMocks() {

        tripSummaryServiceSpy.trip.specieColor = [{
            "code": "COD",
            "color": "781c81"
        },
        {
            "code": "DAB",
            "color": "3f51a3"
        },
        {
            "code": "HOM",
            "color": "519cb8"
        },
        {
            "code": "LEM",
            "color": "83ba6d"
        },
        {
            "code": "PLE",
            "color": "c3ba45"
        },
        {
            "code": "SOL",
            "color": "e68a33"
        },
        {
            "code": "WHG",
            "color": "d92120"
        }
        ];

        activityRestServiceSpy.getTripCatchesEvolution.andCallFake(function () {
            return {
                then: function (callback) {
                    return callback(getTripCatchesEvolution());
                }
            }
        });

    }

    it('should call the services only once', inject(function () {
        scope.speciesColors = tripSummaryServiceSpy.trip.specieColor;
        expect(activityRestServiceSpy.getTripCatchesEvolution.callCount).toBe(1);
    }));

    it('detects all the species codes', inject(function() {
        expect(scope.speciesCodes.sort()).toEqual(["LEZ", "HKE", "NEP", "ANF", "SQI", "HAD", "JOD", "TUR", "LIN", "SOL", "GFB", "SQC", "COD", "POK", "POL", "WHG"].sort());
    }));

    it('calculates the initial catch evolution data', inject(function() {
        expect(scope.catchEvolutionData.catchEvolutionProgress[0].grandTotal).toEqual(312);
        expect(scope.catchEvolutionData.catchEvolutionProgress[0].cumulativeGrandTotal).toEqual(312);
        expect(normalizeTotal(scope.catchEvolutionData.catchEvolutionProgress[0].total)).toEqual([
            {speciesCode: 'LEZ', weight: 36},
            {speciesCode: 'HKE', weight: 23},
            {speciesCode: 'ANF', weight: 175},
            {speciesCode: 'HAD', weight: 78}
        ].sort(bySpeciesCode));
        expect(normalizeTotal(scope.catchEvolutionData.catchEvolutionProgress[0].cumulative)).toEqual([
            {speciesCode: 'LEZ', weight: 36},
            {speciesCode: 'HKE', weight: 23},
            {speciesCode: 'ANF', weight: 175},
            {speciesCode: 'HAD', weight: 78}
        ].sort(bySpeciesCode));
    }));

    it('calculates the initial catch evolution data', inject(function() {
        expect(scope.catchEvolutionData.catchEvolutionProgress[1].grandTotal).toEqual(385);
        expect(scope.catchEvolutionData.catchEvolutionProgress[1].cumulativeGrandTotal).toEqual(312 + 385);
        expect(normalizeTotal(scope.catchEvolutionData.catchEvolutionProgress[1].cumulative)).toEqual([
            {speciesCode: 'LEZ', weight: 36 + 12},
            {speciesCode: 'HKE', weight: 23 + 77},
            {speciesCode: 'ANF', weight: 175 + 245},
            {speciesCode: 'SQI', weight: 42},
            {speciesCode: 'NEP', weight: 9},
            {speciesCode: 'HAD', weight: 78}
        ].sort(bySpeciesCode));
    }));

    it('calculates a table row', inject(function() {
        expect(scope.tableData['LEZ']['Cumul_catches']).toBe(36 + 12 + 24 + 84.01 + 120 + 24 + 36 + 48 + 60 + 12 + 156 + 72 + 72 + 48 + 36 + 48 + 300 + 84.01);
        expect(scope.tableData['LEZ']['ARRIVAL_NOTIFICATION_ONBOARD']).toBe(1164.02);
        expect(scope.tableData['LEZ']['ARRIVAL_NOTIFICATION_UNLOADED']).toBe(1164.02);
    }));

    function getTripCatch() {
        return {

        };
    }

    function normalizeTotal(arr) {
        return arr.map(function(x) {
            return Object.keys(x).reduce(function(aggregate, currentKey) {
                if( currentKey !== 'color' ) {
                    aggregate[currentKey] = x[currentKey];
                }
                return aggregate;
            }, {});
        }).sort(bySpeciesCode);
    }

    function bySpeciesCode(a,b) {
        return a.speciesCode > b.speciesCode ? 1 : (a.speciesCode === b.speciesCode ? 0 : -1);
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

});
