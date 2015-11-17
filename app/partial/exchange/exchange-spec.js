describe('ExchangeCtrl', function() {

	var scope,ctrl;

	beforeEach(module('unionvmsWeb'));

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();
		ctrl = $controller('ExchangeCtrl', {$scope: scope});
	}));

	it('should allow all messages when filter all', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "all";
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeTruthy();
	}));

	it('should only allow incoming', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "incoming";
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeTruthy();
	}));

	it('should only allow outgoing', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "outgoing";
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeTruthy();
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeFalsy();
	}));

	it('should not allow any', inject(function() {
		scope.exchangeLogsSearchResults.incomingOutgoing = "banana";
		expect(scope.filterIncomingOutgoing({incoming: true})).toBeFalsy();
		expect(scope.filterIncomingOutgoing({incoming: false})).toBeFalsy();
	}));

});