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
describe('CatchevolutionCtrl', function () {

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
        ctrl = $controller('CatchevolutionCtrl', { $scope: scope });
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

        angular.forEach(scope.catchEvolutionData.catchProgress, function (item) {
            var keys = _.keys(item);
            angular.forEach(keys, function (key) {
                if (key === 'cumulated') {
                    expect(item[key]['title']).toBeDefined();
                }
                angular.forEach(item[key]['speciesList'], function (rec) {
                    expect(rec.color).toBeDefined();
                })
            });
        });

    }));


    function getTripCatch() {
        return {

        };
    }

    function getTripCatchesEvolution() {
        return {
            "catchProgress": [{
                "catchEvolution": {
                    "onboard": {
                        "speciesList": [{
                            "speciesCode": "COD",
                            "weight": 111
                        },
                        {
                            "speciesCode": "DAB",
                            "weight": 111
                        },
                        {
                            "speciesCode": "HOM",
                            "weight": 111
                        },
                        {
                            "speciesCode": "LEM",
                            "weight": 111
                        },
                        {
                            "speciesCode": "PLE",
                            "weight": 111
                        },
                        {
                            "speciesCode": "SOL",
                            "weight": 111
                        },
                        {
                            "speciesCode": "WHG",
                            "weight": "111"
                        }],
                        "total": 555
                    },
                    "cumulated": {
                        "speciesList": [{
                            "speciesCode": "COD",
                            "weight": 111
                        },
                        {
                            "speciesCode": "DAB",
                            "weight": 111
                        }],
                        "total": 222
                    }
                },
                "activityType": "DEPARTURE",
                "reportType": "NOTIFICATION"
            },
            {
                "catchEvolution": {
                    "onboard": {
                        "speciesList": [{
                            "speciesCode": "COD",
                            "weight": 111
                        },
                        {
                            "speciesCode": "DAB",
                            "weight": 111
                        },
                        {
                            "speciesCode": "HOM",
                            "weight": 111
                        },
                        {
                            "speciesCode": "LEM",
                            "weight": 111
                        },
                        {
                            "speciesCode": "PLE",
                            "weight": 111
                        },
                        {
                            "speciesCode": "SOL",
                            "weight": 111
                        },
                        {
                            "speciesCode": "WHG",
                            "weight": "111"
                        }],
                        "total": 555
                    },
                    "cumulated": {
                        "speciesList": [{
                            "speciesCode": "COD",
                            "weight": 111
                        },
                        {
                            "speciesCode": "DAB",
                            "weight": 111
                        }],
                        "total": 222
                    }
                },
                "activityType": "AREA_ENTRY",
                "reportType": "NOTIFICATION"
            }],
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
