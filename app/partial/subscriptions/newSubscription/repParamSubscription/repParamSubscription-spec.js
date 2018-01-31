describe('RepparamsubscriptionCtrl', function() {
	
	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

	/*beforeEach(inject(function($rootScope, $controller, Subscription) {
		scope = $rootScope.$new();
		scope.subscription = new Subscription();
		ctrl = $controller('RepparamsubscriptionCtrl', {$scope: scope});
	}));

	beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	it('should initialize the creation type as "Transport original report"', inject(function($compile) {
		expect(scope.subscription.reportParams.vesselIdType.type).toEqual('original');
		
		scope.view = $compile('<div ng-include="partial/subscriptions/newSubscription/repParamSubscription/repParamSubscription.html"></div>')(scope);
		scope.view.appendTo('#parent-container');
	
		scope.$digest();


		var viewToRemove = angular.element('#parent-container');
		if(viewToRemove){
			viewToRemove.remove();
		}
	}));*/

});