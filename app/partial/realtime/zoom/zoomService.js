angular.module('unionvmsWeb').factory('zoomService', function($localStorage, realtimeMapService) {

    if ($localStorage['mapZoomLevel'] == null) {
        $localStorage['mapZoomLevel'] = [];
    }

    var zoomService = {
        saveZoomLevel: function (index) {
            $localStorage['mapZoomLevel'][index] = {
                center: realtimeMapService.getCenter(),
                zoomLevel: realtimeMapService.getZoomLevel()
            };

            let map = realtimeMapService.getMap();


            let imageHolder = document.getElementById('zoomImage' + index);

            let imageData = map.renderer_.canvas_.toDataURL('image/jpeg', 0.1);

            imageHolder.src = imageData;
            imageHolder.style.width = '128px';
            imageHolder.style.height = '128px';

            $localStorage['mapZoomLevel'][index] = {
                center: realtimeMapService.getCenter(),
                zoomLevel: realtimeMapService.getZoomLevel(),
                imageData: imageData
            };


        },
        loadZoomLevel: function (index) {
            let options = $localStorage['mapZoomLevel'][index];
            realtimeMapService.updateView(
                options.center,
                options.zoomLevel
            );

        },
        loadAllZoomLevels : function() {
            if ($localStorage['mapZoomLevel'] === null) {
                console.log('no zoom level stored in cache.');
                return;
            }
            for (let i = 0 ; i < $localStorage['mapZoomLevel'].length; i++) {
                let zoomLevel = $localStorage['mapZoomLevel'][i];
                if (zoomLevel.imageData) {
                    let imageHolder = document.getElementById('zoomImage' + i);
                    imageHolder.src = zoomLevel.imageData;
                    imageHolder.style.width = '128px';
                    imageHolder.style.height = '128px';
                }
            }
        }
    };
    return zoomService;
});
