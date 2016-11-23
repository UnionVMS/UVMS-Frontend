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
                type: 'ONB - Onboard',
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
                type: 'ONB - Onboard',
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
            
//            scope.ngModel.shift();
//            scope.init();
//            expect(scope.selected).toEqual(scope.ngModel[0]);
//            expect(scope.selected.total).toEqual(scope.ngModel[0].lsc + scope.ngModel[0].bms);
//            expect(scope.chartData.length).toBe(2);
            
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
    //<catch-class-detail-tile class="col-md-12 summary-section" ng-model="faServ.activityData.fishingData" tile-title="{{'activity.departure_catch_detail' | i18n}}" is-location-clickable="isLocationClickable()" buffer-distance="5000" click-callback="locationClickCallback()"></catch-class-detail-tile>
});