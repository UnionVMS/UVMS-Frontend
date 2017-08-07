(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .filter('codeList', codeList);
    
    function codeList(codeListService) {

        var codeLists = {};

        function codeListFilter(input, type) {
            if (!codeLists[type]) {
                codeLists[type] = codeListService.getCodeList(type);
            }

            var text = codeLists[type].getValue(input);
            if (text) {
                return input + ' - ' + text;
            }
            return input;
        }

        return codeListFilter;
    }
})();