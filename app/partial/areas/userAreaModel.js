angular.module('unionvmsWeb').factory('UserArea',function() {

    var UserArea = {
        id: undefined,
        name: undefined,
        desc: undefined,
        type: undefined,
        validFrom: undefined,
        validTo: undefined,
        geometry: undefined,
        coordsArray: [],
        coordsProj: undefined,
        reset: function(){
            reset();
        },
        resetGeometry: function(){
            resetGeometry();
        },
        setCoordsFromGeom: function(){
            setCoordsFromGeom();
        }
    };
    
    var reset = function(){
        UserArea.id = undefined;
        UserArea.name = undefined;
        UserArea.desc = undefined;
        UserArea.type = undefined;
        UserArea.validFrom = undefined;
        UserArea.validTo = undefined;
        UserArea.resetGeometry();
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

	return UserArea;
});