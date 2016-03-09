angular.module('unionvmsWeb').factory('UserArea',function() {

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
            this.id = parseInt(data.id);
            this.name = data.name;
            this.scopeSelection = data.scopeSelection;
            this.desc = data.areaDesc;
            this.subType = data.subType;
            this.startDate = data.startDate !== '' ? data.startDate : undefined;
            this.endDate = data.endDate !== '' ? data.endDate : undefined;
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