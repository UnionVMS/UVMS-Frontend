/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
angular.module('unionvmsWeb').controller('NewsubscriptionCtrl',function($scope, locale, subscriptionsRestService , Subscription){
    $scope.isNewSubscription = true;
    $scope.subService = subscriptionsRestService;
    $scope.vesselSearchItems = [
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
    };
    $scope.selectedAreas = [];
    $scope.saveSubscription = function(){
        $scope.report.areas = $scope.exportSelectedAreas();
        console.log("$scope.report"+JSON.stringify($scope.report));
        
    };

    $scope.exportSelectedAreas = function(){
        var exported = [];
        for (var i = 0; i < $scope.selectedAreas.length; i++){
            var area = {
                gid: parseInt($scope.selectedAreas[i].gid),
                areaType: $scope.selectedAreas[i].areaType    
            };
            exported.push(area);
        }
        
        return exported;
    };

/*  $scope.clearSearchProps = function(){
        $scope.shared.searchVesselString = undefined;
        $scope.shared.vessels = [];
    }; */
    function init(){

        $scope.subscription = new Subscription();
        $scope.subscription.showqueryParam = false;
        $scope.subService.getFormDetails('1').then(function(response){
            $scope.subscription.fromJson(response);
            $scope.report = $scope.subscription;
        }, function(error){
            //TODO deal with error from service
        });
        $scope.subService.getFormComboDetails('2').then(function(response){
            $scope.comboData = response;
        }, function(error){
            //TODO deal with error from service
        });
        
    }
    init();
});