describe('MobileTerminalCtrl', function() {

	beforeEach(module('unionvmsWeb'));

	var scope,ctrl, inmarsatCConfig, iridiumConfig, options1, options2;

    beforeEach(inject(function($rootScope, $controller, TranspondersConfig, TerminalConfig, CapabilityOption) {
        scope = $rootScope.$new();
        ctrl = $controller('MobileTerminalCtrl', {$scope: scope});


        //Create terminalConfig for InmarsatC with PLUGIN capability
        inmarsatCConfig = new TerminalConfig();
        inmarsatCConfig.systemType = "INMARSAT_C";
        inmarsatCConfig.viewName = "Inmarsat-C";

        var capabilityOptions = [];
        var options1DTO = {labelName: "BURUM", serviceName: "eu.europa.plugin.inmarsat.burum"};
        options1 = CapabilityOption.fromJson(options1DTO, 'PLUGIN');
        var options2DTO = {labelName: "EIK", serviceName: "eu.europa.plugin.inmarsat.eik"};
        options2 = CapabilityOption.fromJson(options2DTO, 'PLUGIN');
        capabilityOptions.push(options1);
        capabilityOptions.push(options2);

        inmarsatCConfig.capabilities["PLUGIN"] = capabilityOptions;

        //Create terminalConfig for Iridium without PLUGIN capability
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
        expect(scope.transponderSystems[0].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[0].typeAndPlugin.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[0].typeAndPlugin.plugin.labelName).toEqual(options1.attributes['LABELNAME']);
        expect(scope.transponderSystems[0].typeAndPlugin.plugin.serviceName).toEqual(options1.attributes['SERVICENAME']);

        expect(scope.transponderSystems[1].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[1].typeAndPlugin.type).toEqual(inmarsatCConfig.systemType);
        expect(scope.transponderSystems[1].typeAndPlugin.plugin.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(scope.transponderSystems[1].typeAndPlugin.plugin.serviceName).toEqual(options2.attributes['SERVICENAME']);

        expect(scope.transponderSystems[2].typeAndPlugin).toBeDefined();
        expect(scope.transponderSystems[2].typeAndPlugin.type).toEqual(iridiumConfig.systemType);
        expect(scope.transponderSystems[2].typeAndPlugin.plugin.labelName).toBeUndefined();
        expect(scope.transponderSystems[2].typeAndPlugin.plugin.serviceName).toBeUndefined();
	}));

    it('getModelValueForTransponderSystemBySystemTypeAndPlugin should return correct value', inject(function(TranspondersConfig, TerminalConfig, CapabilityOption) {
        //Create dropdowns
        scope.createTransponderSystemDropdownOptions();

        var returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndPlugin(inmarsatCConfig.systemType, options2.attributes['LABELNAME'], options2.attributes['SERVICENAME']);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(inmarsatCConfig.systemType);
        expect(returnValue.plugin.labelName).toEqual(options2.attributes['LABELNAME']);
        expect(returnValue.plugin.serviceName).toEqual(options2.attributes['SERVICENAME']);

        returnValue = scope.getModelValueForTransponderSystemBySystemTypeAndPlugin(iridiumConfig.systemType);
        expect(returnValue).toBeDefined();
        expect(returnValue.type).toEqual(iridiumConfig.systemType);
        expect(returnValue.plugin.labelName).toBeUndefined();
        expect(returnValue.plugin.serviceName).toBeUndefined();
    }));


});