angular.module('unionvmsWeb').factory('spatialHelperService',function() {

	var spServ = {
	    tbControl: {
	        measure: false,
	        fullscreen: false,
	        print: false
	    },
	    measure: {
	        units: 'm',
	        speed: undefined,
	        startDate: undefined,
	        disabled: false
	    },
	    print: {
	        exportFormat: 'png',
	        layout: 'portrait',
	        title: undefined,
	        portrait: {
	            title: {
	                top: 20
	            },
	            footer: {
	                bottom: 290,
	                left: 10,
	                right: 160
	            },
	            mapSize: {
	                maxWidth: 190,
	                maxHeight: 250
	            }
	        },
	        landscape: {
	            title: {
                    left: 10,
                    top: 20
                },
                footer: {
                    bottom: 200,
                    left: 10,
                    right: 246
                },
                mapSize: {
                    maxWidth: 275,
                    maxHeight: 165
                }
	        }
	    }
	};
	
	spServ.setToolbarControls = function(config){
	    for (var i = 0; i < config.map.tbControl.length; i++){
	        spServ.tbControl[config.map.tbControl[i].type] = true;
	    }
	};

	return spServ;
});