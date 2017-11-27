angular.module('unionvmsWeb').controller('NewsubscriptionCtrl',function($scope, subscriptionsRestService , Subscriptions){
    $scope.isNewSubscription = true;
    $scope.subService = subscriptionsRestService;
    $scope.subscriptions = new Subscriptions();
    
    subscriptionsRestService.getFormDetails('1').then(function(response){
        $scope.subscriptionForm = response;
    }, function(error){
        //TODO deal with error from service
    });
    
    $scope.subService.getOrganizationDetails('2').then(function(response){
        $scope.comboData = response;
    }, function(error){
        //TODO deal with error from service
    });
    
    $scope.saveSubscription = function(){
        console.log("in save subscription");
    };
    
});