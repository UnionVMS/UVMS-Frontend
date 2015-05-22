angular.module('unionvmsWeb')
.factory('TranspondersConfig', function(TerminalConfig) {

        function TranspondersConfig(){
        }

        TranspondersConfig.fromJson = function(data){
            var transponderConfig = new TranspondersConfig();
            transponderConfig.terminalConfigs = {};
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
.factory('TerminalConfig', function() {

        function TerminalConfig(){
        }

        TerminalConfig.fromJson = function(data){
            var terminalConfig = new TerminalConfig();

            //System type
            terminalConfig.systemType = data.terminalSystemType;

            //Set a view text for the transponder system
            terminalConfig.viewName = data.terminalSystemType;
            if(data.terminalSystemType === "INMARSAT_C"){
                terminalConfig.viewName = "Inmarsat-C Eik";
            }            

            //Create list of terminal fields
            terminalConfig.terminalFields = {};            
            $.each(data.terminalFieldList, function(index, field){
                terminalConfig.terminalFields[field] = true;
            });

            //Create list of channel fields
            terminalConfig.channelFields = {};            
            $.each(data.channelFieldList, function(index, field){
                terminalConfig.channelFields[field] = true;
            });

            return terminalConfig;
        };
 

        return TerminalConfig;
    });