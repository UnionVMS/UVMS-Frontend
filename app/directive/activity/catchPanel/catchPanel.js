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
 * @ngdoc directive
 * @name catchPanel
 * @param locale {Service} The angular locale service
 * @attr {Object} ngModel - The data object used as input for the directive
 * @attr {Boolean} withTable - Whether the panel should include or not a data table
 * @attr {String} title - title for the catch panel
 * @attr {Boolean} isLoading - Whether teh parent container is still loading or not
 * @attr {String} unit - The weight unit to be used for the directive
 * @description
 *  A reusable tile that will display two pie charts side-by-side, and optionally a table and caption for the input data 
 */
angular.module('unionvmsWeb').directive('catchPanel', function(locale, $compile, $modal) {
    return {
        restrict: 'E',
        replace: false,
        scope: {
            ngModel: '=',
            title: '@',
            isLoading: '='
        },
        templateUrl: 'directive/activity/catchPanel/catchPanel.html',
        link: function(scope, element, attrs, fn) {
            scope.options = {
                chart: {
                    type: 'pieChart',
                    height: 200,
                    x: function(d){
                        return d.speciesCode;
                    },
                    y: function(d){
                        return d.weight;
                    },
                    color: function(d) {
                        return d.color;
                    },
                    showLegend: false,
                    showLabels: false,
                    pie: {
                        dispatch: {
                            elementClick: function(e){
                                var modalInstance = $modal.open({
                                    templateUrl: 'partial/activity/pieChartModal/pieChartModal.html',
                                    controller: 'PiechartmodalCtrl',
                                    size: 'md',
                                    resolve: {
                                        modalData: function() {
                                            return e.data;
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            };
		}
    };
});
