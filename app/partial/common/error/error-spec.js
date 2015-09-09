describe('errorCtrl', function() {

    var scope,ctrl;

    beforeEach(module('unionvmsWeb'));

    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('errorCtrl', {$scope: scope});
    }));

});