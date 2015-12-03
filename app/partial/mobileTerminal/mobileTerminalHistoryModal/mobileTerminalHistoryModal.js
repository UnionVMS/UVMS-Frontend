angular.module('unionvmsWeb').controller('mobileTerminalHistoryModalCtrl',function($scope, $modalInstance, SearchResults, mobileTerminalRestService, SearchResultListPage, mobileTerminal, locale){

    $scope.mobileTerminal = mobileTerminal;
    $scope.currentSearchResults = new SearchResults('changeDate', true, locale.getString('mobileTerminal.history_alert_message_on_zero_items'));

    var init = function(){
        //Get history
        $scope.currentSearchResults.setLoading(true);
        mobileTerminalRestService.getHistoryWithAssociatedVesselForMobileTerminal($scope.mobileTerminal).then(function(historyList){
            var searchResultPage = new SearchResultListPage(historyList, 1, 1);
            $scope.currentSearchResults.updateWithNewResults(searchResultPage);
        }, function(err){
            $scope.currentSearchResults.setLoading(false);
            $scope.currentSearchResults.setErrorMessage(locale.getString('mobileTerminal.history_alert_message_on_failed_to_load_error'));
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    init();
});

angular.module('unionvmsWeb').factory('MobileTerminalHistoryModal', function($modal) {
    return {
        show: function(mobileTerminal) {
            return $modal.open({
                templateUrl: 'partial/mobileTerminal/mobileTerminalHistoryModal/mobileTerminalHistoryModal.html',
                controller: 'mobileTerminalHistoryModalCtrl',
                size: "lg",
                resolve: {
                    mobileTerminal: function(){
                        return mobileTerminal;
                    }
                }
            });
        }
    };
});