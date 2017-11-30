angular.module('unionvmsWeb').controller('NewsubscriptionCtrl',function($scope, locale, subscriptionsRestService , Subscription){
    $scope.isNewSubscription = true;
    $scope.subService = subscriptionsRestService;
    /* $scope.vesselSearchItems = [
        {"text": locale.getString('spatial.reports_form_vessels_search_by_vessel'), "code": "asset"},
        {"text": locale.getString('spatial.reports_form_vessels_search_by_group'), "code": "vgroup"}
    ];
    $scope.shared = {
        vesselSearchBy: 'asset',
        searchVesselString: '',
        selectAll: false,
        selectedVessels: 0,
        vessels: [],
        areas: []
    }; */
    $scope.subscription = new Subscription();

    subscriptionsRestService.getFormDetails('1').then(function(response){
        $scope.subscription.fromJson(response);
    }, function(error){
        //TODO deal with error from service
    });
    $scope.subService.getFormComboDetails('2').then(function(response){
        $scope.comboData = response;
    }, function(error){
        //TODO deal with error from service
    });
    $scope.saveSubscription = function(subscription){
        console.log("in save subscription"+JSON.stringify(subscription));
    };
    
});