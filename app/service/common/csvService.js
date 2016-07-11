/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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