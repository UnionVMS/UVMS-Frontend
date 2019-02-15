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

            var map = realtimeMapService.getMap();


            var imageHolder = document.getElementById('zoomImage' + index);

            var imageData = map.B.b.toDataURL('image/jpeg', 0.1);

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
            var options = $localStorage['mapZoomLevel'][index];
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
            for (var i = 0 ; i < $localStorage['mapZoomLevel'].length; i++) {
                var zoomLevel = $localStorage['mapZoomLevel'][i];
                if (zoomLevel.imageData) {
                    var imageHolder = document.getElementById('zoomImage' + i);
                    imageHolder.src = zoomLevel.imageData;
                    imageHolder.style.width = '128px';
                    imageHolder.style.height = '128px';
                }
            }
        }
    };
    return zoomService;
});
