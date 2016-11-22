/**
 * @memberof unionvmsWeb
 * @ngdoc directive
 * @name catchClassDetailTile
 * @attr {String} fieldTitle - The title of the fieldset tile
 * @description
 *  A reusable tile that will display the details of a catch. It is used in several partials such as departurePanel and arrivalPanel 
 */
angular.module('unionvmsWeb').directive('catchClassDetailTile', function() {
	return {
		restrict: 'E',
		replace: false,
		controller: 'CatchClassDetailTileCtrl',
		scope: {
		    tileTitle: '@',
		    ngModel: '=',
		    isLocationClickable: '=',
		    bufferDistance: '@',
		    clickCallback: '&'
		},
		templateUrl: 'directive/activity/catchClassDetailTile/catchClassDetailTile.html',
		link: function(scope, element, attrs, fn) {
		    scope.init();
		}
	};
}).
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CatchClassDetailTileCtrl
 * @param $scope {Service} The controller scope
 * @param locale {Service} The angular locale service
 * @attr {Object} selected - The selected record that is used to display information on the location tile, catch table and summary (it always refers to a specific fish species)
 * @attr {Object} options - An object containing all NVD3 chart options
 * @attr {Array} chartData - An array of objects used as data source in the chart
 * @description
 *  The controller for the catchClassDetailTile directive ({@link unionvmsWeb.catchClassDetailTile})
 */
controller('CatchClassDetailTileCtrl', function($scope, locale){
    $scope.selected = {};
    
    /**
     * The initialization function that will process the ngModel to properly formatted objects that are used within the directive
     * 
     * @memberof CatchClassDetailTileCtrl
     * @public
     * @alias init
     */
    $scope.init = function(){
        selectRecordAndSetLocationTitle(0);
        generateChartData();
    };
    
    $scope.options = {
        chart: {
            type: 'multiBarChart',
            stacked: true,
            showLegend: true,
            showControls: false,
            useInteractiveGuideline: true,
            yAxis: {
                axisLabel: locale.getString('activity.header_fa_weight'),
                showMaxMin: false,
                ticks: 5
            },
            xAxis: {
                rotateYLabel: true,
                rotateLabels: -45,
                tickFormat: function(xValue){
                    return $scope.ngModel[xValue].species;
                }
            },
            multibar: {
                dispatch: {
                    elementClick: function(e){
                        selectRecordAndSetLocationTitle(e.data.idx);
                    }
                }
            },
            interactiveLayer: {
                tooltip: {
                    headerFormatter: function (xValue) {
                        return $scope.ngModel[xValue].species;
                    },
                    contentGenerator: function(data){
                        var html = '<table class="catch-class-detail-chart"><thead><tr><td colspan="3"><strong>SOL</strong></td></tr></thead><tbody>';
                        for (var i = 0; i < data.series.length; i++){
                            html += '<tr><td class="legend-color-guide"><div style="background-color: #' + data.series[i].color + '"></div></td>';
                            html += '<td class="key">' + data.series[i].key + '</td>';
                            html += '<td class="value">' + data.series[i].value + ' kg' + '</td></tr>';
                        }
                        html += '</tbody></table';
                        
                        return html;
                    }
                }
            }
        }        
    };
    
    /**
     * Select the record that should be used to display information on the location tile, table and summary sections. Set the location tile title according
     * to the number of locations available for a given record
     * 
     * @memberof CatchClassDetailTileCtrl
     * @private
     * @param {Number} idx - The index of the item to be selected
     */
    function selectRecordAndSetLocationTitle (idx){
        $scope.selected = $scope.ngModel[idx];
        $scope.selected.total = parseFloat($scope.selected.lsc) + parseFloat($scope.selected.bms);
        
        var title = 'activity.location';
        if ($scope.selected.locations.length > 1){
            title += 's';
        }
        $scope.locationTitle = locale.getString(title);
    }
    
    /**
     * Generate properly formatted data series that will be used as data source in the chart.
     * 
     * @memberof CatchClassDetailTileCtrl
     * @private
     */
    function generateChartData(){
        var colors = palette('tol-rainbow', 2);
        var lscSeries = {
            key: locale.getString('activity.lsc').toUpperCase(),
            color: colors[0],
            values: []
        };
        
        var bmsSeries = {
            key: locale.getString('activity.bms').toUpperCase(),
            color: colors[1],
            values: []
        };
        
        var counter = 0;
        angular.forEach($scope.ngModel, function(item){
            lscSeries.values.push(generateChartRecord(item, 'lsc', counter));
            bmsSeries.values.push(generateChartRecord(item, 'bms', counter));
            counter += 1;
        });
        
        $scope.chartData = [lscSeries, bmsSeries];
    }
    
    /**
     * Generate a proper record to be used in the chart data series
     * 
     * @memberof CatchClassDetailTileCtrl
     * @private
     * @param {Object} data - The object containing the source data
     * @param {String} type - The record type that should be generated (supported options: 'lms' and 'bms')
     * @param {Number} idx - The index of the source object
     * @returns {Object} The record object to be used as input for the chart data series
     */
    function generateChartRecord (data, type, idx){
        return {
            idx: idx,
            key: data.species,
            series: type === 'lms' ? 0 : 1,
            x: idx,
            y: data[type]
        };
    }
});
