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
angular.module('unionvmsWeb').controller('RealtimeCtrl', function($scope, $mdSidenav, microMovementRestService, dateTimeService){
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
        addMarker(positions[positions.length-1], color, asset);

    }

    function addMarker(pos, c, assetId) {
        //var myIcon = L.divIcon({className: 'svg-div-icon', iconSize: [48, 64]});
        var svgUrl = './assets/images/map-marker.svg'; // insert your own svg

        var svgType = 'image/svg+xml';
        
        var icon = L.icon({
            iconUrl: svgUrl,
            iconSize: [38, 95],
            iconAnchor: [22, 46],
            popupAnchor: [-3, -76]
        });
        // Creates a red marker with the coffee icon
        var vectorMarker = L.VectorMarkers.icon({
            icon: 'ship',
            markerColor: c,
            iconColor: '#fff',
            extraClasses: 'marker-icon-padding',
        });
        let marker = L.marker(pos, { icon: vectorMarker,  color: c}).addTo(map);

        /*
        // using svg icons, slow performance
        //replace the outerhtml with svg object         
        let previousStyle = marker._icon.style;
        let markerId = 'marker_' + assetId;
        marker._icon.outerHTML = "<object id='" + markerId + "' type='" + svgType + "' data='" + svgUrl +"' class='leaflet-marker-icon leaflet-zoom-animated leaflet-interactive' style='" + previousStyle.cssText + "'>";        
        

        let markerElement = document.getElementById(markerId);
        
        if (markerElement !== null && markerElement !== undefined) {
            
            markerElement.addEventListener('load', function(){
                let svgElement = document.getElementById(markerId).contentDocument.firstChild;
                svgElement.setAttribute('fill', c);
            });
        }
        */

        if (assetId !== undefined) {
            marker.bindPopup(assetId).openPopup();
        }
    }

    // Draws a polyline based on positions, takes an array of positions [lat, long]
    function drawPolyLine(positions, c) {
        var polyline = L.polyline(positions, {color : c, smoothFactor: 10}).addTo(map);
        positions.forEach(p => {
            L.circle(p, { radius: 50, color: c}).addTo(map);
        });
    }    

    function getPositions() {
        let promise = new Promise(function(resolve, reject) {
            let date = new Date(Date.now() - 86400000).getTime();    // get the positions of the last 30 minutes
            let dateString = dateTimeService.formatUTCDateWithTimezone(dateTimeService.toUTC(date));
            
            microMovementRestService.getPositionList(dateString).then((positions) => {
                resolve(positions);
            }).catch(error => {
                reject(error);
            });
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

    // move to utils class
    Array.prototype.groupBy = function(prop) {
        return this.reduce(function(groups, item) {
            const val = item[prop];
            groups[val] = groups[val] || [];
            groups[val].push(item);
            return groups;
        }, {});
    };

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // locate ourselves
    map.locate({setView: true, maxZoom: 8});

    // store local cache for last n minutes...

    // get the positions

    getPositions().then((positionsByAsset) => {
        // group positions by asset
        //let positionsByAsset = positions.groupBy('asset');
        console.log(positionsByAsset);

        let i = 0;
        Object.values(positionsByAsset).forEach(value => {
            
            let locations = [];

            if (value.map !== undefined) {
                
                value.map((v) => {
                    let location = [v.location.latitude, v.location.longitude];
                    locations.push(location);
                });            
                drawVesselWithSegments(value[0].asset, locations);   
            }
        });

    }).catch(error => {
        console.error('Failed to get positions:', error);
    });


});

