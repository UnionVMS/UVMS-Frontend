angular.module('unionvmsWeb')
    .controller('addNewVesselCtrl', function($scope, $http){

        $scope.dummydata = { "active": true,
            "source": "EU",
            "name": "Grodan Boll",
            "countryCode": "SWE123",
            "vesselType": "VESSEL-TYPE: 123",
            "hasIrcs": true,
            "ircs": "IRCS-123",
            "externalMarking": "MARKING1",
            "cfr": "CFR123",
            "imo": "Not supported",
            "mmsiNo": "Not supported",
            "billing": "Not supported",
            "hasLicense": true,
            "homePort": "PORT123",
            "lengthOverAll": 125.5,
            "lengthBetweenPerpendiculars": 123.5,
            "grossTonnage": 123.5,
            "otherGrossTonnage": 134.5,
            "safetyGrossTonnage": 177.3,
            "powerMain": 709.2,
            "powerAux": 246.4};



        $scope.postNewVessel = function(){
            console.log("Posting to server...");

           // $http.defaults.headers.common['access-control-allow-headers'] = '*';
           // $http.defaults.headers.post['Content-Type'] = 'application/json';

            /*         var req = {
                         method: 'POST',
                         url: 'http://livm67u:28080/vessel-rest/vessel',
                         headers: {
                             'Content-Type': 'application/json'}
                         },
                         data: {
                             "active": true,
                             "source": "EU",
                             "name": "Kalle Stropp",
                             "countryCode": "SWE123",
                             "vesselType": "VESSEL-TYPE: 123",
                             "hasIrcs": true,
                             "ircs": "IRCS-123",
                             "externalMarking": "MARKING1",
                             "cfr": "CFR123",
                             "imo": "Not supported",
                             "mmsiNo": "Not supported",
                             "billing": "Not supported",
                             "hasLicense": true,
                             "homePort": "PORT123",
                             "lengthOverAll": 125.5,
                             "lengthBetweenPerpendiculars": 123.5,
                             "grossTonnage": 123.5,
                             "otherGrossTonnage": 134.5,
                             "safetyGrossTonnage": 177.3,
                             "powerMain": 709.2,
                             "powerAux": 246.4 }
                     };

                     $http(req).success(onPostSuccess,onPostError);*/


           $http.post('http://livm67u:28080/vessel-rest/vessel',$scope.dummydata)
                .then(onPostSuccess,onPostError);

            console.log("Wating response...");
        };

        $scope.setVesselData = function(){
            var country = {}, activitytype = {}, irc = {}, license = {};
            country = $scope.selectedCountry;
            activitytype = $scope.selectedActivityType;
            irc = $scope.selectedIrcs;
            license = $scope.selectedLicense;

            $scope.newVessesel.country = country.code;
            $scope.newVessesel.type = activitytype.code;
            $scope.newVessesel.ircs = irc.code;
            $scope.newVessesel.license = license.code;

        };

        /* selects*/
        $scope.vesselcountries =[{'name':'Swe','code':'46'},{'name':'DK','code':'47'},{'name':'NOR','code':'48'}];
        $scope.vesselactivitytypes =[{'name':'Fishing','code':'1124'},{'name':'Dock','code':'001'},{'name':'Trawling','code':'002'}];
        $scope.vesselircstypes =[{'name':'YES','code':'1'},{'name':'NO','code':'0'}];
        $scope.vessellicenstypes =[{'name':'YES','code':'1'},{'name':'NO','code':'0'}];


            $scope.newVessesel = {
            'id':'',
            'name':'',
            'cfr':'',
            'imo':'',
            'lenght':'',
            'overall':'',
            'country':'',
            'type':'',
            'mmsio':'',
            'billing':'',
            'capacity':'',
            'city':'',
            'ircs':'',
            'extra':'',
            'extmarking':'',
            'license':'',
            'homeport':'',
            'power':'',
            'effect':''
        };


        var onPostSuccess = function(response){
            console.log("Post successfull");
        };

        var onPostError = function(error){
            console.log("Error...");
        };

    })
    .directive('addnewvessel', function() {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'directive/addnewvessel/addnewvessel.html'

	};
});

