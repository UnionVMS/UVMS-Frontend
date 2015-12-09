angular.module('unionvmsWeb').controller('ManualmovementlistCtrl',function($scope, globalSettingsService){

	$scope.speedUnit = globalSettingsService.getSpeedUnit();

});