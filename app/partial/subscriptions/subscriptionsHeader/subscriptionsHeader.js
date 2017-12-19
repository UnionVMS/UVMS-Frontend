angular.module('unionvmsWeb').controller('SubscriptionsheaderCtrl',function($scope, subscriptionsService, locale){
    $scope.subServ = subscriptionsService;
    /*$scope.getTitle = function(){
        {{'subscriptions.pagemenu_new_subscription' | i18n }}
    }*/
});