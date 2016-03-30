angular.module('unionvmsWeb').factory('defaultMapConfigs',function() {
	var defaultMapConfigs = {
        map: {
            projection: {
                epsgCode: 3857, //So far we only support 3857 and 4326
                units: 'm',
                global: true,
                axis: 'enu',
                extent: '-20026376.39;-20048966.10;20026376.39;20048966.10'
            },
            control: [{
                type: 'zoom'
            },{
                type: 'drag'
            },{
                type: 'scale',
                units: 'nautical' //Possible values: metric, degrees, nautical, us, imperial
            },{
                type: 'mousecoords',
                epsgCode: 4326,
                format: 'dd' //Possible values: dd, dms, ddm, m
            },{
                type: 'history'
            }],
            tbControl: [{
                type: 'measure'
            },{
                type: 'fullscreen'
            },{
                type: 'mapFishPrint'
            },{
                type: 'bookmarks'
            }]
        }
    };

	return defaultMapConfigs;
});