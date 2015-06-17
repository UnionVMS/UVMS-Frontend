angular.module('unionvmsWeb')
.factory('TranspondersConfig', function(TerminalConfig) {

        function TranspondersConfig(){
            this.terminalConfigs = {};
        }

        TranspondersConfig.fromJson = function(data){
            var transponderConfig = new TranspondersConfig();
            for (var i = 0; i < data.length; i ++) {
                transponderConfig.terminalConfigs[data[i].terminalSystemType] = TerminalConfig.fromJson(data[i]);
            }

            return transponderConfig;
        };

        TranspondersConfig.prototype.getTerminalConfigBySystemName = function(systemName){
            return this.terminalConfigs[systemName];
        };

        return TranspondersConfig;
    });

angular.module('unionvmsWeb')
.factory('TerminalConfig', function(CapabilityOption) {

        function TerminalConfig(){
            this.systemType = undefined;
            this.viewName = undefined;
            this.terminalFields = {};
            this.channelFields = {}; 
            this.capabilities = {};      
        }

        TerminalConfig.fromJson = function(data){
            var terminalConfig = new TerminalConfig();

            //System type
            terminalConfig.systemType = data.terminalSystemType;

            //Set a view text for the transponder system
            terminalConfig.viewName = data.terminalSystemType;
            if(data.terminalSystemType === "INMARSAT_C"){
                terminalConfig.viewName = "Inmarsat-C";
            }            

            //Create list of terminal fields
            $.each(data.terminalFieldList, function(index, field){
                terminalConfig.terminalFields[field] = true;
            });

            //Create list of channel fields                
            $.each(data.channelFieldList, function(index, field){
                terminalConfig.channelFields[field] = true;
            });

            //Create list of capabilities
            $.each(data.capabilityList, function(index, capability) {

                //Capability WITH options
                if(angular.isDefined(capability.optionList) && _.isArray(capability.optionList) && capability.optionList.length > 0){
                    var capabilityOptions = [];
                    $.each(capability.optionList, function(index, aCapability){
                        capabilityOptions.push(CapabilityOption.fromJson(aCapability, capability.name));
                    });
                    terminalConfig.capabilities[capability.name] = capabilityOptions;
                }
                //Capability WITHOUT options
                else{
                    terminalConfig.capabilities[capability.name] = true;
                }
            });

            return terminalConfig;
        };
 

        return TerminalConfig;
});

angular.module('unionvmsWeb')
.factory('CapabilityOption', function(locale) {

    function CapabilityOption(){
        this.name = undefined;
        this.code = undefined;
        this.text = undefined; //shown in dropdowns by default
    }

    CapabilityOption.fromJson = function(data, capabilityName){
        var capabilityOption = new CapabilityOption();
        capabilityOption.name = data.name;
        capabilityOption.text = data.name;

        if(angular.isDefined(data.code)){
            capabilityOption.code = data.code;
        }else{
            capabilityOption.code = data.name;
        }

        //Get view name
        var viewName;
        switch(capabilityName){
            case "SUPPORT_SINGLE_OCEAN":
            case "SUPPORT_MULTIPLE_OCEAN":
                viewName = locale.getString("mobileTerminal.OCEAN_REGION" +"_" +capabilityOption.name);
                break;
            case "HAS_LES":
                viewName = locale.getString("mobileTerminal.LES" +"_" +capabilityOption.name);
                break;                
        }

        if(angular.isDefined(viewName) && viewName !== "%%KEY_NOT_FOUND%%"){
            capabilityOption.text = viewName;
        }

        return capabilityOption;
    };
    return CapabilityOption;
});


angular.module('unionvmsWeb')
.factory('SystemTypeAndLES', function(locale) {

    function SystemTypeAndLES(type, les){
        this.type = type;
        this.les = les;
    }

    SystemTypeAndLES.prototype.equalsTypeAndLES = function(type, les){
        return this.type === type && this.les === les;
    };

    return SystemTypeAndLES;
});