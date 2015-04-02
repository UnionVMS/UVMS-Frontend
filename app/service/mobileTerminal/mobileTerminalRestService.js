angular.module('unionvmsWeb')
    .factory('mobileTerminalRestFactory',function($resource) {

    return {
        getMobileTerminals : function(){
            $resource('/unionvms-api/sec/active/:mobileterminal');
        },
        getMobileTerminalsWithoutVessels : function(){
            $resource('/mobile-rest/mobile/list');
        }
    };
})
    .service('mobileTerminalRestService',function(mobileTerminalRestFactory, MobileTerminal){
        /*mobileTerminalRestFactory.getMobileTerminalsWithoutVessels().get("",
            function (success) {
                var mobileTerminals = [];
                for (var i = 0; i < success.response.length; i ++) {
                    mobileTerminals.push(new MobileTerminal(success.response[i]));
                }
            },
            function (error) {
            console.log('Unable to get mobile terminals ' + error);
        });*/
    }
);
