(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('salesSelectionService', salesSelectionService);

    function salesSelectionService(searchService) {
        var toExclude = [];
        var toInclude = [];
        var selectAll = false;

        var service = {
            checkAll: checkAll,
            checkItem: checkItem,
            getToExclude: getToExclude,
            getToInclude: getToInclude,
            getSelectAll: getSelectAll,
            getExportList: getExporList,
            reset: reset
        };

        return service;

 

        ////////////////////////////

        function getToExclude() {
            return toExclude;
        }
        function getToInclude() {
            return toInclude;
        }
        function getSelectAll() {
            return selectAll;
        }
        function getExporList() {
            var list = selectAll ? toExclude : toInclude;
            var filters = searchService.getAdvancedSearchObject();
            var exportList = {
                'exportAll': selectAll,
                'ids': list,
                'criteria': { 'filters': filters }
            };
            return exportList;
        }

        /////////////////////////////
        function reset() {
            toExclude = [];
            toInclude = [];
            selectAll = false;
        }
        function checkAll() {
            var visibleAll = selectAll && toExclude.length === 0;
            selectAll = !visibleAll;
            toExclude = [];
            toInclude = [];
        }
        function checkItem(id, selected) {
            //export all and add one item
            if (selectAll && selected) {
                $$removeFromList('exclude', id);
            } else if (selectAll && !selected) {
                $$addToList('exclude', id);
            } else if (!selectAll && selected) {
                $$addToList('include', id);
            } else if (!selectAll && !selected) {
                $$removeFromList('include', id);
            }
        }
        function $$removeFromList(listName, id) {
            var list = $$getCorrectList(listName);
            $.each(list, function (index, tempId) {
                if (id === tempId) {
                    list.splice(index, 1);
                }
            });
        }
        function $$addToList(listName, id) {
            var list = $$getCorrectList(listName);
            if (list.indexOf(id) === -1) {
                list.push(id);
            }
        }
        function $$getCorrectList(listName) {
            if (listName === 'include') {
                return toInclude;
            }
            if (listName === 'exclude') {
                return toExclude;
            }
            return [];
        }
    }
})();