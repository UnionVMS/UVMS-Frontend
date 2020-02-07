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
 * @ngdoc controller
 * @name CatchevolutionCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the Catch Evolution panel
 */
angular.module('unionvmsWeb').controller('CatchEvolutionCtrl', function ($scope, activityRestService, tripSummaryService, loadingStatus) {

    $scope.speciesColors = [];

    var startingActivityTypes = ['DEPARTURE', 'AREA_ENTRY', 'AREA_EXIT'];
    var operationActivityTypes = ['FISHING_OPERATION', 'DISCARD', 'RELOCATION', 'JOINED_FISHING_OPERATION'];
    var complexActivityTypes = ['LANDING', 'TRANSHIPMENT','ARRIVAL'];
    var DECLARATION = 'DECLARATION';
    var TOTAL = 'TOTAL';
    var SPECIES = 'Species';
    var DIFFERENCE = 'Difference';
    var CUMUL_CATCHES = 'Cumul_catches';
    var ONBOARD = 'ONBOARD';
    var LOADED = 'LOADED';
    var UNLOADED = 'UNLOADED';

    /**
       * Initialization function
       *
       * @memberof CatchEvolutionCtrl
       * @private
       */
    var init = function () {

        if (angular.isDefined(tripSummaryService.trip)) {
            loadingStatus.isLoading('TripSummary', true, 2);
            $scope.tripId = tripSummaryService.trip.id;

            activityRestService.getTripCatchesEvolution($scope.tripId).then(function (response) {
                loadingStatus.isLoading('TripSummary', false);
                // Get data for graph use
                var temp = angular.copy(response);

                // HACK: Match color with species code here, not from tripModel!
                // Get all species codes
                $scope.speciesCodes = getSpeciesCodes(temp);
                var availableColors = palette('tol-rainbow', $scope.speciesCodes.length);

                for (var i = 0; i < $scope.speciesCodes.length; i++) {
                    $scope.speciesColors.push({
                        code: $scope.speciesCodes[i],
                        color: availableColors[i]
                    });
                }

                var speciesKeys = $scope.speciesColors.map(function(item) {
                    return item.code;
                });

                $scope.speciesColorsObject = transformArrayToObject($scope.speciesColors);

                // Create object with species keys as properties (an object for direct access)
                $scope.tableData = speciesKeys.reduce(function(current, item) {
                    current[item] = {};
                    return current;
                }, {});
                // Get data for table use (array for access in order)
                $scope.dataForTable = angular.copy(response);
                constructTable();
                calculateTableTotals();
                calculateDifferences();

                // sort by orderId (ensure correct order)
                var sorted = sortCatchEvolutionProgressByOrderId(temp);
                var withCumulative = calculateCumulatives(sorted);

                $scope.catchEvolutionData = transformResponse(withCumulative);

                // find last declaration affecting cumulative
                var lastIndexOfDeclarationCumulative =  $scope.catchEvolutionData.catchEvolutionProgress.map(function(obj) {
                    return obj.reportType === DECLARATION && obj.affectsCumulative;
                  }).lastIndexOf(true);

                // Flag to change color to red
                if (lastIndexOfDeclarationCumulative > -1) {
                    $scope.catchEvolutionData.catchEvolutionProgress[lastIndexOfDeclarationCumulative].last = true;
                }

            }, function (error) {
                loadingStatus.isLoading('TripSummary', false);
                //TODO deal with error from service
            });
        }
    };

    function transformArrayToObject(array){
        var obj = {};
        angular.forEach(array, function(item){
            obj[item.code] = item.color;
        });
        return obj;
    }

    function extractUniqueSpeciesCodes(speciesCodes, x) {
        if( angular.isDefined(x) ) {
            var i, propertyNames = Object.keys(x);
            for( i = 0; i < propertyNames.length; i++ ) {
                if( !speciesCodes[propertyNames[i]] ) {
                    speciesCodes[propertyNames[i]] = true;
                }
            }
        }
    }

    function getSpeciesCodes(data) {
        var speciesCodes = {};
        angular.forEach(data.catchEvolutionProgress, function(item) {
            extractUniqueSpeciesCodes(speciesCodes, item.total);
            extractUniqueSpeciesCodes(speciesCodes, item.loaded);
            extractUniqueSpeciesCodes(speciesCodes, item.onBoard);
            extractUniqueSpeciesCodes(speciesCodes, item.unLoaded);
        });
        return Object.keys(speciesCodes);
    }

    function sortCatchEvolutionProgressByOrderId(data) {
        data.catchEvolutionProgress.sort(function(a, b) {
            return a.orderId - b.orderId;
        });
        return data;
    }


    function calculateCumulatives(data) {
        var cumulativePerSpecies = {};
        // Calculate cumulatives per species
        angular.forEach(data.catchEvolutionProgress, function(item) {

            if (complexActivityTypes.indexOf(item.activityType) > -1) {
                item.previousCumulative = angular.copy(cumulativePerSpecies);
            }
            if (item.affectsCumulative) {
                if (startingActivityTypes.indexOf(item.activityType) > -1) {
                    // For starting activity only add if total cumulative for trip is empty
                    if (angular.equals({}, cumulativePerSpecies)) {
                        cumulativePerSpecies = calculateCumulativePerSpecies(cumulativePerSpecies, item.total);
                        console.log('cumulative per species', cumulativePerSpecies);
                        item.cumulative = angular.copy(cumulativePerSpecies);
                    }
                } else if (operationActivityTypes.indexOf(item.activityType) > -1) {
                    cumulativePerSpecies = calculateCumulativePerSpecies(cumulativePerSpecies, item.total);
                    item.cumulative = angular.copy(cumulativePerSpecies);
                } else if (complexActivityTypes.indexOf(item.activityType) > -1) {
                    // add to cumulative per Species
                    if (!angular.equals({},item.loaded)) {
                        cumulativePerSpecies = calculateCumulativePerSpecies(cumulativePerSpecies, item.loaded);
                        item.cumulative = angular.copy(cumulativePerSpecies);
                    }
                    // subtract from cumulative per Species
                    if (!angular.equals({},item.unLoaded)) {
                        cumulativePerSpecies = calculateCumulativePerSpecies(cumulativePerSpecies, item.unLoaded, true);
                        item.cumulative = angular.copy(cumulativePerSpecies);
                    }
                }
            }
        });
        return data;
    }

    function transformResponseProperty(item, propertyName, grandTotalPropName) {
        if (item.hasOwnProperty(propertyName) && !angular.equals({}, item[propertyName])) {
            var tempData = item[propertyName];
            delete item[propertyName];
            item[propertyName]  = transformObjectToArray(tempData);
            matchColorWithSpecies(item[propertyName]);
            item[grandTotalPropName] = calculateGrandTotal(item[propertyName]);
        }
    }

    function transformResponse(data) {
        angular.forEach(data.catchEvolutionProgress, function(item) {
            transformResponseProperty(item, 'total', 'grandTotal');
            transformResponseProperty(item, 'loaded', 'grandLoadedTotal');
            transformResponseProperty(item, 'unLoaded', 'grandUnloadedTotal');
            transformResponseProperty(item, 'onBoard', 'grandOnboardTotal');
            transformResponseProperty(item, 'cumulative', 'cumulativeGrandTotal');
            transformResponseProperty(item, 'previousCumulative', 'previousCumulativeGrandTotal');
        });
        return data;
    }

    function transformObjectToArray(data) {
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
    }

    function calculateGrandTotal(data) {
        return data.reduce(function(previous, next) {
            return previous + next['weight'];
        },0);
    }

    function calculateCumulativePerSpecies(previousCumulative, currentCumulative, subtract) {
        if (angular.equals({}, previousCumulative)) {
            return angular.copy(currentCumulative);
        } else {
            Object.keys(currentCumulative).forEach(function(key) {
                if (angular.isDefined(previousCumulative[key])) {
                    if (subtract){
                        previousCumulative[key] -= currentCumulative[key];
                    } else {
                        previousCumulative[key] += currentCumulative[key];
                    }
                } else {
                    previousCumulative[key] = currentCumulative[key];
                }
            }, this);
        }
        return previousCumulative;
    }

    function matchColorWithSpecies(list) {
        // Match color with speciesCode
        angular.forEach(list, function(datum) {
            angular.forEach($scope.speciesColors, function(entry) {
                if (datum.speciesCode === entry.code) {
                    datum.color = '#' + entry.color;
                }
            });
         });
        return list;
    }

    // TRANSFORMATIONS FOR TABLE

    $scope.tableHeaders = [SPECIES];

    function constructTable() {
        angular.forEach($scope.dataForTable.catchEvolutionProgress, function(item) {
            if (startingActivityTypes.indexOf(item.activityType) > -1) {
                if (item.affectsCumulative) {
                    if ($scope.tableHeaders.indexOf(CUMUL_CATCHES) === -1) {
                        $scope.tableHeaders.push(CUMUL_CATCHES);
                        performTableCalculations(item.total, CUMUL_CATCHES);
                    }
                }
            } else if (operationActivityTypes.indexOf(item.activityType) > -1) {
                if (item.affectsCumulative) {
                    addIfNotExists(CUMUL_CATCHES);
                    performTableCalculations(item.total, CUMUL_CATCHES);
                }
            } else if (complexActivityTypes.indexOf(item.activityType) > -1) {
                if (!angular.equals({}, item.onBoard)) {
                    var onBoardTitle = item.activityType + '_' + item.reportType + '_' + ONBOARD;
                    addIfNotExists(onBoardTitle);
                    performTableCalculations(item.onBoard, onBoardTitle);
                }
                if (!angular.equals({}, item.loaded)) {
                    var loadedTitle = item.activityType + '_'  + item.reportType + '_'  + LOADED;
                    addIfNotExists(loadedTitle);
                    performTableCalculations(item.loaded, loadedTitle);
                }
                if (!angular.equals({}, item.unLoaded)) {
                    var unLoadedTitle = item.activityType + '_'  + item.reportType + '_'  + UNLOADED;
                    addIfNotExists(unLoadedTitle);
                    performTableCalculations(item.unLoaded, unLoadedTitle);
                }
            }
        });
    }

    function calculateTableTotals() {
        $scope.tableData[TOTAL] = {};
        $scope.tableData[TOTAL][SPECIES] = "TOTAL";
        angular.forEach($scope.tableHeaders, function(header) {
            if (header !== SPECIES) {
                for (var item in $scope.tableData) {
                    // DO NOT ADD TOTAL AGAIN
                    if (item !== TOTAL && angular.isDefined($scope.tableData[item][header])) {
                        if (angular.isDefined($scope.tableData[TOTAL][header])) {
                            $scope.tableData[TOTAL][header] += $scope.tableData[item][header];
                        } else {
                            $scope.tableData[TOTAL][header] = $scope.tableData[item][header];
                        }
                    }
                }
            }
        });
    }

    function performTableCalculations(object, header) {
        for (var property in object) {
            $scope.tableData[property][SPECIES] = property;
            if (angular.isDefined($scope.tableData[property][header])) {
                $scope.tableData[property][header] += object[property];
            } else {
                $scope.tableData[property][header] = object[property];
            }
        }
    }

    function calculateDifferences() {
        $scope.tableHeaders.push(DIFFERENCE);
        for (var item in $scope.tableData) {
            $scope.tableData[item][DIFFERENCE] = 0;
            for (var property in $scope.tableData[item]) {
                if ($scope.tableData[item].hasOwnProperty(property)) {
                    if (property.indexOf(CUMUL_CATCHES) > -1) {
                        $scope.tableData[item][DIFFERENCE] += $scope.tableData[item][property];
                    } else if (property.indexOf(DECLARATION) > -1) {
                        if (property.indexOf(UNLOADED) > -1) {
                            $scope.tableData[item][DIFFERENCE] -= $scope.tableData[item][property];
                        } else if (property.indexOf(LOADED) > -1) {
                            $scope.tableData[item][DIFFERENCE] += $scope.tableData[item][property];
                        }
                    }
                }
            }
        }
    }


    function addIfNotExists(header) {
        if ($scope.tableHeaders.indexOf(header) === -1) {
            $scope.tableHeaders.push(header);
        }
    }

    init();
});
