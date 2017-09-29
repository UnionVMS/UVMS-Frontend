angular.module('unionvmsWeb').factory('tableService',function(locale) {

    /**
     * Get the headers data in table format
     * 
     * @memberof tableService
     * @private
     * @param {Object} obj - contains the property, to be converted, in the current level
     * @param {Object} headers - converted headers
     * @param {Object} level - current object level
	 * @returns {Object} headers model
     */
    function getTableHeaders(obj, localePrefix, headers, level) {
        headers = headers || [];
        level = angular.isDefined(level) ? level + 1 : 0;
        headers[level] = headers[level] || [];
        var globalHeaders = level ? undefined : [];


        angular.forEach(obj, function(property,propertyName){
            var label;
            if(angular.isObject(property)){
                label = locale.getString(localePrefix + propertyName.toLowerCase());
                label = label !== "%%KEY_NOT_FOUND%%"? label : propertyName;
                headers[level].push({title: label, width: getColWidth(property)});
                headers[level+1] = headers[level+1] || [];
                headers[level+1].concat(getTableHeaders(property, localePrefix, headers, level));
            }else{
                if(level === 0){
                    globalHeaders.push({title: propertyName === '_' ? '' : locale.getString(localePrefix + propertyName.toLowerCase()), width: 1});
                }else{
                    label = locale.getString(localePrefix + propertyName.toLowerCase());
                    label = label !== "%%KEY_NOT_FOUND%%"? label : propertyName;
                    headers[level].push({title: label, width: 1});
                }
            }
        });

        if(level === 0){
            headers[headers.length-1] = globalHeaders.concat(headers[headers.length-1]);
        }

        return {
            nrGlobalHeaders: globalHeaders ? globalHeaders.length : undefined,
            headers: headers
        };
    }

    /**
     * Get the width of a specified column to be used as colspan
     * 
     * @memberof tableService
     * @private
     * @param {Object | String | Number} col - table column
	 * @returns {Number} column width
     */
    function getColWidth(col) {
        var colWidth = 0;

        angular.forEach(col, function(prop){
            if(angular.isObject(prop)){
                colWidth += getColWidth(prop);
            }else{
                colWidth++;
            }
        });

        return colWidth;
    }

    /**
     * Get the table rows from the service data
     * 
     * @memberof tableService
     * @private
     * @param {Array} arr - array with the table rows
	 * @returns {Object} row model
     */
    function getTableRows(arr) {
        var rows = [];
        angular.forEach(arr, function(item){
            rows.push(getTableRow(item));
        });

        return rows;
    }

    /**
     * Get the table row data from the service data
     * 
     * @memberof tableService
     * @private
     * @param {Array} obj - source of data to build the table row
     * @param {Array} rows - table rows 
	 * @returns {Object} row model
     */
    function getTableRow(obj, rows) {
        rows = rows || [];

        angular.forEach(obj, function(property, key){
            if(!angular.isObject(property)){
                rows.push({
                    key: key,
                    value: property
                });
            }
        });

        angular.forEach(obj, function(property, key){
            if(angular.isObject(property)){
                rows.concat(getTableRow(property, rows));
            }
        });

        return rows;
    }

    /**
      * Get the ordered table row data from the service data
      * 
      * @memberof tableService
      * @private
      * @param {Array} row - row to be ordered
      * @param {Array} header - format to order the row
      * @returns {Array} ordered row
      * @alias sortRow
      */
    var sortRow = function(row, header) {
        var currentRow = [];
        angular.forEach(header, function(item) {
            angular.forEach(row, function(rowItem) {
                if (rowItem.key === item) {
                    currentRow.push({
                        key: item,
                        value: rowItem.value
                    });
                }
            });
        });
        return currentRow;
    };

    /**
     * Get the ordered table rows from the service data
     * 
     * @memberof tableService
     * @private
     * @param {Array} rowData - data to be ordered
     * @param {Array} header - format to order the row
	 * @returns {Array}  ordered rows to be displayed
     * @alias sortTableRows
     */
    var sortTableRows = function(rowData, header) {
        var orderedRows = [];
        angular.forEach(rowData, function(row) {
            var rowData = sortRow(row, header);
            orderedRows.push(rowData);

        });
        return orderedRows;
    };

    var tableService = {};

	/**
	 * Converts data received from the service into table data
	 * 
	 * @memberof tableService
	 * @public
	 * @param {Object} data - contains the data related to the table
	 * @returns {Object} table model
	 * @alias convertDataToTable
	 */
    tableService.convertDataToTable = function(data, localePrefix, tableName) {

        var table;
        if(data.items.length > 0) {

            if (tableName === "catches") {
                
                // catches
                table = getTableHeaders(data.items[0], localePrefix);
                var optiRows = getTableRows(data.items);
                var headerData = _.pluck(optiRows[0], 'key');
                // ordered rows
                table.rows = sortTableRows(optiRows, headerData);
                table.totals = data.total ? sortRow(getTableRow(data.total), headerData) : undefined;

            } else {
                //landing
                table = getTableHeaders(data.header, localePrefix);
                table.rows = data.items;
                table.totals = data.total;
            }

        }else{
            table = {};
        }
        return table;
    };

    return tableService;
});