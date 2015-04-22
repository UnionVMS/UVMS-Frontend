angular.module('unionvmsWeb').controller('mobileTerminalFormCtrl',function($scope, locale, MobileTerminal, mobileTerminalRestService, alertService, $modal){

    //Visibility statuses
    $scope.isVisible = {
        assignVessel : false,
    };

    //Values for dropdowns
    $scope.oceanRegions =[{'text':'AORE','code':'aore'}];
    $scope.channelTypes =[{'text':'VMS','code':'VMS'}, {'text':'ELOG','code':'ELOG'}];

    //Has form submit been atempted?
    $scope.submitAttempted = false;
    
    //Watch for changes to the ngModel
    $scope.$watch(function () { return $scope.currentMobileTerminal;}, function (newVal, oldVal) {
        if (typeof newVal !== 'undefined' && newVal !== oldVal) {            
            setTerminalConfig($scope.currentMobileTerminal.mobileTerminalId.systemType);
        }
    });

    //On terminal system selected
    $scope.onTerminalSystemSelect = function(item){
        //Set the terminalConfig to use
        setTerminalConfig(item.code);
    };

    var setTerminalConfig = function(systemName){
        console.log("set terminal config :" + systemName);
        $scope.terminalConfig = $scope.transpondersConfig.getTerminalConfigBySystemName(systemName);
    };

    //Update order attribute in all channels according to their position in the channels list
    var updateChannelOrders = function(){
        $.each($scope.currentMobileTerminal.channels, function(index, channel){
            channel.order = index +1;
        });
    };

    //Add a new channel to the end of the list of channels
    $scope.addNewChannel = function(){
        $scope.currentMobileTerminal.addNewChannel();
    };

    //Remove a channel from the list of channels
    $scope.removeChannel = function(channelIndex){
        $scope.currentMobileTerminal.channels.splice(channelIndex, 1);
        updateChannelOrders();
    };

    //Move channel in the list. Used when sorting the channels up and down
    $scope.moveChannel = function(oldIndex, newIndex){
        $scope.currentMobileTerminal.channels.splice(newIndex, 0, $scope.currentMobileTerminal.channels.splice(oldIndex, 1)[0]);
        updateChannelOrders();
    };

    $scope.unassignVessel = function() {
        // Show modal Comment dialog.
        $modal.open({
            templateUrl: "partial/mobileTerminal/assignVessel/assignVesselComment/assignVesselComment.html",
            controller: "AssignVesselCommentCtrl",
            resolve: {
                title: function() {
                    return locale.getString('mobileTerminal.unassign_vessel') + ' "' + $scope.currentMobileTerminal.associatedVessel.name + '"';
                }
            }
        }).result.then($scope.unassignVesselWithComment);
    };

    $scope.unassignVesselWithComment = function(comment) {
        mobileTerminalRestService.unassignMobileTerminal($scope.currentMobileTerminal, comment).then(function(res) {
            // Success
            $scope.currentMobileTerminal.unassign();
            alertService.showSuccessMessage(locale.getString('mobileTerminal.unassign_vessel_message_on_success'));
        }, 
        function(res) {
            // Error
            alertService.showErrorMessage(locale.getString('mobileTerminal.unassign_vessel_message_on_error'));
        });
    };

    //Show/hide assign vessel
    $scope.toggleAssignVessel = function(){
        $scope.isVisible.assignVessel = !$scope.isVisible.assignVessel;
    };
});

