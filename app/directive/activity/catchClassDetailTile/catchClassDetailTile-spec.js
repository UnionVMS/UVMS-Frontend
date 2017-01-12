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
describe('catchClassDetailTile', function() {
    var scope,compile,tile,$httpBackend,controller;
    
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
    
    function builMockData(){
        return [{
            species: 'COD',
            speciesName: 'Gadus morhua',
            lsc: 12000,
            bms: 345,
            locations: [{
                name: '39F6-27.4.b.XEU'
            }, {
                name: '39F6-27.4.a.XEU',
                geometry: 'POLYGON ((30 10, 10 20, 20 40, 40 40, 30 10))'
            }],
            details: {
                catchType: 'ONB - Onboard',
                unit: 123,
                weightMeans: 'EST - Estimated'
            }
        },{
            species: 'SOL',
            speciesName: 'Sole',
            lsc: 1200,
            bms: 540,
            locations: [{
                name: '39F6-27.4.a.XEU',
                geometry: 'POINT(5.5 60.5)'
            }],
            details: {
                catchType: 'ONB - Onboard',
                unit: 124,
                weightMeans: 'EST - Estimated'
            }
        }];
    }
    
    describe('testing the controller: CatchClassDetailTileCtrl', function(){
        beforeEach(inject(function($controller) {
            controller = $controller('CatchClassDetailTileCtrl', {
                $scope: scope
            });
        }));
        
        it('should properly initialize and set selected record and chart series', function(){
            scope.ngModel = builMockData();
            
            scope.init();
            expect(scope.selected).toEqual(scope.ngModel[0]);
            expect(scope.selected.total).toEqual(scope.ngModel[0].lsc + scope.ngModel[0].bms);
            expect(scope.chartData.length).toBe(2);
            
            var record = scope.chartData[0].values[0];
            expect(record.idx).toBe(0);
            expect(record.species).toEqual(scope.ngModel[0].species);
            expect(record.series).toEqual(0);
            expect(record.x).toBe(0);
            expect(record.y).toEqual(scope.ngModel[0].lsc);
        });
        
        it('should retrieve species as ticks', function(){
            scope.ngModel = builMockData();
            scope.init();
            
            var test = scope.options.chart.xAxis.tickFormat(0);
            expect(test).toEqual(scope.ngModel[0].species);
        });
        
        it('should have the species name in the tooltip header', function(){
            scope.ngModel = builMockData();
            scope.init();
            
            var test = scope.options.chart.interactiveLayer.tooltip.headerFormatter(0);
            expect(test).toEqual(scope.ngModel[0].species);
        });
        
        it('should properly generate a tooltip', function(){
            scope.ngModel = builMockData();
            scope.init();
            
            var data = {
                index: 0,
                value: 0,
                series: [{
                    color: '781c81',
                    key: 'LSC',
                    value: scope.ngModel[0].lsc,
                    data: {
                        species: scope.ngModel[0].species
                    }
                },{
                    color: '"d92120"',
                    key: 'BMS',
                    value: scope.ngModel[0].bms,
                    data: {
                        species: scope.ngModel[0].species
                    }
                }]
            };
            
            var test = scope.options.chart.interactiveLayer.tooltip.contentGenerator(data);
            var html = '<table class="catch-class-detail-chart"><thead><tr><td colspan="3"><strong>' + data.series[0].data.species + '</strong></td></tr></thead>'
            html += '<tbody><tr><td class="legend-color-guide"><div style="background-color: #' + data.series[0].color + '"></div></td><td class="key">' + data.series[0].key +'</td>';
            html += '<td class="value">' + data.series[0].value + ' kg</td></tr><tr><td class="legend-color-guide"><div style="background-color: #' + data.series[1].color + '"></div></td>';
            html += '<td class="key">' + data.series[1].key + '</td><td class="value">' + data.series[1].value + ' kg</td></tr></tbody></table>';
            
            expect(test).toEqual(html);
        });
        
        it('should handle mouse click in the chart and change selected record', function(){
            scope.ngModel = builMockData();
            scope.init();
            
            var evt = {
                data: {
                    idx: 1
                }
            };
            var test = scope.options.chart.multibar.dispatch.elementClick(evt);
            expect(scope.selected).toEqual(scope.ngModel[1]);
        });
        
    });
    
    describe('testing the directive: catchClassDetailTile', function(){
        afterEach(function(){
            angular.element('catch-class-detail-tile').remove();
        });
        
        it('should properly render the tile', function(){
            scope.ngModel = builMockData();
            
            tile = compile('<catch-class-detail-tile ng-model="ngModel" tile-title="test"></catch-class-detail-tile>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var testScope = tile.isolateScope();
            
            expect(angular.element('legend').children().text()).toEqual('test');
            expect(angular.element('rect').length).toEqual(scope.ngModel.length * 2 + 1);
            expect(angular.element('.species-title').text()).toEqual(testScope.selected.species + ' - ' + testScope.selected.speciesName);
            expect(angular.element('.section').find('span').eq(1).text()).toEqual(testScope.selected.details.catchType);
            expect(angular.element('.section').find('span').eq(3).text()).toEqual(testScope.selected.details.unit.toString());
            expect(angular.element('.section').find('span').eq(5).text()).toEqual(testScope.selected.total + ' kg');
            expect(angular.element('.section').find('span').eq(7).text()).toEqual(testScope.selected.details.weightMeans);
            expect(angular.element('td:not(.uppercase)').eq(0).text()).toEqual(testScope.selected.lsc.toString());
            expect(angular.element('td:not(.uppercase)').eq(1).text()).toEqual(testScope.selected.bms.toString());
        });
    });
});
