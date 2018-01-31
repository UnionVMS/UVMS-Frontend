/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
describe('subscriptionsService', function() {

  var subServ;

  beforeEach(module('unionvmsWeb'));

  beforeEach(inject(function(subscriptionsService, $httpBackend){
      subServ = subscriptionsService;

      $httpBackend.whenGET(/usm/).respond();
      $httpBackend.whenGET(/i18n/).respond();
      $httpBackend.whenGET(/globals/).respond({data : []});

  }));

  it('should set the alert status', inject(function() {
      expect(subServ).toBeDefined();
      subServ.setAlertStatus('error', 'test', true);
      expect(subServ.alertStatus.timer).toBeUndefined();
      expect(subServ.alertStatus.msg).toEqual('test');
      expect(subServ.alertStatus.type).toEqual('error');
      expect(subServ.alertStatus.isVisible).toBeTruthy();
      expect(subServ.alertStatus.invalidType).toBeUndefined();
  }));

  it('should set the alert status with a timeout', inject(function ($timeout) {
      spyOn(subServ, 'cancelTimeout');
      expect(subServ).toBeDefined();
      subServ.setAlertStatus('error', 'test', true, 1000);
      expect(subServ.alertStatus.timer).toBeDefined();
      expect(subServ.alertStatus.msg).toEqual('test');
      expect(subServ.alertStatus.type).toEqual('error');
      expect(subServ.alertStatus.isVisible).toBeTruthy();
      expect(subServ.alertStatus.invalidType).toBeUndefined();
      $timeout.flush();
      expect(subServ.cancelTimeout).toHaveBeenCalled();
  }));

  it('should reset the alert status to the original config', inject(function () {
      expect(subServ).toBeDefined();
      subServ.setAlertStatus('error', 'test', true);
      subServ.resetAlert();
      expect(subServ.alertStatus.timer).toBeUndefined();
      expect(subServ.alertStatus.msg).toBeUndefined();
      expect(subServ.alertStatus.type).toBeUndefined();
      expect(subServ.alertStatus.isVisible).toBeFalsy();
      expect(subServ.alertStatus.invalidType).toBeUndefined();
  }));

    it('should get the alert invalid type', inject(function () {
        expect(subServ).toBeDefined();
        subServ.setAlertStatus('error', 'test', true, undefined, 'error-test');

        expect(subServ.alertStatus.timer).toBeUndefined();
        expect(subServ.alertStatus.msg).toEqual('test');
        expect(subServ.alertStatus.type).toEqual('error');
        expect(subServ.alertStatus.isVisible).toBeTruthy();
        expect(subServ.alertStatus.invalidType).toEqual('error-test');
    }));
});
