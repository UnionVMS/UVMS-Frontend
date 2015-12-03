angular.module('unionvmsWeb').factory('Area',function() {
    
    function Area(){
        this.gid = undefined;
        this.areaType = undefined;
        this.name = undefined;
        this.code = undefined;
        this.extent = undefined;
    }
	
    Area.prototype.fromJson = function(data){
        var area = new Area();
        
        area.gid = parseInt(data.gid);
        area.areaType = data.areaType;
        area.name = data.name;
        area.code = data.code;
        area.extent = data.extent;
        return area;
    };
    
//    Area.prototype.fromGeoJson = function(data){
//        //TODO
//    };

	return Area;
});