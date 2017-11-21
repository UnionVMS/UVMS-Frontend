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
 * @name faHistoryNavigator
 * @param fishingActivityService {Service} The fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param FishingActivity {Model} The model of a fishing activity
 * @attr {Object} history - An object containing the ids of the previous and next activity in the history
 * @attr {String} activityName - The activity type name so that the proper rest service can be called
 * @description
 *  A reusable button that will allow to navigate through the history of a particular fishing activity.
 */
angular.module('unionvmsWeb').directive('faHistoryNavigator', function (fishingActivityService,FishingActivity, $compile) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            history: '=',
            activityName: '@'
        },
        templateUrl: 'directive/activity/faHistoryNavigator/faHistoryNavigator.html',
        link: function (scope, element, attrs, fn) {
            scope.faServ = fishingActivityService;
            
            scope.status = {
                id: undefined,
                documentType: undefined,
                activityType: undefined
            };
            
            /**
             * Load the activity from a previous/next version id
             * 
             * @memberof faHistoryNavigator
             * @public
             * @param {Number} activityId - The id of the activity to be loaded
             */
            scope.openHistoryView = function (activityId) {
                scope.status.id = activityId;
                scope.status.documentType = scope.faServ.documentType;
                scope.status.activityType = scope.faServ.activityType;
              
                scope.faServ.resetActivity();
                scope.faServ.getFishingActivity(new FishingActivity(scope.activityName),scope.recompileView,activityId);  
            };
            
            /**
             * Recompile the activity view and update the fishing activity service
             * 
             * @memberof faHistoryNavigator
             * @public
             */
            scope.recompileView = function(){
                scope.faServ.id = scope.status.id;
                scope.faServ.documentType = scope.status.documentType;
                scope.faServ.activityType = scope.status.activityType;
                var content = angular.element('.activity-details');
                $compile(content.contents())(scope);
            };
            
            /**
             * Update the correction status of the activity service according to the history items provided by the REST service
             * 
             * @memberof faHistoryNavigator
             * @public
             */
            scope.updateCorrection = function(){
                var isCorrection = true;
                if (!angular.isDefined(scope.history.previousId) || scope.history.previousId === 0){
                    isCorrection = false;
                }
                scope.faServ.isCorrection = isCorrection;
            };
          
            scope.updateCorrection();
        }
    };
});
