angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, $route, MobileTerminal, mobileTerminalRestService){

    var init = function(){
        //Get list transponder systems
        mobileTerminalRestService.getTranspondersConfig()
        .then(
            function(data){
                $.each(data, function(index, value){
                    var text = value.terminalSystemType,
                        code = value.terminalSystemType;

                    //Set a view text
                    if(value.terminalSystemType === "INMARSAT_C"){
                        text = "Inmarsat-C Eik";
                    }

                    $scope.transponderSystems.push({text : text, code :code});

                });
                //$scope.transponderSystems = data;
            },
            function(error){
                console.error(error);
                $scope.createResponseMessage = "You cannot create a mobile terminal at the moment. Error information: Failed to load terminal systems from the server. ";
                showMessage();
            }
        );
    }; 

    $scope.isVisible = {
        assignVessel : false,
    };

    //Values for dropdowns
    $scope.transponderSystems =[];
    $scope.oceanRegions =[{'text':'AORE','code':'aore'}];
    $scope.channelTypes =[{'text':'VMS','code':'VMS'}, {'text':'ELOG','code':'ELOG'}];

    //The values for the new mobile terminal
    $scope.newMobileTerminal = new MobileTerminal();

    //Show a message for 4 seconds
    var showMessage = function(){
        $('.createResponseMessage').slideDown('slow');
        setTimeout(function() {
            $('.createResponseMessage').slideUp('slow');
        }, 4000 );
    };

    //Success creating the new mobile terminal
    var createSuccess = function(){
        $scope.createResponseMessage = "The Mobile Terminal has been created successfully. You can close this window or just wait and it will close itself.";
        showMessage();
        setTimeout(function() {
            $route.reload();
        }, 2000 );        
    };

    //Error creating the new mobile terminal
    var createError = function(){
        $scope.createResponseMessage = "The mobile terminal could not be created.";
        showMessage();                
    };

    //Create the mobile terminal
    $scope.createNewMobileTerminal = function(){
        if($scope.newMobileTerminalForm.$valid){
            mobileTerminalRestService.createNewMobileTerminal($scope.newMobileTerminal)
                .then(createSuccess, createError);
        }else{
            $scope.createResponseMessage = "Form is not valid.";
        }
    };    

    //Update order attribute in all channels according to their position in the channels list
    var updateChannelOrders = function(){
        $.each($scope.newMobileTerminal.channels, function(index, channel){
            channel.order = index +1;
        });
    };

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        $scope.newMobileTerminal.addNewChannel();
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.newMobileTerminal.channels.splice(channelIndex, 1);
        updateChannelOrders();
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.newMobileTerminal.channels.splice(newIndex, 0, $scope.newMobileTerminal.channels.splice(oldIndex, 1)[0]);
        updateChannelOrders();
    };

    //Show/hide assign vessel
    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };

    //Clear the form
    $scope.clearForm = function(){
        $scope.newMobileTerminal = new MobileTerminal();
    };

    init();

});

