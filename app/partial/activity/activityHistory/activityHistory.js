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
 * @name ActivityoverviewCtrl
 * @param $scope {Service} controller scope
 * @param activityService {Service} The activity service
 * @description
 *  The controller for the fishing activity overview page
 */
angular.module('unionvmsWeb').controller('ActivityhistoryCtrl',function($scope, activityService){
    $scope.actServ = activityService;
    
    /**
     * Get the details of an activity an open the activity details page
     * 
     * @memberof ActivityoverviewCtrl
     * @public
     * @alias getDetails
     */
    $scope.getDetails = function(){
        //FIXME remove mock
        $scope.actServ.details = {
            name: 'Activity details will be here'
        };
        $scope.goToView(3);
    };
    
    /**
     * Open the activities history list page
     * 
     * @memberof ActivityoverviewCtrl~
     * @public
     * @alias openActivityHistory
     */
    $scope.openActivityHistory = function(idx){
        $scope.actServ.activitiesHistoryList.isLoading = true;
        $scope.actServ.getActivitiesHistory($scope.actServ.displayedHistory[idx]);
        $scope.goToView(2);
    };
});
