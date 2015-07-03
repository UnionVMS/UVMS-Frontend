describe('configurationService', function() {

    var buildings = {HOUSE : 1, CABIN : 2, TENT : 3};
    var vesselRestSpy;

    beforeEach(module('unionvmsWeb'));  

    beforeEach(inject(function($rootScope, $q, vesselRestService, movementRestService, mobileTerminalRestService) {

        var vesselDeffered = $q.defer();
        vesselDeffered.resolve({LETTER : 'A', COUNTRY : 'SWE'}); 
        vesselRestSpy = spyOn(vesselRestService, 'getConfig').andReturn(vesselDeffered.promise); 

        var movementDeffered = $q.defer();
        movementDeffered.resolve({THEME : 'GREEN', NUMBER : 2, BUILDINGS : buildings}); 
        spyOn(movementRestService, 'getConfig').andReturn(movementDeffered.promise); 

        var deffered = $q.defer();
        deffered.resolve({THEME : 'GREEN', NUMBER : 2, BUILDINGS : buildings}); 
        spyOn(mobileTerminalRestService, 'getTranspondersConfig').andReturn(deffered.promise);         
        spyOn(mobileTerminalRestService, 'getChannelNames').andReturn(deffered.promise);         
    }));


    it('should build configs dictionary and return correct values', inject(function($rootScope, configurationService) {

        var vesselLetter, buildings;
        configurationService.setup().then(function(){
            vesselLetter = configurationService.getValue('VESSEL', 'LETTER');
            buildings = configurationService.getValue('MOVEMENT', 'BUILDINGS');
        });

        $rootScope.$apply();
        expect(vesselLetter).toBe('A');
        expect(buildings).toEqual(buildings);

    }));

    it('should return undefined for non existing values', inject(function($rootScope, configurationService) {

        var noModule, noParam;
        configurationService.setup().then(function(){
            noModule = configurationService.getValue('NON_EXISTING', 'LETTER');
            noParam = configurationService.getValue('MOVEMENT', 'NON_EXISTING');
        });

        $rootScope.$apply();
        expect(noModule).toBeUndefined();
        expect(noParam).toBeUndefined();
    }));

});