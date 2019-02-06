angular.module('unionvmsWeb').factory('ZoomModal', function($modal) {
    return {
        show: function() {
            return $modal.open({
                templateUrl: 'partial/realtime/zoom/zoomModal.html',
                controller: 'ZoomCtrl',
                windowClass : "infoModal",
                backdrop: false,
                size: 'md',
                resolve:{

                }
            });
        }
    };
});
