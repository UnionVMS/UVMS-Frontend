(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('groupLineInput', {
            templateUrl: 'directive/sales/groupLineInput/groupLineInput.html',
            controller: groupLineInputCtrl,
            controllerAs: 'vm',
            bindings: {
                initialtext: '@',
                items: '<',
                updateFunction: '=',
                resetPerformed: '='
            }
        });

    function groupLineInputCtrl(searchService, $scope) {
        /* jshint validthis:true */

        var vm = this;
        vm.functions = ["and", "or"];
        vm.startFunction = "and";
        vm.removeItem = removeItem;
        vm.updateModel = updateModel;
        vm.onSelect = onSelect;
        vm.selectFunction = selectFunction;
        init();

        ///////////////////////

        function init(){
            if (vm.selectedItems === undefined) {
                vm.selectedItems = [];
            }

            if (vm.selectedFunction === undefined) {
                vm.selectedFunction = vm.startFunction;
            }

            if (vm.items !== undefined) {
                vm.codes = $.map(vm.items, function (value, index) {
                    if (value.code !== undefined) {
                        return [value.code];
                    }
                });
            }
        }
        function reset() {
            vm.selectedItems = [];
            vm.selectedFunction = vm.startFunction;
        }
        //Handle remove one item.
        function removeItem(item) {
            var index = vm.selectedItems.indexOf(item);
            vm.selectedItems.splice(index, 1);
            updateModel();
        }

        function updateModel() {
            vm.updateFunction(vm.selectedItems, vm.selectedFunction);
        }

        function onSelect() {
            //only add if code is correct and not already in list.
            if (vm.tempItem !== undefined && vm.selectedItems.indexOf(vm.tempItem) < 0 ) {
                vm.selectedItems.push(vm.tempItem);
                vm.tempItem = undefined;
                updateModel();
            }
        }

        function selectFunction(func) {
            vm.selectedFunction = func;
            updateModel();
        }


        $scope.$on('sales.advanced-search-reset', function () {
            reset();
        });

        $scope.$on('sales.perform-saved-search', function (event, args) {
            reset();
            if (args.speciesAll && args.speciesAll.length > 0) {
                vm.selectedItems = args.speciesAll;
                vm.selectedFunction = "and";
            } else if (args.speciesAny && args.speciesAny.length > 0) {
                vm.selectedItems = args.speciesAny;
                vm.selectedFunction = "or";
            }
        });

        $scope.startsWith = function(state, viewValue) {
            return state && state.substr && state.substr(0, viewValue.length).toLowerCase() === viewValue.toLowerCase();
        };
    }
})();
