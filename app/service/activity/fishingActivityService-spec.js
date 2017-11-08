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
    var mockMdrServ, actRestServ;
    beforeEach(module('unionvmsWeb'));

    beforeEach(function() {
        mockMdrServ = jasmine.createSpyObj('mdrCacheService', ['getCodeList']);
        actRestServ = jasmine.createSpyObj('activityRestService', ['getFishingActivityDetails']);

        module(function($provide) {
            $provide.value('mdrCacheService', mockMdrServ);
            $provide.value('activityRestService', actRestServ);
        });
        builMocks();
    });


    var faModels = {
        common: [
            'activityDetails',
            'reportDetails',
            'tripDetails'
        ],
        departure: [
            'locations',
            'gears',
            'catches',
            'processingProducts'
        ],
        landing: [
            'locations',
            'catches',
            'processingProducts'
        ],
        arrival_notification: [
            'locations',
            'catches',
            'processingProducts'
        ],
        arrival_declaration: [
            'locations',
            'gears'
        ],
        fishing_operation: [
            'locations',
            'gears',
            'catches',
            'processingProducts',
            'gearShotRetrieval'
        ],
        discard: [
            'locations',
            'catches',
            'processingProducts'
        ],
        joint_fishing_operation: [
            'locations',
            'gears',
            'catches',
            'processingProducts',
            'relocation',
            'vesselDetails',
            'gearProblems'
        ],
        relocation: [
            'locations',
            'catches',
            'processingProducts',
            'vesselDetails'
        ],
        transhipment: [
            'locations',
            'catches',
            'processingProducts',
            'vesselDetails'
        ],
        area_entry: [
            'areas',
            'catches',
            'processingProducts'
        ],
        area_exit: [
            'areas',
            'catches',
            'processingProducts'
        ]
    };

    function getActivityDetails() {
        return {
                occurence: "2016-11-08T16:36:03",
                vessel_activity: "FSH - Fishing",
                no_operations: 57,
                fisheryType: "Demersal",
                targetedSpecies: [
                    "GADUS"
                ],
                fishing_time: {
                    duration: "10d 11h 20m"
                }
            };
    }

    function getLocation() {
        return {
            name: "Jofajwud",
            geometry: "POINT(62.22296 -54.98633)"
        };
    }

    function getReportDetails() {
        return {
            type: "DECLARATION",
            id: "4bc9392b-3607-5d91-9032-194b83f89e28",
            refId: "c0bd3ec3-b178-5951-9853-7e13bb76b607",
            purposeCode: 1,
            purpose: "Budrilico cuwmaglo gij munhofip pi zuwbibum bi feh ke za ajunutoc mupzaj gop ho legipejo epdeli.",
            relatedReports: [
                {
                    id: "726b43ee-f70c-54ee-b4ad-a7976585ef42",
                    schemeId: "dcafedc4"
                }
            ]
        };
    }

    function getGears() {
        return [
            {
                type: "LHM",
                role: "On board",
                meshSize: "139mm",
                lengthWidth: "11m",
                numberOfGears: 5,
                height: 66,
                nrOfLines: 135,
                nrOfNets: 4,
                nominalLengthOfNet: 950,
                quantity: 92,
                description: "Otdoki winad jakifi li vebahu waazu fow ebezijo asmaca relena lulas vaj lure bitehu weper ukojuj vumdabew ot."
            },
            {
                type: "TBB",
                role: "Deployed",
                meshSize: "211mm",
                lengthWidth: "99m",
                numberOfGears: 3,
                height: 200,
                nrOfLines: 127,
                nrOfNets: 9,
                nominalLengthOfNet: 109,
                quantity: 34,
                description: "Sec lufi mazwubkoz hesgos nemto neku sale kowijfa ju opa icopaze lisizo."
            }
        ];
    }

    function getCatchClass() {
        return {
            unit: 911,
            weight: 1814,
            weightingMeans: "WEIGHED",
            stockId: "7da34062",
            size: "orbecebo",
            tripId: "8c3ea655-3cb6-5e67-8f75-40282589bc7a",
            usage: "omregaj",
            destinationLocation: [
                {
                    id: "(508)",
                    name: "Bojuguj",
                    countryId: "NU"
                }
            ],
            specifiedFluxLocations: [
                getLocation(),
                getLocation()
            ],
            characteristics: [
                {
                    typeCode: "ij",
                    typeCodeListId: "f14129be-3ff6-50e8-9351-3ccb1e1ce45b",
                    valueMeasure: 503,
                    valueMeasureUnitCode: "jurpule",
                    calculatedValueMeasure: 335,
                    valueDateTime: "1366808461",
                    valueIndicator: "law",
                    valueCode: "puheve",
                    valueText: "Ravgodec eg awi dimon zib cu cejsuh hu bi jafe cemove awfiz lodedza agoti vu uzeupaon.",
                    valueQuantity: 195,
                    valueQuantityCode: "na",
                    calculatedValueQuantity: 443,
                    description: "Lac ul pojolla gegikun ojihag sof vor peswiddaz dafver una lag zirot mugbumha sa atufid havbo ju hi."
                },
                {
                    typeCode: "mop",
                    typeCodeListId: "7917df18-e9f4-5351-bc8d-f79c516598e5",
                    valueMeasure: 688,
                    valueMeasureUnitCode: "wac",
                    calculatedValueMeasure: 941,
                    valueDateTime: "734037196",
                    valueIndicator: "ridafiha",
                    valueCode: "caleoku",
                    valueText: "Cozebuh bof te oro ojmo wehhi ca agu geuworav vargunu carterem tamuz ewi ge.",
                    valueQuantity: 706,
                    valueQuantityCode: "paftif",
                    calculatedValueQuantity: 939,
                    description: "Cecubo vovbalos et po rihbe korah pabnawke se agonep ka rihle fazhaweb golkidim nitwa wip ke."
                }
            ],
            gears: getGears()
        };
    }

    function getCatchDetail() {
        return {
            type: "DISCARDED",
            species: "TUR",
            calculatedWeight: 1372,
            groupingDetails: {
                LSC: getCatchClass(),
                BMS: getCatchClass()
            },
            locations: {
                "gfcm_stat_rectangle": "Dezobin",
                "gfcm_gsa": "Damoze",
                "fao_area": "Moapiho"
            }
        };
    }

    function getTripDetails() {
        return {
            vesselDetails:{
                name: "MADONNA DI POMPEI",
                country: "MLT",
                contactParties:[
                    {
                        role: "MASTER",
                        contactPerson:{
                            alias: "Miguel Nunes"
                        },
                        structuredAddress:[
                            {
                            streetName: "MARSAXLOKK (KAVALLERIZZA)",
                            countryCode: "MLT"
                            }
                        ]
                    }
                ],
                vesselIds:[
                    {
                        id: "SWE000010025",
                        schemeId: "CFR"
                    }
                ],
                authorizations:[

                ]
            },
            trips:[
                {
                    tripId:[
                        {
                            id: "MLT-TRP-20160630000001",
                            schemeId: "EU_TRIP_ID"
                        }
                    ],
                    arrivalTime: "2017-01-08T22:18:00",
                    landingTime: "2017-01-09T10:46:00"
                }
            ]
        };
    }

    function getProcessingProduct() {
        return {  
            type: "UNLOADED",
            locations:{  
                fao_area: "51.5"
            },
            species: "SKJ",
            presentation: "WHL",
            weight: 106854.0
        };
    }

    function getVesselDetails() {
        return {
            country:"ESP",
            role:"RECEIVER",
            contactParties:[

            ],
            vesselIds:[
                {
                    id:"EA6395",
                    schemeId:"IRCS"
                }
            ],
            authorizations:[
                {
                    id:"fIdVessel2",
                    schemeId:"sIdVEssel2"
                },
                {
                    id:"fIdVessel",
                    schemeId:"sIdVEssel"
                },
                {
                    id:"fId123",
                    schemeId:"sId123"
                }
            ]
        };
    }

    function getGearShotRetrieval() {
        return [
            {
                type:"GEAR_SHOT",
                occurrence:"2016-12-20T01:31:00",
                characteristics:{

                },
                gearProblems:[

                ],
                location:{
                    geometry:"POINT (-11.303 49.683)",
                    structuredAddresses:[

                    ]
                }
            },
            {
                type:"GEAR_RETRIEVAL",
                occurrence:"2016-12-20T06:02:00",
                characteristics:{

                },
                gearProblems:[

                ],
                location:{
                    geometry:"POINT (-11.382 49.439)",
                    structuredAddresses:[

                    ]
                }
            }
        ];
    }

    function getRelocation() {
        return {
            roleName:"PARTICIPATING_VESSEL",
            country:"MAR",
            vesselIdentifiers:[
                {
                    id:"MA04",
                    schemeId:"IRCS"
                },
                {
                    id:"ATEU0MAR00004",
                    schemeId:"ICCAT"
                }
            ],
            name:"NAVIRE 4",
            speciesCode:"BFT",
            type:"ALLOCATED_TO_QUOTA",
            weight:0,
            unit:0,
            characteristics:[

            ]
        };
    }

    function getAreas() {
        return {
            transmission:{
                occurence:"2017-01-09T12:20:00"
            },
            crossing:{
                occurence:"2017-01-09T12:20:00"
            }
        };
    }

    function getFaResponse() {
        return {
            activityDetails: getActivityDetails(),
            locations: getLocation(),
            reportDetails: getReportDetails(),
            catches: [
                getCatchDetail(),
                getCatchDetail()
            ],
            gears: getGears(),
            tripDetails: getTripDetails(),
            processingProducts: [
                getProcessingProduct(),
                getProcessingProduct()
            ],
            vesselDetails: getVesselDetails(),
            gearShotRetrievalList: getGearShotRetrieval(),
            relocations: [
                getRelocation(),
                getRelocation()
            ],
            gearProblems: [],
            areas: getAreas()
        };
    }


    function getActivityDetailsResult() {
        return {
            items:[
                {
                    idx:4,
                    label:'',
                    value:'Demersal',
                    clickable:undefined,
                    onClick:undefined,
                    id:'fisheryType'
                }
            ],
            subItems:[
                {
                    idx:6,
                    label:'',
                    value:'10d 11h 20m',
                    clickable:undefined,
                    onClick:undefined,
                    id:'duration'
                }
            ],
            subTitle:'',
            title:': '
        };
    }

    function getGearsResult() {
        return [{
                type: 'LHM - Handlines and pole-lines (mechanized)',
                role: 'On board',
                mainCharacteristics: {
                    items: [{
                            idx: 0,
                            label: '',
                            value: '139mm',
                            clickable: undefined,
                            onClick: undefined,
                            id: 'meshSize'
                        }, {
                            idx: 1,
                            label: '',
                            value: '11m',
                            clickable: undefined,
                            onClick: undefined,
                            id: 'lengthWidth'
                        }, {
                            idx: 2,
                            label: '',
                            value: 5,
                            clickable: undefined,
                            onClick: undefined,
                            id: 'numberOfGears'
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
                            clickable: undefined,
                            onClick: undefined,
                            id: 'meshSize'
                        }, {
                            idx: 1,
                            label: '',
                            value: '99m',
                            clickable: undefined,
                            onClick: undefined,
                            id: 'lengthWidth'
                        }, {
                            idx: 2,
                            label: '',
                            value: 3,
                            clickable: undefined,
                            onClick: undefined,
                            id: 'numberOfGears'
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
        ];
    }

    function getReportDetailsResult() {
        return {
            items: [{
                    idx: 0,
                    label: '',
                    value: 'DECLARATION',
                    clickable: undefined,
                    id: 'type'
                }, {
                    idx: 5,
                    label: '',
                    value: '4bc9392b-3607-5d91-9032-194b83f89e28',
                    clickable: undefined,
                    id: 'id'
                }, {
                    idx: 6,
                    label: '',
                    value: 'c0bd3ec3-b178-5951-9853-7e13bb76b607',
                    clickable: true,
                    id: 'refId'
                }, {
                    idx: 2,
                    label: '',
                    value: 1,
                    clickable: undefined,
                    id: 'purposeCode'
                }, {
                    idx: 3,
                    label: '',
                    value: 'Budrilico cuwmaglo gij munhofip pi zuwbibum bi feh ke za ajunutoc mupzaj gop ho legipejo epdeli.',
                    clickable: undefined,
                    id: 'purpose'
                }
            ],
            subItems: [{
                    idx: 9,
                    label: '',
                    value: '726b43ee-f70c-54ee-b4ad-a7976585ef42',
                    clickable: undefined,
                    id: 'dcafedc4'
                }
            ],
            subTitle: '',
            title: ''
        };
    }

    function getCatchClassResult() {
        return {
            unit: 911,
            weight: 1814,
            specifiedFluxLocations: [
                getLocation(),
                getLocation()
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
            gears: getGearsResult(),
            classProps: {
                weightingMeans: 'WEIGHED',
                stockId: '7da34062',
                size: 'orbecebo',
                tripId: '8c3ea655-3cb6-5e67-8f75-40282589bc7a',
                usage: 'omregaj',
                destinationLocation: '(508) - Bojuguj, NU'
            }
        };
    }

    function getCatchDetailResult() {
        return {
            type: 'DISCARDED',
            species: 'TUR',
            calculatedWeight: 1372,
            groupingDetails: {
                LSC: getCatchClassResult(),
                BMS: getCatchClassResult()
            },
            locations: {
                gfcm_stat_rectangle: 'Dezobin',
                gfcm_gsa: 'Damoze',
                fao_area: 'Moapiho'
            }
        };
    }

    function getTripDetailsResult() {
        return {
            vesselDetails:{
                name:'MADONNA DI POMPEI',
                country:'MLT',
                contactParties:[
                    {
                        role:'MASTER',
                        contactPerson:{
                        alias:'Miguel Nunes'
                        },
                        structuredAddress:[
                        {
                            streetName:'MARSAXLOKK (KAVALLERIZZA)',
                            countryCode:'MLT'
                        }
                        ],
                        type:'MASTER - Miguel Nunes'
                    }
                ],
                vesselOverview:{
                    items:[
                        {
                        idx:1,
                        label:'',
                        value:'MADONNA DI POMPEI',
                        clickable:undefined,
                        onClick:undefined,
                        id:'name'
                        },
                        {
                        idx:2,
                        label:'',
                        value:'MLT',
                        clickable:undefined,
                        onClick:undefined,
                        id:'country'
                        },
                        {
                        idx:3,
                        label:'',
                        value:'SWE000010025',
                        clickable:undefined,
                        onClick:undefined,
                        id:'CFR'
                        }
                    ]
                },
                type:'MLT - MADONNA DI POMPEI'
            },
            trips:[
                {
                    tripId:[
                        {
                        id:'MLT-TRP-20160630000001',
                        schemeId:'EU_TRIP_ID'
                        }
                    ],
                    arrivalTime:'2017-01-08T22:18:00',
                    landingTime:'2017-01-09T10:46:00'
                }
            ]
        };
    }

    function getVesselDetailsResult() {
        return [
            {
                country:'ESP',
                role:'RECEIVER',
                authorizations:{
                    items:[
                        {
                            idx:0,
                            label:'',
                            value:'fIdVessel2',
                            clickable:undefined,
                            onClick:undefined,
                            id:'sIdVEssel2'
                        },
                        {
                            idx:1,
                            label:'',
                            value:'fIdVessel',
                            clickable:undefined,
                            onClick:undefined,
                            id:'sIdVEssel'
                        },
                        {
                            idx:2,
                            label:'',
                            value:'fId123',
                            clickable:undefined,
                            onClick:undefined,
                            id:'sId123'
                        }
                    ],
                    title:''
                },
                vesselOverview:{
                    items:[
                        {
                            idx:2,
                            label:'',
                            value:'ESP',
                            clickable:undefined,
                            onClick:undefined,
                            id:'country'
                        },
                        {
                            idx:0,
                            label:'',
                            value:'RECEIVER',
                            clickable:undefined,
                            onClick:undefined,
                            id:'role'
                        },
                        {
                            idx:3,
                            label:'',
                            value:'EA6395',
                            clickable:undefined,
                            onClick:undefined,
                            id:'IRCS'
                        }
                    ]
                },
                type:'ESP'
            }
        ];
    }

    function getGearShotRetrievalResult() {
        return [
            {
                type:"GEAR_SHOT",
                occurrence:"2016-12-20T01:31:00",
                characteristics:{

                },
                gearProblems:[

                ],
                location:[
                    {
                        geometry:"POINT (-11.303 49.683)",
                        structuredAddresses:[

                        ]
                    }
                ]
            },
            {
                type:"GEAR_RETRIEVAL",
                occurrence:"2016-12-20T06:02:00",
                characteristics:{

                },
                gearProblems:[

                ],
                location:[
                    {
                        geometry:"POINT (-11.382 49.439)",
                        structuredAddresses:[

                        ]
                    }
                ]
            }
        ];
    }

    function getRelocationResult() {
        return {
            roleName:"PARTICIPATING_VESSEL",
            country:"MAR",
            vesselIdentifiers:[
                {
                    id:"MA04",
                    schemeId:"IRCS"
                },
                {
                    id:"ATEU0MAR00004",
                    schemeId:"ICCAT"
                }
            ],
            name:"NAVIRE 4",
            speciesCode:"BFT",
            type:"ALLOCATED_TO_QUOTA",
            weight:0,
            unit:0,
            characteristics:[

            ],
            ircs:"MA04",
            vesselId:{
                id:"ATEU0MAR00004",
                schemeId:"ICCAT"
            }
        };
    }

    function getAreasResult() {
        return {
            areaData:{
                transmission:{
                    occurence:"2017-01-09T12:20:00"
                },
                crossing:{
                    occurence:"2017-01-09T12:20:00"
                }
            },
                title:"",
                number:6
        };
    }

    var finalModel = {
        areas: getAreasResult(),
        activityDetails: getActivityDetailsResult(),
        locations: getLocation(),
        gears: getGearsResult(),
        reportDetails: getReportDetailsResult(),
        catches: [
            getCatchDetailResult(), 
            getCatchDetailResult()
        ],
        tripDetails: getTripDetailsResult(),
        processingProducts: [
            getProcessingProduct(),
            getProcessingProduct()
        ],
        vesselDetails: getVesselDetailsResult(),
        gearShotRetrieval: getGearShotRetrievalResult(),
        relocation: [
            getRelocationResult(),
            getRelocationResult()
        ],
        gearProblems: []
    };

    function getGearsDesc() {
        return [{
            code: "LHM",
            description: "Handlines and pole-lines (mechanized)"
        },
        {
            code: "SSC",
            description: "Scottish seines"
        }];
    }

    function getCatchType() {
        return [{
            code: "KEPT_IN_NET",
            description: "Catch kept in the net"
        }];
    }

    function getWeightMeans() {
        return [{
            code: "ESTIMATED",
            description: "Estimated weight mean"
        }];
    }

    function builMocks() {
        mockMdrServ.getCodeList.andCallFake(function(param) {
            if (param === 'GEAR_TYPE') {
                return {
                    then: function(callback) {
                        return callback(getGearsDesc());
                    }
                };
            } else if (param === 'FA_CATCH_TYPE') {
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

    angular.forEach(faModels,function(type,typeName){
        if(typeName !== 'common'){
            var components = faModels.common.concat(type);

            describe(typeName, function() {
                var faObj;

                beforeEach(inject(function(FishingActivity) {
                    faObj = new FishingActivity(typeName);
                    faObj.fromJson(getFaResponse());
                }));

                angular.forEach(components, function(component){
                    it('should load ' + component, function() {
                        if(component === 'reportDetails'){
                            angular.forEach(faObj[component].items, function(item){
                                delete item.onClick;
                            });
                            angular.forEach(faObj[component].subItems, function(subItem){
                                delete subItem.onClick;
                            });
                        }

                        var exceptions = ['arrival_notification', 'arrival_declaration'];
                        if(component === 'activityDetails' && exceptions.indexOf(typeName) !== -1){
                            expect(faObj[component]).toEqual(getActivityDetails());
                        }else{
                            expect(faObj[component]).toEqual(finalModel[component]);
                            expect(_.isEqual(faObj[component],finalModel[component])).toBeTruthy();
                        }
                    });
                });

            });
        }
    });

});
