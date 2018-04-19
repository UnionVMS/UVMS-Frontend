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
 * @name purposeCodeBadge
 * @param {Service} fishingActivityService - the fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @parm {Service} locale - the angular locale service
 * @desc
 *  A badge to clearly classify fishing activity purpose code (correction, cancelation, original, corrected, ...)
 */
angular.module('unionvmsWeb').directive('purposeCodeBadge', function(fishingActivityService, locale) {
    return {
        restrict: 'E',
        replace: true,
        templateUrl: 'directive/activity/purposeCodeBadge/purposeCodeBadge.html',
        link: function(scope, element, attrs, fn) {
            scope.finished = false;
            scope.isCorrected = false;
            scope.faServ = fishingActivityService;
            scope.getTitle = function(){
                var title;
                if (angular.isDefined(scope.faServ.activityData) && angular.isDefined(scope.faServ.activityData.reportDetails)){
                    var items = scope.faServ.activityData.reportDetails.items;
                    var purposeCodeItem = _.findWhere(items, {id: "purposeCode"});
                    if (angular.isDefined(purposeCodeItem)){
                        scope.finished = true;
                        if (scope.faServ.isCorrection){
                            title = locale.getString('activity.optype_correction');
                        } else {
                            if (parseInt(purposeCodeItem.originalValue) === 9 && (scope.faServ.activityData.history.previousId || scope.faServ.activityData.history.nextId)){
                                title = locale.getString('activity.fa_report_document_type_corrected');
                                scope.isCorrected = true;
                            }

                            //TODO cancellation
                        }
                    }
                }
                return title;
            }
        }
    };
});
