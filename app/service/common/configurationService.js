
(function(){

    var configurationService = function($q, locale, vesselRestService, movementRestService, mobileTerminalRestService){

        //Dict of configuration parameters for all modules
        var configs = {};

        //Have the configurations already been loaded?
        var loaded = false;

        var CONFIG_MODULES = {
            "VESSEL" : vesselRestService.getConfig(),
            "MOVEMENT" : movementRestService.getConfig(),
            "MOBILETERMINAL" : mobileTerminalRestService.getConfig(),
            "MOBILE_TERMINAL_TRANSPONDERS" : mobileTerminalRestService.getTranspondersConfig(),
            "MOBILE_TERMINAL_CHANNELS" : mobileTerminalRestService.getChannelNames(),
        };

        //Get configuration for all modules
        var setup = function(){
            var deferred = $q.defer();
            var promises = [];

            //Config has already been loaded
            if(loaded){                
                return deferred.resolve();
            }

            //Load all configs  
            $.each(CONFIG_MODULES, function(key, value){
                promises.push(getConfigForModule(key, value));
            });
            console.log("Waiting for all configurations to finish...");

            //When all configs are loaded then...
            $q.all(promises).then(
                function(response){
                    console.log("All configurations have been loaded.");
                    console.log(configs);
                    loaded = true;
                    deferred.resolve();
                },
                function(error){
                    console.error("Failed to load all configurations.");
                    deferred.reject();
                }
            );

            return deferred.promise;
        };

        var getConfigForModule  = function(moduleName, getConfigFunctionCall){
            console.log("Get config: " + moduleName);
            var deferred = $q.defer();            
            getConfigFunctionCall.then(
                function(response){
                    //Update the config dict with the values from the reponse
                    configs[moduleName] = response;
                    deferred.resolve();
                },
                function(error){
                    console.error("Error loading config for " +moduleName);
                    deferred.reject();
                }
            );
            return deferred.promise;
        };

        var getConfigValue = function(moduleName, configParameter){
            try{
                return configs[moduleName][configParameter];
            }catch(err){
                console.error("Config parameter " +configParameter +" is missing for " +moduleName);
                return undefined;
            }
        };

        var getConfig = function(moduleName){
            try{
                return configs[moduleName];
            }catch(err){
                console.error("Config is missing for " +moduleName);
                return undefined;
            }
        };        

         var setTextAndCodeForDropDown = function(valueToSet, prefix, module){ 
            var valueList = [];
            _.find(valueToSet, 
                function(val){
                    valueList.push({'text': translateTextForDropdowns(val, prefix, module), 'code': val});
                });
            return valueList;
        };

        var translateTextForDropdowns = function(textToTranslate, prefix, module){
            if (textToTranslate.indexOf('+') !== -1) {
                textToTranslate = textToTranslate.replace("+"," plus");
            }
            return locale.getString('config.' + module + "_"+ prefix + "_" + textToTranslate);
        };

        return{
            setup: setup,
            getValue: getConfigValue,
            getConfig: getConfig,
            setTextAndCodeForDropDown : setTextAndCodeForDropDown

        };
    };

    angular.module('unionvmsWeb')
	.factory('configurationService',['$q', 'locale', 'vesselRestService', 'movementRestService', 'mobileTerminalRestService', configurationService]);
    
}());
