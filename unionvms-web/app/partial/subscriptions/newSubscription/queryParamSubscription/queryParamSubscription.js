angular.module('unionvmsWeb').controller('QueryparamsubscriptionCtrl', function ($scope) {
    $scope.period = [{ text: 'hours', code:'hours' }, { text: 'weeks', code:'weeks' }, { text: 'months', code:'months' }];
    $scope.vesselIdTypes = [{ text: 'vessel ID 1', code:'vessel ID 1' }, { text: 'vessel ID 2',code:'vessel ID 2' }, { text: 'vessel ID 3',code:'vessel ID 3' }];
});