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
angular.module('unionvmsWeb').controller('ReportspaginationCtrl',function($scope,$timeout){

    $scope.inputPage = 1;

    //Handle change in page input field
    var inputChangeCallbackTimeout;
    $scope.onInputPageChange = function(value){
        if(value){
            $scope.inputPage = value;
        }
        
        if($scope.inputPage >= 1 && $scope.inputPage <= $scope.numPages && $scope.inputPage !== $scope.currentPage){
            changeTimeout();
        }else if(!angular.isDefined($scope.inputPage) || $scope.inputPage === null){
            return;
        }else if($scope.inputPage < 1){
            $scope.inputPage = 1;
            changeTimeout();
        }else if($scope.inputPage > $scope.numPages){
            $scope.inputPage = $scope.numPages;
            changeTimeout();
        }else{
            $scope.inputPage = $scope.currentPage;
        }
    };

    var changeTimeout = function(){
        $timeout.cancel(inputChangeCallbackTimeout);
        inputChangeCallbackTimeout = $timeout(function(){
            $scope.selectPage($scope.inputPage);            
        }, 300);
    };

    $scope.$watch('currentPage',function(newVal,oldVal) {
        if(newVal !== $scope.inputPage){
            $scope.inputPage = newVal;
        }
    });

});
