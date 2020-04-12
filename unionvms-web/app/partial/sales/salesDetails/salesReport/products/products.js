(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .component('salesProducts', {
            templateUrl: 'partial/sales/salesDetails/salesReport/products/products.html',
            controller: productsCtrl,
            controllerAs: 'vm',
            bindings: {
                products: '<',
                currency: '<',
                showArea: '<'
            }
        });

    function productsCtrl(locale, salesCsvService, csvService) {
        /* jshint validthis:true */
        var vm = this;

        vm.filterProducts = filterProducts;
        vm.filteredProducts = [];
        vm.editSelectionCallBack = editSelectionCallBack;

        /////////////////////////

        /**
         * Filters product by species
         * @param species
         */
        function filterProducts(species) {
            vm.selectedSpecies = species;
            vm.filteredProducts = _.where(vm.products, { 'species': species });
        }

        /////////////////////////
        vm.editSelectionDropdownItems = [
             { text: locale.getString('sales.products_export_specie'), code: 'EXPORT_SPECIE' },
             { text: locale.getString('sales.products_export_all'), code: 'EXPORT_ALL' }
        ];

        function editSelectionCallBack(item) {
            var data = vm.products;
            if (item.code.toUpperCase() === 'EXPORT_SPECIE') {
                data = _.where(data, { 'species': vm.selectedSpecies });
            }
            var header = salesCsvService.headers.product;
            csvService.downloadCSVFile(data, header, "sales_products_export.csv");
        }
    }
})();
