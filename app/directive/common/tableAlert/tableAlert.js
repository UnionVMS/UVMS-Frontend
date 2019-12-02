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
angular.module('unionvmsWeb').directive('tableAlert', function() {
	return {
		restrict: 'E',
		replace: true,
		controller: 'tableAlertCtrl',
		scope: {
			type: '=',
			msg: '=',
			visible: '=?',
			timeout: '=',
			noHide: '@',
			closable: '@'
		},
		templateUrl: 'directive/common/tableAlert/tableAlert.html'
	};
});

angular.module('unionvmsWeb').controller('tableAlertCtrl',['$scope','$timeout','locale', function($scope,$timeout,locale){
	$scope.hide = function(){
	    if ($scope.noHide){
	        $scope.visible = false;
	    } else {
	        $timeout(function(){
	            $scope.visible = false;
	        }, angular.isDefined($scope.timeout) ? $scope.timeout : 3000);
	    }
	};
	
	$scope.$watch(function(){return $scope.visible;},function(newVal){
	    if (!$scope.closable){
	        if (newVal === true){
	            if (!$scope.noHide && $scope.type !== 'info'){
	                $scope.hide();
	            }
	        } else {
	            $scope.hide();
	        }
	    }
	});
	
	$scope.close = function(){
	    $scope.visible = false;
	};
	
	$scope.$watch(function(){return $scope.msg;},function(newVal){
		$scope.message = locale.getString($scope.msg);
	});
}]);

