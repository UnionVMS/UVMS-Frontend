angular.module('unionvmsWeb').controller('RepparamsubscriptionCtrl',function($scope){
    $scope.isRepParamOpened = false;

    $scope.creationType = {
        original: {
            type: 'original'
        },
        newReport: {
            type: 'new',
            vesselIdTypes: []
        }
    };

    $scope.vesselIdTypes = [
        {
            id: 'ICCAT'
        },
        {
            id: 'CFR'
        },
        {
            id: 'IRCS'
        }
    ];

    $scope.reportsToBeIncluded = [
        {
            id: 'DEP DECL'
        },
        {
            id: 'FOP DECL'
        },
        {
            id: 'ARR NOT'
        },
        {
            id: 'DEP DECL1'
        }
    ];

    $scope.updateVesselIdTypes = function(vesselIdType){
        if(vesselIdType.type === 'original'){
            $scope.changeAllItemsSelection(false, vesselIdType.selectedTypes, 'vesselId');
        }
    };

    $scope.changeItemSelection = function(item,reportsSelected){
        if(item.selected && reportsSelected.indexOf(item.id) === -1){
            reportsSelected.push(item.id);
        }else if(!item.selected){
            reportsSelected.splice(reportsSelected.indexOf(item.id), 1);
        }
    };

    $scope.changeAllItemsSelection = function(selectAll,reportsSelected, type){
        var arrName;
        if(type === 'vesselId'){
            arrName = 'vesselIdTypes';
        }else{
            arrName = 'reportsToBeIncluded';
        }

        if(selectAll){
            reportsSelected = [].concat(_.pluck($scope[arrName], 'id'));
        }else{
            reportsSelected = [];
        }

        updateView(selectAll, arrName);
    };

    function updateView(selectAll, arrName){
        _.each($scope[arrName], function(report){
            report.selected = selectAll;
        });
    }

});