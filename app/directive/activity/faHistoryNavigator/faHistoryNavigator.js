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
angular.module('unionvmsWeb').directive('faHistoryNavigator', function (fishingActivityService,FishingActivity, $compile, locale) {
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
            scope.hasMultipleItems = false;

            scope.status = {
                id: undefined,
                documentType: undefined,
                activityType: undefined,
                repId: undefined
            };

            scope.getAlertMsg = function(){
                var msg = '';
                if (scope.hasMultipleItems === true){
                    msg = locale.getString('activity.warn_msg_when_multiple_activitites_in_history')
                }

                return msg;
            }


            function checkIsCurrentActivity(record){
                angular.forEach(record.fishingActivityIds, function(item){
                    if (parseInt(item) === scope.faServ.id && parseInt(record.faReportID) === scope.faServ.repId){
                        record.enabled = false;
                    }
                });
            }


            /**
             * Update hisotry items in order to enable/disable them in the dropdown menu
             *
             * @memberOf faHistoryNavigator
             * @private
             */
            function updateHistoryItems(){
                angular.forEach(scope.history, function (item) {
                    if (item.fishingActivityIds.length === 1){
                        checkIsCurrentActivity(item);
                    } else {
                        scope.hasMultipleItems = true;
                        checkIsCurrentActivity(item);
                    }
                });
            }

            scope.isActivityDisabled = function(id, repId){
                var disabled = false;
                if (parseInt(id) === scope.faServ.id && parseInt(repId) === scope.faServ.id){
                    disabled = true;
                }

                return disabled;
            };
            
            /**
             * Load the activity from a previous/next version id
             * 
             * @memberof faHistoryNavigator
             * @public
             * @param {Object} item - The history item object containing the activity and report ID's to load the desired activity screen
             */
            scope.openHistoryView = function (item, id) {
                if ((item.fishingActivityIds.length === 1 && item.enabled) || (item.fishingActivityIds.length > 1 && id !== scope.faServ.id)){
                    if (angular.isDefined(id)){
                        scope.status.id = id;
                    } else {
                        scope.status.id = item.fishingActivityIds[0];
                    }

                    scope.status.documentType = scope.faServ.documentType;
                    scope.status.activityType = scope.faServ.activityType;
                    scope.status.repId = item.faReportID;

                    scope.faServ.resetActivity();
                    scope.faServ.getFishingActivity(new FishingActivity(scope.activityName), scope.recompileView, scope.status.id, item.faReportID);
                }
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
                scope.faServ.repId = scope.status.repId;
                scope.faServ.reloadFromActivityHistory = true;

                var content = angular.element('.activity-details');
                $compile(content.contents())(scope);
                
            };
            
            /**
             * Update the correction status of the activity service according to the history items provided by the REST service
             * 
             * @memberof faHistoryNavigator
             * @private
             */
            /*scope.updateCorrection = function(){
                //FIXME check how to update this
                var isCorrection = true;
                /!*if (!angular.isDefined(scope.history.previousId) || scope.history.previousId === 0){
                    isCorrection = false;
                }*!/
                scope.faServ.isCorrection = isCorrection;
            };
          
            scope.updateCorrection();*/

            function updateCorrectionStatus(){
                var isCorrection = false;
                var currentItem = _.findWhere(scope.history, {enabled: false});

                if (angular.isDefined(currentItem) && parseInt(currentItem.purposeCode) === 5){
                    isCorrection = true;
                }
                scope.faServ.isCorrection = isCorrection;
            }

            updateHistoryItems();
            updateCorrectionStatus();
        }
    };
});
