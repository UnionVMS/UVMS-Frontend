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
describe('AlarmReportModalCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, modalInstance, alarm;

    beforeEach(inject(function($rootScope, $controller, Alarm) {
        scope = $rootScope.$new();
        modalInstance = {                    // Create a mock object using spies
            close: jasmine.createSpy('modalInstance.close'),
            dismiss: jasmine.createSpy('modalInstance.dismiss'),
            result: {
                then: jasmine.createSpy('modalInstance.result.then')
            }
        };
        alarm = new Alarm();
        var options = {};
        createController = function(){
            return $controller('AlarmReportModalCtrl', {$scope: scope, $uibModalInstance: modalInstance, alarm : alarm, options : options});
        };
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));


    it('closeModal should close the modal', inject(function() {
        var controller = createController();
        scope.closeModal();
        expect(modalInstance.close).toHaveBeenCalled();
    }));


    it('cancel should dismiss the modal', inject(function() {
        var controller = createController();
        scope.cancel();
        expect(modalInstance.dismiss).toHaveBeenCalled();
    }));

    it('should compose a warning messsage', inject(function(locale) {
        alarm.alarmItems = [{ruleName: 'Latitude missing'}, {ruleName: 'Terminal not found'}];
        spyOn(locale, 'getString').andCallFake(function(key) {
            return {
                'alarms.add_tranceiver_asset_reprocess': 'Add transceiver and reprocess asset.',
                'alarms.report_not_added_to_database': 'Report not added in database.'
            }[key];
        });

        createController();

        expect(scope.warningMessage).toEqual('Latitude missing. Terminal not found. Add transceiver and reprocess asset. Report not added in database.');
    }));

    describe('reprocess()', function() {
        it('reprocess() should set status to reproccessed, send request to server, view success text and call callback function', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "reprocessAlarms").andReturn(deferred.promise);
            var updatedAlarm = new Alarm();
            updatedAlarm.setStatusToReprocessed();
            deferred.resolve(updatedAlarm);

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.reprocess();
            scope.$digest();

            expect(updateStatusSpy).toHaveBeenCalled();
            expect(setSuccessTextSpy).toHaveBeenCalled();
            expect(setErrorTextSpy).not.toHaveBeenCalled();

            //Callback should have been called
            expect(callbackSpy).toHaveBeenCalledWith(updatedAlarm);

            //The status of the scope alarm should be updated
            expect(scope.alarm.isReprocessed()).toBeTruthy('Alarm should be reprocessed');
        }));

        it('reprocess() should not update the alarm object if the accept() fails', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "reprocessAlarms").andReturn(deferred.promise);
            deferred.reject();

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.reprocess();
            scope.$digest();

            expect(updateStatusSpy).toHaveBeenCalled();
            expect(setSuccessTextSpy).not.toHaveBeenCalled();
            expect(setErrorTextSpy).toHaveBeenCalled();

            //Callback should not have been called
            expect(callbackSpy).not.toHaveBeenCalled();

            //The status of the scope alarm should not have been updated
            expect(scope.alarm.isOpen()).toBeTruthy('Alarm should still be open');
        }));
    });


    describe('reject()', function() {
        it('reject() should set status to rejected, send request to server, view success text and call callback function', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "updateAlarmStatus").andReturn(deferred.promise);
            var updatedAlarm = new Alarm();
            updatedAlarm.setStatusToRejected();
            deferred.resolve(updatedAlarm);

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.reject();
            scope.$digest();

            expect(updateStatusSpy).toHaveBeenCalled();
            expect(setSuccessTextSpy).toHaveBeenCalled();
            expect(setErrorTextSpy).not.toHaveBeenCalled();

            //Callback should have been called
            expect(callbackSpy).toHaveBeenCalledWith(updatedAlarm);

            //The status of the scope alarm should be updated
            expect(scope.alarm.status).toEqual('REJECTED');
        }));


        it('reject() should not update the alarm object if the reject() fails', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "updateAlarmStatus").andReturn(deferred.promise);
            deferred.reject();

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.reject(false);
            scope.$digest();

            expect(updateStatusSpy).toHaveBeenCalled();
            expect(setSuccessTextSpy).not.toHaveBeenCalled();
            expect(setErrorTextSpy).toHaveBeenCalled();

            //Callback should not have been called
            expect(callbackSpy).not.toHaveBeenCalled();

            //The status of the scope alarm should not have been updated
            expect(scope.alarm.isOpen()).toBeTruthy('Alarm should still be open');
        }));
    });

});
