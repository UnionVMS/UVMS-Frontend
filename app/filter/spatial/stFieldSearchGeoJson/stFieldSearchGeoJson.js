angular.module('smart-table').filter('stFieldSearchGeoJson', function($filter, unitConversionService, coordinateFormatService){
    return function(array, predictedObject){
        var filterFilter = $filter('filter');
        var filteredRecs = [];
        
        var searchableKeys = Object.keys(predictedObject);
        var searchObj = {};
        var additionalFilters = {
           doSearch: false,
           recs: []
        };
        
        var timeFields = ['duration', 'totalTimeAtSea'];
        
        var comps;
        for (var i = 0; i < searchableKeys.length; i++){
            if (searchableKeys[i].indexOf('.') !== -1){ //here we are filtering in positions and segments table
                var keysArray = searchableKeys[i].split('.');
                if (keysArray[0] === 'properties'){ 
                    if (!angular.isDefined(searchObj[keysArray[0]])){
                        searchObj[keysArray[0]] = {};
                    }
                    
                    if (keysArray[1].indexOf('|') !== -1){
                        comps = keysArray[1].split('|'); 
                        if (comps[1] === 'startDate'){
                            additionalFilters.startDate = predictedObject[searchableKeys[i]];
                            additionalFilters.startDateField = comps[0];
                            additionalFilters.doSearch = true;
                        } else {
                            additionalFilters.endDate = predictedObject[searchableKeys[i]];
                            additionalFilters.endDateField = comps[0];
                            additionalFilters.doSearch = true;
                        }
                    } else if(_.indexOf(timeFields, keysArray[1]) !== -1){
                        additionalFilters[keysArray[1]] = unitConversionService.duration.humanToTime(predictedObject[searchableKeys[i]]);
                        additionalFilters.srcSearch = predictedObject[searchableKeys[i]];
                        additionalFilters.doSearch = true;
                    } else {
                        searchObj[keysArray[0]][keysArray[1]] = predictedObject[searchableKeys[i]];
                    }
                } else if (keysArray[0] === 'geometry'){
                    if (keysArray[1].indexOf('lat') !== -1){
                        if(!angular.isDefined(additionalFilters.lat)){
                            additionalFilters.lat = {};
                        }
                        additionalFilters.doSearch = true;
                        comps = keysArray[1].split('|');
                        if (comps[1] === 'deg'){
                            additionalFilters.lat.deg = predictedObject[searchableKeys[i]];
                        } else if (comps[1] === 'min'){
                            additionalFilters.lat.min = predictedObject[searchableKeys[i]];
                        } else {
                            additionalFilters.lat.dd = predictedObject[searchableKeys[i]]; 
                        }
                    } else {
                        if(!angular.isDefined(additionalFilters.lon)){
                            additionalFilters.lon = {};
                        }
                        additionalFilters.doSearch = true;
                        comps = keysArray[1].split('|');
                        if (comps[1] === 'deg'){
                            additionalFilters.lon.deg = predictedObject[searchableKeys[i]];
                        } else if (comps[1] === 'min'){
                            additionalFilters.lon.min = predictedObject[searchableKeys[i]];
                        } else {
                            additionalFilters.lon.dd = predictedObject[searchableKeys[i]]; 
                        }
                    }
                }
            } else { //here we are filtering tracks table
                if (_.indexOf(timeFields, searchableKeys[i]) !== -1){
                    additionalFilters[searchableKeys[i]] = unitConversionService.duration.humanToTime(predictedObject[searchableKeys[i]]);
                    additionalFilters.srcSearch = predictedObject[searchableKeys[i]];
                    additionalFilters.vmsTable = 'track';
                    additionalFilters.doSearch = true;
                } else {
                    searchObj[searchableKeys[i]] = predictedObject[searchableKeys[i]];
                }
            }
        }

        var tempRecs = [];
        if (!angular.equals({}, searchObj)){
            tempRecs = filterFilter(array, searchObj);
        } else {
            tempRecs = array;
        }
        
        //Function to calculate upper boundary when filtering fields with duration/time
        var calculateBoundary = function(filterObj){
            var parsedStr = filterObj.srcSearch.match(/([0-9]+[dhms]{1})/ig);
            var secondsToAdd = 0;
            var fixedSeconds = 0;
            for (var i = 0; i < parsedStr.length; i++){
                //days
                if (parsedStr[i].toUpperCase().indexOf('D') !== -1){
                    fixedSeconds += parseInt(parsedStr[i]) * 24 * 3600;
                    if (i + 1 === parsedStr.length){
                        secondsToAdd += 24 * 3600;
                    }
                }
                //hours
                if (parsedStr[i].toUpperCase().indexOf('H') !== -1){
                    fixedSeconds += parseInt(parsedStr[i]) * 3600;
                    if (i + 1 === parsedStr.length){
                        secondsToAdd += 3600;
                    }
                }
                //minutes
                if (parsedStr[i].toUpperCase().indexOf('M') !== -1){
                    fixedSeconds += parseInt(parsedStr[i]) * 60;
                    if (i + 1 === parsedStr.length){
                        secondsToAdd += 60;
                    }
                }
                //seconds
                if (parsedStr[i].toUpperCase().indexOf('S') !== -1){
                    fixedSeconds += parseInt(parsedStr[i]); 
                    if (secondsToAdd === 0){
                        filterObj.onlySeconds = true;
                    }
                }
            }
            return fixedSeconds + secondsToAdd;
        };
        
        var convertCoords = function(coordObj){
            var coord = parseInt(coordObj.deg);
            if (angular.isDefined(coordObj.min)){
                var sign = Math.sign(coord);
                coord = (Math.abs(coord) + parseFloat(coordObj.min.replace(',','.')) / 60) * sign;
                coord = Math.floor(coord * 1000) / 1000;
            }
            return coord.toString();
        };
        
        if (additionalFilters.doSearch === true){
            var additionalKeys = Object.keys(additionalFilters);
            additionalKeys.splice(0,1);
            angular.forEach(tempRecs, function(rec, idx){
                var include, filterDate, recDate;
                var includeArray = [];
                var counter = 0;
                
                if (angular.isDefined(this.lon)){
                    include = false;
                    //decimal degrees
                    if (angular.isDefined(this.lon.dd) && rec.geometry.coordinates[0].toString().indexOf(this.lon.dd) !== -1){
                      include = true;
                    }
                    
                    //degrees decimal minutes
                    if (angular.isDefined(this.lon.deg) && rec.geometry.coordinates[0].toString().indexOf(convertCoords(this.lon)) !== -1){
                        include = true;
                    }
                    
                    includeArray.push(include);
                    counter += 1;
                }
                
                if (angular.isDefined(this.lat)){
                    include = false;
                    //decimal degrees
                    if (angular.isDefined(this.lat.dd) && rec.geometry.coordinates[1].toString().indexOf(this.lat.dd) !== -1){
                        include = true;
                    }
                    
                    //degrees decimal minutes
                    if (angular.isDefined(this.lat.deg) && rec.geometry.coordinates[1].toString().indexOf(convertCoords(this.lat)) !== -1){
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
                
                var upBoundary;
                if (angular.isDefined(this.duration)){
                    include = false;
                    upBoundary = calculateBoundary(this);
                    
                    if (angular.isDefined(this.vmsTable) && this.vmsTable === 'track'){
                        if (upBoundary && rec.duration >= this.duration && rec.duration < upBoundary){
                            include = true;
                        }
                        
                        if (rec.duration === this.duration){
                            include = true;
                        }
                        
                        if (angular.isDefined(this.onlySeconds) && rec.duration > upBoundary - 1 && rec.duration <= upBoundary){
                            include = true;
                        }
                    } else {
                        if (upBoundary && rec.properties.duration >= this.duration && rec.properties.duration < upBoundary){
                            include = true;
                        }
                        
                        if (rec.properties.duration === this.duration){
                            include = true;
                        }
                        
                        if (angular.isDefined(this.onlySeconds) && rec.properties.duration > upBoundary - 1 && rec.properties.duration <= upBoundary){
                            include = true;
                        }
                    }
                    
                    includeArray.push(include);
                    counter += 1;
                }
                
                if (angular.isDefined(this.totalTimeAtSea)){
                    include = false;
                    upBoundary = calculateBoundary(this);
                    
                    if (upBoundary && rec.totalTimeAtSea >= this.totalTimeAtSea && rec.totalTimeAtSea < upBoundary){
                        include = true;
                    }
                    
                    if (rec.totalTimeAtSea === this.totalTimeAtSea){
                        include = true;
                    }
                    
                    if (angular.isDefined(this.onlySeconds) && rec.totalTimeAtSea > upBoundary - 1 && rec.totalTimeAtSea <= upBoundary){
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