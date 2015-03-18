angular.module('unionvmsWeb')
    .controller('vesselmultiselectCtrl', function($scope, savedsearches) {

        $scope.selectedgroup = function(item){
            $scope.$parent.selected = "ID: " + item.id + " name: " +item.name + " Filter: " + item.filter;
            $scope.$parent.dropdowntitle = item.name;
            $scope.$parent.searchFilter = item.filter;
        };

        $scope.predefinedgroups = savedsearches.getPredefinedGroups();
        $scope.groups = savedsearches.getGroups();
        $scope.dropdowntitle = 'Saved searches and groups';

    })
    .directive('vesselmultiselectdropdown', function() {
        return {
            restrict: 'E',
            templateUrl: 'directive/vesselMultiSelectDropdown/vesselMultiSelectDropdown.html'
        };
    });

