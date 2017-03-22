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
describe('fishingActivityService', function() {
    var mockMdrServ, faObj;
    beforeEach(module('unionvmsWeb'));

    beforeEach(function() {
        mockMdrServ = jasmine.createSpyObj('mdrCacheService', ['getCodeList']);

        module(function($provide) {
            $provide.value('mdrCacheService', mockMdrServ);
        });
        builMocks();
    });

    function getFaGears() {
        return [{
            "type": "LHM",
            "role": "On board",
            "meshSize": "139mm",
            "lengthWidth": "11m",
            "numberOfGears": 5,
            "height": 66,
            "nrOfLines": 135,
            "nrOfNets": 4,
            "nominalLengthOfNet": 950,
            "quantity": 92,
            "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
        }, {
            "type": "TBB",
            "role": "Deployed",
            "meshSize": "211mm",
            "lengthWidth": "99m",
            "numberOfGears": 3,
            "height": 200,
            "nrOfLines": 127,
            "nrOfNets": 9,
            "nominalLengthOfNet": 109,
            "quantity": 34,
            "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
        }];
    }

    function getFaGearsResult() {
        return [{
            "type": "LHM - Handlines and pole-lines (mechanized)",
            "role": "On board",
            "meshSize": "231mm",
            "beamLength": "53m",
            "numBeams": 2
        }, {
            "type": "SSC - Scottish seines",
            "role": "On board",
            "meshSize": "65mm",
            "beamLength": "39m",
            "numBeams": 4
        }];
    }

    function getFaResponse() {

        return {
            "activityDetails": {
                "occurence": "2016-11-08T16:36:03",
                "vessel_activity": "FSH - Fishing",
                "no_operations": 57,
                "fisheryType": "Demersal",
                "targetedSpecies": [
                    "GADUS"
                ],
                "fishing_time": {
                    "duration": "10d 11h 20m"
                }
            },
            "locations": {
                "name": "Jofajwud",
                "geometry": "POINT(62.22296 -54.98633)"
            },
            "reportDetails": {
                "type": "DECLARATION",
                "acceptedDate": "2018-07-07T06:48:08",
                "id": "4bc9392b-3607-5d91-9032-194b83f89e28",
                "refId": "c0bd3ec3-b178-5951-9853-7e13bb76b607",
                "creationDate": "2016-06-09T19:34:12",
                "purposeCode": 1,
                "purpose": "Budrilico cuwmaglo gij munhofip pi zuwbibum bi feh ke za ajunutoc mupzaj gop ho legipejo epdeli.",
                "relatedReports": [
                    {
                        "id": "726b43ee-f70c-54ee-b4ad-a7976585ef42",
                        "schemeId": "dcafedc4"
                    }
                ]
            },
            "catches": [
                {
                    "type": "DISCARDED",
                    "species": "TUR",
                    "calculatedWeight": 1372,
                    "lsc": {
                        "unit": 911,
                        "weight": 1814,
                        "weightingMeans": "WEIGHED",
                        "stockId": "7da34062",
                        "size": "orbecebo",
                        "tripId": "8c3ea655-3cb6-5e67-8f75-40282589bc7a",
                        "usage": "omregaj",
                        "destinationLocation": [
                            {
                                "id": "(508)",
                                "name": "Bojuguj",
                                "countryId": "NU"
                            }
                        ],
                        "specifiedFluxLocations": [
                            {
                                "name": "Lepeme",
                                "geometry": "POINT(17.93296 -15.83782)"
                            },
                            {
                                "name": "Colufcu",
                                "geometry": "POINT(-84.30513 -47.4552)"
                            }
                        ],
                        "characteristics": [
                            {
                                "typeCode": "ij",
                                "typeCodeListId": "f14129be-3ff6-50e8-9351-3ccb1e1ce45b",
                                "valueMeasure": 503,
                                "valueMeasureUnitCode": "jurpule",
                                "calculatedValueMeasure": 335,
                                "valueDateTime": "1366808461",
                                "valueIndicator": "law",
                                "valueCode": "puheve",
                                "valueText": "Ravgodec eg awi dimon zib cu cejsuh hu bi jafe cemove awfiz lodedza agoti vu uzeupaon.",
                                "valueQuantity": 195,
                                "valueQuantityCode": "na",
                                "calculatedValueQuantity": 443,
                                "description": "Lac ul pojolla gegikun ojihag sof vor peswiddaz dafver una lag zirot mugbumha sa atufid havbo ju hi."
                            },
                            {
                                "typeCode": "mop",
                                "typeCodeListId": "7917df18-e9f4-5351-bc8d-f79c516598e5",
                                "valueMeasure": 688,
                                "valueMeasureUnitCode": "wac",
                                "calculatedValueMeasure": 941,
                                "valueDateTime": "734037196",
                                "valueIndicator": "ridafiha",
                                "valueCode": "caleoku",
                                "valueText": "Cozebuh bof te oro ojmo wehhi ca agu geuworav vargunu carterem tamuz ewi ge.",
                                "valueQuantity": 706,
                                "valueQuantityCode": "paftif",
                                "calculatedValueQuantity": 939,
                                "description": "Cecubo vovbalos et po rihbe korah pabnawke se agonep ka rihle fazhaweb golkidim nitwa wip ke."
                            }
                        ],
                        "gears": [
                            {
                                "type": "LHM",
                                "role": "On board",
                                "meshSize": "139mm",
                                "lengthWidth": "11m",
                                "numberOfGears": 5,
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            {
                                "type": "TBB",
                                "role": "Deployed",
                                "meshSize": "211mm",
                                "lengthWidth": "99m",
                                "numberOfGears": 3,
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            }
                        ]
                    },
                    "bms": {
                        "unit": 1432,
                        "weight": 1788,
                        "weightingMeans": "WEIGHED",
                        "stockId": "83369cf5",
                        "size": "oc",
                        "tripId": "6f8c22ac-b410-54db-a2f3-c040c47adc88",
                        "usage": "zezu",
                        "destinationLocation": [
                            {
                                "id": "(545)",
                                "name": "Zelihco",
                                "countryId": "SC"
                            },
                            {
                                "id": "(873)",
                                "name": "Goobri",
                                "countryId": "SY"
                            },
                            {
                                "id": "(233)",
                                "name": "Fepegez",
                                "countryId": "NI"
                            },
                            {
                                "id": "(201)",
                                "name": "Weduso",
                                "countryId": "LT"
                            }
                        ],
                        "specifiedFluxLocations": [
                            {
                                "name": "Macwosha",
                                "geometry": "POINT(-85.44089 -88.44016)"
                            },
                            {
                                "name": "Jomfiba",
                                "geometry": "POINT(-33.987 -83.40046)"
                            },
                            {
                                "name": "Minike",
                                "geometry": "POINT(81.47809 -43.04273)"
                            },
                            {
                                "name": "Jowsotobe",
                                "geometry": "POINT(20.24789 -69.17315)"
                            }
                        ],
                        "characteristics": [
                            {
                                "typeCode": "ba",
                                "typeCodeListId": "901c9f8f-f06d-5549-804d-f5d4c94a4654",
                                "valueMeasure": 117,
                                "valueMeasureUnitCode": "ag",
                                "calculatedValueMeasure": 247,
                                "valueDateTime": "341723797",
                                "valueIndicator": "opuah",
                                "valueCode": "lemamez",
                                "valueText": "Diper ef guukibi jimaskuk lizwofe evasab pajfak kepbovso jigafa mak ke abbaje esurokso gambozabu em pahhu bug kisfaopi.",
                                "valueQuantity": 942,
                                "valueQuantityCode": "pelitsu",
                                "calculatedValueQuantity": 887,
                                "description": "Ari wujamon vuj uglamus sejpu bimcibgaj upemadru tevubuj zepibbed ek temu pip jauz pef."
                            },
                            {
                                "typeCode": "evuhka",
                                "typeCodeListId": "b87980ab-dded-5bc1-a072-6835daa139a5",
                                "valueMeasure": 565,
                                "valueMeasureUnitCode": "as",
                                "calculatedValueMeasure": 308,
                                "valueDateTime": "1373985210",
                                "valueIndicator": "bahsophis",
                                "valueCode": "ruf",
                                "valueText": "Iciovsa epo keb husiffo pahjom keslatlab remonido mumhul ko fehvumi wumto widud ranuna riga nun wiviki naosit.",
                                "valueQuantity": 804,
                                "valueQuantityCode": "na",
                                "calculatedValueQuantity": 246,
                                "description": "Uv pugospuj ocipuk bazhal difeziman riuni appa jocefolab mu zeen befta toczaaki azeelza."
                            },
                            {
                                "typeCode": "af",
                                "typeCodeListId": "59c44e86-b19c-5949-b2fd-cd7ea68890a6",
                                "valueMeasure": 560,
                                "valueMeasureUnitCode": "jufegerek",
                                "calculatedValueMeasure": 276,
                                "valueDateTime": "521319180",
                                "valueIndicator": "etozobje",
                                "valueCode": "lubasmuf",
                                "valueText": "Ni daaseda zetadde fig saj jilizun topbif fi sojuzi ev moto novinal vano wu jolbisuc cihzinmej dajudbih wawcecad.",
                                "valueQuantity": 298,
                                "valueQuantityCode": "iveeco",
                                "calculatedValueQuantity": 760,
                                "description": "Buvejdo zig wet munuruh karnezor ivjompit hajaf ejunefo behulem him nenat pizviteko udrom niw."
                            }
                        ],
                        "gears": [
                            {
                                "type": "LHM",
                                "role": "On board",
                                "meshSize": "139mm",
                                "lengthWidth": "11m",
                                "numberOfGears": 5,
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            {
                                "type": "TBB",
                                "role": "Deployed",
                                "meshSize": "211mm",
                                "lengthWidth": "99m",
                                "numberOfGears": 3,
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            }
                        ]
                    },
                    "locations": {
                        "gfcm_stat_rectangle": "Dezobin",
                        "gfcm_gsa": "Damoze",
                        "fao_area": "Moapiho"
                    }
                },
                {
                    "type": "TAKEN_ONBOARD",
                    "species": "COD",
                    "calculatedWeight": 1913,
                    "lsc": {
                        "unit": 732,
                        "weight": 1901,
                        "weightingMeans": "STEREOSCOPIC",
                        "stockId": "13afa034",
                        "size": "ebsanlog",
                        "tripId": "2a3afbd6-6aeb-5eb6-9d45-fefbbd31704a",
                        "usage": "tak",
                        "destinationLocation": [
                            {
                                "id": "(961)",
                                "name": "Rewavfim",
                                "countryId": "SZ"
                            },
                            {
                                "id": "(837)",
                                "name": "Duneel",
                                "countryId": "TJ"
                            }
                        ],
                        "specifiedFluxLocations": [
                            {
                                "name": "Gavwiwji",
                                "geometry": "POINT(-81.76905 8.54789)"
                            },
                            {
                                "name": "Ebzifa",
                                "geometry": "POINT(155.04406 81.47475)"
                            },
                            {
                                "name": "Nestuipo",
                                "geometry": "POINT(87.22781 75.11277)"
                            },
                            {
                                "name": "Arkefig",
                                "geometry": "POINT(46.50919 3.38097)"
                            }
                        ],
                        "gears": [
                            {
                                "type": "LHM",
                                "role": "On board",
                                "meshSize": "139mm",
                                "lengthWidth": "11m",
                                "numberOfGears": 5,
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            {
                                "type": "TBB",
                                "role": "Deployed",
                                "meshSize": "211mm",
                                "lengthWidth": "99m",
                                "numberOfGears": 3,
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            }
                        ]
                    },
                    "bms": {
                        "unit": 1262,
                        "weight": 1079,
                        "weightingMeans": "SAMPLING",
                        "stockId": "7fbd2526",
                        "size": "hawmambiz",
                        "tripId": "db95acde-8a52-5739-aa44-93463b5d1727",
                        "usage": "uka",
                        "destinationLocation": [
                            {
                                "id": "(848)",
                                "name": "Fusitkiw",
                                "countryId": "NF"
                            },
                            {
                                "id": "(476)",
                                "name": "Rutokaf",
                                "countryId": "FR"
                            },
                            {
                                "id": "(586)",
                                "name": "Etpuled",
                                "countryId": "VA"
                            },
                            {
                                "id": "(411)",
                                "name": "Zicriabo",
                                "countryId": "CY"
                            },
                            {
                                "id": "(900)",
                                "name": "Akavupi",
                                "countryId": "AU"
                            }
                        ],
                        "specifiedFluxLocations": [
                            {
                                "name": "Mewvadpa",
                                "geometry": "POINT(8.30149 87.56808)"
                            },
                            {
                                "name": "Makmofer",
                                "geometry": "POINT(-88.49438 30.70248)"
                            }
                        ],
                        "characteristics": [
                            {
                                "typeCode": "ba",
                                "typeCodeListId": "d24dcd99-4c8a-551a-a529-facf54d10d56",
                                "valueMeasure": 220,
                                "valueMeasureUnitCode": "lahenor",
                                "calculatedValueMeasure": 901,
                                "valueDateTime": "163161957",
                                "valueIndicator": "cuku",
                                "valueCode": "nel",
                                "valueText": "Ri zocseg tavubcit lavav ojhub zuknev pemir guzjofge zibe ruzkuna nufoulu urvijok.",
                                "valueQuantity": 295,
                                "valueQuantityCode": "beg",
                                "calculatedValueQuantity": 600,
                                "description": "Mev arbebweh ewpoji taffaju etanuswac uzkoop dem ti wawocho tupa gub pedtim gafmuoko hu izzahita."
                            }
                        ],
                        "gears": [
                            {
                                "type": "LHM",
                                "role": "On board",
                                "meshSize": "139mm",
                                "lengthWidth": "11m",
                                "numberOfGears": 5,
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            {
                                "type": "TBB",
                                "role": "Deployed",
                                "meshSize": "211mm",
                                "lengthWidth": "99m",
                                "numberOfGears": 3,
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            }
                        ]
                    },
                    "locations": {
                        "fao_area": "Sitcicum",
                        "effort_zone": "Edsotos",
                        "rfmo": "Lajhuumu",
                        "territory": "Arufisa"
                    }
                }
            ],
            "gears": [
                {
                    "type": "LHM",
                    "role": "On board",
                    "meshSize": "139mm",
                    "lengthWidth": "11m",
                    "numberOfGears": 5,
                    "height": 66,
                    "nrOfLines": 135,
                    "nrOfNets": 4,
                    "nominalLengthOfNet": 950,
                    "quantity": 92,
                    "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                },
                {
                    "type": "TBB",
                    "role": "Deployed",
                    "meshSize": "211mm",
                    "lengthWidth": "99m",
                    "numberOfGears": 3,
                    "height": 200,
                    "nrOfLines": 127,
                    "nrOfNets": 9,
                    "nominalLengthOfNet": 109,
                    "quantity": 34,
                    "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                }
            ]
        };
    }

    function getFaModel() {
        return {
            "faType": "fishing_operation",
            "activityDetails": {
                "items": {
                    "occurence": {
                        "idx": 0,
                        "label": "",
                        "value": "2016-11-08T17:36:03+01:00"
                    },
                    "vessel_activity": {
                        "idx": 2,
                        "label": "",
                        "value": "FSH - Fishing"
                    },
                    "fisheryType": {
                        "idx": 4,
                        "label": "",
                        "value": "Demersal"
                    },
                    "targetedSpecies": {
                        "idx": 5,
                        "label": "",
                        "value": "GADU"
                    }
                },
                "subItems": {
                    "duration": {
                        "idx": 6,
                        "label": "",
                        "value": "10d 11h 20m"
                    }
                },
                "subTitle": "",
                "title": ": "
            },
            "locations": {
                "name": "Jofajwud",
                "geometry": "POINT(62.22296 -54.98633)"
            },
            "gears": [{
                "type": "LHM - Handlines and pole-lines (mechanized)",
                "role": "On board",
                "characteristics": {
                    "items": {
                        "meshSize": {
                            "idx": 0,
                            "label": "",
                            "value": "139mm"
                        },
                        "lengthWidth": {
                            "idx": 1,
                            "label": "",
                            "value": "11m"
                        }
                    },
                    "characteristicsDetails": {
                        "height": 66,
                        "nrOfLines": 135,
                        "nrOfNets": 4,
                        "nominalLengthOfNet": 950,
                        "quantity": 92,
                        "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                    },
                    "title": ""
                }
            }, {
                "type": "TBB",
                "role": "Deployed",
                "characteristics": {
                    "items": {
                        "meshSize": {
                            "idx": 0,
                            "label": "",
                            "value": "211mm"
                        },
                        "lengthWidth": {
                            "idx": 1,
                            "label": "",
                            "value": "99m"
                        }
                    },
                    "characteristicsDetails": {
                        "height": 200,
                        "nrOfLines": 127,
                        "nrOfNets": 9,
                        "nominalLengthOfNet": 109,
                        "quantity": 34,
                        "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                    },
                    "title": ""
                }
            }],
            "reportDetails": {
                "items": {
                    "type": {
                        "idx": 0,
                        "label": "",
                        "value": "DECLARATION"
                    },
                    "acceptedDate": {
                        "idx": 7,
                        "label": "",
                        "value": "2018-07-07T07:48:08+01:00"
                    },
                    "id": {
                        "idx": 5,
                        "label": "",
                        "value": "4bc9392b-3607-5d91-9032-194b83f89e28"
                    },
                    "refId": {
                        "idx": 6,
                        "label": "",
                        "value": "c0bd3ec3-b178-5951-9853-7e13bb76b607",
                        "clickable": true
                    },
                    "creationDate": {
                        "idx": 1,
                        "label": "",
                        "value": "2016-06-09T20:34:12+01:00"
                    },
                    "purpose": {
                        "idx": 3,
                        "label": "",
                        "value": "Budrilico cuwmaglo gij munhofip pi zuwbibum bi feh ke za ajunutoc mupzaj gop ho legipejo epdeli."
                    }
                },
                "subItems": {
                    "dcafedc4": {
                        "idx": 9,
                        "label": "",
                        "value": "726b43ee-f70c-54ee-b4ad-a7976585ef42"
                    }
                },
                "subTitle": "",
                "title": ""
            },
            "catches": [{
                "type": "DISCARDED",
                "species": "TUR",
                "calculatedWeight": 1372,
                "lsc": {
                    "specifiedFluxLocations": [{
                        "name": "Lepeme",
                        "geometry": "POINT(17.93296 -15.83782)"
                    }, {
                        "name": "Colufcu",
                        "geometry": "POINT(-84.30513 -47.4552)"
                    }],
                    "characteristics": [{
                        "typeCode": "ij",
                        "typeCodeListId": "f14129be-3ff6-50e8-9351-3ccb1e1ce45b",
                        "valueMeasure": 503,
                        "valueMeasureUnitCode": "jurpule",
                        "calculatedValueMeasure": 335,
                        "valueDateTime": "1366808461",
                        "valueIndicator": "law",
                        "valueCode": "puheve",
                        "valueText": "Ravgodec eg awi dimon zib cu cejsuh hu bi jafe cemove awfiz lodedza agoti vu uzeupaon.",
                        "valueQuantity": 195,
                        "valueQuantityCode": "na",
                        "calculatedValueQuantity": 443,
                        "description": "Lac ul pojolla gegikun ojihag sof vor peswiddaz dafver una lag zirot mugbumha sa atufid havbo ju hi."
                    }, {
                        "typeCode": "mop",
                        "typeCodeListId": "7917df18-e9f4-5351-bc8d-f79c516598e5",
                        "valueMeasure": 688,
                        "valueMeasureUnitCode": "wac",
                        "calculatedValueMeasure": 941,
                        "valueDateTime": "734037196",
                        "valueIndicator": "ridafiha",
                        "valueCode": "caleoku",
                        "valueText": "Cozebuh bof te oro ojmo wehhi ca agu geuworav vargunu carterem tamuz ewi ge.",
                        "valueQuantity": 706,
                        "valueQuantityCode": "paftif",
                        "calculatedValueQuantity": 939,
                        "description": "Cecubo vovbalos et po rihbe korah pabnawke se agonep ka rihle fazhaweb golkidim nitwa wip ke."
                    }],
                    "gears": [{
                        "type": "LHM",
                        "role": "On board",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "139mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "11m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            "title": ""
                        }
                    }, {
                        "type": "TBB",
                        "role": "Deployed",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "211mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "99m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            },
                            "title": ""
                        }
                    }],
                    "classProps": {
                        "unit": 911,
                        "weight": 1814,
                        "weightingMeans": "WEIGHED",
                        "stockId": "7da34062",
                        "size": "orbecebo",
                        "tripId": "8c3ea655-3cb6-5e67-8f75-40282589bc7a",
                        "usage": "omregaj",
                        "destinationLocation": "(508) - Bojuguj, NU"
                    }
                },
                "bms": {
                    "specifiedFluxLocations": [{
                        "name": "Macwosha",
                        "geometry": "POINT(-85.44089 -88.44016)"
                    }, {
                        "name": "Jomfiba",
                        "geometry": "POINT(-33.987 -83.40046)"
                    }, {
                        "name": "Minike",
                        "geometry": "POINT(81.47809 -43.04273)"
                    }, {
                        "name": "Jowsotobe",
                        "geometry": "POINT(20.24789 -69.17315)"
                    }],
                    "characteristics": [{
                        "typeCode": "ba",
                        "typeCodeListId": "901c9f8f-f06d-5549-804d-f5d4c94a4654",
                        "valueMeasure": 117,
                        "valueMeasureUnitCode": "ag",
                        "calculatedValueMeasure": 247,
                        "valueDateTime": "341723797",
                        "valueIndicator": "opuah",
                        "valueCode": "lemamez",
                        "valueText": "Diper ef guukibi jimaskuk lizwofe evasab pajfak kepbovso jigafa mak ke abbaje esurokso gambozabu em pahhu bug kisfaopi.",
                        "valueQuantity": 942,
                        "valueQuantityCode": "pelitsu",
                        "calculatedValueQuantity": 887,
                        "description": "Ari wujamon vuj uglamus sejpu bimcibgaj upemadru tevubuj zepibbed ek temu pip jauz pef."
                    }, {
                        "typeCode": "evuhka",
                        "typeCodeListId": "b87980ab-dded-5bc1-a072-6835daa139a5",
                        "valueMeasure": 565,
                        "valueMeasureUnitCode": "as",
                        "calculatedValueMeasure": 308,
                        "valueDateTime": "1373985210",
                        "valueIndicator": "bahsophis",
                        "valueCode": "ruf",
                        "valueText": "Iciovsa epo keb husiffo pahjom keslatlab remonido mumhul ko fehvumi wumto widud ranuna riga nun wiviki naosit.",
                        "valueQuantity": 804,
                        "valueQuantityCode": "na",
                        "calculatedValueQuantity": 246,
                        "description": "Uv pugospuj ocipuk bazhal difeziman riuni appa jocefolab mu zeen befta toczaaki azeelza."
                    }, {
                        "typeCode": "af",
                        "typeCodeListId": "59c44e86-b19c-5949-b2fd-cd7ea68890a6",
                        "valueMeasure": 560,
                        "valueMeasureUnitCode": "jufegerek",
                        "calculatedValueMeasure": 276,
                        "valueDateTime": "521319180",
                        "valueIndicator": "etozobje",
                        "valueCode": "lubasmuf",
                        "valueText": "Ni daaseda zetadde fig saj jilizun topbif fi sojuzi ev moto novinal vano wu jolbisuc cihzinmej dajudbih wawcecad.",
                        "valueQuantity": 298,
                        "valueQuantityCode": "iveeco",
                        "calculatedValueQuantity": 760,
                        "description": "Buvejdo zig wet munuruh karnezor ivjompit hajaf ejunefo behulem him nenat pizviteko udrom niw."
                    }],
                    "gears": [{
                        "type": "LHM",
                        "role": "On board",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "139mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "11m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            "title": ""
                        }
                    }, {
                        "type": "TBB",
                        "role": "Deployed",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "211mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "99m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            },
                            "title": ""
                        }
                    }],
                    "classProps": {
                        "unit": 1432,
                        "weight": 1788,
                        "weightingMeans": "WEIGHED",
                        "stockId": "83369cf5",
                        "size": "oc",
                        "tripId": "6f8c22ac-b410-54db-a2f3-c040c47adc88",
                        "usage": "zezu",
                        "destinationLocation": "(545) - Zelihco, SC"
                    }
                },
                "locations": {
                    "gfcm_stat_rectangle": "Dezobin",
                    "gfcm_gsa": "Damoze",
                    "fao_area": "Moapiho"
                }
            }, {
                "type": "TAKEN_ONBOARD",
                "species": "COD",
                "calculatedWeight": 1913,
                "lsc": {
                    "specifiedFluxLocations": [{
                        "name": "Gavwiwji",
                        "geometry": "POINT(-81.76905 8.54789)"
                    }, {
                        "name": "Ebzifa",
                        "geometry": "POINT(155.04406 81.47475)"
                    }, {
                        "name": "Nestuipo",
                        "geometry": "POINT(87.22781 75.11277)"
                    }, {
                        "name": "Arkefig",
                        "geometry": "POINT(46.50919 3.38097)"
                    }],
                    "gears": [{
                        "type": "LHM",
                        "role": "On board",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "139mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "11m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            "title": ""
                        }
                    }, {
                        "type": "TBB",
                        "role": "Deployed",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "211mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "99m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            },
                            "title": ""
                        }
                    }],
                    "classProps": {
                        "unit": 732,
                        "weight": 1901,
                        "weightingMeans": "STEREOSCOPIC",
                        "stockId": "13afa034",
                        "size": "ebsanlog",
                        "tripId": "2a3afbd6-6aeb-5eb6-9d45-fefbbd31704a",
                        "usage": "tak",
                        "destinationLocation": "(961) - Rewavfim, SZ"
                    }
                },
                "bms": {
                    "specifiedFluxLocations": [{
                        "name": "Mewvadpa",
                        "geometry": "POINT(8.30149 87.56808)"
                    }, {
                        "name": "Makmofer",
                        "geometry": "POINT(-88.49438 30.70248)"
                    }],
                    "characteristics": [{
                        "typeCode": "ba",
                        "typeCodeListId": "d24dcd99-4c8a-551a-a529-facf54d10d56",
                        "valueMeasure": 220,
                        "valueMeasureUnitCode": "lahenor",
                        "calculatedValueMeasure": 901,
                        "valueDateTime": "163161957",
                        "valueIndicator": "cuku",
                        "valueCode": "nel",
                        "valueText": "Ri zocseg tavubcit lavav ojhub zuknev pemir guzjofge zibe ruzkuna nufoulu urvijok.",
                        "valueQuantity": 295,
                        "valueQuantityCode": "beg",
                        "calculatedValueQuantity": 600,
                        "description": "Mev arbebweh ewpoji taffaju etanuswac uzkoop dem ti wawocho tupa gub pedtim gafmuoko hu izzahita."
                    }],
                    "gears": [{
                        "type": "LHM",
                        "role": "On board",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "139mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "11m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 66,
                                "nrOfLines": 135,
                                "nrOfNets": 4,
                                "nominalLengthOfNet": 950,
                                "quantity": 92,
                                "description": "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
                            },
                            "title": ""
                        }
                    }, {
                        "type": "TBB",
                        "role": "Deployed",
                        "characteristics": {
                            "items": {
                                "meshSize": {
                                    "idx": 0,
                                    "label": "",
                                    "value": "211mm"
                                },
                                "lengthWidth": {
                                    "idx": 1,
                                    "label": "",
                                    "value": "99m"
                                }
                            },
                            "characteristicsDetails": {
                                "height": 200,
                                "nrOfLines": 127,
                                "nrOfNets": 9,
                                "nominalLengthOfNet": 109,
                                "quantity": 34,
                                "description": "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
                            },
                            "title": ""
                        }
                    }],
                    "classProps": {
                        "unit": 1262,
                        "weight": 1079,
                        "weightingMeans": "SAMPLING",
                        "stockId": "7fbd2526",
                        "size": "hawmambiz",
                        "tripId": "db95acde-8a52-5739-aa44-93463b5d1727",
                        "usage": "uka",
                        "destinationLocation": "(848) - Fusitkiw, NF"
                    }
                },
                "locations": {
                    "fao_area": "Sitcicum",
                    "effort_zone": "Edsotos",
                    "rfmo": "Lajhuumu",
                    "territory": "Arufisa"
                }
            }]
        }
    }

    function getGears() {
        return [{
            "code": "LHM",
            "description": "Handlines and pole-lines (mechanized)"
        },
        {
            "code": "SSC",
            "description": "Scottish seines"
        }];
    }

    function getCatchType() {
        return [{
            "code": "KEPT_IN_NET",
            "description": "Catch kept in the net"
        }];
    }

    function getWeightMeans() {
        return [{
            "code": "ESTIMATED",
            "description": "Estimated weight mean"
        }];
    }

    function builMocks() {
        mockMdrServ.getCodeList.andCallFake(function(param) {
            if (param === 'gear_type') {
                return {
                    then: function(callback) {
                        return callback(getGears());
                    }
                };
            } else if (param === 'fa_catch_type') {
                return {
                    then: function(callback) {
                        return callback(getCatchType());
                    }
                };
            } else {
                return {
                    then: function(callback) {
                        return callback(getWeightMeans());
                    }
                };
            }
        });
    }

    it('should load the fa model', inject(function(fishingActivityService, FishingActivity) {
        var faObj = new FishingActivity('fishing_operation');
        faObj.fromJson(getFaResponse());
        expect(angular.equals(faObj, getFaModel())).toBe(true);
        /*expect(faObj).toEqual(getFaModel());*/
    }));

});
