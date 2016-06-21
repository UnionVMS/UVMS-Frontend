describe('mapFishPrintRestServiceTest', function() {

    var $httpBackend, printRestService;

    beforeEach(module('unionvmsWeb', 'ngMockE2E', function($provide) {
        // Do some other stuff before each test run if you want...
    }));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        printRestService = $injector.get('mapFishPrintRestService');
        $httpBackend.whenGET(/usm\/assets\/translate\/locale-.*\.json/).respond({});
        $httpBackend.whenGET(/^i18n\/\.*/).respond({});
        $httpBackend.whenGET('/usm-administration/rest/ping').respond({});
        $httpBackend.whenGET('/config/rest/globals').respond({});
    }));

    afterEach(function() {
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        //$httpBackend.verifyNoOutstandingRequest();
    });

    it('should return array with templates', inject(function() {

        $httpBackend.expectGET('/mapfish-print/print/apps.json')
            .respond(201, ['template_1', 'template_2']);

        printRestService.getTemplates().then(function(response) {
            expect(response).toContain('template_1');
            expect(response).toContain('template_2');
        });

    }));

    it('should return the capabilities of the template', inject(function() {

        $httpBackend.expectGET('/mapfish-print/print/template_1/capabilities.json')
            .respond(200, {app: "template_1", formats: ['pdf']});

        printRestService.getCapabilities('template_1').then(function(response) {
            expect(response.app).toBe('template_1');
            expect(response.formats).toContain('pdf');
        });

    }));

    it('should create print job', inject(function() {

        $httpBackend.expectPOST('/mapfish-print/print/template_1/report.pdf', {layout: 'A4 Portrait'})
            .respond(200, {
                ref: '15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b',
                statusURL: '/print/status/15179fee-618d-4356-8114-cfd8f146e273.json',
                downloadURL: '/print/report/15179fee-618d-4356-8114-cfd8f146e273'
            }
        );

        printRestService.createPrintJob('template_1', 'pdf', {layout: 'A4 Portrait'}).then(function(response) {
            expect(response.ref).toBe('15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b');
            expect(response.statusURL).toBe('/print/status/15179fee-618d-4356-8114-cfd8f146e273.json');
            expect(response.downloadURL).toBe('/print/report/15179fee-618d-4356-8114-cfd8f146e273');

        });
    }));

    it('should return the status of the print job', inject(function() {

        $httpBackend.expectGET('/mapfish-print/print/status/15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b.json')
            .respond(200, {
                "done": false,
                "status": "running",
                "elapsedTime": 507,
                "waitingTime": 0,
                "downloadURL": "/print/report/15179fee-618d-4356-8114-cfd8f146e273"
            });

        printRestService.getPrintJobStatus('15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b').then(function(response) {
            expect(response.done).toBeFalsy();
            expect(response.status).toBe('running');
            expect(response.elapsedTime).toEqual(507);
            expect(response.waitingTime).toEqual(0);
            expect(response.downloadURL).toEqual("/print/report/15179fee-618d-4356-8114-cfd8f146e273");
        });

    }));


    it('should cancel the print job', inject(function() {

        $httpBackend.expectDELETE('/mapfish-print/print/cancel/15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b')
            .respond(200, {});

        printRestService.cancelPrintJob('15179fee-618d-4356-8114-cfd8f146e273@3067ade6-0768-4fc6-b41d-40422d0cdb8b').then(function(response) {
            //ok
        });

    }));

});
