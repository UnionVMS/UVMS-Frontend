describe('combobox', function() {

  beforeEach(module('unionvmsWeb'));

  var scope,compile,template;

  //STATES
  var states = {
    initialTextCombo: {
      'initialtext': 'initialtext'
    },
    comboWithDestination: {
      'destComboList': 'destComboList'
    },
    callbackCombo: {
      'callback': 'callback',
      'callbackParams': 'callbackParams'
    },
    initCallbackCombo: {
      'initCallback': 'initCallback'
    },
    noPlaceholderOnListCombo: {
      'noPlaceholderOnList': 'noPlaceholderOnList'
    },
    uppercaseCombo: {
      'uppercase': 'uppercase'
    }
  };

  //COMBO TYPES
  var types = {
    basicCombo: {
    },
    groupCombo: {
      'group': 'group'
    },
    lineStyleCombo: {
      'lineStyle': 'lineStyle'
    },
    editableCombo: {
      'editable': 'editable'
    },
    multipleCombo: {
      'multiple': 'multiple'
    },
    sectionCombo: {
      'comboSection': 'comboSection',
      'items': 'itemsSection'
    }
  };

  beforeEach(inject(function($rootScope,$compile) {
    scope = $rootScope.$new();
    compile = $compile;

    scope.model = {value: 'item1'};
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

    var parentElement = angular.element('<div id="parent-container"></div>');
    parentElement.appendTo('body');
    scope.destComboList = '#parent-container';

    scope.group = 'group';


    scope.callback = jasmine.createSpy('callback');
    scope.callbackParams = ['param1','param2'];

    
    scope.lineStyle = true;

    scope.editable = true;
    scope.multiple = true;
    scope.uppercase = true;

    scope.comboSection = 'comboSection';

    scope.initCallback = jasmine.createSpy('initCallback');

    scope.noPlaceholderOnList = true;

    scope.commonCombo = {
      'ngModel': 'model.value',
      'items': 'items',
      'name': 'name',
      'ngDisabled': 'ngDisabled',
      'isLoading': 'isLoading',
      'disabledItems': 'disabledItems'
    };

    scope.buildComboToCompile = function(features){
      var combo = '<combobox ';

      angular.forEach(features,function(value,key){
        combo += key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() + '=\"' + value + "\" ";
      });
      combo += '></combobox>';
      return combo;
    };

  }));

  beforeEach(inject(function($httpBackend) {
      //Mock
      $httpBackend.whenGET(/usm/).respond();
      $httpBackend.whenGET(/i18n/).respond();
      $httpBackend.whenGET(/globals/).respond({data : []});
  }));

  angular.forEach(types,function(comboType,comboTypeName){
    describe(comboTypeName, function() {

      it('should receive all the paramenters', function() {
        var combo = angular.copy(scope.commonCombo);

        angular.forEach(comboType,function(value,key){
          combo[key] = value;
        });
        
        scope[comboTypeName] = compile(scope.buildComboToCompile(combo))(scope);
        scope.$digest();
        var isolatedScope = scope[comboTypeName].isolateScope();

        expect(isolatedScope.name).toBe(scope.name);
        expect(isolatedScope.ngDisabled).toEqual(scope.ngDisabled);
        expect(isolatedScope.isLoading).toEqual(scope.isLoading);
        expect(isolatedScope.disabledItems).toEqual(scope.disabledItems);

        /*angular.forEach(comboType,function(value,key){
          if(){
            expect(isolatedScope[key]).toEqual(scope[key]);
          }
        });*/

      });

      /*it('should receive all the paramenters', function() {
        var combo = angular.copy(scope.commonCombo);

        angular.forEach(value,function(value,key){
          combo[key] = value;
        });
        
        scope[key] = compile(scope.buildComboToCompile(combo))(scope);
        scope.$digest();
        var isolatedScope = scope[key].isolateScope();

        expect(isolatedScope.name).toBe(scope.name);
        expect(isolatedScope.ngDisabled).toEqual(scope.ngDisabled);
        expect(isolatedScope.isLoading).toEqual(scope.isLoading);
        expect(isolatedScope.disabledItems).toEqual(scope.disabledItems);

      });*/

    });

  });

});