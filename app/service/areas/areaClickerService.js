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
angular.module('unionvmsWeb').factory('areaClickerService',function(areaAlertService, spatialRestService, Area, locale) {

	var areaClickerService = {
	    active: false,
        layerType: undefined,
        clickResults: 0,
        data: [],
        clearData: function(){
            this.data = [];
        },
        deactivate: function(){
            this.active = false;
            this.layer = undefined;
            this.clickResults = 0;
            this.clearData();
        },
        getDataFromMap: function(payload){
            areaAlertService.setLoading(locale.getString('areas.getting_area'));
            var self = this;
            self.clearData();
            self.clickResults = 0;
            spatialRestService.getAreaDetails(payload).then(function(response){
                self.clickResults = response.data.length;
                for (var i = 0; i < response.data.length; i++){
                    var area = new Area();
                    area = area.fromJson(response.data[i]);
                    self.data.push(area);
                }
                areaAlertService.removeLoading();
            }, function(error){
                areaAlertService.removeLoading();
                areaAlertService.setError();
                areaAlertService.alertMessage = locale.getString('areas.error_searching_areas');
            });
        }
	};

	return areaClickerService;
});