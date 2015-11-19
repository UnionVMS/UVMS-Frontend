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
