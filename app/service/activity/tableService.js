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
            if(angular.isObject(property)){

                headers[level].push({title: propertyName, width: getColWidth(property)});
                headers[level+1] = headers[level+1] || [];
                headers[level+1].concat(getTableHeaders(property, localePrefix, headers, level));
            }else{
                if(level === 0){
                    globalHeaders.push({title: propertyName === '_' ? '' : locale.getString(localePrefix + propertyName.toLowerCase()), width: 1});
                }else{
                    headers[level].push({title: propertyName, width: 1});
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
     * @param {Array} rows - table rows to be displayed
	 * @returns {Object} row model
     */
    function getTableRow(obj, rows) {
        rows = rows || [];

        angular.forEach(obj, function(property){
            if(!angular.isObject(property)){
                rows.push(property);
            }
        });

        angular.forEach(obj, function(property){
            if(angular.isObject(property)){
                rows.concat(getTableRow(property, rows));
            }
        });

        return rows;
    }

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
	tableService.convertDataToTable = function(data, localePrefix) {
		var table;
		if(data.items.length > 0){
			table = getTableHeaders(data.items[0], localePrefix);
			table.rows = getTableRows(data.items);
			table.totals = data.total ? getTableRow(data.total) : undefined;
		}else{
			table = {};
		}
		return table;
	};

	return tableService;
});