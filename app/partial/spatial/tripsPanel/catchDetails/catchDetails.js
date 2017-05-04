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
angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function($scope, activityRestService, locale, tableService, reportService, loadingStatus, tripSummaryService) {
    
    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */    
    var init = function() {
     
        $scope.tripId=tripSummaryService.trip.id;
        if(angular.isDefined($scope.tripId)){           
            loadingStatus.isLoading('TripSummary', true, 1);
            //FIXME change with proper trip id
            activityRestService.getTripCatchDetail($scope.tripId).then(function(response){
                $scope.fishingTripDetails = response;
                loadingStatus.isLoading('TripSummary', false);
            }, function(error){
                //TODO deal with error from service
            });
            
            loadingStatus.isLoading('TripSummary', true, 1);
            //FIXME change with proper trip id
            activityRestService.getTripCatchesLandingDetails($scope.tripId).then(function(response){
                $scope.tables = response;
                processTables();
            }, function(error){
                //TODO deal with error from service
            });
        }else{
            loadingStatus.isLoading('TripSummary', true, 1);

            var items = [];
            angular.forEach(reportService.criteria.recordDTOs, function(item){
                items.push(_.extendOwn(angular.copy(item.summaryTable.summaryFishSize), item.summaryTable.summaryFaCatchType));

                angular.forEach(item.groups, function(group){
                    items[items.length-1][group.key] = group.value;
                });
            });
            
            var total = reportService.criteria.total;
            total = _.extendOwn(angular.copy(total.summaryFishSize),total.summaryFaCatchType);


            var fishHeaders = ['LSC','BMS','DISCARDED','DIM'];
            var defaults = {};
            angular.forEach(items, function(row){
                angular.forEach(row, function(classItem,className){
                    if(fishHeaders.indexOf(className) !== -1){
                        if(!angular.isDefined(defaults[className])){
                            defaults[className] = {};
                        }
                        angular.forEach(classItem, function(specie,specieName){
                            if(!angular.isDefined(defaults[className][specieName])){
                                defaults[className][specieName] = 0;
                            }
                        });
                    }
                });
            });

            angular.forEach(items, function(row){
                angular.forEach(defaults, function(classItem,className){
                    if(angular.isDefined(row[className])){
                        angular.forEach(classItem, function(specie,specieName){
                            if(!angular.isDefined(row[className][specieName])){
                                row[className][specieName] = specie;
                            }
                        });
                    }else{
                        row[className] = classItem;
                    }
                });
            });

            $scope.tables = {
                catches: {
                    items: items,
                    total: total
                }
            };
            processTables();
        }
    };
    
    function processTables(){
        var tableOrder = {
            catches: 0,
            landing: 1,
            difference: 2
        };
        
        if(angular.isDefined($scope.tables.difference)){
            var newItems = [];
            angular.forEach($scope.tables.difference.items,function(value,key) {
                var item = angular.copy(value);
                item._ = locale.getString('activity.catch_details_' + key);
                newItems.push(item);
            });
            $scope.tables.difference.items = newItems;
        }
        
        if(angular.isDefined($scope.tables) && _.keys($scope.tables).length){
            var newTables = [];
            angular.forEach($scope.tables, function(tableData,tableName){
                var newtable = tableService.convertDataToTable(tableData,'activity.catch_details_column_');
                if(tableName !== 'difference'){
                    newtable.title = tableName;
                }
                newtable.order = tableOrder[tableName];
                newTables.push(newtable);
            });

            $scope.tables = newTables;

            $scope.isCatchDetailsLoaded = true;
        }
        loadingStatus.isLoading('TripSummary', false);
    }

    init();
});