describe('loadingPanel', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,compile,loadingStatusServ;

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

	beforeEach(inject(function(loadingStatus) {
		loadingStatusServ = loadingStatus;

		if(!angular.element('#parent-container').length){
			var parentElement = angular.element('<div id="parent-container"></div>');
			parentElement.appendTo('body');
		}
	}));

	it('should show and hide simple loading', function() {
		var loadingPanel = compile('<loading-panel type="SaveReport"></loading-panel>')(scope);
		scope.$digest();

		loadingPanel.appendTo('#parent-container');

		expect(angular.element('#parent-container > .loading-panel').hasClass('ng-hide')).toEqual(true);

		loadingStatusServ.isLoading('SaveReport',true);
		scope.$digest();
		expect(angular.element('#parent-container > .loading-panel').hasClass('ng-hide')).toEqual(false);

		loadingStatusServ.isLoading('SaveReport',false);
		scope.$digest();
		expect(angular.element('#parent-container > .loading-panel').hasClass('ng-hide')).toEqual(true);

		angular.element('loading-panel').remove();
		loadingPanel.isolateScope().$destroy();
	});

});