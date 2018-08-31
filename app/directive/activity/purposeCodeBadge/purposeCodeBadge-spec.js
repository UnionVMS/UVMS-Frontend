describe('purposeCodeBadge', function () {

    beforeEach(module('unionvmsWeb'));

    var scope, compile, mockFaServ, locale;

    beforeEach(function () {
        mockFaServ = {
            activityData: {
                reportDetails: {
                    items: [{
                        id: 'purposeCode',
                        originalValue: 9
                    }]
                },
                history: {
                    previousId: 0,
                    nextId: 1
                }
            },
            isCorrection: true
        };

        locale = {
            getString : function(str){
                var title;
                switch (str){
                    case 'activity.optype_correction':
                        title = 'CORRECTION';
                        break;
                    case 'activity.fa_report_document_type_corrected':
                        title = 'CORRECTED';
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

    it('it should render the badge with title as CORRECTION', function () {
        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.finished).toBeTruthy();
        expect(scope.getTitle()).toEqual('CORRECTION');
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    /*it('it should render the badge with title as CORRECTED', function () {
        mockFaServ.isCorrection = false;
        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.finished).toBeTruthy();
        expect(scope.getTitle()).toEqual('CORRECTED');
        expect(angular.element('.purpose-code-badge>.red-badge')[0]).toBeDefined();
        expect(angular.element('.badge').css('display')).toEqual('block');
    });

    it('it should not render the badge if it is not a correction, corrected or cancelled report', function () {
        mockFaServ.isCorrection = false;
        mockFaServ.activityData.history.nextId = 0;
        badge = compile('<purpose-code-badge></purpose-code-badge>')(scope);
        badge.appendTo('#parent-container');
        scope.$digest();

        expect(scope.finished).toBeTruthy();
        expect(scope.getTitle()).toBeUndefined();
        expect(angular.element('.badge').hasClass('ng-show')).toBeFalsy();

    });*/
});