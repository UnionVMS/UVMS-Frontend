(function () {
    'use strict';
   
    angular
        .module('unionvmsWeb')
        .factory('SalesConfig', salesConfigFactory);

    function salesConfigFactory() {

        function SalesConfig() {
            this.flagStates = [];
            
        }

        return SalesConfig;
    }
})();