describe('QueryparamsubscriptionCtrl', function() {
	
	beforeEach(module('unionvmsWeb'));

	var scope,ctrl;

	/*beforeEach(inject(function($rootScope, $controller, Subscription) {
		scope = $rootScope.$new();
		scope.subscription = new Subscription();
		ctrl = $controller('QueryparamsubscriptionCtrl', {$scope: scope});
	}));

	beforeEach(inject(function($httpBackend) {
		//Mock
		$httpBackend.whenGET(/usm/).respond();
		$httpBackend.whenGET(/i18n/).respond();
		$httpBackend.whenGET(/globals/).respond({data : []});
	}));

	it('should include the current partial to parent scope', inject(function($compile) {

		scope.view = $compile('<div ng-include="partial/subscriptions/newSubscription/queryParamSubscription/queryParamSubscription.html"></div>')(scope);
		scope.view.appendTo('#parent-container');
	
		scope.$digest();


		var viewToRemove = angular.element('#parent-container');
		if(viewToRemove){
			viewToRemove.remove();
		}
	}));*/

});
