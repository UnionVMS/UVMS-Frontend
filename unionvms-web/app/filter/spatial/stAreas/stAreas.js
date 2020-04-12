angular.module('unionvmsWeb').filter('stAreas', function($filter) {
	return function(input, predicate) {
	    var searchString = predicate['$'];
	    
	    var customSearch = function(value, index, array){
	        if (typeof searchString === 'undefined'){
	            return true;
	        }
	        
	        var name = value.name === null ? -1 : value.name.toLowerCase().indexOf(searchString);
	        var desc = value.desc === null ? -1 : value.desc.toLowerCase().indexOf(searchString);
	        
	        if (name !== -1 || desc !== -1){
	            return true;
	        } else {
	            return false;
	        }
	    };
	    
	    return $filter('filter')(input, customSearch, false);
	};
});
