describe('Table with combobox filters and calculated totals', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile,tile,$timeout,$filter;
    
    beforeEach(inject(function($rootScope,$compile,$injector,_$timeout_,_$filter_,$httpBackend) {
        scope = $rootScope.$new();
        compile = $compile;
        
        if(!angular.element('#parent-container').length){
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }
        
        checkAndRemoveExistingTables();
        
        $timeout = _$timeout_;
        $filter = _$filter_;
        
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));
    
    afterEach(function(){
        angular.element('table-filter-headers').remove();
    });
    
    function checkAndRemoveExistingTables(){
        var tables = angular.element('table');
        if (tables.length > 0){
            angular.forEach(tables, function(table){
                table.remove();
            });
        }
    }
    
    function buildMockRecords(){
        return [{
            "type": "ONBOARD",
            "role": "CATCHING_VESSEL",
            "roleDesc": "The catching vessel",
            "weight": 1444,
            "locations": {
                "rfmo": "Pepodo",
                "fao": "Puvijhas"
            }
        },{
            "type": "UNLOADED",
            "role": "PARTICIPATING_VESSEL",
            "roleDesc": "The participating vessel",
            "weight": 1234,
            "locations": {
                "rfmo": "Uncifi",
                "effort": "Mophalo",
                "fao": "Puvijhas"
            }
        }];
    }
    
    function buildMockColumns(){
        return [{
            title: 'type',
            srcProp: 'type',
            isVisible: true,
            useComboFilter: true
        },{
            title: 'rfmo',
            srcObj: 'locations',
            srcProp: 'rfmo',
            isArea: true,
            isVisible: true,
            useComboFilter: true
        }, {
            title: 'fao',
            srcObj: 'locations',
            srcProp: 'fao',
            isArea: true,
            isVisible: true,
            useComboFilter: true
        }, {
            title: 'effort',
            srcObj: 'locations',
            srcProp: 'effort',
            isArea: true,
            isVisible: true,
            useComboFilter: true
        }, {
            title: 'ices',
            srcObj: 'locations',
            srcProp: 'ices',
            isArea: true,
            isVisible: true,
            useComboFilter: true
        },{
            title: 'weight',
            srcProp: 'weight',
            isVisible: true,
            calculateTotal: true
        },{
            title: 'role',
            srcProp: 'roleDesc',
            filterBy: 'role',
            isVisible: true,
            useComboFilter: true
        }];
    }
    
    function getColumnCount(cols, prop){
        var counter = 0;
        for (var i = 0; i < cols.length; i++){
            if (prop === 'isVisible'){
                if (cols[i][prop]){
                    counter += 1;
                }
            } else {
                if (cols[i][prop]  && cols[i].isVisible){
                    counter += 1;
                }
            }
            
        }
        
        return counter;
    }
    
    describe('testing tableFilterHeaders directive', function(){
        it('should render the table with data with no selectable rows', function() {
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var table = angular.element('table');
            expect(table.length).toBe(1);
            expect(table.find('thead tr').eq(0).find('th').length).toBe(getColumnCount(scope.columns, 'isVisible'));
            expect(table.find('tbody tr').length).toEqual(scope.records.length);
            expect(angular.element('st-select-multiple').length).toEqual(getColumnCount(scope.columns, 'useComboFilter'));
            expect(angular.element('st-calculate-totals').length).toEqual(getColumnCount(scope.columns, 'calculateTotal'));
            expect(table.find('tbody tr.selected-row').length).toEqual(0);
        });
        
        it('should render the table with data with selectable rows', function() {
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea" selected-item="selectedItem"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var table = angular.element('table');
            expect(table.length).toBe(1);
            expect(table.find('thead tr').eq(0).find('th').length).toBe(getColumnCount(scope.columns, 'isVisible'));
            expect(table.find('tbody tr').length).toEqual(scope.records.length);
            expect(angular.element('st-select-multiple').length).toEqual(getColumnCount(scope.columns, 'useComboFilter'));
            expect(angular.element('st-calculate-totals').length).toEqual(getColumnCount(scope.columns, 'calculateTotal'));
            expect(table.find('tbody tr.selected-row').length).toEqual(1);
        });
        
        it('should select a row based on its index', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea" selected-item="selectedItem"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var isolatedScope = tile.isolateScope();
            isolatedScope.selectRow(1);
            
            var table = angular.element('table');
            expect(table.find('tbody tr').eq(0).hasClass('selected-row')).toBeTruthy();
        });
    });
    
    function getModel(records, prop, isArea){
        var model = [];
        for (var i = 0; i < records.length; i++){
            var rec;
            if (isArea){
                rec = records[i]['locations'][prop];
            } else {
                rec = records[i][prop];
            }
            
            if (angular.isDefined(rec)){
                model.push(rec);
            }
        }
        
        if (isArea){
            model.push('null_values');
        }
        
        return model;
    }
    
    function getComboItems(records, prop, isArea){
        var items = [];
        for (var i = 0; i < records.length; i++){
            var value;
            if (isArea){
                value = records[i]['locations'][prop];
            } else{
                value = records[i][prop];
            }
            
            if (angular.isDefined(value)){
                items.push({
                    code: value,
                    text: value
                });
            }
        }
        
        if (isArea){
            items.push({
                code: 'null_values',
                text: ''
            });
        }
        
        return items;
    }
    
    describe('testing the stSelectMultiple directive', function(){
        it('should properly build combobox items and model for generic properties', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var multiple = angular.element('st-select-multiple').eq(0);
            var isolatedScope = multiple.isolateScope();
            var items = _.map(isolatedScope.combo.items, function(item){
                return _.omit(item, '$$hashKey');
            });
            expect(isolatedScope.combo.model).toEqual(getModel(scope.records, 'type'));
            expect(items).toEqual(getComboItems(scope.records, 'type'));
        });
        
        it('should properly build combobox items and model for location properties including empty values', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var multiple = angular.element('st-select-multiple').eq(3);
            var isolatedScope = multiple.isolateScope();
            var items = _.map(isolatedScope.combo.items, function(item){
                return _.omit(item, '$$hashKey');
            });
            
            expect(isolatedScope.combo.model).toEqual(getModel(scope.records, 'effort', true));
            expect(items).toEqual(getComboItems(scope.records, 'effort', true));
        });
        
        it('should call the filter function upon (un)selection of a combobox item', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var multiple = angular.element('st-select-multiple').eq(0);
            var isolatedScope = multiple.isolateScope();
            spyOn(isolatedScope, 'doFilter');
            
            var combo = multiple.find('.combobox');
            var listItem = angular.element('#' + combo.attr('combolist-id')).find('li');
            listItem.click();
            isolatedScope.$digest();
            $timeout.flush();
            
            expect(isolatedScope.doFilter).toHaveBeenCalled();
        });

        it('should apply the filter when using filterBy property', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var nrRows = angular.element(tile).find('.table-filter-headers tbody tr').length;
            expect(nrRows).toEqual(2);

            var multiple = angular.element('st-select-multiple').eq(3);
            var isolatedScope = multiple.isolateScope();
            
            var combo = multiple.find('.combobox');
            var listItem = angular.element('#' + combo.attr('combolist-id')).find('li').eq(1);
            
            listItem.click();
            isolatedScope.$digest();
            $timeout.flush();
            

            nrRows = angular.element(tile).find('.table-filter-headers tbody tr').length;
            expect(nrRows).toEqual(1);
        });
    });
    
    function calculateTotal(records, prop){
        var total = 0;
        for (var i = 0; i < records.length; i++){
            total += records[i][prop];
        }
        
        return total.toString();
    }
    
    describe('testing the stCalculateTotals directive', function(){
        it('should properly calculate the totals of a specified property', function(){
            scope.records = buildMockRecords();
            scope.columns = buildMockColumns();
            scope.selectedItem = {};
            
            tile = compile('<table-filter-headers columns="columns" records="records" unique-columns-src-data="locations" unique-columns="isArea"></table-filter-headers>')(scope);
            tile.appendTo('#parent-container');
            scope.$digest();
            
            var totals = angular.element('st-calculate-totals');
            var value = totals.text().split(' ');
            expect(value[1]).toEqual(calculateTotal(scope.records, 'weight'));
        });
    });
    
    describe('testing the custom filter function comboHeaderFilter', function(){
        it('should filter the data records using a not nested property', function(){
            var filter = $filter('comboHeaderFilter');
            var records = buildMockRecords();
            var predObj = {
                type: {
                    matchAny: {
                        all: false,
                        items: ['ONBOARD']
                    }
                }
            }
            var filtered = filter(records, predObj) 
            expect(filtered.length).toEqual(records.length - 1);
            expect(filtered[0].type).toEqual('ONBOARD');
        });
        
        it('should filter the data records using a nested property', function(){
            var filter = $filter('comboHeaderFilter');
            var records = buildMockRecords();
            var predObj = {
                'locations.rfmo': {
                    matchAny: {
                        all: false,
                        items: ['Pepodo']
                    }
                }
            }
            var filtered = filter(records, predObj) 
            expect(filtered.length).toEqual(records.length - 1);
            expect(filtered[0].locations.rfmo).toEqual('Pepodo');
        });
        
        it('should filter the data records using null values', function(){
            var filter = $filter('comboHeaderFilter');
            var records = buildMockRecords();
            var predObj = {
                'locations.effort': {
                    matchAny: {
                        all: false,
                        items: ['null_values']
                    }
                }
            }
            var filtered = filter(records, predObj) 
            expect(filtered.length).toEqual(records.length - 1);
            expect(filtered[0].locations.effort).not.toBeDefined();
        });
    });
});