
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


angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function($scope, activityRestService, locale) {

    function convertDataToTable(data) {
        var table;
        if(data.items.length > 0){
            table = getTableHeaders(data.items[0]);
            table.rows = getTableRows(data.items);
            table.totals = data.total ? getTableRow(data.total) : undefined;
        }else{
            table = {};
        }
        return table;
    }

    function getTableHeaders(obj, headers, level) {
        headers = headers || [];
        level = angular.isDefined(level) ? level + 1 : 0;
        headers[level] = headers[level] || [];
        var globalHeaders = level ? undefined : [];


        angular.forEach(obj, function(property,propertyName){
            if(angular.isObject(property)){

                headers[level].push({title: propertyName, width: getColWidth(property)});
                headers[level+1] = headers[level+1] || [];
                headers[level+1].concat(getTableHeaders(property, headers, level));
            }else{
                if(level === 0){
                    globalHeaders.push({title: propertyName === '_' ? '' : locale.getString('activity.catch_details_column_' + propertyName), width: 1});
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

    function getTableRows(arr) {
        var rows = [];
        angular.forEach(arr, function(item){
            rows.push(getTableRow(item));
        });

        return rows;
    }
    
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


    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */
    var init = function() {

        var tableOrder = {
            catches: 0,
            landing: 1,
            difference: 2
        };

        $scope.fishingTripDetails = activityRestService.getTripCatchDetail('1234');
        $scope.tables = activityRestService.getTripCatchesLandingDetails('1234');

        var newItems = [];
        angular.forEach($scope.tables.difference.items,function(value,key) {
            var item = angular.copy(value);
            item._ = locale.getString('activity.catch_details_' + key);
            newItems.push(item);
        });
        $scope.tables.difference.items = newItems;

        if(angular.isDefined($scope.tables) && _.keys($scope.tables).length){
            var newTables = [];
            angular.forEach($scope.tables, function(tableData,tableName){
                var newtable = convertDataToTable(tableData);
                if(tableName !== 'difference'){
                    newtable.title = tableName;
                }
                newtable.order = tableOrder[tableName];
                newTables.push(newtable);
            });

            $scope.tables = newTables;

            $scope.isCatchDetailsLoaded = true;
        }

    };

    init();

});