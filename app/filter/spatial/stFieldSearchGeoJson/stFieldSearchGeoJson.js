angular.module('smart-table').filter('stFieldSearchGeoJson', function($filter, unitConversionService, coordinateFormatService){
    return function(array, predictedObject){
        //check predicted object type and parse it back
        var pKey = _.keys(predictedObject);
        var srcObject = {};
        var type = 'tracks';
        if (pKey.length === 1){
            srcObject = JSON.parse(predictedObject[pKey[0]]);
            type = pKey[0];
        }
         
        //Filter
        var filterFilter = $filter('filter');
        var filteredRecs = [];

        
        var searchableKeys = _.keys(srcObject);
        var searchObj = {};
        var additionalFilters = {
           doSearch: false,
           recs: []
        };
        
        var timeFields = ['duration', 'totalTimeAtSea'];
        var numberFields = ['reportedSpeed', 'calculatedSpeed', 'speedOverGround', 'distance'];
        
        if (type !== 'tracks' && type !== 'trips'){
            searchObj.properties = {};
        }
        
        //HELPER FUNCTIONS
        var getNumDecimals = function(num){
            if (_.isNumber(num)){
                num = num.toString();
            }
            
            var numSplit = num.split(".")[1];
            var decimals = 0;
            if (angular.isDefined(numSplit)){
                decimals = numSplit.length;
            }
            return decimals; 
        };
        
        var getDecimalsAsString = function(num){
            if (_.isNumber(num)){
                num = num.toString();
            }
            return num.split(".")[1];
        };
        
        var fixDecimalNotation = function(numStr){
            return numStr.replace(',','.');
        };
        
        var checkDecimalDegrees = function(dd, geomCoord){
            //src dd filter
            var numerical = parseFloat(fixDecimalNotation(dd));
            var decimals = getNumDecimals(numerical);
            
            var resp = false;
            if (Math.sign(geomCoord) === Math.sign(numerical)){
                if (decimals === 0){
                    resp = Math.abs(numerical) === Math.abs(Math.trunc(geomCoord));
                } else {
                    resp = Math.abs(Math.trunc(numerical)) === Math.abs(Math.trunc(geomCoord)) && getDecimalsAsString(geomCoord).indexOf(getDecimalsAsString(numerical)) === 0;
                }
            }
            
            return resp;
        };
        
        var getMinutesFromDD = function(dd){
            var num = dd.toString();
            var numSplit = num.split('.');
            
            var minutes;
            if (angular.isDefined(numSplit[1])){
                var decimals = numSplit[1].length;
                minutes = parseInt(numSplit[1]) / Math.pow(10, decimals) * 60;
            }
            
            return minutes;
        };
        
        var checkDecimalMinutes = function(minutes, geomCoord){
            var decimals = getNumDecimals(minutes);
            minutes = parseFloat(minutes).toString();
            var coordMin = getMinutesFromDD(geomCoord);
            if (decimals === 0){
                coordMin = Math.trunc(coordMin).toString();
            } else {
                coordMin = coordMin.toFixed(decimals);
            }
            
            var resp = false;
            if (coordMin.indexOf(minutes) === 0){
                resp = true;
            }
            
            return resp;
        };
        
        //Function to calculate upper boundary when filtering fields with duration/time
        var dehumanizeTimeAndCalculateUpBoundary = function(time){
            var parsedStr = time.match(/([0-9]+[dhms]{1})/ig);
            var secondsToAdd = 0;
            var fixedSeconds = 0;
            if (_.isArray(parsedStr)){
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
                    }
                }
                
                //return converted input and seconds as miliseconds to add for upper boundary
                return [fixedSeconds * 1000, secondsToAdd * 1000];
            }
        };
        
        //LET'S DO THE ACTUAL FILTERING
        var comps;
        for (var i = 0; i < searchableKeys.length; i++){
            var keyIn = false;
            if (_.indexOf(numberFields, searchableKeys[i]) !== -1){
                keyIn = true;
                additionalFilters[searchableKeys[i]] = srcObject[searchableKeys[i]];
                additionalFilters.doSearch = true;
            }
            
            if (_.indexOf(timeFields, searchableKeys[i]) !== -1){
                var calcTimes = dehumanizeTimeAndCalculateUpBoundary(srcObject[searchableKeys[i]]);
                if (_.isArray(calcTimes)){
                    keyIn = true;
                    additionalFilters[searchableKeys[i]] = srcObject[searchableKeys[i]];
                    additionalFilters.doSearch = true;
                    
                    additionalFilters.srcTime = calcTimes[0];
                    additionalFilters.secondsToAdd = calcTimes[1];
                    additionalFilters.upBoundary = calcTimes[0] + calcTimes[1];
                } else {
                    continue;
                }
            }
            
            if (type !== 'tracks'){
                if (_.indexOf(numberFields, searchableKeys[i]) === -1 &&  _.indexOf(timeFields, searchableKeys[i]) === -1){
                    if (searchableKeys[i].indexOf('lon') !== -1){
                        keyIn = true;
                        if (!angular.isDefined(additionalFilters.lon)){
                            additionalFilters.lon = {};
                        }
                        additionalFilters.doSearch = true;
                        comps = searchableKeys[i].split('|');
                        if (comps[1] === 'dd'){
                            additionalFilters.lon.dd = srcObject[searchableKeys[i]];
                        } else if (comps[1] === 'deg') {
                            additionalFilters.lon.deg = srcObject[searchableKeys[i]];
                        } else {
                            additionalFilters.lon.min = srcObject[searchableKeys[i]];
                        }
                    } else if (searchableKeys[i].indexOf('lat') !== -1){
                        keyIn = true;
                        if(!angular.isDefined(additionalFilters.lat)){
                            additionalFilters.lat = {};
                        }
                        additionalFilters.doSearch = true;
                        comps = searchableKeys[i].split('|');
                        if (comps[1] === 'dd'){
                            additionalFilters.lat.dd = srcObject[searchableKeys[i]];
                        } else if (comps[1] === 'deg'){
                            additionalFilters.lat.deg = srcObject[searchableKeys[i]];
                        } else {
                            additionalFilters.lat.min = srcObject[searchableKeys[i]]; 
                        }
                    } else if (searchableKeys[i] === 'startDate' || searchableKeys[i] === 'endDate' || searchableKeys[i] === 'alarmStartDate' || searchableKeys[i] === 'alarmEndDate') {
                        keyIn = true;
                        additionalFilters[searchableKeys[i]] = srcObject[searchableKeys[i]];
                        var name = searchableKeys[i] + 'Field';
                        if (type === 'positions'){
                            additionalFilters[name] = 'positionTime';
                        } else if (type === 'alarms'){
                            additionalFilters[name] = 'ticketOpenDate';
                        } else if (type === 'trips'){
                            if (searchableKeys[i] === 'startDate'){
                                additionalFilters[name] = 'firstFishingActivityDateTime';
                            } else {
                                additionalFilters[name] = 'lastFishingActivityDateTime';
                            }
                        }
                        
                        additionalFilters.doSearch = true;
                    } else if (searchableKeys[i] === 'tripId'){
                        keyIn = true;
                        additionalFilters['tripId'] = srcObject[searchableKeys[i]];
                        additionalFilters.doSearch = true;
                    }
                }
            } 
            
            if (!keyIn){
                if (type === 'tracks' || type === 'trips'){
                    searchObj[searchableKeys[i]] = srcObject[searchableKeys[i]]; //this is the default
                } else {
                    searchObj.properties[searchableKeys[i]] = srcObject[searchableKeys[i]]; //this is the default
                }
                
            }
        }
        
        var tempRecs = [];
        if (!angular.equals({}, searchObj)){
            tempRecs = filterFilter(array, searchObj);
        } else {
            tempRecs = array;
        }
        
        var updateInclude = function(temp, include){
            if (temp === false){
                include = false;
            }
            return include;
        };
        
        if (additionalFilters.doSearch === true){
            var additionalKeys = _.keys(additionalFilters);
            additionalKeys.splice(0,1);
            var temp;
            angular.forEach(tempRecs, function(rec, idx){
                var filterDate, recDate;
                var includeArray = [];
                var include = true;
                if (angular.isDefined(this.lon)){
                    //decimal degrees
                    if (angular.isDefined(this.lon.dd)){
                        temp = checkDecimalDegrees(this.lon.dd, rec.geometry.coordinates[0]);
                    }
                    
                    //degrees decimal minutes
                    if (angular.isDefined(this.lon.deg)){
                        //degrees
                        temp = checkDecimalDegrees(this.lon.deg, rec.geometry.coordinates[0]);
                        
                        //decimal minutes
                        if (angular.isDefined(this.lon.min) && temp){
                            temp = checkDecimalMinutes(this.lon.min, rec.geometry.coordinates[0]);
                        }
                    }
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.lat)){
                    //decimal degrees
                    if (angular.isDefined(this.lat.dd)){
                        temp = checkDecimalDegrees(this.lat.dd, rec.geometry.coordinates[1]);
                    }
                    
                    //degrees decimal minutes
                    if (angular.isDefined(this.lat.deg)){
                        //degrees
                        temp = checkDecimalDegrees(this.lat.deg, rec.geometry.coordinates[1]);
                        
                        //decimal minutes
                        if (angular.isDefined(this.lat.min) && include){
                            temp = checkDecimalMinutes(this.lat.min, rec.geometry.coordinates[1]);
                        }
                    }
                    include = updateInclude(temp, include);
                }
                
                var srcRec = rec;
                if (angular.isDefined(this.startDate)){
                    if (type !== 'trips'){
                        srcRec = rec.properties;
                    }
                    recDate = moment.utc(srcRec[this.startDateField]);
                    filterDate = moment.utc(this.startDate);
                    
                    temp = recDate.isAfter(filterDate);
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.endDate)){
                    if (type !== 'trips'){
                        srcRec = rec.properties;
                    }
                    
                    recDate = moment.utc(srcRec[this.endDateField]);
                    filterDate = moment.utc(this.endDate);
                    
                    temp = recDate.isBefore(filterDate);
                    include = updateInclude(temp, include);
                }
                
                var srcSpeed;
                if (angular.isDefined(this.reportedSpeed)){
                    srcSpeed = $filter('number')(rec.properties.reportedSpeed, 5);
                    temp = srcSpeed.indexOf(fixDecimalNotation(this.reportedSpeed)) === 0;
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.calculatedSpeed)){
                    srcSpeed = $filter('number')(rec.properties.calculatedSpeed, 5);
                    temp = srcSpeed.indexOf(fixDecimalNotation(this.calculatedSpeed)) === 0;
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.speedOverGround)){
                    srcSpeed = $filter('number')(rec.properties.speedOverGround, 5);
                    temp = srcSpeed.indexOf(fixDecimalNotation(this.speedOverGround)) === 0;
                    include = updateInclude(temp, include);
                }
                
                var srcDist;
                if (angular.isDefined(this.distance)){
                    if (type === 'tracks'){
                        srcDist = $filter('number')(rec.distance, 5);
                    } else {
                        srcDist = $filter('number')(rec.properties.distance, 5);
                    }
                    temp = srcDist.indexOf(fixDecimalNotation(this.distance)) === 0;
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.duration)){
                    temp = false;
                    var srcProp;
                    if (type === 'tracks'){
                        srcProp = rec.duration;
                    } else if (type === 'trips'){
                        srcProp = rec.tripDuration;
                    } else {
                        srcProp = rec.properties.duration;
                    }
                    
                    
                    if (this.upBoundary && srcProp >= this.srcTime && srcProp < this.upBoundary){
                        temp = true;
                    }
                    
                    if (srcProp === this.srcTime){
                        temp = true;
                    }
                    
                    if (this.secondsToAdd === 0 && srcProp > this.upBoundary - 1 && srcProp <= this.upBoundary){
                        temp = true;
                    }
                    
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.totalTimeAtSea)){
                    temp = false;
                    if (this.upBoundary && rec.totalTimeAtSea >= this.srcTime && rec.totalTimeAtSea < this.upBoundary){
                        temp = true;
                    }
                    
                    if (rec.totalTimeAtSea === this.srcTime){
                        temp = true;
                    }
                    
                    if (this.secondsToAdd === 0 && rec.totalTimeAtSea > this.upBoundary - 1 && rec.totalTimeAtSea <= this.upBoundary){
                        temp = true;
                    }
                    
                    include = updateInclude(temp, include);
                }
                
                if (angular.isDefined(this.tripId)){
                    temp = false;
                    var tripName = rec.schemeId + ':' + rec.tripId;
                    if (tripName.indexOf(this.tripId.toUpperCase()) !== -1){
                        temp = true;
                    }
                    include = updateInclude(temp, include);
                }
                
                if (include){
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