angular.module('unionvmsWeb').factory('Area',function() {
    
    function Area(){
        this.gid = undefined;
        this.areaType = undefined;
        this.name = undefined;
        this.desc = undefined;
        this.code = undefined;
        this.extent = undefined;
    }
	
    Area.prototype.fromJson = function(data){
        var area = new Area();
        
        var gid = data.gid;
        if (!angular.isDefined(data.gid)){
            gid = data.id;
        }
        
        area.gid = parseInt(gid);
        area.areaType = data.areaType;
        area.name = data.name;
        area.desc = data.desc;
        area.code = data.code;
        area.extent = data.extent;
        return area;
    };

	return Area;
});