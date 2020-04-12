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
describe('ExchangeService', function() {

  beforeEach(module('unionvmsWeb'));

    var exchangeServiceDTO = {
        "serviceClassName": "testdata.liquibase.satellite.eik",
        "name": "EIK",
        "type": "SATELLITE_RECEIVER",
        "status": "STARTED"
    };


    it("should parse DTO correctly", inject(function(ExchangeService) {
        var exchangeService = ExchangeService.fromJson(exchangeServiceDTO);

        expect(exchangeService.serviceClassName).toEqual(exchangeServiceDTO.serviceClassName);
        expect(exchangeService.name).toEqual(exchangeServiceDTO.name);
        expect(exchangeService.type).toEqual(exchangeServiceDTO.type);
        expect(exchangeService.status).toEqual(exchangeServiceDTO.status);
    }));


});