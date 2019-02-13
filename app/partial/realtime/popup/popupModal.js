angular.module('unionvmsWeb').factory('PopupModal', function($modal) {
    return {
        show: function(data) {


            var modalInstance = $modal.open({
                templateUrl: 'partial/realtime/popup/popupModal.html',
                controller: 'PopupCtrl',
                backdropClass: 'popupctrl-modal-backdrop',
                backdrop: true,
                keyboard: true,
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
