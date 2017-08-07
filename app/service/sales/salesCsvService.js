(function () {
    'use strict';

    angular
        .module('unionvmsWeb')
        .factory('salesCsvService', salesCsvService);

    function salesCsvService(locale) {
        var service = {
            headers: {
                salesReport: [
                    locale.getString('sales.table_header_flag_state'),
                    locale.getString('sales.table_header_external_marketing'),
                    locale.getString('sales.table_header_ircs'),
                    locale.getString('sales.table_header_name'),
                    locale.getString('sales.table_header_sales_date'),
                    locale.getString('sales.table_header_sales_location'),
                    locale.getString('sales.table_header_landing_date'),
                    locale.getString('sales.table_header_landing_port'),
                    locale.getString('sales.table_header_sales_type'),
                    locale.getString('sales.table_header_seller'),
                    locale.getString('sales.table_header_buyer')
                ],
                product: [
                    locale.getString('sales.products_table_header_specie'),
                    locale.getString('sales.products_table_header_area'),
                    locale.getString('sales.products_table_header_freshness'),
                    locale.getString('sales.products_table_header_presentation'),
                    locale.getString('sales.products_table_header_preservation'),
                    locale.getString('sales.products_table_header_factor'),
                    locale.getString('sales.products_table_header_category'),
                    locale.getString('sales.products_table_header_class'),
                    locale.getString('sales.products_table_header_usage'),
                    locale.getString('sales.products_table_header_weight'),
                    locale.getString('sales.products_table_header_unit'),
                    locale.getString('sales.products_table_header_price')
                ]
            }
        };
        return service;
    }
})();
