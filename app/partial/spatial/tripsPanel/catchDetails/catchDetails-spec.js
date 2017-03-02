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
describe('CatchdetailsCtrl', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, activityRestServiceSpy;

    beforeEach(function () {
        activityRestServiceSpy = jasmine.createSpyObj('activityRestService', ['getTripCatchDetail', 'getTripCatchesLandingDetails']);

        module(function ($provide) {
            $provide.value('activityRestService', activityRestServiceSpy);
        });
    });

    beforeEach(inject(function ($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({ data: [] });
    }));

    beforeEach(inject(function ($rootScope, $controller) {
        buildMocks();
        scope = $rootScope.$new();
        ctrl = $controller('CatchdetailsCtrl', { $scope: scope });
        scope.$digest();
    }));

    function getTripCatchDetail() {
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



    function getTripCatchesLandingDetails() {
        return {
                "difference": {
                    "items": {
                        "catches": {
                            "lsc": {
                                "cod": "1222",
                                "sol": "1222",
                                "lem": "1333",
                                "tur": "1333"
                            },
                            "bms": {
                                "cod": "23",
                                "sol": "22"
                            }
                        },
                        "landed": {
                            "lsc": {
                                "cod": "1283",
                                "sol": "1161",
                                "lem": "1666",
                                "tur": "1466"
                            },
                            "bms": {
                                "cod": "24",
                                "sol": "20"
                            }

                        },
                        "difference": {
                            "lsc": {
                                "cod": "615(+5)",
                                "sol": "1161(+5)",
                                "lem": "1666(+5)",
                                "tur": "1466(+5)"
                            },
                            "bms": {
                                "cod": "24(+5)",
                                "sol": "20(+5)"
                            }
                        }
                    }
                },
                "catches": {
                    "total": {
                        "lsc": {
                            "cod": "5555",
                            "sol": "6666",
                            "lem": "7777",
                            "tur": "8888"
                        },
                        "bms": {
                            "cod": "9999",
                            "sol": "9999"
                        },
                        "dis": {
                            "cod": "1111",
                            "lem": "5555"
                        },
                        "dim": {
                            "sol": "9876"
                        }
                    },
                    "items": [{
                        "date": "21-04-1879",
                        "area": "235 RUE DU PROGRESS",
                        "lsc": {
                            "cod": "1111",
                            "sol": "1111",
                            "lem": "00001",
                            "tur": "12341"
                        },
                        "bms": {
                            "cod": "1231",
                            "sol": "1111"
                        },
                        "dis": {
                            "cod": "3451",
                            "lem": "1231"
                        },
                        "dim": {
                            "sol": "5671"
                        }
                    }, {
                        "date": "21-04-1880",
                        "area": "236 RUE DU PROGRESS1",
                        "lsc": {
                            "cod": "1112",
                            "sol": "1112",
                            "lem": "00002",
                            "tur": "12342"
                        },
                        "bms": {
                            "cod": "1232",
                            "sol": "1112"
                        },
                        "dis": {
                            "cod": "3452",
                            "lem": "1232"
                        },
                        "dim": {
                            "sol": "5672"
                        }
                    }, {
                        "date": "21-04-1881",
                        "area": "237 RUE DU PROGRESS2",
                        "lsc": {
                            "cod": "1113",
                            "sol": "1113",
                            "lem": "00003",
                            "tur": "12343"
                        },
                        "bms": {
                            "cod": "5363",
                            "sol": "1113"
                        },
                        "dis": {
                            "cod": "8753",
                            "lem": "1233"
                        },
                        "dim": {
                            "sol": "5673"
                        }
                    }]
                },
                "landing": {
                    "total": {
                        "lsc": {
                            "cod": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "123",
                                "gut": "876"
                            },
                            "lem": {
                                "whl": "666"
                            },
                            "tur": {
                                "whl": "000"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            }
                        }
                    },
                    "items": [{
                        "area": "235 RUE DU PROGRESS",
                        "lsc": {
                            "cod": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "lem": {
                                "whl": "888"
                            },
                            "tur": {
                                "whl": "777"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            }
                        }
                    }, {
                        "area": "235 RUE DU PROGRESS1",
                        "lsc": {
                            "cod": {
                                "whl": "7772",
                                "gut": "4442"
                            },
                            "sol": {
                                "whl": "7772",
                                "gut": "4442"
                            },
                            "lem": {
                                "whl": "7772"
                            },
                            "tur": {
                                "whl": "7772"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "4442"
                            },
                            "sol": {
                                "whl": "7772",
                                "gut": "4442"
                            }
                        }
                    }, {
                        "area": "235 RUE DU PROGRESS2",
                        "lsc": {
                            "cod": {
                                "whl": "7773",
                                "gut": "4443"
                            },
                            "sol": {
                                "whl": "7773",
                                "gut": "4443"
                            },
                            "lem": {
                                "whl": "7773"
                            },
                            "tur": {
                                "whl": "7773"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            }
                        }
                    }]
                }
            };

    }




    function buildMocks() {
        activityRestServiceSpy.getTripCatchDetail.andCallFake(function () {
            return {
                then: function(callback){
                    return callback(getTripCatchDetail());
                }
            };
        });
        activityRestServiceSpy.getTripCatchesLandingDetails.andCallFake(function (test) {
            return {
                then: function(callback){
                    return callback(getTripCatchesLandingDetails());
                }
            };
        });
    }



    it('should call the web services only once', inject(function () {
        expect(activityRestServiceSpy.getTripCatchDetail.callCount).toBe(1);
        expect(activityRestServiceSpy.getTripCatchesLandingDetails.callCount).toBe(1);
    }));

    it('should initialize the mandatory properties', inject(function () {
        angular.forEach(scope.tables,function(table) {
            expect(table.headers).toBeDefined();
            expect(table.rows).toBeDefined();
            expect(table.order).toBeDefined();
        });
    }));

    it('should initialize the totals and table titles', inject(function () {
        var tableData = getTripCatchesLandingDetails();

        angular.forEach(tableData,function(data,tableName) {
            angular.forEach(scope.tables,function(table) {
                if(tableName===table.title){
                    if(angular.isDefined(data.total)){
                        expect(table.totals).toBeDefined();
                    }
                    if(tableName === 'difference'){
                        expect(table.title).toBeUndefined();
                    }else{
                        expect(table.title).toEqual(tableName);
                    }
                }
            });
        });
    }));
    

});

