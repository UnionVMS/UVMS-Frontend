describe('gearShotRetrievalTile', function() {

    beforeEach(module('unionvmsWeb'));
    
    var scope,compile,mockMapServ;
    
    beforeEach(function(){
        mockMapServ = jasmine.createSpyObj('mapService', ['zoomTo', 'getMapProjectionCode']);
        
        module(function($provide){
            $provide.value('mapService', mockMapServ);
        });
    });
    
    beforeEach(inject(function($rootScope,$compile,$injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $injector.get('$httpBackend');
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
        
        mockService();
    }));
    
    afterEach(function(){
        angular.element('gear-shot-retrieval-tile').remove();
    });
    
    function mockService(){
        mockMapServ.getMapProjectionCode.andCallFake(function(){
            return 'EPSG:4326'
        });
    }
    
    function builMockData(){
        return [{
            type: 'GEAR_RETRIEVAL',
            occurrence: '2018-03-13T06:21:16',
            id: {
                id: '826b9acc-e071-5e8c-8dba-d27af967cb09',
                schemeId: 'e7c40415'
            },
            duration: 69662,
            characteristics: {
                key1: 'value1',
                key2: 'value2'
            },
            location: [{
                country: 'SS',
                rfmoCode: 'Borders',
                geometry: 'POINT(-170.84345 -60.27334)',
                structuredAddress: [{
                    streetName: 'Kurwuv View',
                    plotId: '1d0a3e3c',
                    postCode: 'G7H 6H0',
                    cityName: 'Emumule',
                    countryCode: 'LY',
                    countryName: 'Lithuania',
                    characteristics: {
                        key1: 'value1',
                        key2: 'value2'
                    }
                }],
                identifier: {
                    id: 'a2c02904-6374-525d-87ae-b8103f602830',
                    schemeId: '6a965aa3'
                }
            }],
            gearProblems: [{
                type: 'SPLIT',
                nrOfGears: 3,
                recoveryMeasure: 'OCULAR',
                locations: [{
                    country: 'MH',
                    rfmoCode: 'Buckinghamshire',
                    geometry: 'POINT(-47.1814 20.57743)',
                    structuredAddress: [{
                        streetName: 'Olalak Loop',
                        plotId: '3f049180',
                        postCode: 'L1S 7K8',
                        cityName: 'Abanignec',
                        countryCode: 'TW',
                        countryName: 'Tunisia',
                        characteristics: {
                            key1: 'value1',
                            key2: 'value2'
                        }
                    }],
                    identifier: {
                        id: 'b09dbdd2-c25a-5acf-8002-9cc9618f7618',
                        schemeId: 'ee7b4e05'
                    }
                }],
                recoveryDesc: 'Locating lost gear using visual methods',
                typeDesc: 'Split'
            }],
            gears: [{
                    type: 'LHM',
                    role: 'On board',
                    characteristics: {
                        items: [{
                                idx: 0,
                                label: 'Mesh size',
                                value: '104mm'
                            },{
                                idx: 1,
                                label: 'Width length',
                                value: '40m'
                            }],
                        characteristicsDetails: {
                            height: 287,
                            nrOfLines: 128,
                            nrOfNets: 8,
                            nominalLengthOfNet: 966,
                            quantity: 68,
                            description: 'Botlapu mujlu wela fulivo daj ced vuphujomu orino he sebti sospu akojunaj.'
                        },
                        title: 'Characteristics'
                    }
                }
            ]
        }];
    }
    
    it('should properly render the gear shot retrieval tile', function() {
        //FIXME
//        scope.srcData = builMockData();
//        scope.tileTitle = 'gearShotRetrieval';
//        
//        tile = compile('<gear-shot-retrieval-tile  src-data="srcData" tile-title="tileTitle"></gear-shot-retrieval-tile>')(scope);
//        tile.appendTo('#parent-container');
//        scope.$digest();
        
        //expect(angular.element('gear-shot-retrieval-tile').length).toBe(1);
        
    });
});