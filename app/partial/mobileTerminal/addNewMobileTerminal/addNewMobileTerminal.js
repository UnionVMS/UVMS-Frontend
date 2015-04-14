angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope, $route, locale, MobileTerminal, mobileTerminalRestService, alertService){

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
            },
            function(error){
                alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_load_transponders_error'));
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

    //Has form submit been atempted?
    $scope.submitAttempted = false;

    
    //The values for the new mobile terminal
    $scope.newMobileTerminal = new MobileTerminal();

    //Success creating the new mobile terminal
    var createSuccess = function(){
        alertService.showSuccessMessage(locale.getString('mobileTerminal.add_new_alert_message_on_success'));                      
        setTimeout(function() {
            $route.reload();
        }, 2000 );        
    };

    //Error creating the new mobile terminal
    var createError = function(){
        alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_error'));
    };

    //Create the mobile terminal
    $scope.createNewMobileTerminal = function(){
        $scope.submitAttempted = true;

        //Validate form
        if(!$scope.newMobileTerminalForm.$valid){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_form_validation_error'));
            return false;
        }

        //Validate at least one channel
        if($scope.newMobileTerminal.channels.length === 0){
            alertService.showErrorMessage(locale.getString('mobileTerminal.add_new_alert_message_on_channels_missing_validation_error'));
            return false;            
        }
        
        //Create
        mobileTerminalRestService.createNewMobileTerminal($scope.newMobileTerminal)
                .then(createSuccess, createError);
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

