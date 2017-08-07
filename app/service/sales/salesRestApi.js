(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('salesRestApi', salesRestApi);

    function salesRestApi($resource) {

        var sales = $resource('/sales/rest/:domain/:action', {},
            {
                search: {method: 'POST', params: {domain: 'report', action: 'search'}},
                codeLists: {method: 'GET', params: {domain: 'codelists', action: ''}},
                get: {method: 'GET', params: {domain: 'report', action: ''}},
                getSavedSearches: {method: 'GET', params: {domain:'savedSearch', action: ''}},
                saveSearch: {method: 'POST', params: {domain: 'savedSearch', action: ''}},
                deleteSavedSearch: {method: 'DELETE', params: {domain: 'savedSearch', action: ''}},
                exportDocuments: {method: 'POST', params: {domain: 'report', action: 'export'}},
                exportSelectedDocuments: {method: 'POST', params: {domain: 'report', action: 'exportSelected'}}
            });

        var service = {
            sales: sales
        };

        return service;
    }
})();
