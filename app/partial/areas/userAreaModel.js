/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name UserArea
 * @param unitConversionService {service} unit conversion service
 * @description
 *  A factory that returns UserArea class to allow the definition of user areas, including vectorial geometry and attributes. 
 */
angular.module('unionvmsWeb').factory('UserArea',function(unitConversionService) {
    /**
     * Creates a new User Area
     * 
     * @memberof UserArea
     * @class
     */
    var UserArea = {
        id: undefined,
        name: undefined,
        desc: undefined,
        subType: '',
        scopeSelection: [],
        startDate: undefined,
        endDate: undefined,
        geometry: undefined,
        coordsArray: [],
        coordsProj: undefined,
        centroidCoords: [],
        centroidProj: undefined,
        datasetName: undefined,
        reset: function(){
            reset();
        },
        resetGeometry: function(){
            resetGeometry();
        },
        setCoordsFromGeom: function(){
            setCoordsFromGeom();
        },
        setCoordsFromObj: function(geomObj){
            setCoordsFromObj(geomObj);
        },
        setCentroidCoords: function(coords){
            this.centroidCoords = coords;
        },
        resetCentroid: function(){
            resetCentroid();
        },
        setPropertiesFromJson: function(data){
            var id = parseInt(data.id);
            this.id = isNaN(id) ? parseInt(data.gid) : id;  
            this.name = data.name;
            this.scopeSelection = data.scopeSelection;
            this.desc = data.areaDesc;
            this.subType = data.subType;
            this.startDate = data.startDate !== '' ? unitConversionService.date.convertDate(data.startDate, 'from_server') : undefined;
            this.endDate = data.endDate !== '' ? unitConversionService.date.convertDate(data.endDate, 'from_server') : undefined;
            this.datasetName = data.datasetName;
        }
    };
    
    var reset = function(){
        UserArea.id = undefined;
        UserArea.name = undefined;
        UserArea.desc = undefined;
        UserArea.subType = undefined;
        UserArea.startDate = undefined;
        UserArea.endDate = undefined;
        UserArea.scopeSelection = [];
        UserArea.resetGeometry();
        UserArea.resetCentroid();
        UserArea.datasetName = undefined;
    };
    
    var resetGeometry = function(){
        UserArea.geometry = undefined;
        UserArea.coordsArray = [];
    };
    
    var setCoordsFromGeom = function(){
        var coords = UserArea.geometry.getCoordinates()[0];
        coords.pop();
        UserArea.coordsArray = coords; 
    };
    
    var setCoordsFromObj = function(geomObj){
        var coords = geomObj.getCoordinates()[0];
        coords.pop();
        UserArea.coordsArray = coords;
    };
    
    var resetCentroid = function(){
        UserArea.centroidCoords = [];
    };

	return UserArea;
});