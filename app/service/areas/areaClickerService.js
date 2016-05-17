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
                areaAlertService.setError()
                areaAlertService.alertMessage = locale.getString('areas.error_searching_areas');
            });
        }
	};

	return areaClickerService;
});