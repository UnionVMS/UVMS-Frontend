//angular.module('unionvmsWeb').factory('vessel',function() {

//	var vessel = {};

//	return vessel;
//});

(function(){
    var vessel = function($http, $log){

         var getDummyDataFromGithub = function(){
            return $http.get("https://api.github.com/users/angular")
                .then(function(response){
                    return response.data;
                },
                function(reason){
                    return reason.data;
                });
         };
//  return $http.get("http://livm67u:28080/vessel-rest/vessel/list")
        var getVesselList = function(){
            return $http.get("http://livm67u:28080/vessel-rest/vessel/list");
             //  .then(onvesselComplete,onError);
        };

      /* */ var onError = function(reason){

            $log.write("something when trying to get vessels");
            return "Something triggered an error...";

        };

        var onvesselComplete = function(response){
            return response;
        };

        var createdummies = function(){
            return  [
                {
                    'id': '232',
                    'name': 'Josefin',
                    'state': 'UK',
                    'extno': 'VG-40',
                    'type':'Fishing',
                    'signal':'SKRM',
                    'comm':'Inmarsat-C',
                    'memberno':'104',
                    'terminals':[
                        {
                            'id':'92X3',
                            'terminalname':'CFR43'
                        },
                        {
                            'id':'322X3',
                            'terminalname':'CFR43'
                        }
                    ],
                    'lastreport':'1'
                },
                {
                    'id': '664',
                    'name': 'Helga',
                    'state': 'SWE',
                    'extno': 'VH-40',
                    'type':'Dock',
                    'signal':'SKRM',
                    'comm':'Inmarsat-C',
                    'memberno':'893',
                    'terminals':[
                        {
                            'id':'66I3',
                            'terminalname':'CF66A'
                        },
                        {
                            'id':'X55',
                            'terminalname':'CFR533'
                        },
                        {
                            'id':'HIF',
                            'terminalname':'LOWR'
                        }
                    ],
                    'lastreport':'1'
                },
                {
                    'id': '948',
                    'name': 'Lisa',
                    'state': 'SWE',
                    'extno': 'VH-46',
                    'type':'Fishing',
                    'signal':'SKRM',
                    'comm':'Inmarsat-C',
                    'memberno':'893',
                    'terminals':[
                        {
                            'id':'X556',
                            'terminalname':'IFOR'
                        }
                    ],
                    'lastreport':'2'
                },
                {
                    'id': '492',
                    'name': 'Ester',
                    'state': 'UK',
                    'extno': 'VH-66',
                    'type':'Anchor',
                    'signal':'SKER',
                    'comm':'Inmarsat-B',
                    'memberno':'9932',
                    'terminals':[
                        {
                            'id':'F156',
                            'terminalname':'SFOR'
                        },{
                            'id':'XJ46',
                            'terminalname':'GFGD'
                        }
                    ],
                    'lastreport':'8'
                },
                {
                    'id': '3112',
                    'name': 'LAX',
                    'state': 'ROU',
                    'extno': 'VG-40',
                    'type':'Anchor',
                    'signal':'SKER',
                    'comm':'Inmarsat-B',
                    'memberno':'9132',
                    'terminals':[
                        {
                            'id':'G156',
                            'terminalname':'RO32'
                        },{
                            'id':'JAS39',
                            'terminalname':'ROU332'
                        }
                    ],
                    'lastreport':'4'
                }
            ];

        };

        var getVessels = function(){
            var result = createdummies();
            var i = 0;
            for (i = 0; i < 20; i++)
            {
                var x = createdummies();
                var index = 0;

                for(index = 0; index < x.length; index++){
                    x[index]["id"] = x[index]["id"] + Math.floor((Math.random() * 999) + 1);
                    result.push(x[index]);
                }

            }
            return result;
        };

        return{
            getDummyDataFromGithub : getDummyDataFromGithub,
            getVessels : getVessels,
            getVesselList: getVesselList
        };
    };

    var module = angular.module('unionvmsWeb');
    module.factory('vessel',vessel);

}());
