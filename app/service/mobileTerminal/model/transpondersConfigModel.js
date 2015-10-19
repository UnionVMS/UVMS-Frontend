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
.factory('TerminalConfig', function(CapabilityOption, locale) {

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
            var viewName = locale.getString("config.MOBILETERMINAL_TRANSPONDERS_" +data.terminalSystemType);
            if(angular.isDefined(viewName) && viewName !== "%%KEY_NOT_FOUND%%"){
                terminalConfig.viewName = viewName;
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
        this.attributes = {}; //used for special types, e.g. HAS_LES
    }

    CapabilityOption.fromJson = function(data, capabilityName){
        var capabilityOption = new CapabilityOption();
        //Set name and text
        capabilityOption.name = data.name;
        capabilityOption.text = data.name;

        //Set code
        if(angular.isDefined(data.code)){
            capabilityOption.code = data.code;
        }else{
            capabilityOption.code = data.name;
        }

        //Set all attributes
        for (var key in data){
            capabilityOption.attributes[key.toUpperCase()] = data[key];
        }

        //Get view name
        var viewName;
        switch(capabilityName){
            case "SUPPORT_SINGLE_OCEAN":
            case "SUPPORT_MULTIPLE_OCEAN":
                capabilityOption.text = capabilityOption.name;
                viewName = locale.getString("config.MOBILETERMINAL_OCEAN_REGION_" +capabilityOption.text);
                break;
            case "HAS_LES":
                capabilityOption.text = capabilityOption.attributes['LABELNAME'];
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

    function SystemTypeAndLES(type, labelName, serviceName){
        this.type = type;
        this.labelName = labelName;
        this.serviceName = serviceName;
    }

    SystemTypeAndLES.prototype.equals = function(other){
        return this.type === other.type && this.labelName === other.labelName && this.serviceName === other.serviceName;
    };

    return SystemTypeAndLES;
});