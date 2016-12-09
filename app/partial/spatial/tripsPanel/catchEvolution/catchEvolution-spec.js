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
describe('CatchevolutionCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, activityRestServiceSpy, $httpBackend;

    beforeEach(function() {
        activityRestServiceSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchDetail', 'getTripCatchesEvolution']);

        module(function($provide) {
            $provide.value('activityRestService', activityRestServiceSpy);
        });
    });


    beforeEach(inject(function($rootScope, $controller, $injector) {
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
        
        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('CatchevolutionCtrl', { $scope: scope });
    }));

    function buildMocks() {
        activityRestServiceSpy.getTripCatchDetail.andCallFake(function() {
            return getTripCatch();
        });
        activityRestServiceSpy.getTripCatchesEvolution.andCallFake(function() {
            return getTripCatchesEvolution();
        });

    }

    it('should call the services only once', inject(function() {
        expect(activityRestServiceSpy.getTripCatchDetail.callCount).toBe(1);
        expect(activityRestServiceSpy.getTripCatchesEvolution.callCount).toBe(1);
        
        angular.forEach(scope.catchEvolutionData.catchProgress, function(item){
            var keys = _.keys(item);
            angular.forEach(keys, function(key){
                if (key === 'cumulated'){
                    expect(item[key]['title']).toBeDefined();
                }
                angular.forEach(item[key]['speciesList'], function(rec){
                    expect(rec.color).toBeDefined();
                })
            });
        });
        
        angular.forEach(scope.catchEvolutionData.finalCatch, function(item){
            var keys = _.keys(item);
            expect(_.indexOf(keys, 'title')).not.toBe(-1);
            angular.forEach(item.speciesList, function(rec){
                expect(rec.color).toBeDefined();
                expect(rec.tableColor['background-color']).toBeDefined();
            });
        });
    }));
    
    
    function getTripCatch() {
        return {
            "tripID": "BEL-TRP-O16-2016_0021",
            "vesselName": "Beagle(BEL123456789)",
            "departure": "2016-10-21T08:28:21",
            "departureAt": ["BEZEE"],
            "arrival": "2016-10-21T08:28:21",
            "arrivalAt": ["BEOST"],
            "landing": "2016-10-21T08:28:21",
            "landingAt": ["BEOST"]
        };
    }

    function getTripCatchesEvolution() {
        return {
            "catchProgress": [{
                "onboard": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_2",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_3",
                        "weight": 111
                    },
                    {
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    }],
                    "total": 555
                },
                "cumulated": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    }],
                    "total": 222
                }
            },
            {
                "onboard": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_2",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_3",
                        "weight": 111
                    },
                    {
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    }],
                    "total": 555
                },
                "cumulated": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    }],
                    "total": 222
                }
            }],
            "finalCatch": {
                "landed": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_2",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD_3",
                        "weight": 111
                    },
                    {
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    }],
                    "total": 555
                },
                "cumulated": {
                    "speciesList": [{
                        "speciesCode": "BEAGLE",
                        "weight": 111
                    },
                    {
                        "speciesCode": "SEAFOOD",
                        "weight": 111
                    }],
                    "total": 222
                }
            }
        }
    }

});
