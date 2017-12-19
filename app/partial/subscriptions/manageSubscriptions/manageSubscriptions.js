angular.module('unionvmsWeb').controller('ManagesubscriptionsCtrl',function($scope, subscriptionsService){
    $scope.subServ = subscriptionsService;

    function init(){
        $scope.subServ.layoutStstus.isForm = false;
    }

    init();
});