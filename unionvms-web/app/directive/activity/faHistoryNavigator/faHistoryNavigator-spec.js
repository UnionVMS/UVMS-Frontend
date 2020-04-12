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
describe('faHistoryNavigator', function() {

    beforeEach(module('unionvmsWeb'));

    var scope,compile, mockFaServ, faHistory, testScope;

    beforeEach(function () {
        mockFaServ = {
            id: 1,
            repId: 1,
            documentType: 'declaration'
        };

        mockFaServ.resetActivity = jasmine.createSpy('resetActivity');
        mockFaServ.getFishingActivity = jasmine.createSpy('getFishingActivity');

        module(function ($provide) {
            $provide.value('fishingActivityService', mockFaServ);
        });
    });

    beforeEach(inject(function ($rootScope, $compile, $injector, $httpBackend) {
        if (!angular.element('#parent-container').length) {
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }

        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data: []});
        $httpBackend.whenPOST(/mdr/).respond();

        scope = $rootScope.$new();
        compile = $compile;
    }));

    afterEach(function () {
        angular.element('.fa-history-navigator').remove();
    });

    it('it should not render the history dropdown if an activity has no history', function () {
        scope.history = [];
        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        expect(angular.element('.fa-history-navigator > .btn-group').length).toEqual(0);
    });

    it('it should not render the history button if an activity has only one history item', function () {
        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];
        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        expect(angular.element('.fa-history-navigator > .btn-group').length).toEqual(0);
    });

    it('it should render the history dropdown with 2 history elements and no sub-children', function () {
        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9',
            enabled: true
        },{
            fishingActivityIds: [2],
            faReportId: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5',
            enabled: true
        }];
        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        testScope = faHistory.isolateScope();

        expect(angular.element('.fa-history-navigator > .btn-group').length).toEqual(1);
        expect(angular.element('.fa-history-navigator').find('li').length).toEqual(2);
        expect(angular.element('.fa-history-navigator').find('i.fa-caret-left').length).toEqual(0);
        expect(testScope.history[0].enabled).toBeFalsy();
        expect(testScope.history[1].enabled).toBeTruthy();
        expect(mockFaServ.isCorrection).toBeFalsy();

    });

    it('it should render the history dropdown with 5 history elements including sub-children', function () {
        mockFaServ.id = 3;
        mockFaServ.repId = 2;

        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9',
            enabled: true
        },{
            fishingActivityIds: [2,3,4],
            faReportId: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5',
            enabled: true
        }];
        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        testScope = faHistory.isolateScope();

        expect(angular.element('.fa-history-navigator > .btn-group').length).toEqual(1);
        expect(angular.element('.fa-history-navigator').find('li').length).toEqual(5);
        expect(angular.element('.fa-history-navigator').find('i.fa-caret-left').length).toEqual(1);
        expect(testScope.history[0].enabled).toBeTruthy();
        expect(testScope.history[1].enabled).toBeFalsy();
        expect(testScope.hasMultipleItems).toBeTruthy();
        expect(mockFaServ.isCorrection).toBeTruthy();

    });

    it('it should load an activity view from a simple history item', inject(function (FishingActivity) {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;

        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9',
            enabled: true
        },{
            fishingActivityIds: [2],
            faReportId: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5',
            enabled: true
        }];

        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        testScope = faHistory.isolateScope();
        testScope.openHistoryView(scope.history[1]);

        var activity = new FishingActivity(testScope.activityName);
        var status = {
            id: 2,
            documentType: mockFaServ.documentType,
            activityType: testScope.activiyName,
            repId: 2
        };

        expect(mockFaServ.resetActivity).toHaveBeenCalled();
        expect(mockFaServ.getFishingActivity).toHaveBeenCalledWith(activity, testScope.recompileView, 2, 2);
        expect(testScope.status).toEqual(status);
    }));

    it('it should load an activity view from a complex history item', inject(function (FishingActivity) {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;

        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9',
            enabled: true
        },{
            fishingActivityIds: [2,3,4],
            faReportId: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5',
            enabled: true
        }];

        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        testScope = faHistory.isolateScope();
        testScope.openHistoryView(scope.history[1], 3);

        var activity = new FishingActivity(testScope.activityName);
        var status = {
            id: 3,
            documentType: mockFaServ.documentType,
            activityType: testScope.activiyName,
            repId: 2
        };

        expect(mockFaServ.resetActivity).toHaveBeenCalled();
        expect(mockFaServ.getFishingActivity).toHaveBeenCalledWith(activity, testScope.recompileView, 3, 2);
        expect(testScope.status).toEqual(status);
    }));

    it('it should check if the activity is enabled/disabled', function () {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;

        scope.history = [{
            fishingActivityIds: [1],
            faReportId: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9',
            enabled: true
        },{
            fishingActivityIds: [2,3,4],
            faReportId: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5',
            enabled: true
        }];

        faHistory = compile('<fa-history-navigator history="history" activity-name="area_exit"></fa-history-navigator>')(scope);
        faHistory.appendTo('#parent-container');
        scope.$digest();

        testScope = faHistory.isolateScope();

        expect(testScope.isActivityDisabled(1,1)).toBeTruthy();
        expect(testScope.isActivityDisabled(3,2)).toBeFalsy();
    });


});
