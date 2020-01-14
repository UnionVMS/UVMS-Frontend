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
describe('catchPanel', function() {
    var scope,compile,actRestSpy, $httpBackend;
    
    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $compile, $injector) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        $httpBackend = $injector.get('$httpBackend');;
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    afterEach(function(){
        angular.element('#parent-container').remove();
    });

   
    function getTripCatchesSummaryPiesData() {
        return {
            "overview":{
            },
            "reports":[
            ],
            "tripVessel":{
            },
            "tripRoles":[
            ],
            "cronology":{
             
            },
            "messageCount":{
            },
            "mapData":{
            },
            "tripSpeciesCodes":[
               "LEZ",
               "HKE",
               "ANF",
               "HAD",
               "NEP",
               "SQI",
               "JOD",
               "TUR",
               "LIN",
               "SOL",
               "GFB",
               "SQC",
               "COD",
               "POL",
               "POK",
               "WHG"
            ],
            "graphClass":"col-md-6 col-lg-4 col-xs-6 col-sm-6",
            "tripSpeciesColorsObject": {
               "LEZ":"781c81",
               "HKE":"4d1f82",
               "ANF":"403e95",
               "HAD":"4063b0",
               "NEP":"4684c2",
               "SQI":"519cb8",
               "JOD":"62ac9a",
               "TUR":"77b77b",
               "LIN":"90bc62",
               "SOL":"abbe51",
               "GFB":"c3ba45",
               "SQC":"d7af3d",
               "COD":"e39a36",
               "POL":"e77830",
               "POK":"e34d28",
               "WHG":"d92120"
            },
            "tripCatchSummary": [
                {
                    "onBoard":[
                        {
                            "speciesCode":"LEZ",
                            "weight":1317.02,
                            "color":"#781c81"
                        },
                        {
                            "speciesCode":"HKE",
                            "weight":1366,
                            "color":"#4d1f82"
                        },
                        {
                            "speciesCode":"ANF",
                            "weight":4045.01,
                            "color":"#403e95"
                        },
                        {
                            "speciesCode":"HAD",
                            "weight":649.99,
                            "color":"#4063b0"
                        },
                        {
                            "speciesCode":"NEP",
                            "weight":36,
                            "color":"#4684c2"
                        },
                        {
                            "speciesCode":"SQI",
                            "weight":2227,
                            "color":"#519cb8"
                        },
                        {
                            "speciesCode":"JOD",
                            "weight":220,
                            "color":"#62ac9a"
                        },
                        {
                            "speciesCode":"TUR",
                            "weight":13,
                            "color":"#77b77b"
                        },
                        {
                            "speciesCode":"LIN",
                            "weight":78,
                            "color":"#90bc62"
                        },
                        {
                            "speciesCode":"SOL",
                            "weight":13,
                            "color":"#abbe51"
                        },
                        {
                            "speciesCode":"GFB",
                            "weight":328,
                            "color":"#c3ba45"
                        },
                        {
                            "speciesCode":"SQC",
                            "weight":13,
                            "color":"#d7af3d"
                        },
                        {
                            "speciesCode":"COD",
                            "weight":78,
                            "color":"#e39a36"
                        },
                        {
                            "speciesCode":"POK",
                            "weight":26,
                            "color":"#e34d28"
                        },
                        {
                            "speciesCode":"WHG",
                            "weight":78,
                            "color":"#d92120"
                        },
                        {
                            "speciesCode":"POL",
                            "weight":26,
                            "color":"#e77830"
                        }
                    ],
                    "grandOnboardTotal":10514.02
                },
                {
                    "transhipment":[
                        {
                            "speciesCode":"SQI",
                            "weight":35,
                            "color":"#519cb8"
                        },
                        {
                            "speciesCode":"LEZ",
                            "weight":50,
                            "color":"#781c81"
                        }
                    ],
                    "grandTranshipmentTotal":85
                },
                {
                    "landing":[
                        {
                            "speciesCode":"SQI",
                            "weight":30,
                            "color":"#519cb8"
                        },
                        {
                            "speciesCode":"LEZ",
                            "weight":40,
                            "color":"#781c81"
                        }
                    ],
                    "grandLandingTotal":70
                }
            ],
            "tripTableData": {
               "LEZ":{
                  "Species":"LEZ",
                  "CATCHES":1317.02,
                  "LAN":40,
                  "TRA":50,
                  "Difference":1227.02
               },
               "HKE":{
                  "Species":"HKE",
                  "CATCHES":1366,
                  "Difference":1366
               },
               "ANF":{
                  "Species":"ANF",
                  "CATCHES":4045.01,
                  "Difference":4045.01
               },
               "HAD":{
                  "Species":"HAD",
                  "CATCHES":649.99,
                  "Difference":649.99
               },
               "NEP":{
                  "Species":"NEP",
                  "CATCHES":36,
                  "Difference":36
               },
               "SQI":{
                  "Species":"SQI",
                  "CATCHES":2227,
                  "LAN":30,
                  "TRA":35,
                  "Difference":2162
               },
               "JOD":{
                  "Species":"JOD",
                  "CATCHES":220,
                  "Difference":220
               },
               "TUR":{
                  "Species":"TUR",
                  "CATCHES":13,
                  "Difference":13
               },
               "LIN":{
                  "Species":"LIN",
                  "CATCHES":78,
                  "Difference":78
               },
               "SOL":{
                  "Species":"SOL",
                  "CATCHES":13,
                  "Difference":13
               },
               "GFB":{
                  "Species":"GFB",
                  "CATCHES":328,
                  "Difference":328
               },
               "SQC":{
                  "Species":"SQC",
                  "CATCHES":13,
                  "Difference":13
               },
               "COD":{
                  "Species":"COD",
                  "CATCHES":78,
                  "Difference":78
               },
               "POL":{
                  "Species":"POL",
                  "CATCHES":26,
                  "Difference":26
               },
               "POK":{
                  "Species":"POK",
                  "CATCHES":26,
                  "Difference":26
               },
               "WHG":{
                  "Species":"WHG",
                  "CATCHES":78,
                  "Difference":78
               },
               "TOTAL":{
                  "Species":"TOTAL",
                  "CATCHES":10514.02,
                  "LAN":70,
                  "TRA":85,
                  "Difference":10359.02
               }
            },
            "tripTableHeaders": [
               "Species",
               "CATCHES",
               "LAN",
               "TRA",
               "Difference"
            ]
        }
    }
   
    it('should show the catch details chart section', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        expect(catchPanel.find('.summary-details-pie').length).toEqual(1);
    });

    it('should show the catch details table section', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();

        expect(angular.element('.summary-catch-table').length).toEqual(1);
    });

    it('should show the catch details with three pie charts', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        expect(catchPanel.find('.summary-pie-section').length).toEqual(3);
    });

    it('should show the titles for each pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();

        var elementCount = catchPanel.find('.summary-pie-section-title').children().length;
        expect(elementCount).toEqual(3);
    });

    it('should show the title for onboard pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.summary-pie-section-title').children('.onboard-section-title').text();
        expect(element).toEqual('ONBOARD');
    });

    it('should show the title for transhipment pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.summary-pie-section-title').children('.transhipment-section-title').text();
        expect(element).toEqual('TRA(UNLOADED)');
    });

    it('should show the title for landed pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.summary-pie-section-title').children('.landed-section-title').text();
        expect(element).toEqual('LAN(UNLOADED)');
    });
    
    it('should show the total weight for onboard pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.onboard-total').text();
        expect(element).toContain(scope.data['tripCatchSummary'][0].grandOnboardTotal);
    });

    it('should show the total weight for transhipment pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.transhipment-total').text();
        expect(element).toContain(scope.data['tripCatchSummary'][1].grandTranshipmentTotal);
    });

    it('should show the total weight for landing pie', function() {
        scope.data = getTripCatchesSummaryPiesData();
        var catchPanel = compile('<catch-panel ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        var element = catchPanel.find('.landing-total').text();
        expect(element).toContain(scope.data['tripCatchSummary'][2].grandLandingTotal);
    });
});