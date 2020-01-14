/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name tripDataHelperService
 * @param $resource {service} angular resource service
 * @param $http {service} angular http service 
 * @description
*/

(function() {
    angular.module('unionvmsWeb').service('tripDataHelperService', function () {
        var startingActivityTypes = ['DEPARTURE', 'AREA_ENTRY', 'AREA_EXIT'];
        var operationActivityTypes = ['FISHING_OPERATION', 'DISCARD', 'RELOCATION', 'JOINED_FISHING_OPERATION'];
        var speciesColors = [];
    
        // TRANSFORMATIONS FOR TABLE
        var TOTAL = 'TOTAL';
        var SPECIES = 'Species';
        var DIFFERENCE = 'Difference';
        var tableHeaders = [];
        var tableData;
        var dataForTable;
        return tripDataHelperService = {
           
    
        transformCatchEvolutionData: function(self, data) {
            // Get data for graph use
            var temp = angular.copy(data);
            self.tripSpeciesCodes = this.getSpeciesCodes(temp);
            var availableColors = palette('tol-rainbow', self.tripSpeciesCodes.length);
    
            speciesColors = [];
            for (var i = 0; i < self.tripSpeciesCodes.length; i++) {
                speciesColors.push({
                    code: self.tripSpeciesCodes[i],
                    color: availableColors[i]
                });
            }
    
            // sort by orderId (ensure correct order)
            var sorted = this.sortCatchEvolutionProgressByOrderId(temp);
            var catchSummary = this.calculateCatchesSummary(sorted);
            self.graphClass = this.getGraphClass(catchSummary);
            this.catchSummaryToArray(catchSummary);
    
    
            self.tripSpeciesColorsObject = this.transformArrayToObject(speciesColors);
            var speciesKeys = speciesColors.map(function(item) {
                return item.code;
            });
            tableHeaders = [SPECIES];
            // Create object with species keys as properties (an object for direct access)
            tableData = speciesKeys.reduce(function(current, item) {
                current[item] = {};
                return current;
            }, {});
            // Get data for table use (array for access in order)
            dataForTable = angular.copy(data);
            this.constructTable();
            this.calculateTableTotals();
            this.calculateDifferences();
            self.tripCatchSummary = catchSummary;
            self.tripTableData  = tableData;
            self.tripTableHeaders = tableHeaders;
    
            return self;
        },
    
        calculateCatchesSummary: function(data){
            var catchSummary = [];
            catchSummary.push({
                onBoard : {}
            });
            catchSummary.push({
                transhipment : {}
            });
            catchSummary.push({
                landing : {}
            });
    
            angular.forEach(data.catchEvolutionProgress, function(item) {
                if (item.affectsCumulative){
                    if (item.activityType === 'TRANSHIPMENT') {
                        if (angular.isDefined(item.loaded)) {
                            this.addCatchesToObject(catchSummary[0].onBoard, item.loaded);
                        }
                        if (angular.isDefined(item.unLoaded)) {
                            this.addCatchesToObject(catchSummary[1].transhipment, item.unLoaded);
                        }
                    } else if (item.activityType==='LANDING') {
                        if (angular.isDefined(item.loaded)) {
                            this.addCatchesToObject(catchSummary[0].onBoard, item.loaded);
                        }
                        if (angular.isDefined(item.unLoaded)) {
                            this.addCatchesToObject(catchSummary[2].landing, item.unLoaded);
                        }
                    } else if (startingActivityTypes.indexOf(item.activityType) > -1 || operationActivityTypes.indexOf(item.activityType) > -1) {
                        this.addCatchesToObject(catchSummary[0].onBoard, item.total);
                    }
                }
            },this);
            return catchSummary;
        },
    
        getGraphClass: function(catchSummary) {
            var occurences =  this.calculateGraphClass(catchSummary);
            switch(occurences) {
                case 1:
                  return 'col-md-10 col-lg-10 col-xs-10';
                case 2:
                  return 'col-md-6 col-lg-6 col-xs-6';
                case 3:
                  return 'col-md-6 col-lg-4 col-xs-6 col-sm-6';
                default:
                  return '';
            }
        },
    
        calculateGraphClass: function(catchSummary) {
            var counter = 0; 
            angular.forEach(catchSummary, function(item) {
                if (item.hasOwnProperty('onBoard')) {
                    if (!angular.equals({}, item.onBoard)) {
                        counter++;
                    }
                } else if (item.hasOwnProperty('transhipment')) {
                    if (!angular.equals({}, item.transhipment)) {
                        counter++;
                    }
                } else if(item.hasOwnProperty('landing')) {
                    if (!angular.equals({}, item.landing)) {
                        counter++;
                    }
                }
            },this);
            return counter;
        },
    
        addCatchesToObject: function(obj, catches){
            Object.keys(catches).forEach(function(key) {
                if (angular.isDefined(obj[key])) {
                    obj[key] += catches[key];
                } else {
                    obj[key] = catches[key];
                }
            }, this);
        },
    
        getSpeciesCodes: function(data) {
            var speciesCodes = {};
            angular.forEach(data.catchEvolutionProgress, function(item) {
                this.extractUniqueSpeciesCodes(speciesCodes, item.total);
                this.extractUniqueSpeciesCodes(speciesCodes, item.loaded);
                this.extractUniqueSpeciesCodes(speciesCodes, item.onBoard);
                this.extractUniqueSpeciesCodes(speciesCodes, item.unLoaded);
            },this);
            return Object.keys(speciesCodes);
        },
    
        extractUniqueSpeciesCodes: function(speciesCodes, x) {
            if (angular.isDefined(x)) {
                var i, propertyNames = Object.keys(x);
                for( i = 0; i < propertyNames.length; i++ ) {
                    if (!speciesCodes[propertyNames[i]]) {
                        speciesCodes[propertyNames[i]] = true;
                    }
                }
            }
        },
    
        transformArrayToObject: function(array){
            var obj = {};
            angular.forEach(array, function(item){
                obj[item.code] = item.color;
            });
            return obj;
        },
    
        sortCatchEvolutionProgressByOrderId: function(data) {
            data.catchEvolutionProgress.sort(function(a, b) {
                return a.orderId - b.orderId;
            });
            return data;
        },
    
        catchSummaryToArray: function(data){
            this.transformResponseProperty(data[0], 'onBoard', 'grandOnboardTotal');
            this.transformResponseProperty(data[1], 'transhipment', 'grandTranshipmentTotal');
            this.transformResponseProperty(data[2], 'landing', 'grandLandingTotal');
            return data;
        },
    
        transformResponseProperty: function(item, propertyName, grandTotalPropName) {
            if (item.hasOwnProperty(propertyName) && !angular.equals({}, item[propertyName])) {
                var tempData = item[propertyName];
                delete item[propertyName];
                item[propertyName]  =  this.transformObjectToArray(tempData);
                this.matchColorWithSpecies(item[propertyName]);
                item[grandTotalPropName] = this.calculateGrandTotal(item[propertyName]);
            }
        },
    
        transformObjectToArray: function(data) {
            var tempList = [];
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    tempList.push({
                        speciesCode: key,
                        weight: data[key]
                    });
                }
            }
            return tempList;
        },
    
        matchColorWithSpecies: function(list) {
            // Match color with speciesCode
            angular.forEach(list, function(datum) {
                angular.forEach(speciesColors, function(entry) {
                    if (datum.speciesCode === entry.code) {
                        datum.color = '#' + entry.color;
                    }
                });
            });
            return list;
        },
    
        calculateGrandTotal: function(data) {
            return data.reduce(function(previous, next) {
                return previous + next['weight'];
            },0);
        },
    
        constructTable: function() {
            angular.forEach(dataForTable.catchEvolutionProgress, function(item) {
                if (item.affectsCumulative) {
                    if (item.activityType === 'TRANSHIPMENT') {
                        if (angular.isDefined(item.loaded)) {
                            this.addIfNotExists('CATCHES');
                            this.performTableCalculations(item.loaded, 'CATCHES');
                        }
                        if (angular.isDefined(item.unLoaded)) {
                            this.addIfNotExists('TRA');
                            this.performTableCalculations(item.unLoaded, 'TRA');
                        }
                    } else if (item.activityType === 'LANDING') {
                        if (angular.isDefined(item.loaded)) {
                            this.addIfNotExists('CATCHES');
                            this.performTableCalculations(item.loaded, 'CATCHES');
                        }
                        if (angular.isDefined(item.unLoaded)) {
                            this.addIfNotExists('LAN');
                            this.performTableCalculations(item.unLoaded, 'LAN');
                        }
                    } else if (startingActivityTypes.indexOf(item.activityType) > -1 || operationActivityTypes.indexOf(item.activityType) > -1) {
                        this.addIfNotExists('CATCHES');
                        this.performTableCalculations(item.total, 'CATCHES');
                    }
                }
            },this);
        },
    
        calculateTableTotals: function() {
            tableData[TOTAL] = {};
            tableData[TOTAL][SPECIES] = "TOTAL";
            angular.forEach(tableHeaders, function(header) {
                if (header !== SPECIES) {
                    for (var item in tableData) {
                        // DO NOT ADD TOTAL AGAIN
                        if (item !== TOTAL && angular.isDefined(tableData[item][header])) {
                            if (angular.isDefined(tableData[TOTAL][header])) {
                                tableData[TOTAL][header] += tableData[item][header];
                            } else {
                                tableData[TOTAL][header] = tableData[item][header];
                            }
                        }
                    }
                }
            },this);
        },
    
        performTableCalculations: function(object, header) {
            for (var property in object) {
                tableData[property][SPECIES] = property;
                if (angular.isDefined(tableData[property][header])) {
                    tableData[property][header] += object[property];
                } else {
                    tableData[property][header] = object[property];
                }
            }
        },
    
        calculateDifferences: function() {
            tableHeaders.push(DIFFERENCE);
            for (var item in tableData) {
                tableData[item][DIFFERENCE] = 0;
                for (var property in tableData[item]) {
                    if (tableData[item].hasOwnProperty(property)) {
                        if (property === "CATCHES") {
                            tableData[item][DIFFERENCE] += tableData[item][property];
                        } else if (property === "TRA" || property === "LAN") {
                                tableData[item][DIFFERENCE] -= tableData[item][property];
                        }
                    }
                }
            }
        },
    
    
        addIfNotExists: function(header) {
            if (tableHeaders.indexOf(header) === -1) {
                tableHeaders.push(header);
            }
        }};
    });
})();


