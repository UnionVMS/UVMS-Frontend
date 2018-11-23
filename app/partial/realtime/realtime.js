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
angular.module('unionvmsWeb').controller('RealtimeCtrl', function(
    $rootScope,
    $scope,
    loadingStatus,
    $window,
    $interval,
    genericMapService,
    areaMapService,
    defaultMapConfigs,
    projectionService,
    $log,
    $mdSidenav,
    $localStorage,
    microMovementRestService,
    movementRestService,
    vesselRestService,
    dateTimeService,
    microMovementServerSideEventsService,
    $interval) {

    angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 8
        }
    });

    const MAX_MOVEMENTS_IN_CACHE = 2000;
    const MAX_TIME_FOR_MOVEMENT_IN_CACHE_MS = 1800000;   // 5 hours
    const CHECK_TIME_FOR_MOVEMENT_IN_CACHE_INTERVAL_MS = 900000;  // 15 min

    /*
    $scope.toggleLeft = buildToggler('left');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
    */

    // hide the top bar
    $(document.getElementsByClassName("headercontainer")).hide();

    $($window).resize($scope.updateContainerSize);

    // Listen to the changes of micromovement changes
    $rootScope.$on('event:micromovement', (e, data) => {
        let microMovement = JSON.parse(data);

        let posExists = false;
        let assetExists = false;
        for (let key in $localStorage['realtimeMapData']) {
            if (key === microMovement.asset){
                let value = $localStorage['realtimeMapData'][key];
                assetExists  = true;
                if (value[0].guid !== microMovement.guid) {
                    posExists = true;
                    break;
                }
            }
        }
        if (!assetExists ) {
            $localStorage['realtimeMapData'][microMovement.asset] = [];
        }
        if (!posExists) {
            $localStorage['realtimeMapData'][microMovement.asset].push(microMovement);
        }
        drawVesselWithSegments(microMovement.asset, [microMovement], false);

    });

    let clearRealTimeMapDataCache = $interval(function () {
        clearCacheRealTimeFeatures();
    }, CHECK_TIME_FOR_MOVEMENT_IN_CACHE_INTERVAL_MS);

    var
        vectorSource = new ol.source.Vector(),
        vectorLayer = new ol.layer.Vector({
            source: vectorSource
        });

    var styles = {
        iconStyle: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 46],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
                opacity: 0.75,
                src: './assets/images/close.png'
            }),
            text: new ol.style.Text({
                font: '12px Calibri,sans-serif',
                fill: new ol.style.Fill({color: '#000'}),
                stroke: new ol.style.Stroke({
                    color: '#fff', width: 2
                }),
                text: 'Some text'
            }),
        }),
        square: new ol.style.Style({
                image: new ol.style.RegularShape({
                    fill: new ol.style.Fill({color: '#000'}),
                    stroke: new ol.style.Stroke({
                        color: '#fff', width: 2
                    }),
                    points: 4,
                    radius: 10,
                    angle: Math.PI / 4
                })
        }),
        circle: new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({color: '#000'}),
                stroke: new ol.style.Stroke({
                    color: '#fff', width: 2
                }),
                radius: 5,
            })
        }),
        triangle: new ol.style.Style({
                image: new ol.style.RegularShape({
                    fill: new ol.style.Fill({
                        color: 'red'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 2
                    }),
                    points: 3,
                    radius: 10,
                    rotation: 0,
                    angle: 0
                })
        }),
        line: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            })
        })
    };

    // todo: move to own class
    function deg2rad(degrees) {
        return Math.sin(degrees * Math.PI / 180);
    }

    // todo: move to own class
    function createStyle(styleType, fillColor, strokeColor) {
        let style = null;

        switch (styleType) {
            case 'circle':
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: new ol.style.Fill({color: fillColor}),
                        stroke: new ol.style.Stroke({
                            color: strokeColor, width: 2
                        }),
                        radius: 5,
                    })
                });
            break;
            case 'line':
                style = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: fillColor,
                        width: 2
                    })
                });
            break;
            case 'triangle':
                style = new ol.style.Style({
                    image: new ol.style.RegularShape({
                        fill: new ol.style.Fill({
                            color: fillColor
                        }),
                        stroke: new ol.style.Stroke({
                            color: strokeColor,
                            width: 2
                        }),
                        points: 3,
                        radius: 10,
                        rotation: 0,
                        angle: 0
                    })
                });
            break;
        }
        if (style == null) {
            $log.error('Style type ' + style + '  not supported.');
        }
        return style;
    }

    $scope.updateContainerSize = function (evt) {
        setTimeout(function () {

            var w = angular.element(window);
            if (evt && (angular.element('#realtime.fullscreen').length > 0 ||
                (angular.element('#realtime.fullscreen').length === 0 && evt.type.toUpperCase().indexOf("FULLSCREENCHANGE") !== -1))) {

                $('#realtime').css('height', w.height() - 1 + 'px');
                $('#areaMap').css('height', w.height() - 1 + 'px');
                areaMapService.updateMapSize();
                return;
            }

            var minHeight = 400;
            var headerHeight = angular.element('header')[0].offsetHeight;
            var newHeight = w.height() - headerHeight;

            if (newHeight < minHeight) {
                newHeight = minHeight;
            }


            $('#realtime').css('height', newHeight - 1 + 'px');
            $('#areaMap').css('height', newHeight - 1 + 'px');
            areaMapService.updateMapSize();
        }, 100);

    };

    $scope.stopInitInterval = function () {
        $interval.cancel($scope.initInterval);
        $scope.initInterval = undefined;
        loadingStatus.isLoading('Realtime', false);
    };

    angular.element(document).ready(function () {
        loadingStatus.isLoading('Realtime', true, 0);
        genericMapService.setMapBasicConfigs();
        projectionService.getProjections();

        $($window).resize($scope.updateContainerSize);

        $scope.updateContainerSize();

        initLocalCaches();

        $scope.initInterval = $interval(function () {
            if (!_.isEqual(genericMapService.mapBasicConfigs, {})) {
                areaMapService.setMap();
                getMap().addLayer(vectorLayer);
                $scope.stopInitInterval();
                // get the positions
                /*
                getPositions().then((positionsByAsset) => {
                    let i = 0;
                    // Todo: change to for loop to make faster
                    Object.values(positionsByAsset).forEach(positions => {
                        if (positions.map !== undefined) {
                            drawVesselWithSegments(positions[0].asset, positions, true);
                        }
                    });

                }).catch(error => {
                    console.error('Failed to get positions:', error);
                });
                */

                // draw cached realtime positions
                drawCachedRealtimeFeatures();

                // initialize server side event
                if (!microMovementServerSideEventsService.hasSubscribed()) {
                    microMovementServerSideEventsService.subscribe();
                }
            }
        }, 10);
    });

    function drawVesselWithSegments(asset, positions, drawSegment) {
        let pos = positions[positions.length - 1];
        // draw segments from positions of the boat
        let color = '#' + intToRGB(hashCode(pos.asset));
        if (drawSegment) {
            drawSegment(positions, color);
        }

        // draw vessel on top of segments (segments on a seperate layer)        

        addMarker(pos, deg2rad(pos.heading), color);
    }

    // Draws a polyline based on positions, takes an array of positions [lat, long]
    function drawSegment(positions, c) {
        var positionData = [];
        positions.map(p => {
            var feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat( [ p.location.longitude, p.location.latitude ])));
            var style = createStyle('circle', c, 'white');
            feature.setStyle(style);
            vectorSource.addFeature(feature);

            if (!angular.isDefined(positionData[p.asset])) {
                positionData[p.asset] = [];
            }
            positionData[p.asset].push([p.location.longitude, p.location.latitude]);
        });

        // Add lines
        Object.entries(positionData).forEach(p => {

            var geom = new ol.geom.MultiLineString([p[1]]);
            geom.transform('EPSG:4326', 'EPSG:3857');

            var featureLine = new ol.Feature({
                geometry: geom
            });
            var style = createStyle('line', c, c);

            featureLine.setStyle(style);
            vectorSource.addFeature(featureLine);

        });

    }

    function addMarker(pos, angle, c) {
        let posArray = [pos.location.latitude, pos.location.longitude];
        let feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat( [ posArray[1], posArray[0] ])));

        let style = createStyle('triangle', c, 'white');

        feature.setStyle(style);
        feature.getStyle().getImage().setRotation(angle);
        feature.getStyle().getImage().setOpacity(1);

        if (doesAssetExistinCache(pos.asset)) {
            setFeatureOpacity(pos.guid);
        }
        else {
            $localStorage['realtimeDataAssets'].push(pos.asset);
        }

        if (!doesPositionExistInFeatureCache(pos.guid)) {
            $localStorage['realtimeMapDataFeatures'].push(pos);
        }

        feature['assetId'] = pos.asset;
        feature.setId(pos.guid);

        vectorSource.addFeature(feature);
    }

    function doesAssetExistinCache(assetId) {
        for (let i = 0; i < $localStorage['realtimeDataAssets'].length; i++) {
            if ($localStorage['realtimeDataAssets'][i] === assetId) {
                return true;
            }
        }
        return false;
    }

    function setFeatureOpacity(ignoreId) {
        for (let i = 0; i < $localStorage['realtimeMapDataFeatures'].length; i++) {
            let id = $localStorage['realtimeMapDataFeatures'][i].guid;
            if (id !== ignoreId) {

                let feature = vectorSource.getFeatureById(id);
                if (feature !== null && feature !== undefined) {
                    feature.getStyle().getImage().setOpacity(0.25);
                }
            }
        }

    }


    function drawCachedRealtimeFeatures() {
        for (let i = 0; i < $localStorage['realtimeMapDataFeatures'].length; i++) {
            let pos = $localStorage['realtimeMapDataFeatures'][i];
            if (pos !== null) {
                drawVesselWithSegments(pos.asset, [pos], false);
            }
        }
    }

    function clearCacheRealTimeFeatures() {
        let cacheThresholdTime = Date.now() - MAX_TIME_FOR_MOVEMENT_IN_CACHE_MS;

        for (let i = $localStorage['realtimeMapDataFeatures'].length - 1; i >= 0; i--) {
            let pos = $localStorage['realtimeMapDataFeatures'][i];
            if (pos !== null) {
                let time = new Date(pos.timestamp);
                if (cacheThresholdTime >= time) {
                    console.log('removing item from cache:', $localStorage['realtimeMapDataFeatures'][i]);
                    $localStorage['realtimeMapDataFeatures'].splice(i, 1);
                }
            }
        }
    }

    function doesPositionExistInFeatureCache(guid) {
        for (let i = 0; i < $localStorage['realtimeMapDataFeatures'].length; i++) {
            if ($localStorage['realtimeMapDataFeatures'][i].guid === guid) {
                return true;
            }
        }
        return false;
    }

    function getMap() {
        return areaMapService.map;
    }


    function onLocationFound(e) {
        var radius = e.accuracy / 2;

        L.marker(e.latlng).addTo(getMap())
            .bindPopup("You are within " + radius + " meters from this point").openPopup();

        L.circle(e.latlng, radius).addTo(getMap());
    }

    function onLocationError(e) {
        $log.error(e.message);
    }

    function onMarkerClick(e) {
        let assetId = this.options.assetId;
        if (assetId !== undefined) {
            getAssetInfo(assetId).then((assetInfo) => {
                this.bindPopup(assetId).openPopup();
            });
        }
    }

    function onPositionClick(e) {
        getPosition(this.options.positionGuid).then((movement) => {
            let data = "";
            // format for nicer look
            Object.entries(movement).forEach(m => {
                data += m[0] + ":" + m[1];
            });
            this.bindPopup(data).openPopup();
        });
    }


    function onSegmentClick(e) {
        getSegmentByMovementGuid(this.options.segmentGuid).then((segment) => {
            let data = "";
            // format for nicer look
            Object.entries(segment).forEach(m => {
                data += m[0] + ":" + m[1];
            });
            this.bindPopup(data).openPopup();
        });
    }

    function getPositions() {
        let promise = new Promise(function (resolve, reject) {
            let date = new Date(Date.now() - 86400000).getTime();    // get the positions of the last 30 minutes
            let dateString = dateTimeService.formatUTCDateWithTimezone(dateTimeService.toUTC(date));

            // TODO: put a timeout for the data
            let hasItems = Object.keys($localStorage['realtimeMapData']).length > 0;
            if (angular.isDefined($localStorage['realtimeMapData']) && hasItems) {
                resolve($localStorage['realtimeMapData']);
            }
            else {

                microMovementRestService.getMovementList(dateString).then((positions) => {
                    $localStorage['realtimeMapData'] = positions;
                    resolve($localStorage['realtimeMapData']);
                }).catch(error => {
                    reject(error);
                });
            }


        });

        return promise;

    }

    /**
     * Gets the movement based on the position guid
     */
    function getPosition(positionGuid) {
        let promise = new Promise(function (resolve, reject) {
            let movementInfo;
            if (angular.isDefined($localStorage['realtimeDataMovementsInfo'] && $localStorage['realtimeDataMovementsInfo'].length > 0)) {
                $localStorage['realtimeDataMovementsInfo'].filter(movement => {
                    if (movement[0] === positionGuid) {
                        movementInfo = movement[1];
                        resolve(movementInfo);
                    }
                });
                if (movementInfo == null) {
                    movementRestService.getMovement(positionGuid).then(
                        function (movement) {
                            movementInfo = movement;
                            $localStorage['realtimeDataMovementsInfo'].push([positionGuid, movementInfo]);
                            resolve(movementInfo);
                        },
                        function (error) {
                            $log.error(error);
                            reject(error);
                        }
                    );
                }
            }
        });
        return promise;
    }


    function getAssetInfo(assetId) {
        let promise = new Promise(function (resolve, reject) {

            let assetInfo = null;

            if (angular.isDefined($localStorage['realtimeDataAssets'] && $localStorage['realtimeDataAssets'].length > 0)) {

                $localStorage['realtimeDataAssets'].filter(asset => {
                    if (asset[0] === assetId) {
                        assetInfo = asset[1];
                        resolve(assetInfo);
                    }
                });
                if (assetInfo == null) {
                    vesselRestService.getVessel(assetId).then(
                        function (vessel) {
                            assetInfo = vessel;
                            $localStorage['realtimeDataAssets'].push([assetId, assetInfo]);
                            resolve(assetInfo);
                        },
                        function (error) {
                            $log.error(error);
                            reject(error);
                        }
                    );
                }
            }
        });
        return promise;
    }

    function getSegmentByMovementGuid(guid) {
        let promise = new Promise(function (resolve, reject) {
            let segmentInfo = null;
            if (angular.isDefined($localStorage['realtimeDataSegmentInfo'] && $localStorage['realtimeDataSegmentInfo'].length > 0)) {
                $localStorage['realtimeDataSegmentInfo'].filter(segment => {
                    if (segment[0] === guid) {
                        segmentInfo = segment[1];
                        resolve(segmentInfo);
                    }
                });
                if (segmentInfo == null) {
                    microMovementRestService.getSegmentByMovementGuid(guid).then(
                        function (segment) {
                            segmentInfo = segment;
                            $localStorage['realtimeDataSegmentInfo'].push([guid, segmentInfo]);
                            resolve(segmentInfo);
                        },
                        function (error) {
                            $log.error(error);
                            reject(error);
                        }
                    );
                }
            }
        });
        return promise;
    }

    function getTrackById(guid) {
        let promise = new Promise(function (resolve, reject) {
            let trackInfo = null;
            if (angular.isDefined($localStorage['realtimeDataTrackInfo'] && $localStorage['realtimeDataTrackInfo'].length > 0)) {
                $localStorage['realtimeDataTrackInfo'].filter(track => {
                    if (track[0] === guid) {
                        trackInfo = track[1];
                        resolve(trackInfo);
                    }
                });
                if (trackInfo == null) {
                    microMovementRestService.getTrackById(guid).then(
                        function (track) {
                            trackInfo = track;
                            $localStorage['realtimeDataTrackInfo'].push([guid, trackInfo]);
                            resolve(trackInfo);
                        },
                        function (error) {
                            $log.error(error);
                            reject(error);
                        }
                    );
                }
            }
        });
        return promise;
    }

    // TODO: Move to utils class
    function hashCode(str) { // java String#hashCode
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    function intToRGB(i) {
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    function initLocalCaches() {
        if (!angular.isDefined($localStorage['realtimeDataAssets'])) {
            $localStorage['realtimeDataAssets'] = [];
        }
        if (!angular.isDefined($localStorage['realtimeDataMovementsInfo'])) {
            $localStorage['realtimeDataMovementsInfo'] = [];
        }
        if (!angular.isDefined($localStorage['realtimeDataSegmentInfo'])) {
            $localStorage['realtimeDataSegmentInfo'] = [];
        }
        if (!angular.isDefined($localStorage['realtimeDataTrackInfo'])) {
            $localStorage['realtimeDataTrackInfo'] = [];
        }

        if (!angular.isDefined($localStorage['realtimeMapData'])) {
            $localStorage['realtimeMapData'] = [];
        }
        if (!angular.isDefined($localStorage['realtimeMapDataFeatures'])) {
            $localStorage['realtimeMapDataFeatures'] = [];
        }

    }

    function onRealTimeMapDataUpdated(values) {
        console.log('value updated:', values);
    }

    function refreshRealTimeMapDataFeatures() {
        if (angular.isUndefined($localStorage['realtimeMapDataFeatures'])) {
            return;
        }
        for (let i = 0; i < $localStorage['realtimeMapDataFeatures'].length; i++) {
            let feature = $localStorage['realtimeMapDataFeatures'];

        }
    }
});
