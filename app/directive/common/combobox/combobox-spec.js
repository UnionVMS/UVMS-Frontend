describe('combobox', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile,template;

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
    }/*,
    initCallback: {
      'initCallback': 'initCallback'
    },
    noPlaceholderOnList: {
      'noPlaceholderOnList': 'noPlaceholderOnList',
      'exclude': ['lineStyleCombo','multipleCombo']
    },
    uppercase: {
      'uppercase': 'uppercase',
      'exclude': ['lineStyleCombo']
    },
    disabled: {
      'ngDisabled': 'ngDisabled'
    },
    loading: {
      'isLoading': 'isLoading'
    }*/
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
    lineStyleCombo: {
      'lineStyle': {attr: 'lineStyle', type: '='}
    },
    editableCombo: {
      'editable': {attr: 'editable', type: '='}
    },
    multipleCombo: {
      'multiple': {attr: 'multiple', type: '='},
      'ngModel': {attr: 'modelMultiple', type: '='}
    },
    sectionCombo: {
      'comboSection': {attr: 'comboSection', type: '='},
      'items': {attr: 'itemsSection', type: '='}
    }
  };

  function buildComboToCompile(comboProps){
    var combo = '<combobox ';

    angular.forEach(comboProps,function(value,key){
      console.log('VALUE ON COMPILE - ' + value.attr);
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

  function checkComboParameters(comboProps,isolatedScope){
    angular.forEach(comboProps,function(value,key){
      console.log('KEY - ' + key);
      console.log('VALUE - ' + value.attr);
      

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
        expect(isolatedScope[key]).toEqual(scope[key]);
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

    expect(isolatedScope.initialtext).toEqual(placeholder);
  }

  function comboWithDestinationTest(comboTypeName,isolatedScope){
    expect(angular.element(isolatedScope.destComboList > '#' + isolatedScope.comboboxId).length).toEqual(1);
    expect(angular.element('body > ' + '#' + isolatedScope.comboboxId).length).toEqual(0);
  }

  function callbackTest(comboTypeName,isolatedScope){
    /*spyOn(isolatedScope, 'callback');*/

    console.log(angular.element('body > ' + '#' + isolatedScope.comboboxId));

    angular.element('body > ' + '#' + isolatedScope.comboboxId + ' > ul > li')[1].click();
    expect(isolatedScope.callback).toHaveBeenCalled();

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
    scope.model = 'item1';
    scope.modelMultiple = ['item1','item4','item5'];

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

        isolatedScope.$destroy();
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

              angular.forEach(state.attributes,function(attr,attrName){
                comboWithState[attrName] = attr;
              });

              console.log(buildComboToCompile(comboWithState));

              compileCombo(comboTypeName,comboWithState,comboType);
              var isolatedScope = scope[comboTypeName].isolateScope();

              checkComboParameters(comboWithState,isolatedScope);

              state.testFunc(comboTypeName,isolatedScope);

              isolatedScope.$destroy();
            });

          }

        });

      });

    });

  });

});