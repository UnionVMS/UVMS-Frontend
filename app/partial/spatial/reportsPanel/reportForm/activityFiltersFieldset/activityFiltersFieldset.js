/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name ActivityfiltersfieldsetCtrl
 * @param $scope {Service} controller scope
 * @description
 *  The controller for the activity filters fieldset
 */
angular.module('unionvmsWeb').controller('ActivityfiltersfieldsetCtrl',function($scope){

    //TODO replace the mocks when the REST service is ready
    $scope.reportTypes = [{
        code: 'NOTIFICATION', text: 'Notification'
    },{
        code: 'DECLARATION', text: 'Declaration'
    }];

    //TODO replace the mocks when the REST service is ready
    $scope.activityTypes = [{
        code: 'DEPARTURE', text: 'Departure'
    },{
        code: 'LANDING', text: 'Landing'
    },{
        code: 'ARRIVAL', text: 'Arrival'
    },{
        code: 'FISHING_OPERATION', text: 'Fishing operation'
    }];

    //TODO replace the mocks when the REST service is ready
    /*$scope.ports = [{
        code: 'PORT1', text: 'PORT1'
    },{
        code: 'PORT2', text: 'PORT2'
    },{
        code: 'PORT3', text: 'PORT3'
    },{
        code: 'PORT4', text: 'PORT4'
    }];*/

    //TODO replace the mocks when the REST service is ready
    $scope.gearTypes = [{
        code: 'GNS', text: 'Set gillnets (anchored)'
    },{
        code: 'GND', text: 'Driftnets'
    },{
        code: 'GNC', text: 'Encircling gillnets'
    },{
        code: 'GTR', text: 'Combined gillnets-trammel nets'
    }];

    //TODO replace the mocks when the REST service is ready
    /*$scope.species = [{
        code: 'SOL', text: 'SOL'
    },{
        code: 'COD', text: 'COD'
    },{
        code: 'LEM', text: 'LEM'
    },{
        code: 'TUR', text: 'TUR'
    }];*/

    //TODO replace the mocks when the REST service is ready
    $scope.weightUnits = [{
        code: 'kg', text: 'Kg'
    },{
        code: 'ton', text: 'Ton'
    }];

});