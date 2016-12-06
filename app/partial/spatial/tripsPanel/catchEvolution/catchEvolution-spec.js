describe('CatchevolutionCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, activityRestServiceSpy;

    beforeEach(function() {
        activityRestServiceSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchDetail', 'getTripCatchesEvolution']);

        module(function($provide) {
            $provide.value('activityRestService', activityRestServiceSpy);
        });
    });

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
    }));


    beforeEach(inject(function($rootScope, $controller) {
        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('CatchevolutionCtrl', { $scope: scope });
        scope.$digest();
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
        return [{

            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }


        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }
        }, {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d",
                    "tableColor": {
                        "background-color": "rgba(131, 186, 109, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b",
                    "tableColor": {
                        "background-color": "rgba(219, 171, 59, 0.7)"
                    }
                }, {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                }, {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222
            }
        }];
    }

    function buildMocks() {
        activityRestServiceSpy.getTripCatchDetail.andCallFake(function(test) {
            return getTripCatch();
        });
        activityRestServiceSpy.getTripCatchesEvolution.andCallFake(function(test) {
            return getTripCatchesEvolution();
        });

    }

    it('should call the services only once', inject(function() {
        expect(activityRestServiceSpy.getTripCatchDetail.callCount).toBe(1);
        expect(activityRestServiceSpy.getTripCatchesEvolution.callCount).toBe(1);
    }));

});
