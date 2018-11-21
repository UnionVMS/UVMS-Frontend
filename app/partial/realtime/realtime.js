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
angular.module('unionvmsWeb').controller('RealtimeCtrl', function($scope,loadingStatus, $window, $interval, genericMapService, areaMapService, defaultMapConfigs, projectionService, $log, $mdSidenav, $localStorage, microMovementRestService, movementRestService, vesselRestService, dateTimeService) {

    angular.extend($scope, {
        center: {
            lat: 0,
            lng: 0,
            zoom: 8
        }
    });


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
                getMap().on('click', function(evt){
                    var feature = new ol.Feature(
                        new ol.geom.Point(evt.coordinate)
                    );
                    const myStyle = styles.triangle;
                    feature.setStyle(myStyle);

                    vectorSource.addFeature(feature);
                });
                */

                getPositions().then((positionsByAsset) => {
                    let i = 0;
                    Object.values(positionsByAsset).forEach(positions => {
                        if (positions.map !== undefined) {
                            drawVesselWithSegments(positions[0].asset, positions);
                        }
                    });

                }).catch(error => {
                    console.error('Failed to get positions:', error);
                });
            }
        }, 10);
    });

    function drawVesselWithSegments(asset, positions) {
        // draw segments from positions of the boat
        let color = '#' + intToRGB(hashCode(asset));
        drawSegment(positions, color);
        // draw vessel on top of segments (segments on a seperate layer)        
        var pos = positions[positions.length - 1];
        var posArray = [pos.location.latitude, pos.location.longitude];
        addMarker(posArray, pos.heading, color, asset);
    }

    // Draws a polyline based on positions, takes an array of positions [lat, long]
    function drawSegment(positions, c) {
        var positionData = [];
        positions.map(p => {
            // Draw positions

            /*
            L.circle([p.location.latitude, p.location.longitude], {
                radius: 50,
                color: c,
                positionGuid: p.guid
            }).on('click', onPositionClick).addTo(getMap());
            */

            var feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat( [ p.location.longitude, p.location.latitude ])));
            feature.setStyle(styles.circle);
            vectorSource.addFeature(feature);

            if (!angular.isDefined(positionData[p.asset])) {
                positionData[p.asset] = [];
            }
            positionData[p.asset].push([p.location.longitude, p.location.latitude]);
        });


        var points = [];
        Object.entries(positionData).forEach(p => {
            //var polyline = L.polyline(p[1], {color: c, smoothFactor: 10}).addTo(getMap());

            console.log(p[1]);
            var geom = /*new ol.geom.LineString([points])*/
                new ol.geom.MultiLineString([p[1]])
                //new ol.geom.LineString([ [0, 0], [-8.784296853532169, 51.37259817516915]]);
            geom.transform('EPSG:4326', 'EPSG:3857');

            var featureLine = new ol.Feature({
                geometry: geom
            });

            featureLine.setStyle(styles.line);
            vectorSource.addFeature(featureLine);

        });

    }

    function addMarker(pos, angle, c, assetId) {

        // Creates a red marker with the coffee icon
        var vectorMarker = L.VectorMarkers.icon({
            icon: 'ship',
            markerColor: c,
            iconColor: '#fff',
            extraClasses: 'marker-icon-padding',
        });
/*
        let marker = L.marker(pos, {
            icon: vectorMarker,
            color: c,
            assetId: assetId
        }).bindTooltip("my tooltip text").on('click', onMarkerClick).addTo(getMap());

*/
        var feature = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat( [ pos[1], pos[0] ])));
        feature.setStyle(styles.triangle);
        feature.getStyle().getImage().setRotation(angle);
        vectorSource.addFeature(feature);
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
            if (angular.isDefined($localStorage['realtimeMapData'] && $localStorage['realtimeMapData'].length > 0)) {
                resolve($localStorage['realtimeMapData']);
            }
            else {

                microMovementRestService.getMovementList(dateString).then((positions) => {
                    $localStorage['realtimeMapData'] = positions;
                    resolve(positions);
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
    }
});
