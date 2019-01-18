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
angular.module('unionvmsWeb').controller('mobileTerminalHistoryModalCtrl',function($scope, $modalInstance, SearchResults, mobileTerminalRestService, SearchResultListPage, mobileTerminal, locale){

    $scope.mobileTerminal = mobileTerminal;
        $scope.currentSearchResults = new SearchResults('changeDate', true, locale.getString('mobileTerminal.history_alert_message_on_zero_items'));
        $scope.channelResultList = [];

        var init = function(){
            //Get history
            $scope.currentSearchResults.setLoading(true);
            mobileTerminalRestService.getHistoryWithAssociatedVesselForMobileTerminal($scope.mobileTerminal).then(function(historyList){
                var searchResultPage = new SearchResultListPage(historyList, 1, 1);

                $scope.currentSearchResults.updateWithNewResults(searchResultPage);
                $scope.allCurrentSearchResults = searchResultPage.items;
                $scope.currentSearchResultsByPage = searchResultPage.items;

            }, function(err){
                $scope.currentSearchResults.setLoading(false);
                $scope.currentSearchResults.setErrorMessage(locale.getString('mobileTerminal.history_alert_message_on_failed_to_load_error'));

                $scope.channelResults.setLoading(false);
                $scope.channelResults.setErrorMessage(locale.getString('mobileTerminal.history_alert_message_on_failed_to_load_error'));

                $scope.allCurrentSearchResults = $scope.currentSearchResults.items;
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.getAttribute = function(channelEvent, attribute) {
            for (var index in channelEvent.attributes) {
                var attr = channelEvent.attributes[index];
                if (attr.type === attribute) {
                    return attr.value;
                }
            }
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
