angular.module('unionvmsWeb').factory('csvWKTService',function($timeout, $document, CSV) {

    var csvWKTService = {
        //Export and download data as a CSV file
        downloadCSVFile : function(csvData, csvHeader, filename){
            var options = {
                header : csvHeader,
                fieldSep : ';', 
                decimalSep : '.'
            };

            CSV.stringify(csvData, options).then(function(csv){
                var finalCsv = csv.replace(/undefined/g, '');

                var charset = "utf-8";
                var blob = new Blob([finalCsv], {
                    type: "text/csv;charset="+ charset + ";"
                });

                if (window.navigator.msSaveOrOpenBlob) {
                    navigator.msSaveBlob(blob, filename);
                }
                else {
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', window.URL.createObjectURL(blob));
                    downloadLink.attr('download', filename);
                    downloadLink.attr('target', '_blank');

                    $document.find('body').append(downloadLink);
                    $timeout(function () {
                        downloadLink[0].click();
                        downloadLink.remove();
                    }, null);
                }

            });
        }        
    };

    return csvWKTService;
});