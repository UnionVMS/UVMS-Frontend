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
angular.module('unionvmsWeb').controller('RealtimeCtrl', function($scope, $log, $mdSidenav, $localStorage, microMovementRestService, movementRestService, vesselRestService, dateTimeService){
    $scope.toggleLeft = buildToggler('left');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
    // hide the top bar
    $(document.getElementsByClassName("headercontainer")).hide();




    var map = L.map('mapid').fitWorld();

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoiam9ubnltMjAxOCIsImEiOiJjam84bGYzcDMwYjJxM3FveG0wZXRlNWt5In0.epB2eTO4dOa4NY-dVuntXg', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map);



    function onLocationFound(e) {
        var radius = e.accuracy / 2;

        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();

        L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
        alert(e.message);
    }

    function drawVesselWithSegments(asset, positions) {
        // draw segments from positions of the boat
        let color = '#' + intToRGB(hashCode(asset));
        drawPolyLine(positions,  color);
        // draw vessel on top of segments (segments on a seperate layer)
        var pos = positions[positions.length-1];
        var posArray = [pos.location.latitude, pos.location.longitude];
        addMarker(posArray, color, asset);

    }

    function addMarker(pos, c, assetId) {
        
        // Creates a red marker with the coffee icon
        var vectorMarker = L.VectorMarkers.icon({
            icon: 'ship',
            markerColor: c,
            iconColor: '#fff',
            extraClasses: 'marker-icon-padding',
        });

        let marker = L.marker(pos, { icon: vectorMarker,  color: c, assetId: assetId}).on('click', onMarkerClick).addTo(map);
       
        
    }

    function onMarkerClick(e) {
        let assetId = this.options.assetId;
        if (assetId !== undefined) {
            getAssetInfo(assetId).then((assetInfo) => {
               this.bindPopup(assetId).openPopup();
            });
        }
    }


    // Draws a polyline based on positions, takes an array of positions [lat, long]
    function drawPolyLine(positions, c) {
        var positionData = [];
        positions.map(p => {
            // Draw positions
            
            L.circle([p.location.latitude, p.location.longitude], { radius: 50, color: c, positionGuid: p.guid}).on('click', onPositionClick).addTo(map);
            
            if (!angular.isDefined(positionData[p.asset])) {
                positionData[p.asset] = [];
            }
            positionData[p.asset].push([p.location.latitude, p.location.longitude]);
        });

        Object.entries(positionData).forEach(p => {
            var polyline = L.polyline(p[1], {color : c, smoothFactor: 10}).addTo(map);
        });        
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

    function getPositions() {
        let promise = new Promise(function(resolve, reject) {
            let date = new Date(Date.now() - 86400000).getTime();    // get the positions of the last 30 minutes
            let dateString = dateTimeService.formatUTCDateWithTimezone(dateTimeService.toUTC(date));

            // TODO: put a timeout for the data 
            if (!angular.isDefined($localStorage['realtimeMapData'])) {
                microMovementRestService.getPositionList(dateString).then((positions) => {
                    $localStorage['realtimeMapData'] = positions;                    
                    resolve(positions);
                }).catch(error => {
                    reject(error);
                });
            }
            else {
                resolve($localStorage['realtimeMapData']);
            }

            
        });

        return promise;

    }

    /**
     * Gets the movement based on the position guid
     */
    function getPosition(positionGuid) {
        let promise = new Promise(function(resolve, reject) {
            let movementInfo;
            if (angular.isDefined($localStorage['realtimeDataMovementsInfo'])) {                    
                $localStorage['realtimeDataMovementsInfo'].filter(movement => {
                    if (movement[0] === positionGuid) {
                        movementInfo = movement[1];
                        resolve(movementInfo);
                    }
                });
                if (movementInfo == null) {
                    movementRestService.getMovement(positionGuid).then(
                        function(movement) {
                            movementInfo = movement;
                            $localStorage['realtimeDataMovementsInfo'].push([positionGuid, movementInfo]);
                            resolve(movementInfo);
                        },
                        function(error){
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
        let promise = new Promise(function(resolve, reject) {

            let assetInfo = null;
            
            if (angular.isDefined($localStorage['realtimeDataAssets'])) {
                
                $localStorage['realtimeDataAssets'].filter(asset => {
                    if (asset[0] === assetId) {
                        assetInfo = asset[1];
                        resolve(assetInfo);
                    }
                });
                if (assetInfo == null) {
                    vesselRestService.getVessel(assetId).then(
                        function(vessel) {
                            assetInfo = vessel;
                            $localStorage['realtimeDataAssets'].push([assetId, assetInfo]);
                            resolve(assetInfo);
                        },
                        function(error){
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
    
    function intToRGB(i){
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
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // locate ourselves
    map.locate({setView: true, maxZoom: 8});

    // store local cache for last n minutes...
    initLocalCaches();
    // get the positions

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


});

