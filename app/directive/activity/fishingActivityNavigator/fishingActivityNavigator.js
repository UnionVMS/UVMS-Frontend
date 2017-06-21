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
 * @name fishingActivityNavigator
 * @param tripReportsTimeline {Service} The trip reports timeline service <p>{@link unionvmsWeb.tripReportsTimeline}</p>
 * @param fishingActivityService {Service} The fishing activity service <p>{@link unionvmsWeb.fishingActivityService}</p>
 * @param reportingNavigatorService {Service} The reporting navigator service
 * @attr {String} partial - The partial that should be loaded within the directive
 * @description
 *  A directive to add support for ordered navigation between activities of a trip
 */
angular.module('unionvmsWeb').directive('fishingActivityNavigator', function(tripReportsTimeline, fishingActivityService, reportingNavigatorService, $compile, $rootScope) {
	return {
		restrict: 'E',
		replace: false,
		scope: {
		    partial: '@'
		},
		templateUrl: 'directive/activity/fishingActivityNavigator/fishingActivityNavigator.html',
		link: function(scope, element, attrs, fn) {
		    scope.timeline = tripReportsTimeline;
			scope.repNav = reportingNavigatorService;
		
            /**
             * Navigate to the specied activity
             * 
             * @memberof fishingActivityNavigator
             * @private
             * @param {String} direction - direction might be previous/next fishing activity
             */
            scope.goToItem = function(direction){
				var rec, parentId;
				if(angular.isDefined(scope.timeline[direction + 'Item'].idx)){
					rec = scope.timeline.reports[scope.timeline[direction + 'Item'].idx];
				}

				if (angular.isDefined(rec)){
					fishingActivityService.resetActivity();
					fishingActivityService.id = rec.id;
					fishingActivityService.isCorrection = rec.corrections;
					fishingActivityService.documentType = rec.documentType;
					fishingActivityService.activityType = rec.srcType;
					scope.timeline.setCurrentPreviousAndNextItem(rec.id, parentId);
					
					reportingNavigatorService.goToView('tripsPanel', 'FishingActivityPanel',function(){
						var content = angular.element('fishing-activity-navigator');
						$compile(content)(scope);
					});
				}
            };

		}
	};
});
