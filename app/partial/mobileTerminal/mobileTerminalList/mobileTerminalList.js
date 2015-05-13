angular.module('unionvmsWeb').controller('MobileterminallistCtrl',function($scope){


    //Handle click on the top "check all" checkbox
    $scope.checkAll = function(){        
        if($scope.isAllChecked()){
            //Remove all
            $scope.clearSelection();
        }else{
            //Add all
            $scope.clearSelection();
            $.each($scope.currentSearchResults.mobileTerminals, function(index, item) {
                $scope.addToSelection(item);
            });
        }
    };

    $scope.checkMobileTerminal = function(item){
        item.Selected = !item.Selected;
        if($scope.isChecked(item)){
            //Remove
            $scope.removeFromSelection(item);
        }else{
            $scope.addToSelection(item);
        }      
    };

    $scope.isAllChecked = function(){
        if(angular.isUndefined($scope.currentSearchResults.mobileTerminals) || $scope.selectedMobileTerminals.length === 0){
            return false;
        }

        var allChecked = true;
        $.each($scope.currentSearchResults.mobileTerminals, function(index, item) {
            if(!$scope.isChecked(item)){
                allChecked = false;
                return false;
            }
        });
        return allChecked;
    };

    $scope.isChecked = function(item){
        var checked = false;
        $.each($scope.selectedMobileTerminals, function(index, mobileTerminal){
            if(mobileTerminal.isEqualTerminal(item)){
                checked = true;
                return false;
            }
        });
        return checked;
    };

    $scope.showLog = function (item){
        console.log("Show log info for this item:");
        console.log(item);
    };






});
