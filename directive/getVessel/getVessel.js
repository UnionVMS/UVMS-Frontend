angular.module('unionvmsWeb')
    .controller('getVesselCtrl', function($scope){

        $scope.addNewMobileTerminalToVessel = function () {

            if ($scope.selectedVessel.mobileTerminals === undefined) {
                $scope.selectedVessel.mobileTerminals = [];
            }
            $scope.selectedVessel.mobileTerminals.push({
                "satelliteSystem": [
                    {
                        "name": 'inmarsat-C',
                        "code": '001'
                    },
                    {
                        "name": 'inmarsat-B',
                        "code": '002'
                    }
                ],
                "oceanRegions": [
                    {
                        "name": 'AORE',
                        "code": '001'
                    },
                    {
                        "name": 'EPOC',
                        "code": '002'
                    }
                ],
                'transeiverType': '',
                'serialNo': '',
                'softvareVersion': '',
                'antenna': '',
                'satelliteNo': '',
                'anserBack': '',
                'installedBy': '',
                'installedOn': '',
                'startedOn': '',
                'uninstalledOn': ''
            });
        };



        $scope.countrySelected = function(item){
            $scope.vesselCountry = item.name;
            $scope.selectedVessel.countryCode = item.name;
        };
        $scope.activitySelected = function(item){
            $scope.vesselActivity = item.name;
            $scope.selectedVessel.vesselType = item.name;
        };
        $scope.ircSelected = function(item){
            $scope.vesselIrc = (item.code === "1");
            $scope.selectedVessel.hasIrcs = (item.code === "1");
        };

        $scope.removeMobileSystem = function(item, idx){
            if (idx >= idx){
                $scope.selectedVessel.mobileTerminals.splice(idx,1);
            }
            };

        $scope.changeVesselStatus = function(){
            $scope.selectedVessel.active = $scope.selectedVessel.active === true ? false : true;
        };

    })

    .directive('getvessel', function() {
	return {
		restrict: 'E',
		replace: true,


		templateUrl: 'directive/getVessel/getVessel.html',
		link: function(scope, element, attrs, fn) {


		}
	};
});
