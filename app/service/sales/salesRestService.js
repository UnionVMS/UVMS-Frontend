(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('salesRestService', salesRestService);

    function salesRestService($q, $log, salesRestApi, SalesNoteListPage, userService, SavedSearchGroup, SearchField) {

        var service = {
            getSalesNotesPage: getSalesNotesPage,
            getCodeLists: getCodeLists,
            getSalesDetails: getSalesDetails,
            getSavedSearches: getSavedSearches,
            saveSearch: saveSearch,
            deleteSavedSearch: deleteSavedSearch,
            exportDocuments: exportDocuments,
            exportSelectedDocuments: exportSelectedDocuments
        };

        return service;

        ///////////////////////////

        function getSalesNotesPage(pageNr, filters, sorting) {

            var deferred = $q.defer();
            var pageSize = 10;
            var payload = {
                pageIndex: pageNr,
                pageSize: pageSize,
                filters: filters
            };

            if (sorting && sorting.sortField && sorting.sortDirection) {
                payload.sortField = sorting.sortField;
                payload.sortDirection = sorting.sortDirection;
            }

            salesRestApi.sales.search({}, payload, function (response) {
                if ($$valid(response, deferred)) {
                    var salesNoteListPage = new SalesNoteListPage();
                    angular.extend(salesNoteListPage, response.data);
                    deferred.resolve(salesNoteListPage);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.getSalesNoteList()", err);
                deferred.reject("Could not load salesNoteList");
            });

            return deferred.promise;
        }

        function getCodeLists() {

            var deferred = $q.defer();

            salesRestApi.sales.codeLists({}, {}, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve(response.data);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.getCodeLists()", err);
                deferred.reject("Could not load code lists");
            });

            return deferred.promise;
        }

        function getSalesDetails(id) {
            var deferred = $q.defer();

            var params = { id: id };
            salesRestApi.sales.get(params, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve(response.data);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.getSalesDetails()", err);
                deferred.reject("Could not load sales note");
            });

            return deferred.promise;
        }

        function getSavedSearches() {
            var deferred = $q.defer();
            var user = userService.getUserName();
            salesRestApi.sales.getSavedSearches({'user': user}, function (response) {
                if ($$valid(response, deferred)) {
                    var groups = [];
                    angular.forEach(response.data, function (groupDto) {
                        groups.push($$dtoToSavedSearchGroup(groupDto));
                    });
                    deferred.resolve(groups);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.getSavedSearches()", err);
                deferred.reject("Could not get saved search groups");
            });

            return deferred.promise;
        }

        function saveSearch(savedSearchGroup) {
            var deferred = $q.defer();
            var transferDto = {
                id: savedSearchGroup.id,
                name: savedSearchGroup.name,
                user: savedSearchGroup.user,
                fields: savedSearchGroup.searchFields
            };
            salesRestApi.sales.saveSearch(transferDto, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve($$dtoToSavedSearchGroup(response.data));
                }
            },
            function (err) {
                $log.error("Error: salesRestService.savedSearchGroup()", err);
                deferred.reject("Could not save search group");
            });

            return deferred.promise;
        }

        function deleteSavedSearch(savedSearchGroup) {
            var deferred = $q.defer();
            salesRestApi.sales.deleteSavedSearch(savedSearchGroup, { id: savedSearchGroup.id }, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve(angular.copy(savedSearchGroup));
                }
            },
            function (err) {
                $log.error("Error: salesRestService.deleteSearchGroup()", err);
                deferred.reject("Could not delete search group");
            });
            return deferred.promise;
        }

        //export all documents return from search criteria
        function exportDocuments(filters) {
            var deferred = $q.defer();
            salesRestApi.sales.exportDocuments({}, { filters: filters }, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve(response.data);
                    console.log(response.data);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.exportDocument()", err);
                deferred.reject("Could not perform export all documents");
            });

            return deferred.promise;
        }

        //export selected documents
        function exportSelectedDocuments(exportList) {
            var deferred = $q.defer();
            salesRestApi.sales.exportSelectedDocuments({}, exportList, function (response) {
                if ($$valid(response, deferred)) {
                    deferred.resolve(response.data);
                }
            },
            function (err) {
                $log.error("Error: salesRestService.exportSelectedDocuments()", err);
                deferred.reject("Could not perform export selected documents");
            });
            return deferred.promise;
        }

        ////////////////////////////////

        //Check response code for errors
        function $$valid(response, deferred) {
            if (response.code === 200) {
                return true;
            }

            if (response.code === 400) {
                $log.error("Error: Bad input data", response.data);
                deferred.reject("Bad input data");
                return false;
            }

            $log.error("Error: Server error", response.data);
            deferred.reject("Server error");
            return false;
        }

        //Turn returned dto into SavedSearchGroup object
        function $$dtoToSavedSearchGroup(dto) {
            var searchFields = [];
            if ($.isArray(dto.fields)) {
                for (var i = 0; i < dto.fields.length; i++) {
                    searchFields.push(SearchField.fromJson(dto.fields[i]));
                }
            }
            var group = new SavedSearchGroup(dto.name, dto.user, false, searchFields);
            group.id = dto.id;
            return group;
        }
    }
})();
