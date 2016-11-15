angular.module('unionvmsWeb').controller('DeparturepanelCtrl',function($scope, $state, fishingActivityService, reportFormService){
    $scope.faServ = fishingActivityService;
    $scope.faServ.getData('departure', {}); //FIXME to move to other place
    
    $scope.isLocationClickable = function(){
        var clickable = false;
        if (($state.current.name === 'app.reporting-id' || $state.current.name === 'app.reporting') && reportFormService.currentReport.withMap){
            clickable = true;
        }
        
        return clickable;
    };
    
    $scope.portClickCallback = function(){
        //TODO when we have it running with reports - mainly for hiding/showing stuff
        console.log('This is the click callback');
    }
});