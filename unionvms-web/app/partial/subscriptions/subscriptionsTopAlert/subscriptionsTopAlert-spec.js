describe('SubscriptionstopalertCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,ctrl, mockSubServ;

    beforeEach(function () {
       mockSubServ = jasmine.createSpyObj('subscriptionsService', ['resetAlert']);

       module(function ($provide) {
           $provide.value('subscriptionsService', mockSubServ);
       })
    });

    beforeEach(inject(function($rootScope, $controller, $httpBackend) {
      scope = $rootScope.$new();
      ctrl = $controller('SubscriptionstopalertCtrl', {$scope: scope});

      $httpBackend.whenGET(/usm/).respond();
      $httpBackend.whenGET(/i18n/).respond();
      $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should close the subscriptions top alert', inject(function() {
        scope.close();
        expect(mockSubServ.resetAlert).toHaveBeenCalled();
    }));

});
