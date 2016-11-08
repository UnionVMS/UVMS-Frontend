angular.module('unionvmsWeb').controller('ActivityfiltersfieldsetCtrl',function($scope){

    $scope.reportTypes = [{
        code: 'NOTIFICATION', text: 'Notification'
    },{
        code: 'DECLARATION', text: 'Declaration'
    }];

    $scope.activityTypes = [{
        code: 'DEPARTURE', text: 'Departure'
    },{
        code: 'ARRIVAL', text: 'ARRIVAL'
    },{
        code: 'AREA_ENTRY', text: 'AREA_ENTRY'
    },{
        code: 'AREA_EXIT', text: 'AREA_ENTRY'
    }];

    $scope.ports = [{
        code: 'PORT1', text: 'PORT1'
    },{
        code: 'PORT2', text: 'PORT2'
    },{
        code: 'PORT3', text: 'PORT3'
    },{
        code: 'PORT4', text: 'PORT4'
    }];

    $scope.gearTypes = [{
        code: 'GNS', text: 'Set gillnets (anchored)'
    },{
        code: 'GND', text: 'Driftnets'
    },{
        code: 'GNC', text: 'Encircling gillnets'
    },{
        code: 'GTR', text: 'Combined gillnets-trammel nets'
    }];

    $scope.species = [{
        code: 'SOL', text: 'SOL'
    },{
        code: 'COD', text: 'COD'
    },{
        code: 'LEM', text: 'LEM'
    },{
        code: 'TUR', text: 'TUR'
    }];

    $scope.weightUnits = [{
        code: 'Kg', text: 'Kg'
    },{
        code: 'Ton', text: 'Ton'
    }];

});