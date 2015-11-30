describe('AlarmReportModalCtrl', function() {

    beforeEach(module('unionvmsWeb'));

    var scope, ctrl, modalInstance;

    beforeEach(inject(function($rootScope, $controller, Alarm) {
        scope = $rootScope.$new();
        modalInstance = {                    // Create a mock object using spies
            close: jasmine.createSpy('modalInstance.close'),
            dismiss: jasmine.createSpy('modalInstance.dismiss'),
            result: {
                then: jasmine.createSpy('modalInstance.result.then')
            }
        };
        var alarm = new Alarm();
        var options = {};
        createController = function(){
            return $controller('AlarmReportModalCtrl', {$scope: scope, $modalInstance: modalInstance, alarm : alarm, options : options});
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


    it('acceptAndPollIsAllowed should only be allowed for national vessels', inject(function(Vessel, userService, configurationService) {
        //Allowe all
        spyOn(userService, 'isAllowed').andReturn(true);

        var controller = createController();
        var allowedFlagState = 'SWE';
        spyOn(configurationService, 'getValue').andReturn(allowedFlagState);
        scope.alarm.vessel = new Vessel();

        scope.alarm.vessel.countryCode = allowedFlagState;
        expect(scope.acceptAndPollIsAllowed()).toBeTruthy();

        scope.alarm.vessel.countryCode = "ABC";
        expect(scope.acceptAndPollIsAllowed()).toBeFalsy();
    }));

    it('acceptAndPoll should first create a poll and then update status of alarm to closed', inject(function($q) {
        var controller = createController();
        var deferred = $q.defer();
        var createPollSpy = spyOn(scope, "createPollForConnectId").andReturn(deferred.promise);
        deferred.resolve();

        var deferred2 = $q.defer();
        var acceptSpy = spyOn(scope, "accept").andReturn(deferred2.promise);
        deferred2.resolve();


        scope.acceptAndPoll();
        scope.$digest();

        expect(createPollSpy).toHaveBeenCalled();
        expect(acceptSpy).toHaveBeenCalled();
    }));

    it('acceptAndPoll should not call accept if it fails to create the poll', inject(function($q) {
        var controller = createController();
        var deferred = $q.defer();
        var createPollSpy = spyOn(scope, "createPollForConnectId").andReturn(deferred.promise);
        deferred.reject();

        var acceptSpy = spyOn(scope, "accept");
        var setErrorTextSpy = spyOn(scope, "setErrorText");


        scope.acceptAndPoll();
        scope.$digest();

        expect(createPollSpy).toHaveBeenCalled();
        expect(acceptSpy).not.toHaveBeenCalled();
        expect(setErrorTextSpy).toHaveBeenCalled();
    }));


    describe('createPollForConnectId()', function() {
        it('createPollForConnectId should create a manual poll if exactly one pollable channel is found', inject(function($q, Movement, pollingRestService, pollingService, SearchResultListPage) {
            var deferred = $q.defer();
            var getPollablesSpy = spyOn(pollingRestService, "getPollablesMobileTerminal").andReturn(deferred.promise);
            items = [{id: 'mock'}];
            var searchResultListPage = new SearchResultListPage(items, 1, 1);
            deferred.resolve(searchResultListPage);

            var deferred2 = $q.defer();
            var createPollSpy = spyOn(pollingService, "createPolls").andReturn(deferred2.promise);
            deferred2.resolve();

            var controller = createController();
            scope.alarm.movement = new Movement();
            scope.alarm.movement.connectId = "TEST";

            scope.createPollForConnectId();
            scope.$digest();

            expect(getPollablesSpy).toHaveBeenCalled();
            expect(createPollSpy).toHaveBeenCalled();
        }));

        it('createPollForConnectId should not create a manual poll if zero pollable channels are found', inject(function($q, Movement, pollingRestService, pollingService, SearchResultListPage) {
            var deferred = $q.defer();
            var getPollablesSpy = spyOn(pollingRestService, "getPollablesMobileTerminal").andReturn(deferred.promise);
            var searchResultListPage = new SearchResultListPage([], 1, 1);
            deferred.resolve(searchResultListPage);

            var createPollSpy = spyOn(pollingService, "createPolls");

            var controller = createController();
            scope.alarm.movement = new Movement();
            scope.alarm.movement.connectId = "TEST";

            scope.createPollForConnectId();
            scope.$digest();

            expect(getPollablesSpy).toHaveBeenCalled();
            expect(createPollSpy).not.toHaveBeenCalled();
        }));

        it('createPollForConnectId should get pollables by searching for the connectId of the movement of the alarm', inject(function($q, Movement, pollingRestService, pollingService, SearchResultListPage) {

            var connectId = 'TEST';
            var getPollablesSpy = spyOn(pollingRestService, "getPollablesMobileTerminal").andCallFake(function(getPollableListRequest){
                var deferred = $q.defer();
                expect(getPollableListRequest.connectIds.length).toEqual(1);
                expect(getPollableListRequest.connectIds[0]).toEqual(connectId);
                expect(getPollableListRequest.page).toEqual(1);
                deferred.reject();
                return deferred.promise;
            });

            var controller = createController();
            scope.alarm.movement = new Movement();
            scope.alarm.movement.connectId = connectId;

            expect(pollingService.getPollingOptions().comment).toBeUndefined();
            scope.createPollForConnectId();
            scope.$digest();

            expect(getPollablesSpy).toHaveBeenCalled();
        }));

        it('createPollForConnectId should create a poll of the type MANUAL, with comment set and correct terminal selected', inject(function($q, Movement, pollingRestService, pollingService, SearchResultListPage) {
            var deferred = $q.defer();
            var getPollablesSpy = spyOn(pollingRestService, "getPollablesMobileTerminal").andReturn(deferred.promise);
            items = [{id: 'mock'}];
            var searchResultListPage = new SearchResultListPage(items, 1, 1);
            deferred.resolve(searchResultListPage);

            var createPollSpy = spyOn(pollingService, "createPolls").andCallFake(function(){
                var deferred2 = $q.defer();
                expect(pollingService.getPollingOptions().type).toEqual('MANUAL');
                expect(pollingService.getPollingOptions().comment).toBeDefined();
                expect(pollingService.getNumberOfSelectedTerminals()).toEqual(1);
                expect(pollingService.getSelectedChannels()[0].id).toEqual('mock');
                deferred2.resolve();
                return deferred2.promise;
            });

            var controller = createController();
            scope.alarm.movement = new Movement();
            scope.alarm.movement.connectId = "TEST";

            expect(pollingService.getPollingOptions().comment).toBeUndefined();
            scope.createPollForConnectId();
            scope.$digest();

            expect(getPollablesSpy).toHaveBeenCalled();
            expect(createPollSpy).toHaveBeenCalled();
        }));

    });

    describe('accept()', function() {
        it('accept() should set status to closed, send request to server, view success text and call callback function', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "updateAlarmStatus").andReturn(deferred.promise);
            var updatedAlarm = new Alarm();
            updatedAlarm.setStatusToClosed();
            deferred.resolve(updatedAlarm);

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.accept(false);
            scope.$digest();

            expect(updateStatusSpy).toHaveBeenCalled();
            expect(setSuccessTextSpy).toHaveBeenCalled();
            expect(setErrorTextSpy).not.toHaveBeenCalled();

            //Callback should have been called
            expect(callbackSpy).toHaveBeenCalledWith(updatedAlarm);

            //The status of the scope alarm should be updated
            console.log("scope.alarm.");
            console.log(scope.alarm);
            expect(scope.alarm.isClosed()).toBeTruthy('Alarm should be closed');
        }));

        it('accept() should not update the alarm object if the accept() fails', inject(function($q, Alarm, alarmRestService) {
            var deferred = $q.defer();
            var updateStatusSpy = spyOn(alarmRestService, "updateAlarmStatus").andReturn(deferred.promise);
            deferred.reject();

            var controller = createController();

            var setErrorTextSpy = spyOn(scope, "setErrorText");
            var setSuccessTextSpy = spyOn(scope, "setSuccessText");
            var callbackSpy = spyOn(scope, "callCallbackFunctionAfterStatusChange");

            scope.alarm.status = 'OPEN';
            scope.accept(false);
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