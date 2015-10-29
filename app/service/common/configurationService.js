(function(){

    var configurationService = function($q, $log, locale, vesselRestService, movementRestService, mobileTerminalRestService, auditLogRestService, ruleRestService){

        //Dict of configuration parameters for all modules
        var configs = {};
        var CONFIG_MODULES = {
            "VESSEL" : vesselRestService.getConfig,
            "MOVEMENT" : movementRestService.getConfig,
            "MOBILETERMINAL" : mobileTerminalRestService.getConfig,
            "MOBILE_TERMINAL_TRANSPONDERS" : mobileTerminalRestService.getTranspondersConfig,
            "MOBILE_TERMINAL_CHANNELS" : mobileTerminalRestService.getChannelNames,
            "AUDIT" : auditLogRestService.getAuditConfiguration,
            "RULES" : ruleRestService.getConfig,
        };

        //Clear the loaded configs
        var clear = function(){
            configs = {};
        };

        //Load configurations from the REST apis
        //configsToLoad should be an array of configNames (matching the names in CONFIG_MODULES)
        var setup = function(configsToLoad){
            var deferred = $q.defer();

            if(angular.isUndefined(configsToLoad)){
                $log.warn("configurationService.setup() was called without a list of configs to load. No configs will be loaded.");
                deferred.resolve();
                return deferred.promise;
            }

            $log.debug("Load configurations for:" + configsToLoad.join(', '));
            var promises = [];

            //Remove configs that already are loaded
            var i = configsToLoad.length;
            while (i--) {
                if(angular.isDefined(getConfig(configsToLoad[i]))){
                    $log.debug("Config already loaded for: " +configsToLoad[i]);
                    configsToLoad.splice(i, 1);
                }
            }

            //All configs already loaded?
            if(configsToLoad.length === 0){
                $log.debug("All configs are already loaded :)");
                deferred.resolve();
                return deferred.promise;
            }

            //Load all configs
            $.each(configsToLoad, function(index, configName){
                promises.push(getConfigForModule(configName, CONFIG_MODULES[configName]));
            });
            $log.debug("Waiting for all configurations to finish...");

            //When all configs are loaded then...
            $q.all(promises).then(
                function(response){
                    $log.debug("All configurations have been loaded.");
                    $log.debug(configs);
                    deferred.resolve();
                },
                function(error){
                    $log.error("Failed to load all configurations.");
                    deferred.reject("FAILED TO LOAD CONFIGURATIONS.");
                }
            );

            return deferred.promise;
        };

        var getConfigForModule  = function(moduleName, getConfigFunctionCall){
            $log.debug("Load config: " + moduleName);
            var deferred = $q.defer();
            getConfigFunctionCall().then(
                function(response){
                    //Update the config dict with the values from the reponse
                    configs[moduleName] = response;
                    deferred.resolve();
                },
                function(error){
                    $log.error("Error loading config for " +moduleName);
                    deferred.reject();
                }
            );
            return deferred.promise;
        };

        var getConfigValue = function(moduleName, configParameter){
            try{
                return configs[moduleName][configParameter];
            }catch(err){
                $log.error("Config parameter " +configParameter +" is missing for " +moduleName);
                return undefined;
            }
        };

        var getConfig = function(moduleName){
            try{
                return configs[moduleName];
            }catch(err){
                $log.error("Config is missing for " +moduleName);
                return undefined;
            }
        };


         var setTextAndCodeForDropDown = function(valueToSet, prefix, module, sortAlphabetically){
            var valueList = [];
            _.find(valueToSet,
                function(val){
                    var text = val;
                    if(angular.isDefined(prefix) && angular.isDefined(module)){
                        text = translateTextForDropdowns(val, prefix, module);
                    }
                    valueList.push({'text': text, 'code': val});
                });

            if(sortAlphabetically){
                valueList = _.sortBy(valueList, function(obj){return obj.text;});
            }
            return valueList;
        };

        var translateTextForDropdowns = function(textToTranslate, prefix, module){
            var origTextToTranslate  = textToTranslate;
            textToTranslate = textToTranslate.replace("+"," plus");
            textToTranslate = textToTranslate.replace(","," comma");

            var translation = locale.getString('config.' + module + "_"+ prefix + "_" + textToTranslate);
            //If translation not found, then return untranslated text
            if(translation.indexOf('KEY_NOT_FOUND') >= 0){
                translation = origTextToTranslate;
            }
            return translation;
        };

        return{
            clear: clear,
            setup: setup,
            getValue: getConfigValue,
            getConfig: getConfig,
            setTextAndCodeForDropDown : setTextAndCodeForDropDown

        };
    };

    angular.module('unionvmsWeb')
	.factory('configurationService',['$q', '$log', 'locale', 'vesselRestService', 'movementRestService', 'mobileTerminalRestService', 'auditLogRestService', 'ruleRestService', configurationService]);

}());