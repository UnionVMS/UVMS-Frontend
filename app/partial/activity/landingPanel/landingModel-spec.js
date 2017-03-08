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
describe('Landing', function () {
    var data, summary;
    beforeEach(module('unionvmsWeb'));

    beforeEach(function () {
        data = getLandingData();
        summary = finalSummary();
    });


    function getLandingData() {
        return {
            "summary": {
                "occurence": "2018-02-26T00:28:28",
                "landingTime": {
                    "startOfLanding": "2016-04-22T17:47:19",
                    "endOfLanding": "2017-07-05T14:14:58"
                }
            },
            "port": {
                "name": "Heparkef",
                "geometry": "POINT(-110.87483 -27.21663)"
            },
            "reportDoc": {
                "type": "NOTIFICATION",
                "dateAccepted": "2018-03-01T21:53:57",
                "id": "d9ecf171-6cbd-54ae-ae51-006ff9724b64",
                "refId": "9bc9ff39-4452-5039-953b-6e3f5687bcbe",
                "creationDate": "2017-02-28T10:40:37",
                "purposeCode": 1,
                "purpose": "Ni fumozudi enatug zittufed kim usion lipiwnip luziz aduke wovdifur pufbijkot zudgeuv jul dev con."
            },
            "landingCatchData": [{
                "species": "TUR",
                "speciesName": "CODFISH",
                "lsc": 1900,
                "bms": 714,
                "catchType": "LOADED",
                "units": 437,
                "totalWeight": 1303,
                "catchDetails": [{
                    "area": "Nakabuko",
                    "productWeight": 1298,
                    "size": "BMS",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "SSC",
                    "locations": [{
                        "name": "Guvtofco",
                        "geometry": "POINT(130.51053 25.87245)"
                    }, {
                        "name": "Meftofbi",
                        "geometry": "POINT(-71.4098 13.27981)"
                    }, {
                        "name": "Totuju",
                        "geometry": "POINT(-9.0239 -10.55423)"
                    }],
                    "gears": [{
                        "role": "Deployed",
                        "meshSize": "240mm",
                        "beamLength": "57m",
                        "gearType": "GND",
                        "numBeams": 2
                    }, {
                        "role": "On board",
                        "meshSize": "247mm",
                        "beamLength": "71m",
                        "gearType": "SSC",
                        "numBeams": 3
                    }]
                }, {
                    "area": "Ofekevu",
                    "productWeight": 1236,
                    "size": "LSC",
                    "presentatior": "WHL",
                    "preservation": "FRE",
                    "gearUsed": "SSC",
                    "locations": [{
                        "name": "Nugidojip",
                        "geometry": "POINT(-21.34009 67.91161)"
                    }, {
                        "name": "Ridvibwez",
                        "geometry": "POINT(132.08825 34.37984)"
                    }],
                    "gears": [{
                        "role": "Deployed",
                        "meshSize": "64mm",
                        "beamLength": "92m",
                        "gearType": "GTR",
                        "numBeams": 2
                    }, {
                        "role": "On board",
                        "meshSize": "83mm",
                        "beamLength": "33m",
                        "gearType": "GND",
                        "numBeams": 3
                    }, {
                        "role": "On board",
                        "meshSize": "224mm",
                        "beamLength": "53m",
                        "gearType": "SSC",
                        "numBeams": 4
                    }]
                }, {
                    "area": "Kefejina",
                    "productWeight": 1919,
                    "size": "LSC",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "LHM",
                    "locations": [{
                        "name": "Rodilru",
                        "geometry": "POINT(-15.40754 -40.79133)"
                    }, {
                        "name": "Refuvup",
                        "geometry": "POINT(-82.60369 -44.75682)"
                    }, {
                        "name": "Bafhibow",
                        "geometry": "POINT(-170.07975 -42.17223)"
                    }, {
                        "name": "Awianicaw",
                        "geometry": "POINT(105.34325 80.98774)"
                    }],
                    "gears": [{
                        "role": "On board",
                        "meshSize": "201mm",
                        "beamLength": "45m",
                        "gearType": "TBB",
                        "numBeams": 3
                    }, {
                        "role": "On board",
                        "meshSize": "196mm",
                        "beamLength": "3m",
                        "gearType": "GTR",
                        "numBeams": 2
                    }]
                }, {
                    "area": "Kofebec",
                    "productWeight": 1209,
                    "size": "BMS",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "GTR",
                    "locations": [{
                        "name": "Higisze",
                        "geometry": "POINT(-41.11442 68.6247)"
                    }, {
                        "name": "Pawsobo",
                        "geometry": "POINT(26.78343 -79.89435)"
                    }, {
                        "name": "Duhbohibo",
                        "geometry": "POINT(28.37275 56.24883)"
                    }, {
                        "name": "Cacafgu",
                        "geometry": "POINT(-57.09713 74.87138)"
                    }, {
                        "name": "Palnimdeg",
                        "geometry": "POINT(-69.48467 -21.78431)"
                    }],
                    "gears": [{
                        "role": "Deployed",
                        "meshSize": "177mm",
                        "beamLength": "98m",
                        "gearType": "LHM",
                        "numBeams": 2
                    }]
                }, {
                    "area": "Avpuvo",
                    "productWeight": 1369,
                    "size": "BMS",
                    "presentatior": "WHL",
                    "preservation": "FRE",
                    "gearUsed": "TBB",
                    "locations": [{
                        "name": "Viihpig",
                        "geometry": "POINT(51.63179 45.50557)"
                    }, {
                        "name": "Uvdegu",
                        "geometry": "POINT(-99.82444 24.67573)"
                    }, {
                        "name": "Gitaumu",
                        "geometry": "POINT(47.7262 40.77303)"
                    }],
                    "gears": [{
                        "role": "Deployed",
                        "meshSize": "84mm",
                        "beamLength": "27m",
                        "gearType": "GND",
                        "numBeams": 1
                    }]
                }]
            }, {
                "species": "LEM",
                "speciesName": "SEAFOOD",
                "lsc": 975,
                "bms": 343,
                "catchType": "DISCARDED",
                "units": 120,
                "totalWeight": 1921,
                "catchDetails": [{
                    "area": "Barezad",
                    "productWeight": 1142,
                    "size": "BMS",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "GND",
                    "locations": [{
                        "name": "Mejbovha",
                        "geometry": "POINT(70.38522 -64.41237)"
                    }, {
                        "name": "Giifogut",
                        "geometry": "POINT(-122.81808 21.38709)"
                    }, {
                        "name": "Dibojos",
                        "geometry": "POINT(91.49204 83.20157)"
                    }, {
                        "name": "Cadcudulo",
                        "geometry": "POINT(-144.12501 10.45963)"
                    }, {
                        "name": "Ceozguj",
                        "geometry": "POINT(-80.44485 -61.91642)"
                    }],
                    "gears": [{
                        "role": "Deployed",
                        "meshSize": "197mm",
                        "beamLength": "86m",
                        "gearType": "LHM",
                        "numBeams": 1
                    }, {
                        "role": "Deployed",
                        "meshSize": "124mm",
                        "beamLength": "23m",
                        "gearType": "LHM",
                        "numBeams": 4
                    }, {
                        "role": "Deployed",
                        "meshSize": "78mm",
                        "beamLength": "71m",
                        "gearType": "TBB",
                        "numBeams": 1
                    }, {
                        "role": "On board",
                        "meshSize": "144mm",
                        "beamLength": "9m",
                        "gearType": "LHM",
                        "numBeams": 4
                    }]
                }, {
                    "area": "Sordekbut",
                    "productWeight": 1128,
                    "size": "BMS",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "SSC",
                    "locations": [{
                        "name": "Gugedku",
                        "geometry": "POINT(-103.48696 -27.84659)"
                    }, {
                        "name": "Atononek",
                        "geometry": "POINT(-116.76812 29.70785)"
                    }, {
                        "name": "Fopfutne",
                        "geometry": "POINT(-77.15813 -88.35926)"
                    }, {
                        "name": "Bubajwu",
                        "geometry": "POINT(72.66799 -18.91009)"
                    }, {
                        "name": "Cukbifu",
                        "geometry": "POINT(-77.89279 -5.33678)"
                    }],
                    "gears": [{
                        "role": "On board",
                        "meshSize": "82mm",
                        "beamLength": "52m",
                        "gearType": "GND",
                        "numBeams": 5
                    }]
                }, {
                    "area": "Efborhab",
                    "productWeight": 1633,
                    "size": "BMS",
                    "presentatior": "GUT",
                    "preservation": "FRE",
                    "gearUsed": "GTR",
                    "locations": [{
                        "name": "Tuhosov",
                        "geometry": "POINT(-162.18508 9.08323)"
                    }],
                    "gears": [{
                        "role": "On board",
                        "meshSize": "88mm",
                        "beamLength": "76m",
                        "gearType": "GND",
                        "numBeams": 5
                    }]
                }]
            }]

        }
    }
    function finalSummary() {
        return {
            title: ':',
            subTitle: '',
            items: {
                occurence: '2018-02-26T00:28:28'
            },
            subItems: {
                startOfLanding: '2016-04-22T17:47:19',
                endOfLanding: '2017-07-05T14:14:58'
            }
        }
    };

    it('should instantiate a new empty landing object', inject(function (Landing) {
        var land = new Landing();

        expect(land).toEqual(jasmine.any(Object));
        expect(land.summary).not.toBeDefined();
        expect(land.port).not.toBeDefined();
        expect(land.landingCatchData).toEqual([]);
        expect(land.reportDoc).not.toBeDefined();

    }));

    it('should properly build landing from json data', inject(function (Landing) {
        var land = new Landing();
        land.fromJson(data);
        expect(land.summary).toEqual(summary);
        expect(land.port).toEqual(data.port);
        expect(land.reportDoc).toEqual(data.reportDoc);
        expect(land.landingCatchData.length).toEqual(2);
    }));

});
