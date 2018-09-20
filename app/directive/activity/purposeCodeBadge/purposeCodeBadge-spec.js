describe('purposeCodeBadge', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, mockFaServ, locale;

    beforeEach(function () {
        mockFaServ = {
            id: 1,
            repId: 1,
            activityData: {
                reportDetails: {
                    items: [{
                        id: 'purposeCode',
                        originalValue: 9
                    }]
                },
                history: [{
                    fishingActivityIds: [1],
                    faReportID: 1,
                    acceptanceDate: '2017-06-12T20:50:00',
                    purposeCode: '9'
                }]
            }
        };

        locale = {
            getString : function(str){
                var title;
                switch (str){
                    case 'activity.fa_report_document_type_original':
                        title = 'ORIGINAL';
                        break;
                    case 'activity.optype_correction':
                        title = 'CORRECTION';
                        break;
                    case 'activity.fa_report_document_type_corrected':
                        title = 'CORRECTED';
                        break;
                    case 'activity.optype_deletion':
                        title = 'DELETION';
                        break;
                    case 'activity.fa_report_document_type_deleted':
                        title = 'DELETED';
                        break;
                    case 'activity.optype_cancellation':
                        title = 'CANCELLATION';
                        break;
                    case 'activity.fa_report_document_type_canceled':
                        title = 'CANCELED';
                        break;
                }

                return title;
            }
        };


        module(function ($provide) {
            $provide.value('fishingActivityService', mockFaServ);
            $provide.value('locale', locale);
        });
    });

    beforeEach(inject(function ($rootScope, $compile, $injector, $httpBackend) {
        if (!angular.element('#parent-container').length) {
            var parentElement = angular.element('<div id="parent-container"></div>');
            parentElement.appendTo('body');
        }

        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET('/i18n').respond();
        $httpBackend.whenGET(/globals/).respond({data: []});

        scope = $rootScope.$new();
        compile = $compile;
    }));

    afterEach(function () {
        angular.element('.purpose-code-badge').remove();
    });

    it('it should render the badge with title as ORIGINAL', function () {
        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('ORIGINAL');
        expect(angular.element('.purpose-code-badge>.badge-color-blue')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as CORRECTION', function () {
        mockFaServ.id = 2;
        mockFaServ.repId = 2;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('CORRECTION');
        expect(angular.element('.purpose-code-badge>.badge-color-blue')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as CORRECTED', function () {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '5'
        },{
            fishingActivityIds: [1],
            faReportID: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('CORRECTED');
        expect(angular.element('.purpose-code-badge>.badge-color-red')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as DELETION', function () {
        mockFaServ.id = 2;
        mockFaServ.repId = 2;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '3'
        },{
            fishingActivityIds: [1],
            faReportID: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('DELETION');
        expect(angular.element('.purpose-code-badge>.badge-color-orange')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as DELETED', function () {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '3'
        },{
            fishingActivityIds: [1],
            faReportID: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('DELETED');
        expect(angular.element('.purpose-code-badge>.badge-color-red')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as CANCELLATION', function () {
        mockFaServ.id = 2;
        mockFaServ.repId = 2;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '1'
        },{
            fishingActivityIds: [1],
            faReportID: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('CANCELLATION');
        expect(angular.element('.purpose-code-badge>.badge-color-orange')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should render the badge with title as CANCELED', function () {
        mockFaServ.id = 1;
        mockFaServ.repId = 1;
        mockFaServ.activityData.history = [{
            fishingActivityIds: [2],
            faReportID: 2,
            acceptanceDate: '2017-06-12T20:54:00',
            purposeCode: '1'
        },{
            fishingActivityIds: [1],
            faReportID: 1,
            acceptanceDate: '2017-06-12T20:50:00',
            purposeCode: '9'
        }];

        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.show).toBeTruthy();
        expect(scope.getTitle()).toEqual('CANCELED');
        expect(angular.element('.purpose-code-badge>.badge-color-red')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

});