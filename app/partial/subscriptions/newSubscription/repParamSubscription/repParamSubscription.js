angular.module('unionvmsWeb').controller('RepparamsubscriptionCtrl',function($scope){
    $scope.reportParams = {
        original: {
            type: 'original'
        },
        newReport: {
            type: 'new',
            vesselIdTypes: []
        }
    };

    $scope.vesselIdTypes = [
        'ICCAT',
        'CFR',
        'IRCS'
    ];

});