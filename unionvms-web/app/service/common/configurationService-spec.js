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
describe('configurationService', function() {

    var buildings = {HOUSE : 1, CABIN : 2, TENT : 3};
    var vesselRestSpy;

    //Disable console logging
    console.log = function() {};
    console.error = function() {};

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
        spyOn(mobileTerminalRestService, 'getConfig').andReturn(deffered.promise);
    }));

    beforeEach(inject(function($httpBackend) {
        //Mock
        $httpBackend.whenGET(/usm/).respond();
        $httpBackend.whenGET(/i18n/).respond();
        $httpBackend.whenGET(/globals/).respond({data : []});
    }));

    it('should build configs dictionary and return correct values', inject(function($rootScope, configurationService) {

        var vesselLetter, buildingsFromConfig;
        configurationService.setup(['VESSEL', 'MOVEMENT']).then(function(){
            vesselLetter = configurationService.getValue('VESSEL', 'LETTER');
            buildingsFromConfig = configurationService.getValue('MOVEMENT', 'BUILDINGS');
        });

        $rootScope.$digest();
        expect(vesselLetter).toBe('A');
        expect(buildingsFromConfig).toEqual(buildings);

    }));

    it('should return undefined for non existing values', inject(function($rootScope, configurationService) {

        var noModule, noParam, buildingsFromConfig;
        configurationService.setup(['VESSEL', 'MOVEMENT']).then(function(){
            noModule = configurationService.getValue('NON_EXISTING', 'LETTER');
            noParam = configurationService.getValue('MOVEMENT', 'NON_EXISTING');
            buildingsFromConfig = configurationService.getValue('MOVEMENT', 'BUILDINGS');
        });

        $rootScope.$digest();
        expect(noModule).toBeUndefined();
        expect(noParam).toBeUndefined();
        expect(buildingsFromConfig).toEqual(buildings);
    }));

});
