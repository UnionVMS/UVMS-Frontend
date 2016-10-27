angular.module('smart-table').filter('stSearch', function() {
	return function(array, predictedObject) {
		var filteredTable = [];
		var columns = predictedObject.split('|');
		var input = columns[columns.length-1];
		columns.splice(-1,1);
		
		if(input === "undefined") {
			return array;
		}
		
		if(input){
    		angular.forEach(array, function(row) {
    			for (var i = 0; i<columns.length; i++) {
    				if(row[columns[i]] && row[columns[i]].toLowerCase().indexOf(input.toLowerCase()) > -1) {
    					filteredTable.push(row);
    					break;
    				}
    			}
    		});
		} else {
		    filteredTable = array;
		}
		
		return filteredTable;
	};
});