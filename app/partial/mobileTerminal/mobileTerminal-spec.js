describe('MobileTerminalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl, inmarsatCConfig, iridiumConfig, options1, options2;

    beforeEach(inject(function($rootScope, $controller, TranspondersConfig, TerminalConfig, CapabilityOption) {
        scope = $rootScope.$new();
        ctrl = $controller('MobileTerminalCtrl', {$scope: scope});


        //Create terminalConfig for InmarsatC with HAS_LES capability
        inmarsatCConfig = new TerminalConfig();
        inmarsatCConfig.systemType = "INMARSAT_C";
        inmarsatCConfig.viewName = "Inmarsat-C";

        var capabilityOptions = [];
        var options1DTO = {labelName: "BURUM", serviceName: "eu.europa.plugin.inmarsat.burum"};
        options1 = CapabilityOption.fromJson(options1DTO, 'HAS_LES');
        var options2DTO = {labelName: "EIK", serviceName: "eu.europa.plugin.inmarsat.eik"};
        options2 = CapabilityOption.fromJson(options2DTO, 'HAS_LES');
        capabilityOptions.push(options1);
        capabilityOptions.push(options2);

        inmarsatCConfig.capabilities["HAS_LES"] = capabilityOptions;

        //Create terminalConfig for Iridium without HAS_LES capability
        iridiumConfig = new TerminalConfig();
        iridiumConfig.systemType = "IRIDIUM";
        iridiumConfig.viewName = "Iridium";

        //Create TranspondersConfig
        var config = new TranspondersConfig();
        config.terminalConfigs["INMARSAT_C"] = inmarsatCConfig;
        config.terminalConfigs["IRIDIUM"] = iridiumConfig;
        scope.transpondersConfig = config;

    }));

	it('createTransponderSystemDropdownOptions should create correct dropdown values', inject(function() {

        expect(scope.transponderSystems.length).toEqual(0);

        //Create dropdowns
        scope.createTransponderSystemDropdownOptions();

        //Validate dropdowns
        expect(scope.transponderSystems.length).toEqual(3);
        expect(scope.transponderSystems[0].typeAndLes).toBeDefined();
        expect(scope.transponderSystems[0].typeAndLes.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[0].typeAndLes.labelName).toEqual(options1.attributes['LABELNAME']);
        expect(scope.transponderSystems[0].typeAndLes.serviceName).toEqual(options1.attributes['SERVICENAME']);

        expect(scope.transponderSystems[1].typeAndLes).toBeDefined();
        expect(scope.transponderSystems[1].typeAndLes.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[1].typeAndLes.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(scope.transponderSystems[1].typeAndLes.serviceName).toEqual(options2.attributes['SERVICENAME']);

        expect(scope.transponderSystems[2].typeAndLes).toBeDefined();
        expect(scope.transponderSystems[2].typeAndLes.type).toEqual(iridiumConfig.systemType);
        expect(scope.transponderSystems[2].typeAndLes.labelName).toBeUndefined();
        expect(scope.transponderSystems[2].typeAndLes.serviceName).toBeUndefined();
	}));

    it('getModelValueForTransponderSystemBySystemTypeAndLES should return correct value', inject(function(TranspondersConfig, TerminalConfig, CapabilityOption) {
        //Create dropdowns
        scope.createTransponderSystemDropdownOptions();

        var returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndLES(inmarsatCConfig.systemType, options2.attributes['LABELNAME'], options2.attributes['SERVICENAME']);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(inmarsatCConfig.systemType);
        expect(returnValue.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(returnValue.serviceName).toEqual(options2.attributes['SERVICENAME']);

        returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndLES(iridiumConfig.systemType);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(iridiumConfig.systemType);
        expect(returnValue.labelName).toBeUndefined();
        expect(returnValue.serviceName).toBeUndefined();
    }));


});