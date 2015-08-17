describe('ExchangeCtrl', function() {

	var scope,ctrl;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('ExchangeCtrl', {$scope: scope});
	}));

	it('should allow all messages when filter all', inject(function() {
		scope.searchResults.incomingOutgoing = "all";
		expect(scope.filterIncomingOutgoing({outgoing: true})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({outgoing: false})).toBeTruthy();
	}));

	it('should only allow incoming', inject(function() {
		scope.searchResults.incomingOutgoing = "incoming";
		expect(scope.filterIncomingOutgoing({outgoing: true})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({outgoing: false})).toBeTruthy();
	}));

	it('should only allow outgoing', inject(function() {
		scope.searchResults.incomingOutgoing = "outgoing";
		expect(scope.filterIncomingOutgoing({outgoing: true})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({outgoing: false})).toBeFalsy();
	}));

	it('should not allow any', inject(function() {
		scope.searchResults.incomingOutgoing = "banana";
		expect(scope.filterIncomingOutgoing({outgoing: true})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({outgoing: false})).toBeFalsy();
	}));

});