describe('LayerpanelCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

    beforeEach(inject(function($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('LayerpanelCtrl', {$scope: scope});
      
      scope.resizeMap = function(){
          return true;
      };
      
    }));	

	it('should ...', inject(function() {

		expect(1).toEqual(1);
		
	}));

});