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
describe('combobox', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile;

  //STATES
  var states = {
    initialText: {
      attributes: {
        'initialtext': {attr: 'initialtext', type: '@'}
      },
      'exclude': ['lineStyleCombo'],
      'testFunc': initialTextTest
    },
    comboWithDestination: {
      attributes: {
        'destComboList': {attr: 'destComboList', type: '@'}
      },
      'testFunc': comboWithDestinationTest
    },
    callback: {
      attributes: {
        'callback': {attr: 'callback', type: '='},
        'callbackParams': {attr: 'callbackParams', type: '='}
      },
      'testFunc': callbackTest
    },
    initCallback: {
      attributes: {
        'initCallback': {attr: 'initCallback', type: '='}
      },
      'testFunc': initCallbackTest
    },
    noPlaceholderOnList: {
      attributes: {
        'noPlaceholderOnList': {attr: 'noPlaceholderOnList', type: '@'}
      },
      'exclude': ['lineStyleCombo','multipleCombo'],
      'testFunc': noPlaceholderOnListTest
    },
    uppercase: {
      attributes: {
        'uppercase': {attr: 'uppercase', type: '='}
      },
      'exclude': ['lineStyleCombo'],
      'include': ['initialText'],
      'testFunc': uppercaseTest
    },
    disabled: {
      attributes: {
        'ngDisabled': {attr: 'ngDisabled', type: '='}
      },
      'testFunc': disabledTest
    },
    loading: {
      attributes: {
        'isLoading': {attr: 'isLoading', type: '='}
      },
      'testFunc': loadingTest
    },
    defaultValue: {
      attributes: {
        'defaultValue': {attr: 'defaultValue', type: '='}
      },
      'exclude': ['lineStyleCombo','multipleCombo'],
      'testFunc': defaultValueTest
    },
    listClass: {
      attributes: {
        'listClass': {attr: 'listClass', type: '@'}
      },
      'testFunc': listClassTest
    }
  };

  //COMMON COMBO
  var commonCombo = {
    'ngModel': {attr: 'model', type: '='},
    'items': {attr: 'items', type: '='},
    'name': {attr: 'name', type: '@'},
    'disabledItems': {attr: 'disabledItems', type: '='}
  };

  //COMBO TYPES
  var types = {
    basicCombo: {
    },
    groupCombo: {
      'group': {attr: 'group', type: '@'}
    },
    /*lineStyleCombo: {
      'lineStyle': {attr: 'lineStyle', type: '='}
    },*/
    editableCombo: {
      'editable': {attr: 'editable', type: '='}
    },
    multipleCombo: {
      'multiple': {attr: 'multiple', type: '@'},
      'ngModel': {attr: 'modelMultiple', type: '='},
      'hideSelectedItems': {attr: 'hideSelectedItems', type: '@'},
      'minSelections': {attr: 'minSelections', type: '='}
    },
    sectionCombo: {
      'comboSection': {attr: 'comboSection', type: '='},
      'items': {attr: 'itemsSection', type: '='}
    }
  };

  function buildComboToCompile(comboProps){
    var combo = '<combobox ';

    angular.forEach(comboProps,function(value,key){
      var propertyValue = value.type === '@' ? scope[value.attr] : value.attr;

      combo += key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '=\"' + propertyValue + '\" ';
    });
    combo += '></combobox>';

    return combo;
  }

  function compileCombo(comboTypeName,comboProps,comboType){
    scope[comboTypeName] = compile(buildComboToCompile(comboProps))(scope);
    scope[comboTypeName].appendTo('#parent-container');

    scope.$digest();
  }

  function destroyCombo(isolatedScope){
    var comboToRemove = angular.element('[combolist-id="' + isolatedScope.comboboxId + '"]');
    if(comboToRemove){
        comboToRemove.remove();
    }

    isolatedScope.$destroy();
  }

  function checkComboParameters(comboProps,isolatedScope){
    angular.forEach(comboProps,function(value,key){

      if(angular.isArray(isolatedScope[key])){
        angular.forEach(isolatedScope[key],function(item){
          delete item.$$hashKey;
          if(angular.isArray(item.items)){
            angular.forEach(item.items,function(subitem){
              delete subitem.$$hashKey;
            });
          }
        });
      }

      if(value.type === '@'){
        expect('' + isolatedScope[key]).toEqual('' + scope[key]);
      }else{
        expect(isolatedScope[key]).toEqual(scope[value.attr]);
      }
      
    });
  }

  function initialTextTest(comboTypeName,isolatedScope){
    var placeholder;

    if(comboTypeName === 'editableCombo'){
      placeholder = isolatedScope.placeholder;
    }else{
      placeholder = isolatedScope.currentItemLabel;
    }

    if(comboTypeName !== 'multipleCombo'){
      expect(isolatedScope.initialtext).toEqual(placeholder);
    }

    if(comboTypeName === 'editableCombo'){
      angular.element('#' + isolatedScope.comboboxId + ' .combo-placeholder')[0].click();
      expect(isolatedScope.ngModel).toEqual('');
    }
  }

  function comboWithDestinationTest(comboTypeName,isolatedScope){
    expect(angular.element(isolatedScope.destComboList > '#' + isolatedScope.comboboxId).length).toEqual(1);
    expect(angular.element('body > #' + isolatedScope.comboboxId).length).toEqual(0);
  }

  function callbackTest(comboTypeName,isolatedScope){
    if(comboTypeName === 'sectionCombo'){
      angular.element('body > #' + isolatedScope.comboboxId + ' > ul > li > .dropdown-submenu > li')[0].click();
    }else{
      angular.element('body > #' + isolatedScope.comboboxId + ' > ul > li')[1].click();
    }
    expect(isolatedScope.callback).toHaveBeenCalled();
  }

  function initCallbackTest(comboTypeName,isolatedScope){
    expect(isolatedScope.initCallback).toHaveBeenCalled();
  }

  function noPlaceholderOnListTest(comboTypeName,isolatedScope){
    expect(angular.element('#' + isolatedScope.comboboxId + ' > .combo-placeholder').length).toEqual(0);
  }

  function uppercaseTest(comboTypeName,isolatedScope){
    for(var i=0;i<isolatedScope.loadedItems.length;i++){
      expect(isolatedScope.loadedItems[i].text).toEqual(isolatedScope.loadedItems[i].text.toUpperCase());
    }
  }

  function disabledTest(comboTypeName,isolatedScope){
    expect(angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .comboButtonContainer[disabled]').length).toEqual(1);
  }

  function loadingTest(comboTypeName,isolatedScope){
    expect(angular.element('#' + isolatedScope.comboboxId + ' .loading-msg').length).toEqual(1);
  }

  function defaultValueTest(comboTypeName,isolatedScope){
    expect(isolatedScope.ngModel).toEqual(scope.model);
  }

  function listClassTest(comboTypeName,isolatedScope){
    expect(angular.element("#" + isolatedScope.comboboxId).hasClass(scope.listClass)).toBe(true);
  }


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

  beforeEach(inject(function() {

    scope.items = [
      {code: 'item1', text: 'content1'},
      {code: 'item2', text: 'content2'},
      {code: 'item3', text: 'content3'},
      {code: 'item4', text: 'content4'},
      {code: 'item5', text: 'content5'},
      {code: 'item6', text: 'content6'},
      {code: 'item7', text: 'content7'},
      {code: 'item8', text: 'content8'}
    ];

    scope.itemsSection = [
      {'text': 'group1', 'items': [{code: 'item1', text: 'content1'},{code: 'item2', text: 'content2'}]},
      {'text': 'group2', 'items': [{code: 'item3', text: 'content3'},{code: 'item4', text: 'content4'}]}
    ];

    scope.name = 'name';
    scope.ngDisabled = true;
    scope.isLoading = true;
    scope.disabledItems = ['item2','item3','item6','item8'];

    scope.initialtext = 'placeholder test';

    if(!angular.element('#parent-container').length){
      var parentElement = angular.element('<div id="parent-container"></div>');
      parentElement.appendTo('body');
    }
    
    scope.destComboList = '#parent-container';

    scope.group = 'group';


    scope.callback = jasmine.createSpy('callback');
    scope.callbackParams = ['param1','param2'];

    
    scope.lineStyle = true;

    scope.editable = true;
    scope.multiple = true;
    scope.uppercase = true;

    scope.comboSection = true;

    scope.initCallback = jasmine.createSpy('initCallback');

    scope.noPlaceholderOnList = true;

    scope.defaultValue = 'item1';

    scope.hideSelectedItems = false;
    scope.minSelections = 0;

    scope.listClass = 'testClass';

  }));


  angular.forEach(types,function(comboType,comboTypeName){
    describe(comboTypeName, function() {
      var combo = angular.copy(commonCombo);

      angular.forEach(comboType,function(value,key){
        combo[key] = value;
      });

      it('should compile all combobox types', function() {
        compileCombo(comboTypeName,combo,comboType);
        var isolatedScope = scope[comboTypeName].isolateScope();

        checkComboParameters(combo,isolatedScope);

        angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .comboButtonContainer')[0].click();
        angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .comboButtonContainer')[0].click();

        if(comboTypeName === 'editableCombo'){
          var comboEditableInput = angular.element('[combolist-id="' + isolatedScope.comboboxId + '"] .combo-editable-input');
          isolatedScope.focus = true;
          comboEditableInput.val('content1').trigger('input');
        }

        var model = isolatedScope.ngModel;
        if(comboTypeName === 'sectionCombo'){
          angular.element('body > #' + isolatedScope.comboboxId + ' > ul > li > .dropdown-submenu > li')[2].click();
        }else if(comboTypeName === 'editableCombo'){
          model = model.toLowerCase();
          angular.element('body > #' + isolatedScope.comboboxId + ' > ul > li')[1].click();
        }else{
          angular.element('body > #' + isolatedScope.comboboxId + ' > ul > li')[2].click();
        }

        scope.$digest();

        expect(model).toEqual(isolatedScope.ngModel);

        destroyCombo(isolatedScope);
      });

      describe('should work with all the states', function() {
        
        angular.forEach(states,function(state, stateName){
          
          if(!angular.isDefined(state.exclude) || state.exclude.indexOf(comboTypeName) === -1){
            it(stateName, function() {

              var comboWithState = angular.copy(combo);

              if(stateName === 'initialText'){
                scope.model = undefined;
                scope.modelMultiple = [];
              }

              var statesToInclude = [stateName];
              if(angular.isDefined(state.include) && state.include.length > 0){
                statesToInclude = statesToInclude.concat(state.include);
              }

              angular.forEach(statesToInclude,function(stateToInclude){
                angular.forEach(states[stateToInclude].attributes,function(attr,attrName){
                  comboWithState[attrName] = attr;
                });
              });

              compileCombo(comboTypeName,comboWithState,comboType);
              var isolatedScope = scope[comboTypeName].isolateScope();

              if(stateName !== 'initialText'){
                if(comboTypeName === 'multipleCombo'){
                  scope.modelMultiple = ['item1','item4','item5','item7'];
                }else{
                  scope.model = 'item1';
                }
                scope.$digest();
              }

              checkComboParameters(comboWithState,isolatedScope);

              if(stateName === 'sectionCombo'){
                scope.itemsSection = [
                  {'text': 'group3', 'items': [{code: 'item1', text: 'content1'},{code: 'item2', text: 'content2'}]},
                  {'text': 'group4', 'items': [{code: 'item3', text: 'content3'},{code: 'item4', text: 'content4'}]}
                ];
              }else{
                scope.items = [
                  {code: 'item9', text: 'content1'},
                  {code: 'item2', text: 'content2'},
                  {code: 'item3', text: 'content3'},
                  {code: 'item4', text: 'content4'},
                  {code: 'item5', text: 'content5'},
                  {code: 'item6', text: 'content6'},
                  {code: 'item7', text: 'content7'},
                  {code: 'item1', text: 'content8'}
                ];
              }
              scope.$digest();

              if(comboTypeName === 'multipleCombo' && stateName !== 'initialText'){
                isolatedScope.ngModel = ['item4'];
                isolatedScope.$digest();
                angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .selected-options > li:first-child > .item-remover')[0].click();
                expect(isolatedScope.ngModel).toEqual([]);
                
                isolatedScope.minSelections = 2;
                isolatedScope.ngModel = ['item4','item5','item7'];
                isolatedScope.ngModel.push('item1');
                isolatedScope.$digest();
                console.log(angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .clear-all')[0]);
                angular.element('.combobox[combolist-id="' + isolatedScope.comboboxId + '"] .clear-all')[0].click();
                expect(isolatedScope.ngModel.length).toEqual(2);

                expect(isolatedScope.currentItemLabel.indexOf('2') !== -1).toBe(true);
              }

              state.testFunc(comboTypeName,isolatedScope);
              
              destroyCombo(isolatedScope);
            });

          }

        });

      });

    });

  });

});