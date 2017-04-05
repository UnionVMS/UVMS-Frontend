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
describe('FishingActivity', function() {
  var data;
  beforeEach(module('unionvmsWeb'));
  
  function getFishingOperationData(){
      return {
          "activityDetails": {
              "occurence": "2017-01-21T04:16:08",
              "reason": "Fishing",
              "fisheryType": "Demersal",
              "targetedSpecies": [
                  "CODFISH",
                  "BEAGLE",
                  "GADUS",
                  "SEAFOOD"
              ],
            "fishing_time": {
                "startDate": "2017-01-21T04:16:08"
            }
        },
          "locations": {
              "name": "Duivgug",
              "geometry": "POINT(-51.90263 21.4388)"},
          "gears": [{
                  "type": "LHM",
                  "role": "On board",
                  "meshSize": "231mm",
                  "beamLength": "53m",
                  "numBeams": 2
              },{
                  "type": "SSC",
                  "role": "On board",
                  "meshSize": "65mm",
                  "beamLength": "39m",
                  "numBeams": 4
              }],
          "reportDetails": {
              "type": "NOTIFICATION",
              "dateAccepted": "2016-08-25T10:29:58",
              "id": "d1a71a7c-9b86-592b-bdc6-6f9b2958ac78",
              "refId": "38322286-c95b-57db-b35e-88702dadfc7e",
              "creationDate": "2017-02-08T11:15:47",
              "purposeCode": 3,
              "purpose": "Nizcu sev fabu nathe gani bucava sa vagowwi buzi ekje zobhe ke gesepomi bueb ced.",
              "relatedReports": [
                {
                    "schemaId": "askdlja",
                    "id": "asdlasd-asdkasjd1-1231"
                },
                {
                    "schemaId": "askdlja",
                    "id": "asdlasd-asdkasjd1-1231"
                }
              ]
        },
          "catches": [{
                    type: 'DISCARDED',
                    species: 'TUR',
                    calculatedWeight: 1372,
                    groupingDetails: {
                        LSC: {
                            unit: 911,
                            weight: 1814,
                            specifiedFluxLocations: [{
                                    name: 'Lepeme',
                                    geometry: 'POINT(17.93296 -15.83782)'
                                }, {
                                    name: 'Colufcu',
                                    geometry: 'POINT(-84.30513 -47.4552)'
                                }
                            ],
                            characteristics: [{
                                    typeCode: 'ij',
                                    typeCodeListId: 'f14129be-3ff6-50e8-9351-3ccb1e1ce45b',
                                    valueMeasure: 503,
                                    valueMeasureUnitCode: 'jurpule',
                                    calculatedValueMeasure: 335,
                                    valueDateTime: '1366808461',
                                    valueIndicator: 'law',
                                    valueCode: 'puheve',
                                    valueText: 'Ravgodec eg awi dimon zib cu cejsuh hu bi jafe cemove awfiz lodedza agoti vu uzeupaon.',
                                    valueQuantity: 195,
                                    valueQuantityCode: 'na',
                                    calculatedValueQuantity: 443,
                                    description: 'Lac ul pojolla gegikun ojihag sof vor peswiddaz dafver una lag zirot mugbumha sa atufid havbo ju hi.'
                                }, {
                                    typeCode: 'mop',
                                    typeCodeListId: '7917df18-e9f4-5351-bc8d-f79c516598e5',
                                    valueMeasure: 688,
                                    valueMeasureUnitCode: 'wac',
                                    calculatedValueMeasure: 941,
                                    valueDateTime: '734037196',
                                    valueIndicator: 'ridafiha',
                                    valueCode: 'caleoku',
                                    valueText: 'Cozebuh bof te oro ojmo wehhi ca agu geuworav vargunu carterem tamuz ewi ge.',
                                    valueQuantity: 706,
                                    valueQuantityCode: 'paftif',
                                    calculatedValueQuantity: 939,
                                    description: 'Cecubo vovbalos et po rihbe korah pabnawke se agonep ka rihle fazhaweb golkidim nitwa wip ke.'
                                }
                            ],
                            gears: [{
                                    type: 'LHM',
                                    role: 'On board',
                                    mainCharacteristics: {
                                        items: [{
                                                idx: 0,
                                                label: '',
                                                value: '139mm',
                                                clickable: undefined
                                            }, {
                                                idx: 1,
                                                label: '',
                                                value: '11m',
                                                clickable: undefined
                                            }
                                        ],
                                        characteristics: {
                                            height: 66,
                                            nrOfLines: 135,
                                            nrOfNets: 4,
                                            nominalLengthOfNet: 950,
                                            quantity: 92,
                                            description: 'Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot.'
                                        },
                                        title: ''
                                    }
                                }, {
                                    type: 'TBB',
                                    role: 'Deployed',
                                    mainCharacteristics: {
                                        items: [{
                                                idx: 0,
                                                label: '',
                                                value: '211mm',
                                                clickable: undefined
                                            }, {
                                                idx: 1,
                                                label: '',
                                                value: '99m',
                                                clickable: undefined
                                            }
                                        ],
                                        characteristics: {
                                            height: 200,
                                            nrOfLines: 127,
                                            nrOfNets: 9,
                                            nominalLengthOfNet: 109,
                                            quantity: 34,
                                            description: 'Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo.'
                                        },
                                        title: ''
                                    }
                                }
                            ],
                            classProps: {
                                weightingMeans: 'WEIGHED',
                                stockId: '7da34062',
                                size: 'orbecebo',
                                tripId: '8c3ea655-3cb6-5e67-8f75-40282589bc7a',
                                usage: 'omregaj',
                                destinationLocation: '(508) - Bojuguj, NU'
                            }
                        },
                        BMS: {
                            unit: 1432,
                            weight: 1788,
                            specifiedFluxLocations: [{
                                    name: 'Macwosha',
                                    geometry: 'POINT(-85.44089 -88.44016)'
                                }, {
                                    name: 'Jomfiba',
                                    geometry: 'POINT(-33.987 -83.40046)'
                                }, {
                                    name: 'Minike',
                                    geometry: 'POINT(81.47809 -43.04273)'
                                }, {
                                    name: 'Jowsotobe',
                                    geometry: 'POINT(20.24789 -69.17315)'
                                }
                            ],
                            characteristics: [{
                                    typeCode: 'ba',
                                    typeCodeListId: '901c9f8f-f06d-5549-804d-f5d4c94a4654',
                                    valueMeasure: 117,
                                    valueMeasureUnitCode: 'ag',
                                    calculatedValueMeasure: 247,
                                    valueDateTime: '341723797',
                                    valueIndicator: 'opuah',
                                    valueCode: 'lemamez',
                                    valueText: 'Diper ef guukibi jimaskuk lizwofe evasab pajfak kepbovso jigafa mak ke abbaje esurokso gambozabu em pahhu bug kisfaopi.',
                                    valueQuantity: 942,
                                    valueQuantityCode: 'pelitsu',
                                    calculatedValueQuantity: 887,
                                    description: 'Ari wujamon vuj uglamus sejpu bimcibgaj upemadru tevubuj zepibbed ek temu pip jauz pef.'
                                }, {
                                    typeCode: 'evuhka',
                                    typeCodeListId: 'b87980ab-dded-5bc1-a072-6835daa139a5',
                                    valueMeasure: 565,
                                    valueMeasureUnitCode: 'as',
                                    calculatedValueMeasure: 308,
                                    valueDateTime: '1373985210',
                                    valueIndicator: 'bahsophis',
                                    valueCode: 'ruf',
                                    valueText: 'Iciovsa epo keb husiffo pahjom keslatlab remonido mumhul ko fehvumi wumto widud ranuna riga nun wiviki naosit.',
                                    valueQuantity: 804,
                                    valueQuantityCode: 'na',
                                    calculatedValueQuantity: 246,
                                    description: 'Uv pugospuj ocipuk bazhal difeziman riuni appa jocefolab mu zeen befta toczaaki azeelza.'
                                }, {
                                    typeCode: 'af',
                                    typeCodeListId: '59c44e86-b19c-5949-b2fd-cd7ea68890a6',
                                    valueMeasure: 560,
                                    valueMeasureUnitCode: 'jufegerek',
                                    calculatedValueMeasure: 276,
                                    valueDateTime: '521319180',
                                    valueIndicator: 'etozobje',
                                    valueCode: 'lubasmuf',
                                    valueText: 'Ni daaseda zetadde fig saj jilizun topbif fi sojuzi ev moto novinal vano wu jolbisuc cihzinmej dajudbih wawcecad.',
                                    valueQuantity: 298,
                                    valueQuantityCode: 'iveeco',
                                    calculatedValueQuantity: 760,
                                    description: 'Buvejdo zig wet munuruh karnezor ivjompit hajaf ejunefo behulem him nenat pizviteko udrom niw.'
                                }
                            ],
                            gears: [{
                                    type: 'LHM',
                                    role: 'On board',
                                    mainCharacteristics: {
                                        items: [{
                                                idx: 0,
                                                label: '',
                                                value: '139mm',
                                                clickable: undefined
                                            }, {
                                                idx: 1,
                                                label: '',
                                                value: '11m',
                                                clickable: undefined
                                            }
                                        ],
                                        characteristics: {
                                            height: 66,
                                            nrOfLines: 135,
                                            nrOfNets: 4,
                                            nominalLengthOfNet: 950,
                                            quantity: 92,
                                            description: 'Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot.'
                                        },
                                        title: ''
                                    }
                                }, {
                                    type: 'TBB',
                                    role: 'Deployed',
                                    mainCharacteristics: {
                                        items: [{
                                                idx: 0,
                                                label: '',
                                                value: '211mm',
                                                clickable: undefined
                                            }, {
                                                idx: 1,
                                                label: '',
                                                value: '99m',
                                                clickable: undefined
                                            }
                                        ],
                                        characteristics: {
                                            height: 200,
                                            nrOfLines: 127,
                                            nrOfNets: 9,
                                            nominalLengthOfNet: 109,
                                            quantity: 34,
                                            description: 'Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo.'
                                        },
                                        title: ''
                                    }
                                }
                            ],
                            classProps: {
                                weightingMeans: 'WEIGHED',
                                stockId: '83369cf5',
                                size: 'oc',
                                tripId: '6f8c22ac-b410-54db-a2f3-c040c47adc88',
                                usage: 'zezu',
                                destinationLocation: '(545) - Zelihco, SC'
                            }
                        }
                    },
                    locations: {
                        gfcm_stat_rectangle: 'Dezobin',
                        gfcm_gsa: 'Damoze',
                        fao_area: 'Moapiho'
                    }
                }]
      };
  }
  
  it('should instantiate a new empty departure object', inject(function(FishingActivity){
      var fa = new FishingActivity('fishing_operation');
      
      expect(fa).toEqual(jasmine.any(Object));
      expect(fa.faType).toEqual('fishing_operation');
      expect(fa.operationType).not.toBeDefined();


      expect(fa.activityDetails).not.toBeDefined();
      expect(fa.locations).not.toBeDefined();
      expect(fa.gears).not.toBeDefined();
      expect(fa.reportDetails).not.toBeDefined();
      expect(fa.catches).not.toBeDefined();
  }));

  it('should properly build a fishing operation from json data', inject(function(FishingActivity) {
      data = getFishingOperationData();

      var fa = new FishingActivity('fishing_operation');
      fa.fromJson(data);
      
      expect(fa.activityDetails).toBeDefined();
      expect(fa.activityDetails.items).toBeDefined();
      expect(fa.activityDetails.subItems).toBeDefined();
      expect(fa.activityDetails.title).toBeDefined();
      expect(fa.activityDetails.subTitle).toBeDefined();

      expect(fa.locations).toEqual(data.locations);

      expect(fa.reportDetails).toBeDefined();
      expect(fa.reportDetails.items).toBeDefined();
      expect(fa.reportDetails.subItems).toBeDefined();
      expect(fa.reportDetails.title).toBeDefined();
      expect(fa.reportDetails.subTitle).toBeDefined();
      
      expect(fa.gears.length).toEqual(2);
      expect(fa.catches.length).toBe(1);
  }));

});
