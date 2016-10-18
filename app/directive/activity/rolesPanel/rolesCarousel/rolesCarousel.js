angular.module('unionvmsWeb').controller('RolescarouselCtrl',function($scope,$timeout,tripSummaryService){

    $scope.tripSummServ = tripSummaryService;

    $scope.currentRole = {index: 0};
    $scope.roles = [
        {
            id: 0,
            name: 'John Doe',
            type: 'Captain',
            address: 'Streetname 12 1234 city',
            imgURL: 'http://www.brudnicki.com/photos/600%20dpi/Captain_Brudnicki.JPG'
        },
        {
            id: 1,
            name: 'Adam Aileen',
            type: 'Chief officer',
            address: 'Rue Dieudonné Lefèvre 150 1020 Bruxelles',
            imgURL: 'http://www.brudnicki.com/photos/600%20dpi/Captain_Brudnicki.JPG'
        },
        {
            id: 2,
            name: 'Adolph Sawyer',
            type: 'Chief Engineer',
            address: 'Rue Antoine Dansaert 160 1000 Bruxelles',
            imgURL: 'http://www.brudnicki.com/photos/600%20dpi/Captain_Brudnicki.JPG'
        }
    ];

    $scope.comboItems = [
        {
            code: 0,
            text: 'Captain: John Doe',
        },
        {
            code: 1,
            text: 'Chief officer: Adam Aileen',
        },
        {
            code: 2,
            text: 'Chief Engineer: Adolph Sawyer',
        }
    ];

    $scope.updateCombo = function(slides) {
        $timeout(function() {
            $scope.currentRole.index = _.where(slides,{'active': true})[0].index;
        }, 1);
    };
});