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
angular.module('unionvmsWeb').controller('ValidationresultsmodalCtrl',function($scope, $modalInstance, $log, locale, exchangeRestService, msgGuid){
    $scope.isTableVisible = true;
    $scope.validationResults = [];
    $scope.isLoading = true;
    
    var init = function(){
        exchangeRestService.getValidationResults(msgGuid).then(function(response){
            $scope.validationResults = response.rulesList;
            $scope.displayedResults = [].concat(response.rulesList);
            $scope.msg = vkbeautify.xml(response.msg);
            $scope.isLoading = false;
        }, function(error){
            $log.error("Error getting validation results.");
            $scope.isLoading = false;
            $scope.errorMessage = locale.getString('exchange.get_validation_results_error');
        });
    };
    
    $scope.showError = function(xpath){
        $scope.togglePanelVisibility();
    };
    
    $scope.togglePanelVisibility = function(){
        $scope.isTableVisible = !$scope.isTableVisible;
    };
    
    //Close modal
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    init();
});
