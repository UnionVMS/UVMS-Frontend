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
describe('catchPanelTable', function() {
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


    function getTripCatchesSummaryTableData() {
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

    it('xxxxx should show the correct number of headers', function() {
        scope.data = getTripCatchesSummaryTableData();
        var catchPanelTable = compile('<catch-panel-table data="data" headers="data.tripTableHeaders"></catch-panel-table>')(scope);
        catchPanelTable.appendTo('#parent-container');
        scope.$digest();
        expect(catchPanelTable.find('.table-headers').length).toEqual(5);

    });
    
    it('should show one row for each species', function(){
        scope.data = getTripCatchesSummaryTableData();
        var catchPanelTable = compile('<catch-panel-table data="data.tripTableData" headers="data.tripTableHeaders"></catch-panel-table>')(scope);
        catchPanelTable.appendTo('#parent-container');
        scope.$digest();
        expect(catchPanelTable.find('.species-row').length).toEqual(Object.keys(scope.data.tripTableData).length);
    });
});