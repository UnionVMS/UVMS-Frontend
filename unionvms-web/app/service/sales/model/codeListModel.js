(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('CodeList', codeListFactory);

    function codeListFactory($localStorage) {

        function CodeList(name) {
            this.name = name;
            this.items = [];
        }
      
        CodeList.prototype.getValue = function (code) {
            if (angular.isDefined($localStorage[this.name])) {
                var value = $localStorage[this.name].find(
                    function (item) {
                        return item.code === code;
                    });

                if (angular.isDefined(value)) {
                    return value.text;
                }
                return '';
            }
            return '';
        };

        return CodeList;
    }
})();