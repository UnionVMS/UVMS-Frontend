angular.module('unionvmsWeb').controller('UserpreferencespanelCtrl',function($scope, $anchorScroll){

    $scope.isVisible = {
           report: true,
           userPreferences: false
   };
   
   $scope.toggleUserPreferences = function(){
       $scope.isVisible.report = !$scope.isVisible.report;
       $scope.isVisible.userPreferences = !$scope.isVisible.userPreferences;
       $anchorScroll();
       
       //Call function from parent to toggle menu visibility
       $scope.toggleMenuVisibility();
       
       if($scope.isVisible.report === true){
           $scope.$emit('closeUserPreferences', $scope.previousSelection)
       }
   };
   
   $scope.$on('loadUserPreferences', function(serviceName, previousSelection){
       $scope.toggleUserPreferences();
       $scope.previousSelection = previousSelection;
   });
    
});