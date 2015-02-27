angular.module('unionvmsWeb')
    .controller('newVesselCtrl', function ($scope, $http) {

        $scope.removeNewMobileSystem = function (item) {
            $scope.newVesselObj.mobileTerminals.splice(item, 1);
        };

        $scope.addNewMobileTerminalToNewVessel = function () {

            if ($scope.newVesselObj.mobileTerminals === undefined) {
                $scope.newVesselObj.mobileTerminals = [];
            }
            $scope.newVesselObj.mobileTerminals.push({
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


        $scope.newVesselObj = {
            "active": true,
            "billing": "Not supported",
            "cfr": null,
            "countryCode": null,
            "externalMarking": null,
            "grossTonnage": null,
            "hasIrcs": false,
            "hasLicense": false,
            "homePort": null,
            "imo": "Not supported",
            "internalId": null,
            "ircs": null,
            "lengthBetweenPerpendiculars": null,
            "lengthOverAll": null,
            "mmsiNo": "Not supported",
            "name": null,
            "otherGrossTonnage": null,
            "powerAux": null,
            "powerMain": null,
            "safetyGrossTonnage": null,
            "source": "LOCAL",
            "vesselType": null
        };

    })
    .directive('newvessel', function () {
        return {
            restrict: 'E',
            replace: true,

            templateUrl: 'directive/newvessel/newvessel.html',
            link: function (scope, element, attrs, fn) {


            }
        };
    });
