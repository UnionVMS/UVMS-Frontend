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
 * @name CatchdetailsCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the Catch Details.  
 */
angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function ($scope, activityRestService, locale, tableService, reportService, loadingStatus, tripSummaryService) {

    var prepareSummaryRow = function(record){
        var catchTypes = ['summaryFaCatchType','summaryFishSize'];
        angular.forEach(catchTypes, function(ctype){
            if(angular.isDefined(record[ctype])){
                angular.forEach(record[ctype], function(value,key){
                    if(angular.isDefined(record[ctype][key])){
                        record[ctype][key] = {};
                        record[ctype][key].all_species = value;
                    }
                });
            }
        });
    };

    var prepareSummaryReport = function(){
        if($scope.repServ.criteria && $scope.repServ.criteria.recordDTOs && $scope.repServ.criteria.recordDTOs.length){
            var rowTypes = ['recordDTOs','total'];
            angular.forEach(rowTypes, function(rtype){
                if(rtype === 'total'){
                    prepareSummaryRow($scope.repServ.criteria.total);
                }else{
                    angular.forEach($scope.repServ.criteria[rtype], function(record){
                        prepareSummaryRow(record.summaryTable);
                    });
                }
                
            });

            var summaryReport = prepareCatchData($scope.repServ.criteria);
            $scope.tables = {
                catches: {
                    items: summaryReport.items,
                    total: summaryReport.total
                }
            };

            

            processTables();
        }
    };

    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */
    var init = function () {

        if(angular.isDefined(tripSummaryService.trip)){
            $scope.tripId = tripSummaryService.trip.id;
        }
    
        if (angular.isDefined($scope.tripId)) {
            /*loadingStatus.isLoading('TripSummary', true, 1);
            //FIXME change with proper trip id
            activityRestService.getTripCatchDetail($scope.tripId).then(function (response) {
                $scope.fishingTripDetails = response;
                loadingStatus.isLoading('TripSummary', false);
            }, function (error) {
                //TODO deal with error from service
            });*/

            loadingStatus.isLoading('TripSummary', true, 1);
            //FIXME change with proper trip id
            activityRestService.getTripCatchesLandingDetails($scope.tripId).then(function (response) {
                $scope.catcheDetailsData = response;
                catchDetailsData($scope.catcheDetailsData);
            }, function (error) {
                //TODO deal with error from service
            });

        } else {
            if(!$scope.repServ.criteria){
                $scope.$watchCollection('repServ.criteria', prepareSummaryReport, true);
            }
        }
    };

    /**
      * gets data for catches Table 
      * 
      * @memberof CatchdetailsCtrl
      * @private
      * @alias prepareCatchData
      * @returns data for catches Table
      */
    var prepareCatchData = function (data) {
        var items = [];

        angular.forEach(data.recordDTOs, function (item) {
            items.push(_.extendOwn(item.summaryTable.summaryFishSize, item.summaryTable.summaryFaCatchType));
            angular.forEach(item.groups, function (group) {
                items[items.length - 1][group.key] = group.value;
            });
        });

        var total = data.total;
        total = _.extendOwn(total.summaryFishSize, total.summaryFaCatchType);


        var fishHeaders = ['LSC', 'BMS', 'DISCARDED', 'DIM'];
        var defaults = {};
        angular.forEach(items, function (row) {
            angular.forEach(row, function (classItem, className) {
                if (fishHeaders.indexOf(className) !== -1) {
                    if (!angular.isDefined(defaults[className])) {
                        defaults[className] = {};
                    }
                    angular.forEach(classItem, function (specie, specieName) {
                        if (!angular.isDefined(defaults[className][specieName])) {
                            defaults[className][specieName] = 0;
                        }
                    });
                } else {
                    if (!angular.isDefined(defaults[className])) {
                        defaults[className] = "";
                    }
                }

            });
        });

        angular.forEach(items, function (row) {
            angular.forEach(defaults, function (classItem, className) {
                if (angular.isDefined(row[className])) {
                    angular.forEach(classItem, function (specie, specieName) {
                        if (!angular.isDefined(row[className][specieName])) {
                            row[className][specieName] = specie;
                        }
                    });
                } else {
                    row[className] = classItem;
                }
            });
        });


        return {
            items: items,
            total: total
        };
    };

    /**
      * gets sorted data for landing 
      * 
      * @memberof CatchdetailsCtrl
      * @private
      * @alias getSortedLandingData
      * @returns sorted landing table data
      */
    var getSortedLandingData = function (landingItems, orderedDefaultLanding) {

        var landingdata = [];
        angular.forEach(landingItems, function (row) {
            var currentLandingRow = [];
            angular.forEach(orderedDefaultLanding, function (item, defaultKey) {
                angular.forEach(row, function (rowItem, key) {
                    if (item.key === key) {
                        if (angular.isObject(rowItem)) {
                            angular.forEach(item.value, function (defaultSpecie, defaultSpecieName) {
                                angular.forEach(rowItem, function (Specie, SpecieName) {
                                    if (defaultSpecieName === SpecieName) {
                                        angular.forEach(defaultSpecie, function (defaultSubSpecie, defaultSubSpecieName) {
                                            angular.forEach(Specie, function (subSpecie, subSpecieName) {
                                                if (defaultSubSpecieName === subSpecieName) {
                                                    currentLandingRow.push({
                                                        key: subSpecieName,
                                                        value: subSpecie
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        } else {
                            currentLandingRow.push({
                                key: item.key,
                                value: rowItem
                            });
                        }
                    }

                });
            });
            landingdata.push(currentLandingRow);
        });
        return landingdata;

    };

    /**
      * prepares data for catch details
      * 
      * @memberof CatchdetailsCtrl
      * @private
      * @alias catchDetailsData
      * @returns catch details data
      */
    var catchDetailsData = function (data) {

        var catchData = prepareCatchData(data.catches);

        // Format the landing table data
        var landingItems = [];
        angular.forEach(data.landing.recordDTOs, function (item) {

            landingItems.push(_.extendOwn(item.summaryTable.summaryFishSize, item.summaryTable.summaryFaCatchType));
            angular.forEach(item.groups, function (group) {
                landingItems[landingItems.length - 1][group.key] = group.value;
            });
        });

        var landingTotal = data.landing.total;
        landingTotal = _.extendOwn(landingTotal.summaryFishSize, landingTotal.summaryFaCatchType);



        var fishHeaders = ['LSC', 'BMS', 'DISCARDED', 'DIM'];
        var lanDefaults = {};
        angular.forEach(landingItems, function (row) {
            angular.forEach(row, function (classItem, className) {
                if (fishHeaders.indexOf(className) !== -1) {
                    if (!angular.isDefined(lanDefaults[className])) {
                        lanDefaults[className] = {};
                    }
                    angular.forEach(classItem, function (specie, specieName) {
                        if (!angular.isDefined(lanDefaults[className][specieName])) {
                            lanDefaults[className][specieName] = {};
                        }
                        if (angular.isObject(specie)) {
                            angular.forEach(specie, function (subSpecie, subSpecieName) {
                                if (!angular.isDefined(lanDefaults[className][specieName][subSpecieName])) {
                                    lanDefaults[className][specieName][subSpecieName] = 0;
                                }
                            });
                        }
                    });
                } else {
                    if (!angular.isDefined(lanDefaults[className])) {
                        lanDefaults[className] = "";
                    }
                }

            });
        });

        angular.forEach(landingItems, function (row) {
            angular.forEach(lanDefaults, function (classItem, className) {

                if (angular.isDefined(row[className])) {
                    angular.forEach(classItem, function (specie, specieName) {
                        if (!angular.isDefined(row[className][specieName])) {
                            row[className][specieName] = specie;
                        }
                        if (angular.isDefined(row[className][specieName])) {
                            angular.forEach(specie, function (subSpecie, subSpecieName) {
                                if (!angular.isDefined(row[className][specieName][subSpecieName])) {
                                    row[className][specieName][subSpecieName] = subSpecie;

                                }
                            });
                        }
                    });
                } else {
                    row[className] = classItem;
                }
            });
        });

        var orderedDefaultLanding = [];
        angular.forEach(lanDefaults, function (value, key) {
            if (!angular.isObject(value)) {
                orderedDefaultLanding.push({
                    key: key,
                    value: value
                });
            }
        });

        angular.forEach(lanDefaults, function (value, key) {
            if (angular.isObject(value)) {
                orderedDefaultLanding.push({
                    key: key,
                    value: value
                });
            }

        });

        var landingRows = getSortedLandingData(landingItems, orderedDefaultLanding);
        var landingTotals = getSortedLandingData([landingTotal], orderedDefaultLanding);

        $scope.tables = {
            catches: {
                items: catchData.items,
                total: catchData.total
            },
            landing: {
                header: landingItems[0],
                items: landingRows,
                total: _.flatten(landingTotals, true).length > 0 ?  _.flatten(landingTotals, true) : ""
            }
        };
        
        processTables();
    };


    /**
      * prepares the table data to be displayed
      * 
      * @memberof CatchdetailsCtrl
      * @private
      * @alias processTables
      * @returns table data
      */
    var processTables = function () {
        var tableOrder = {
            catches: 0,
            landing: 1
            // difference: 2
        };

        /*if(angular.isDefined($scope.tables.difference)){
            var newItems = [];
            angular.forEach($scope.tables.difference.items,function(value,key) {
                var item = angular.copy(value);
                item._ = locale.getString('activity.catch_details_' + key);
                newItems.push(item);
            });
            $scope.tables.difference.items = newItems;
        }*/

        if (angular.isDefined($scope.tables) && _.keys($scope.tables).length) {
            var newTables = [];
            angular.forEach($scope.tables, function (tableData, tableName) {
                var newtable = tableService.convertDataToTable(tableData, 'activity.catch_details_column_', tableName);
                if (tableName !== 'difference') {
                    newtable.title = tableName;
                }
                newtable.order = tableOrder[tableName];
                newTables.push(newtable);
            });

            $scope.tables = newTables;
            $scope.isCatchDetailsLoaded = true;
        }
        loadingStatus.isLoading('TripSummary', false);
    };

    init();
});