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
