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
describe('catchTile', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile;

  beforeEach(inject(function($rootScope,$compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

  function buildMocks(){
    scope.fishingData = [
        {
            "type":"KEPT_IN_NET",
            "species":"LEM",
            "calculatedWeight":2213,
            "lsc":{
              "specifiedFluxLocations":[
                  {
                    "name":"Ewajatpav",
                    "geometry":"POINT(-119.76458 -32.60067)"
                  },
                  {
                    "name":"Lowozzo",
                    "geometry":"POINT(29.07022 -61.82131)"
                  }
              ],
              "characteristics":[
                  {
                    "typeCode":"idme",
                    "typeCodeListId":"6f53cebe-b69b-59ba-801a-d29e5a3dc23c",
                    "valueMeasure":448,
                    "valueMeasureUnitCode":"imhaom",
                    "calculatedValueMeasure":103,
                    "valueDateTime":"946167866",
                    "valueIndicator":"tob",
                    "valueCode":"ra",
                    "valueText":"Bemzes asazovo gorzigig deforu hu juluf ta votdirwa ca kow rude boho ponpok dub rujer pisa supiteg.",
                    "valueQuantity":991,
                    "valueQuantityCode":"woburow",
                    "calculatedValueQuantity":743,
                    "description":"Wu suofu gowzifdez burubgep rutoki rid inra ivefoiw uwket zala rag jatrac ajtiha jeb hesevce bacujezos."
                  }
              ],
              "gears":[
                  {
                    "type":"TBB",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"239mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"31m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":180,
                        "nrOfLines":268,
                        "nrOfNets":9,
                        "nominalLengthOfNet":786,
                        "quantity":80,
                        "description":"Tocapugaw wog kawakhof muubouka bug vutdeb div jefawo fik vizekcek imtecev risisupik fekal ga di wihibosu huznulzuh."
                    }
                  },
                  {
                    "type":"GND",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"209mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"21m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":210,
                        "nrOfLines":50,
                        "nrOfNets":9,
                        "nominalLengthOfNet":579,
                        "quantity":6,
                        "description":"Jula manaegu uh mo jadu cifzecos vibpawo bofric gukfavo rarceiba owa cawbec."
                    }
                  },
                  {
                    "type":"SSC",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"134mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"72m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":80,
                        "nrOfLines":197,
                        "nrOfNets":6,
                        "nominalLengthOfNet":115,
                        "quantity":48,
                        "description":"Pediru cu riifowi kocu ber ida hin uwu wokav tudo gaw rihici dasfe kejuj ofomuf zuk su vekmir."
                    }
                  },
                  {
                    "type":"LHM",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"85mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"31m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":210,
                        "nrOfLines":175,
                        "nrOfNets":7,
                        "nominalLengthOfNet":623,
                        "quantity":16,
                        "description":"Mu vugmoh alud umo mi puhadaco budahip teg nesefes fa jeribo uwo zekgucje verut rol."
                    }
                  }
              ],
              "classProps":{
                  "unit":939,
                  "weight":852,
                  "weightingMeans":"ONBOARD",
                  "stockId":"598f9ff2",
                  "size":"piluwga",
                  "tripId":"f650374d-8385-5911-8c4f-bdf80add2267",
                  "usage":"suhcom",
                  "destinationLocation":"(672) - Guwazesi, NE"
              }
            },
            "bms":{
              "specifiedFluxLocations":[
                  {
                    "name":"Kikpoho",
                    "geometry":"POINT(-66.06405 41.17505)"
                  },
                  {
                    "name":"Owijuba",
                    "geometry":"POINT(-70.50319 6.04512)"
                  },
                  {
                    "name":"Iwmupe",
                    "geometry":"POINT(-86.73505 85.29817)"
                  }
              ],
              "characteristics":[
                  {
                    "typeCode":"ire",
                    "typeCodeListId":"404fd324-1741-5966-b526-8809a43edc2a",
                    "valueMeasure":740,
                    "valueMeasureUnitCode":"dupke",
                    "calculatedValueMeasure":246,
                    "valueDateTime":"454498100",
                    "valueIndicator":"piben",
                    "valueCode":"acucaje",
                    "valueText":"Hale pagucab ogu ze am fuz ozucirwod or ni sauca mus fajicara fiswasu nur rebwoze afkej ewlifza.",
                    "valueQuantity":342,
                    "valueQuantityCode":"se",
                    "calculatedValueQuantity":954,
                    "description":"Ci ku rarod polow geeko bezugow mehi fud lotkoc nuklohuj adonev lupu reco agavi ligijcih uzbevje ca."
                  },
                  {
                    "typeCode":"camow",
                    "typeCodeListId":"8ca683f2-c0d0-5c64-b365-60abdae0851c",
                    "valueMeasure":854,
                    "valueMeasureUnitCode":"baz",
                    "calculatedValueMeasure":118,
                    "valueDateTime":"1127158548",
                    "valueIndicator":"mol",
                    "valueCode":"sesu",
                    "valueText":"Nuje erwo zuffodvo jih afu ko laduvo ab garfos hivicnu cotegajuk nalzab lifecsa.",
                    "valueQuantity":491,
                    "valueQuantityCode":"wejpuw",
                    "calculatedValueQuantity":401,
                    "description":"Guzatbub pekadik bihu tubnehmu pusjo menvap vin ebzem ruum wef peipri bugiho."
                  },
                  {
                    "typeCode":"wonibkok",
                    "typeCodeListId":"6b26fddf-9acc-5d1a-97c5-e6a871dc573e",
                    "valueMeasure":149,
                    "valueMeasureUnitCode":"taufa",
                    "calculatedValueMeasure":270,
                    "valueDateTime":"307701307",
                    "valueIndicator":"kozsaiki",
                    "valueCode":"tisnu",
                    "valueText":"Un je zinmu engepid cukiis kuptanu mif judleiha muvgenec dige novza pa pedboc ufe ic pume jak bujnoz.",
                    "valueQuantity":532,
                    "valueQuantityCode":"ib",
                    "calculatedValueQuantity":666,
                    "description":"Itaena nevu rilekiw bina zesoti fakapli mucwemubi jumfa few ja rewweeno owazow mop livwil at ow hepaka."
                  }
              ],
              "gears":[
                  {
                    "type":"SSC",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"140mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"29m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":281,
                        "nrOfLines":56,
                        "nrOfNets":9,
                        "nominalLengthOfNet":167,
                        "quantity":31,
                        "description":"Weukeiso pa gube evi ra mu boleh kibip forzo pa wacmibpuc megit ofemameza riikoba oc."
                    }
                  },
                  {
                    "type":"TBB",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"166mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"93m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":293,
                        "nrOfLines":186,
                        "nrOfNets":4,
                        "nominalLengthOfNet":775,
                        "quantity":77,
                        "description":"Gujaif enoetmof iruhafa dos guduruk javaz ziz sokug fur usjelic geje jeknofruk."
                    }
                  },
                  {
                    "type":"LHM",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"80mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"17m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":215,
                        "nrOfLines":115,
                        "nrOfNets":3,
                        "nominalLengthOfNet":726,
                        "quantity":67,
                        "description":"Ugkunuv puj boh ikamom omujes juwwauka kuzuz mogob koblimbad lofzamat gulanet betda zi soko."
                    }
                  },
                  {
                    "type":"GND",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"82mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"99m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":179,
                        "nrOfLines":246,
                        "nrOfNets":3,
                        "nominalLengthOfNet":527,
                        "quantity":4,
                        "description":"Su guwwe wacicgi cu ewneuw jutgi isa godurbo ha ifimi ehdoz zaf okoofa cipum era jopvuna."
                    }
                  }
              ],
              "classProps":{
                  "unit":1822,
                  "weight":1924,
                  "weightingMeans":"ESTIMATED",
                  "stockId":"783ec34b",
                  "size":"mehinar",
                  "tripId":"52997fa0-8f29-5390-84a7-5e3bfe2e914b",
                  "usage":"vebtekti",
                  "destinationLocation":"(324) - Utulileb, IT"
              }
            },
            "locations":{
              "gfcm_stat_rectangle":"Wuzuoj"
            }
        },
        {
            "type":"LOADED",
            "species":"COD",
            "calculatedWeight":1067,
            "lsc":{
              "specifiedFluxLocations":[
                  {
                    "name":"Mowemlo",
                    "geometry":"POINT(-109.50803 34.75681)"
                  },
                  {
                    "name":"Bedhutan",
                    "geometry":"POINT(-122.62001 -87.33271)"
                  },
                  {
                    "name":"Guvhitim",
                    "geometry":"POINT(-179.69149 -1.56923)"
                  }
              ],
              "gears":[
                  {
                    "type":"SSC",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"68mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"41m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":250,
                        "nrOfLines":52,
                        "nrOfNets":9,
                        "nominalLengthOfNet":152,
                        "quantity":84,
                        "description":"Ifemi hovec cohmemabi karipdo roclavid nezki nut he opahasot ewco cohdad nafucmim tewga gu eczu vo."
                    }
                  },
                  {
                    "type":"GTR",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"137mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"12m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":235,
                        "nrOfLines":202,
                        "nrOfNets":9,
                        "nominalLengthOfNet":931,
                        "quantity":69,
                        "description":"Penipton wovhimo keh keolomo keozihi guj utcomo rahote ca kutco vacca colfuki vuz ladi jin umrec vusa ufomorno."
                    }
                  },
                  {
                    "type":"GND",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"194mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"13m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":154,
                        "nrOfLines":174,
                        "nrOfNets":7,
                        "nominalLengthOfNet":508,
                        "quantity":90,
                        "description":"Diniha wimer mowu no ule mugbotfu turhabhen zoacamoj mece izbuk kahajfel lut midin rocowet vudu."
                    }
                  },
                  {
                    "type":"LHM",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"194mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"26m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":126,
                        "nrOfLines":65,
                        "nrOfNets":9,
                        "nominalLengthOfNet":787,
                        "quantity":86,
                        "description":"Cuzomur etobuz ti koloho gow fidad mon hu tucedude boh fukji arek ruvkibnab."
                    }
                  }
              ],
              "classProps":{
                  "unit":595,
                  "weight":391,
                  "weightingMeans":"ONBOARD",
                  "stockId":"8bc124c8",
                  "size":"tow",
                  "tripId":"e6752ee1-dff0-5c4f-badf-8ca5b2615d40",
                  "usage":"moimela",
                  "destinationLocation":"(444) - Kijowbic, TV"
              }
            },
            "bms":{
              "specifiedFluxLocations":[
                  {
                    "name":"Fehitsu",
                    "geometry":"POINT(-2.98733 53.36113)"
                  }
              ],
              "gears":[
                  {
                    "type":"TBB",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"234mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"64m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":222,
                        "nrOfLines":153,
                        "nrOfNets":2,
                        "nominalLengthOfNet":855,
                        "quantity":93,
                        "description":"De te mi bipnemji soihi uhjaraj ni cagmoif degi bokinu itaniggol ib ta puzgamur hipvumgiv cepti."
                    }
                  },
                  {
                    "type":"SSC",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"207mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"79m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":282,
                        "nrOfLines":97,
                        "nrOfNets":6,
                        "nominalLengthOfNet":893,
                        "quantity":23,
                        "description":"Sowhupoc eg nukev me gi daced ha koj or ciwaget zizbu tutpuvuz fewijupip ewrusob lu."
                    }
                  }
              ],
              "classProps":{
                  "unit":1440,
                  "weight":986,
                  "weightingMeans":"ESTIMATED",
                  "stockId":"0e1c6754",
                  "size":"cadozab",
                  "tripId":"e6c57fef-21a8-54ea-a00e-077c2098c145",
                  "usage":"coc",
                  "destinationLocation":"(432) - Kopaome, AS"
              }
            },
            "locations":{
              "fao_area":"Gotocwun",
              "ices_stat_rectangle":"Bekikka",
              "effort_zone":"Dohodeg",
              "gfcm_stat_rectangle":"Lotuvra"
            }
        },
        {
            "type":"DISCARDED",
            "species":"SOL",
            "calculatedWeight":2067,
            "lsc":{
              "specifiedFluxLocations":[
                  {
                    "name":"Fuwanunij",
                    "geometry":"POINT(-91.70599 -39.1499)"
                  },
                  {
                    "name":"Huucuru",
                    "geometry":"POINT(-74.627 -22.66165)"
                  },
                  {
                    "name":"Wazdasuz",
                    "geometry":"POINT(12.59977 28.43369)"
                  }
              ],
              "gears":[
                  {
                    "type":"TBB",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"242mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"42m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":143,
                        "nrOfLines":80,
                        "nrOfNets":2,
                        "nominalLengthOfNet":989,
                        "quantity":5,
                        "description":"Nablaw sacaj mavenvi nop for wiufiiw di ketusadi cuir pahija niheje vopijut cahipce ep hiezida ricvajob ersulsa."
                    }
                  }
              ],
              "classProps":{
                  "unit":1467,
                  "weight":820,
                  "weightingMeans":"STEREOSCOPIC",
                  "stockId":"bedda0c1",
                  "size":"pup",
                  "tripId":"31670f5e-8908-5cfb-8718-b5fba0e973bf",
                  "usage":"ge",
                  "destinationLocation":"(842) - Betruclur, MU"
              }
            },
            "bms":{
              "specifiedFluxLocations":[
                  {
                    "name":"Fuajfo",
                    "geometry":"POINT(136.69741 -42.94774)"
                  },
                  {
                    "name":"Deuzare",
                    "geometry":"POINT(-138.54588 -54.29153)"
                  }
              ],
              "characteristics":[
                  {
                    "typeCode":"wejfeim",
                    "typeCodeListId":"778244f2-4f8b-5a3e-8ddf-7b927f75c548",
                    "valueMeasure":965,
                    "valueMeasureUnitCode":"tuullel",
                    "calculatedValueMeasure":956,
                    "valueDateTime":"749207566",
                    "valueIndicator":"wiug",
                    "valueCode":"odani",
                    "valueText":"Mac hut zitgu piizutuc co bitjo at do mucuf de ti kitu vo odumiwcu zoh fujbusad defotsav jaji.",
                    "valueQuantity":225,
                    "valueQuantityCode":"vawi",
                    "calculatedValueQuantity":222,
                    "description":"Gen ninwo lihgoeno dap idi ib ugunogine supe avus wiidajo juvlilih jeden cujhevki."
                  },
                  {
                    "typeCode":"fibsazif",
                    "typeCodeListId":"2fb97cbd-2462-5b6f-b7f5-7c2cf97f1e6c",
                    "valueMeasure":527,
                    "valueMeasureUnitCode":"vod",
                    "calculatedValueMeasure":185,
                    "valueDateTime":"793441828",
                    "valueIndicator":"la",
                    "valueCode":"nisatgo",
                    "valueText":"Luzhulab kev in tawac romalif wawocuj hil bitvisif educagi gopa ek sigejaru zelowa ba omefofcis jezarim.",
                    "valueQuantity":542,
                    "valueQuantityCode":"vidzu",
                    "calculatedValueQuantity":588,
                    "description":"Gobvo cal ginjuj dotvicu vuwehuca ibha weroj dos des eheuh sesasleg migzozsaw gog oteleoji ubulen nu ipu."
                  }
              ],
              "gears":[
                  {
                    "type":"TBB",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"52mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"69m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":81,
                        "nrOfLines":298,
                        "nrOfNets":2,
                        "nominalLengthOfNet":700,
                        "quantity":98,
                        "description":"Colrap fimebfu um rim puh fimna ib mogca jew buedpu ujulavo weuhe ged vivolisor."
                    }
                  },
                  {
                    "type":"GTR",
                    "role":"Deployed",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"173mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"31m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":219,
                        "nrOfLines":231,
                        "nrOfNets":10,
                        "nominalLengthOfNet":500,
                        "quantity":23,
                        "description":"Wajsikhi runewoh si vobrejav fiscumdok hifvuicu fef birket gurpuj geptukmin rev tow vunjopo ez."
                    }
                  },
                  {
                    "type":"SSC",
                    "role":"On board",
                    "characteristics":{
                        "items":[
                          {
                              "idx":0,
                              "label":"Mesh size",
                              "value":"104mm"
                          },
                          {
                              "idx":1,
                              "label":"Width length",
                              "value":"55m"
                          }
                        ],
                        "title":"Characteristics"
                    },
                    "characteristicsDetails":{
                        "height":209,
                        "nrOfLines":107,
                        "nrOfNets":5,
                        "nominalLengthOfNet":431,
                        "quantity":56,
                        "description":"Loerdef dem gupaop hivitan cid vece dec eje cu buvowu ir jat puibe ledvir livse buima hisem pifennuz."
                    }
                  }
              ],
              "classProps":{
                  "unit":1123,
                  "weight":1260,
                  "weightingMeans":"STEREOSCOPIC",
                  "stockId":"e2d3e8a1",
                  "size":"legomep",
                  "tripId":"3bb977e4-3d5f-533d-bf0d-2c9c40eec9ba",
                  "usage":"fogar",
                  "destinationLocation":"(685) - Nahtufab, RS"
              }
            },
            "locations":{
              "ices_stat_rectangle":"Tujhenla"
            }
        }
      ];

      scope.isLocationClickable = function(){
        return true;
      };

      scope.clickCallback = function(){
        return true;
      };
  }

  it('should compile and receive the data', function() {
      buildMocks();

      var catchDetail = compile('<catch-tile class="col-md-12 summary-section" ng-model="fishingData" tile-title="Catch" is-location-clickable="isLocationClickable()" buffer-distance="5000" click-callback="locationClickCallback()"></catch-tile>')(scope);
      scope.$digest();

      var isolatedScope = catchDetail.isolateScope();

      expect(isolatedScope.ngModel).toEqual(scope.fishingData);
      expect(catchDetail.find('> .fieldsetLegendStyle > a').text()).toEqual('Catch');
      expect(isolatedScope.bufferDistance).toEqual('5000');

      expect(isolatedScope.selectedClass).toEqual('lsc');
      expect(isolatedScope.selectedSpecieLocation[isolatedScope.selectedClass]).toEqual(scope.fishingData[0][isolatedScope.selectedClass]);
      catchDetail.find('.details-content .global-container table tbody tr')[1].click();
      scope.$digest();
      expect(isolatedScope.selectedClass).toEqual('bms');
      expect(isolatedScope.selectedSpecieLocation[isolatedScope.selectedClass]).toEqual(scope.fishingData[0][isolatedScope.selectedClass]);

      catchDetail.isolateScope().$destroy();
  });
});