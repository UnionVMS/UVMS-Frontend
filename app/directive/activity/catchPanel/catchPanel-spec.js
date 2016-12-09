describe('catchPanel', function() {
    var scope,compile,actRestSpy;
    
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
        console.log('HEEEEEEEEREEEEEEEEE: ' + angular.element('catch-panel').length)
        angular.element('catch-panel').remove();
    });

    function getEvolutionData(){
        return {
            "onboard": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81"
                },
                {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf"
                },
                {
                    "speciesCode": "SEAFOOD_2",
                    "weight": 111,
                    "color": "#83ba6d"
                },
                {
                    "speciesCode": "SEAFOOD_3",
                    "weight": 111,
                    "color": "#dbab3b"
                },
                {
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#d92120"
                }],
                "total": 555
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81"
                },
                {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120"
                }],
                "total": 222,
                "title": "Cumulated"
            }
        };
    }
    
    function getFinalCumulatedData(){
        return {
            "landed": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                },
                {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#447cbf",
                    "tableColor": {
                        "background-color": "rgba(68, 124, 191, 0.7)"
                    }
                }],
                "total": 555,
                "title": "Landed"
            },
            "cumulated": {
                "speciesList": [{
                    "speciesCode": "BEAGLE",
                    "weight": 111,
                    "color": "#781c81",
                    "tableColor": {
                        "background-color": "rgba(120, 28, 129, 0.7)"
                    }
                },
                {
                    "speciesCode": "SEAFOOD",
                    "weight": 111,
                    "color": "#d92120",
                    "tableColor": {
                        "background-color": "rgba(217, 33, 32, 0.7)"
                    }
                }],
                "total": 222,
                "title": "Cumulated Catch"
            }
        };
    }
    

    function getFormattedValue(value, total){
        return value + ' (' + (value/total*100).toFixed(2) + '%)';
    }


    it('should show the catch details with two pie charts', function() {
        scope.data = getEvolutionData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('.catch-section').length).toEqual(1);
        expect(angular.element('legend').children().text()).toEqual('test');
        expect(angular.element('.table').length).toBe(0);
        expect(angular.element('.chart-title > span').eq(0).text()).toEqual('');
        expect(angular.element('nvd3').eq(0).find('.nv-slice').length).toBe(scope.data.onboard.speciesList.length);
        expect(angular.element('.chart-title > span').eq(1).text()).toEqual(scope.data.cumulated.title);
        expect(angular.element('nvd3').eq(1).find('.nv-slice').length).toBe(scope.data.cumulated.speciesList.length);
    });
    
    it('should get properly formatted values for the chart tooltip', function(){
        scope.data = getEvolutionData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        var testScope = catchPanel.isolateScope();
        expect(testScope.options.onboard.chart.valueFormat(scope.data.onboard.speciesList[0]['weight'])).toEqual(getFormattedValue(scope.data.onboard.speciesList[0]['weight'], scope.data.onboard.total))
    });
    
    it('should return species code for the chart', function(){
        scope.data = getEvolutionData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        var testScope = catchPanel.isolateScope();
        expect(testScope.options.onboard.chart.x(scope.data.onboard.speciesList[0])).toEqual(scope.data.onboard.speciesList[0].speciesCode);
    });
    
    it('should return species weights for the chart', function(){
        scope.data = getEvolutionData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        var testScope = catchPanel.isolateScope();
        expect(testScope.options.onboard.chart.y(scope.data.onboard.speciesList[0])).toEqual(scope.data.onboard.speciesList[0].weight);
    });
    
    it('should return proper colors for each species in the chart', function(){
        scope.data = getEvolutionData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        var testScope = catchPanel.isolateScope();
        expect(testScope.options.onboard.chart.color(undefined, 0)).toEqual(scope.data.onboard.speciesList[0].color);
    });

    it('should show the catch details with pie chart and table', function() {
        scope.data = getFinalCumulatedData();
        var catchPanel = compile('<catch-panel title="test" unit="kg" ng-model="data" with-table="true"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        expect(angular.element('.catch-section').length).toEqual(1);
        expect(angular.element('legend').children().text()).toEqual('test');
        
        expect(angular.element('.chart-title > span').eq(0).text()).toEqual(scope.data.landed.title);
        expect(angular.element('nvd3').eq(0).find('.nv-slice').length).toBe(scope.data.landed.speciesList.length);
        expect(angular.element('.chart-title > span').eq(1).text()).toEqual(scope.data.cumulated.title);
        expect(angular.element('nvd3').eq(1).find('.nv-slice').length).toBe(scope.data.cumulated.speciesList.length);
        
        expect(angular.element('.table').length).toBe(2);
        expect(angular.element('.table').eq(0).find('.tr').length).toEqual(scope.data.landed.speciesList.length + 1);
        expect(angular.element('.table').eq(1).find('.tr').length).toEqual(scope.data.cumulated.speciesList.length + 1);
    });
    
    it('should show the catch details with pie chart, table and caption', function() {
        scope.data = getEvolutionData();
        scope.data.onboard.title = 'On board';
        scope.data.onboard.caption = 'On board caption';
        scope.data.cumulated.caption = 'Cumulated caption';
        
        var catchPanel = compile('<catch-panel title="test" ng-model="data" with-table="true"></catch-panel>')(scope);
        catchPanel.appendTo('#parent-container');
        scope.$digest();
        
        
        expect(angular.element('.catch-section').length).toEqual(1);
        expect(angular.element('legend').children().text()).toEqual('test');
        
        expect(angular.element('.chart-title > span').length).toBe(2);
        expect(angular.element('nvd3').length).toBe(2);
        expect(angular.element('.table').length).toBe(2);
        
        expect(angular.element('.chart-caption').eq(0).text()).toEqual(scope.data.onboard.caption);
        expect(angular.element('.chart-caption').eq(1).text()).toEqual(scope.data.cumulated.caption);
    });
});