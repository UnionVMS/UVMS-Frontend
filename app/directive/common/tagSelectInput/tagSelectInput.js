/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
angular.module('unionvmsWeb').directive('tagSelectInput', function() {
    return {
        restrict: 'E',
        replace: true,
        controller: 'tagSelectInputCtrl',
        require: "^ngModel",
        scope: {
            items : '=',
            ngModel:'=',
            ngDisabled : '=',
            ngPlaceholder : '@',
            maxLimit : '@',
            titleField : '@',
            valueField : '@',
            multipleSelectionDropdown : '@'
        },
        templateUrl: 'directive/common/tagSelectInput/tagSelectInput.html',
        link: function(scope, element, attrs, fn) {
        }
    };
});


angular.module('unionvmsWeb')
    .controller('tagSelectInputCtrl', function($scope, locale){

        $scope.selectedItems = [];

        //Get the label for an item
        //Default item variable "text" is used if no attr is set
        $scope.getItemLabel = function(item){
            if($scope.titleField){
                return item[$scope.titleField];
            }else{
                return item.text;
            }
        };

        //Get the code (id) for an item
        //Default item variable "code" is used if no data attr is set
        var getItemCode = function(item){
            if($scope.valueField){
                return item[$scope.valueField];
            }else{
                return item.code;
            }
        };

        $scope.getPlaceholder = function(){
            if(angular.isUndefined($scope.ngPlaceholder)){
                return locale.getString('common.choose');
            }
            return $scope.ngPlaceholder;
        };

        $scope.isSelected = function(item){
            return $scope.selectedItems.indexOf(item) >= 0;
        };

        $scope.isMaxLimitReached = function(){
            if(angular.isUndefined($scope.maxLimit) || isNaN($scope.maxLimit)){
                return false;
            }else{
                return $scope.maxLimit <= $scope.selectedItems.length;
            }
        };

        // Display as dropdown with multiple select option
        $scope.displayMultipleSelectionDropdown = function() {
            if(angular.isDefined($scope.multipleSelectionDropdown)) {
                return true;
            }

        }

        // Set "Multiple options selected placeholder" (When placeholder should be displayed is specified in controller)
        $scope.displayMultipleOptionsPlaceholder = function(){ 
            if(angular.isUndefined($scope.multipleSelectionDropdown) || isNaN($scope.multipleSelectionDropdown)){
                return false;
            } else {
                if ($scope.selectedItems.length >= $scope.multipleSelectionDropdown) {
                    return true;
                }
            }   
        };

        $scope.removeItem = function(item){
            var index = $scope.selectedItems.indexOf(item);
            if(index >= 0){
                $scope.selectedItems.splice(index, 1);
            }
            watchModelChanges = false;
            updateNgModel();            
        };

        $scope.stopPropagation = function(e){
             e.stopPropagation();
        };            
        
        var updateNgModel = function(){
            $scope.ngModel = $scope.selectedItems.map(function(item) { return getItemCode(item); });
        };

        //Select item in dropdown
        $scope.selectItem = function(item, selectAll, removeAll){
            //Add
            if(!$scope.isSelected(item) && !removeAll){
                $scope.selectedItems.push(item);                
                watchModelChanges = false;
                updateNgModel();
            }
            //Remove
            else{
                if (!selectAll) {
                    $scope.removeItem(item);
                }
            }
        };

        // Select all items in dropdown
        $scope.selectAllItems = function(items){
            for (var i = 0; i < items.length; i++) {
                $scope.selectItem(items[i], true);
            }
        }

        // Remove all items in dropdown
        $scope.removeAllItems = function(items){
            for (var i = 0; i < items.length; i++) {
                $scope.selectItem(items[i], false, true);
            }
        }

        //Watch for changes to the ngModel and update the selectedItems
        var watchModelChanges = true;
        $scope.$watch('ngModel', function (newVal, oldVal) {
            if(watchModelChanges){
                if(newVal instanceof Array){
                    $scope.selectedItems.length = 0;
                    $.each(newVal, function(index, selectedItem){
                        $.each($scope.items, function(index2, item){
                            if(String(getItemCode(item)) === String(selectedItem)){
                                $scope.selectedItems.push(item);
                                return false;
                            }
                        });
                    });
                }else{
                    $scope.selectedItems.length = 0;
                }
            }
            watchModelChanges = true;
        });
});