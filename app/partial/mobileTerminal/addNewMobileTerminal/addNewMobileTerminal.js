angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, mobileTerminalRestService){
    $scope.errorMessage = "";

    var init = function(){
        //Get list transponder systems
        mobileTerminalRestService.getTranspondersConfig()
        .then(
            function(data){
                $.each(data, function(index, value){
                    //Set a view name
                    if(value.terminalSystemType === "INMARSAT_C"){
                        data[index].name = "Inmarsat-C Eik";
                    }

                });
                $scope.transponderSystems = data;
            },
            function(error){
                console.error(error);
                $scope.errorMessage = "You cannot create a mobile terminal at the moment. Error information: Failed to load terminal systems from the server. ";
            }
        );
    }; 

    $scope.isVisible = {
        assignVessel : false,
    };

    //Values for dropdowns
    $scope.transponderSystems =[];
    $scope.oceanRegions =[{'name':'AORE','code':'aore'}];

    //The values for the new mobile terminal
    $scope.selectedValues = {
        transponderSystem : '',
        oceanRegion : '',
        communicationChannels : []
    };

    //TODO: REMOVE THIS. It's just used for testing.
    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ ){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        $scope.selectedValues.communicationChannels.push({
            "dnid" : makeid()
        });
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.selectedValues.communicationChannels.splice(channelIndex, 1);
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.selectedValues.communicationChannels.splice(newIndex, 0, $scope.selectedValues.communicationChannels.splice(oldIndex, 1)[0]);
    };

    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };

    init();

});

