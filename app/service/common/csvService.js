angular.module('unionvmsWeb').factory('csvService',function($timeout, $document, CSV) {

    //TODO: Move to config file
    var FIELD_SEPERATOR = ';';

	var csvService = {
        //Export and download data as a CSV file
        downloadCSVFile : function(csvData, csvHeader, filename){
            var options = {
                header : csvHeader,
                fieldSep : FIELD_SEPERATOR, //field separator
                decimalSep : 'locale', //format decimal according to locale settings
                addByteOrderMarker: true
            };

            CSV.stringify(csvData, options).then(function(csv){
                console.log(csv);

                var charset = "utf-8";
                var blob = new Blob([csv], {
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

	return csvService;
});