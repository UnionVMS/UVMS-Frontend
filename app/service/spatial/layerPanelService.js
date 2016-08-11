angular.module('unionvmsWeb').factory('layerPanelService',function() {

	var layerPanelService = {
		panelToReload: [],
		reloadPanels: function(){
			angular.forEach(this.panelToReload,function(func) {
				func();
			});
		}
	};

	return layerPanelService;
});