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
angular.module('unionvmsWeb').controller('RealtimeCtrl',function($scope, microMovementRestService, dateTimeService){

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

    function drawVesselWithSegments(vesselId, positions) {
        // draw segments from positions of the boat
        drawPolyLine(positions, 'red');
        // draw vessel on top of segments (segments on a seperate layer)
        addMarker(positions[0], "<b>" + vesselId + "</b>");

    }

    function addMarker(pos, popupInfoText) {
        let marker = L.marker(pos).addTo(map);
        if (popupInfoText !== undefined) {
            marker.bindPopup(popupInfoText).openPopup();
        }
    }

    // Draws a polyline based on positions, takes an array of positions [lat, long]
    function drawPolyLine(positions, color) {
        var polyline = L.polyline(positions, {color : color}).addTo(map);
    }

    function getPositions() {
        let promise = new Promise(function(resolve, reject) {
            let date = new Date(Date.now() - 1800000).getTime();    // get the positions of the last 30 minutes
            let dateString = dateTimeService.formatUTCDateWithTimezone(dateTimeService.toUTC(date));
            microMovementRestService.getPositionList(dateString, (positions) => {
                console.log(positions);
                resolve(positions);
            }).catch(error => {
                reject(error);
            });
        });

        return promise;

    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    // locate ourselves
    map.locate({setView: true, maxZoom: 8});


    // get the positions
    getPositions().then((positions) => {
        // Create markers per boat

        console.log(positions);
        // draw segments
    }).catch(error => {
        console.error('Failed to get positions:', error);
    });
    //addMarker([0, 0], "This is the boat!");

    var popup = L.popup();

});

