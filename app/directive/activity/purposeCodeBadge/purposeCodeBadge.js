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
            scope.show = false;
            scope.color = 'BLUE';
            scope.faServ = fishingActivityService;
            scope.getTitle = function(){
                var title;
                if (angular.isDefined(scope.faServ.activityData) && _.keys(scope.faServ.activityData).length > 0){
                    var historyItemIdx = _.findIndex(scope.faServ.activityData.history, function(item){
                        var testId;
                        if (item.fishingActivityIds.length === 1){
                            testId = item.fishingActivityIds[0];
                        } else {
                            var idx = _.indexOf(item.fishingActivityIds, scope.faServ.id);
                            if (angular.isDefined(idx)){
                                testId = item.fishingActivityIds[testId];
                            }
                        }

                        if (angular.isDefined(testId)){
                            return testId === scope.faServ.id && item.faReportID === scope.faServ.repId;
                        } else {
                            return false;
                        }

                    });
                    var statusItem;
                    var isFinalItem = false;
                    if (angular.isDefined(historyItemIdx) && historyItemIdx !== -1){
                        if (historyItemIdx > 0){
                            statusItem = scope.faServ.activityData.history[historyItemIdx - 1];
                        } else {
                            statusItem = scope.faServ.activityData.history[historyItemIdx];
                            isFinalItem = true;
                        }
                    } else {
                        var purposeCodeItem = _.findWhere(scope.faServ.activityData.reportDetails.items, {id: "purposeCode"});
                        if (angular.isDefined(purposeCodeItem)){
                            statusItem = {
                                purposeCode: purposeCodeItem.originalValue
                            };
                        }
                        isFinalItem = true;
                    }

                    var properPurposeCode;
                    if (angular.isDefined(statusItem)){
                        properPurposeCode = parseInt(statusItem.purposeCode);
                        switch (properPurposeCode){
                            case 9:
                                title = locale.getString('activity.fa_report_document_type_original');
                                scope.color = 'BLUE';
                                break;
                            case 5:
                                if (isFinalItem){
                                    title = locale.getString('activity.optype_correction');
                                    scope.color = 'BLUE';
                                } else {
                                    title = locale.getString('activity.fa_report_document_type_corrected');
                                    scope.color = 'RED';
                                }
                                break;
                            case 3:
                                if (isFinalItem){
                                    title = locale.getString('activity.optype_deletion');
                                    scope.color = 'ORANGE';
                                } else {
                                    title = locale.getString('activity.fa_report_document_type_deleted');
                                    scope.color = 'RED';
                                }
                                break;
                            case 1:
                                if (isFinalItem){
                                    title = locale.getString('activity.optype_cancellation');
                                    scope.color = 'ORANGE';
                                } else {
                                    title = locale.getString('activity.fa_report_document_type_canceled');
                                    scope.color = 'RED';
                                }
                                break;
                        }
                    }

                    if (angular.isDefined(title)){
                        scope.show = true;
                    }
                    return title;
                }
            };
        }
    };
});
