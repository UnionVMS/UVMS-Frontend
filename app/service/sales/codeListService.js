(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('codeListService', salesCachingService);

    function salesCachingService($localStorage, salesRestService, $q, CodeList) {
        var prefix = 'sales_';

        var service = {
            getCodeListsAssured: getCodeListsPromise,
            getCodeListAssured: getCodeListPromise,
            getCodeLists: getCodeLists,
            getCodeList: getCodeList
        };

        return service;

        /////////////////////////////

        function getCodeListsPromise(names) {
            return assureCodeListsExist().then(function () {
                return getCodeLists(names);
            });
        }

        function getCodeLists(names) {
            var lists = {};
            angular.forEach(names, function (name) {
                var list = $localStorage[prefix + name];
                var codeList = new CodeList(prefix + name);
                codeList.items = angular.copy(list);
                lists[name] = codeList;
            });
            return lists;
        }

        function getCodeListPromise(name) {
            return assureCodeListsExist().then(function () {
                return getCodeList(name);
            });
        }

        function getCodeList(name) {
            return new CodeList(prefix + name);
        }

        //If the code lists are not in local storage get them from back-end
        function assureCodeListsExist() {
            var deferred = $q.defer();

            if (angular.isDefined($localStorage[prefix + 'timestamp'])) {
                deferred.resolve();
            } else {
                salesRestService.getCodeLists().then(
                    function (lists) {
                        for (var list in lists) {
                            if (lists.hasOwnProperty(list)) {
                                $localStorage[prefix + list] = lists[list];
                            }
                        }
                        $localStorage[prefix + 'timestamp'] = new Date();
                        deferred.resolve();
                    });

            }
            return deferred.promise;
        }
    }
})();