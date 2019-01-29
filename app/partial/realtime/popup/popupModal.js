angular.module('unionvmsWeb').factory('PopupModal', function($modal) {
    return {
        show: function(data) {
            return $modal.open({
                templateUrl: 'partial/realtime/popup/popupModal.html',
                controller: 'PopupCtrl',
                windowClass : "infoModal",
                backdrop: false,
                size: 'md',
                resolve:{
                    assetInfo : function () {
                        return data;
                    }
                }
            });
        }
    };
});
