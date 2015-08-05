angular.module('unionvmsWeb').factory('datatablesService',function(locale) {
    return locale.ready('datatables').then(function(){
       return {
            "sEmptyTable": locale.getString('datatables.sEmptyTable'),
            "sInfo": locale.getString('datatables.sInfo'),
            "sInfoEmpty": locale.getString('datatables.sInfoEmpty'),
            "sInfoFiltered": locale.getString('datatables.sInfoFiltered'),
            "sInfoPostFix": locale.getString('datatables.sInfoPostFix'),
            "sInfoThousands": locale.getString('datatables.sInfoThousands'),
            "sLengthMenu": locale.getString('datatables.sLengthMenu'),
            "sLoadingRecords": locale.getString('datatables.sLoadingRecords'),
            "sProcessing": locale.getString('datatables.sProcessing'),
            "sSearch": locale.getString('datatables.sSearch'),
            "sZeroRecords": locale.getString('datatables.sZeroRecords'),
            "oPaginate": {
                "sFirst": locale.getString('datatables.paginateFirst'),
                "sLast": locale.getString('datatables.paginateLast'),
                "sNext": locale.getString('datatables.paginateNext'),
                "sPrevious": locale.getString('datatables.paginatePrevious')
            },
            "oAria": {
                "sSortAscending": locale.getString('datatables.oariaSortAscending'),
                "sSortDescending": locale.getString('datatables.oariaSortDescending')
            }
       };
    });
});