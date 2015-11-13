angular.module('smart-table').filter('stFieldSearchGeoJson', function($filter){
    return function(array, predictedObject){
        var filterFilter = $filter('filter');
        var filteredRecs = [];
        
        var searchableKeys = Object.keys(predictedObject);
        var searchObj = {};
        var additionalFilters = {
           doSearch: false,
           recs: []
        };
        
        for (var i = 0; i < searchableKeys.length; i++){
            if (searchableKeys[i].indexOf('.') !== -1){
                var keysArray = searchableKeys[i].split('.');
                if (keysArray[0] === 'properties'){ 
                    if (!angular.isDefined(searchObj[keysArray[0]])){
                        searchObj[keysArray[0]] = {};
                    }
                    
                    if (keysArray[1].indexOf('|') !== -1){
                        var comps = keysArray[1].split('|'); 
                        if (comps[1] === 'startDate'){
                            additionalFilters.startDate = predictedObject[searchableKeys[i]];
                            additionalFilters.startDateField = comps[0];
                            additionalFilters.doSearch = true;
                        } else {
                            additionalFilters.endDate = predictedObject[searchableKeys[i]];
                            additionalFilters.endDateField = comps[0];
                            additionalFilters.doSearch = true;
                        }
                    } else {
                        searchObj[keysArray[0]][keysArray[1]] = predictedObject[searchableKeys[i]];
                    }
                } else if (keysArray[0] === 'geometry'){
                    var idx = parseInt(keysArray[1].substring(keysArray[1].length - 2, keysArray[1].length - 1));
                    if (idx === 0){
                        additionalFilters.lon = predictedObject[searchableKeys[i]];
                        additionalFilters.doSearch = true;
                    } else {
                        additionalFilters.lat = predictedObject[searchableKeys[i]];
                        additionalFilters.doSearch = true;
                    }
                }
            }
        }

        var tempRecs = [];
        if (!angular.equals({}, searchObj)){
            tempRecs = filterFilter(array, searchObj);
        } else {
            tempRecs = array;
        }
        
        if (additionalFilters.doSearch === true){
            var additionalKeys = Object.keys(additionalFilters);
            additionalKeys.splice(0,1);
            angular.forEach(tempRecs, function(rec, idx){
                var include, filterDate, recDate;
                var includeArray = [];
                var counter = 0;
                
                if (angular.isDefined(this.lon)){
                    include = false;
                    if (rec.geometry.coordinates[0].toString().indexOf(this.lon) !== -1){
                      include = true;
                    }
                    includeArray.push(include);
                    counter += 1;
                }
                
                if (angular.isDefined(this.lat)){
                    include = false;
                    if (rec.geometry.coordinates[1].toString().indexOf(this.lat) !== -1){
                      include = true;
                    }
                    includeArray.push(include);
                    counter += 1;
                }
                
                if (angular.isDefined(this.startDate)){
                    include = false;
                    recDate = moment.utc(rec.properties[this.startDateField]);
                    filterDate = moment.utc(this.startDate);
                    
                    if (recDate.isAfter(filterDate)){
                        include = true;
                    }
                    includeArray.push(include);
                    counter += 1;
                }
                
                if (angular.isDefined(this.endDate)){
                    include = false;
                    recDate = moment.utc(rec.properties[this.endDateField]);
                    filterDate = moment.utc(this.endDate);
                    
                    if (recDate.isBefore(filterDate)){
                        include = true;
                    }
                    includeArray.push(include);
                    counter += 1;
                }
                
                //Get unique values from array
                var n = {},r=[];
                for (var i = 0; i < includeArray.length; i++){
                    if (!n[includeArray[i]]){
                        n[includeArray[i]] = true; 
                        r.push(includeArray[i]); 
                    }
                }
                
                if (r.length === 1 && r[0] === true){
                    this.recs.push(rec);
                }
                
            }, additionalFilters);
            angular.copy(additionalFilters.recs, filteredRecs);
            additionalFilters.recs = [];
        } else {
            filteredRecs = tempRecs;
        }
        
        return filteredRecs;
    };
});