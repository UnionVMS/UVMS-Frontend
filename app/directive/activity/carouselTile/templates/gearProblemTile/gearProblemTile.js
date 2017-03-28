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
 * @name GearproblemtileCtrl
 * @param $scope {Service} controller scope
 * @param $state {Service} state provider service
 * @param tripSummaryService {Service} the trip summary service <p>{@link unionvmsWeb.tripSummaryService}</p>
 * @description
 *  The controller for the gear problem tile template
 */
angular.module('unionvmsWeb').controller('GearproblemtileCtrl',function($scope, $state, tripSummaryService){
    /**
     * Create and show a tootlip with a description for the gear problem type and gear recovery measure
     *  
     *  @memberof GearproblemtileCtrl
     *  @public
     *  @param {Object} item - The item object containing the type and text to be displayed
     *  @param {String} cssSel - The css selector class of the item against which the tip will be displayed
     */
    $scope.displayDetailsTip = function(item, cssSel){
        var target = angular.element('.gear-problem-tile .' + cssSel + '-' + item.type);
        var tip;
        if (angular.isDefined($(target).attr('data-hasqtip'))){
            tip = $(target);
        } else {
            tip = target.qtip({
                content: {
                    text: item[cssSel]
                },
                position: {
                    my: 'left center',
                    at: 'right center',
                    target: target,
                    effect: false
                },
                show: {
                    solo: true,
                    when: false,
                    effect: false
                },
                style: {
                    classes: 'qtip-bootstrap'
                },
                events: {
                    hide: function(evt, api){
                        api.destroy(true);
                    }
                }
            });
        } 
        
        var api = tip.qtip('api');
        api.show();
    };
    
    /**
     * Check if a location tile should be clickable taking into consideration the route and the report configuration
     * 
     * @memberof GearproblemtileCtrl
     * @public
     * @alias isLocationClickable
     * @returns {Boolean} Whether the location tile should be clickable or not
     */
    $scope.isLocationClickable = function(){
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && tripSummaryService.withMap){
            clickable = true;
        }
        
        return clickable;
    };
    
    //TODO - check if we need a click callback on the locations tile
});