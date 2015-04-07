angular.module('unionvmsWeb').controller('addNewMobileTerminalCtrl',function($scope){

        $scope.transponderSystem = "Choose transponder system";
        $scope.oceanRegion = "Choose ocean region";

        //Dummy values for dropdowns
        $scope.transponderSystems =[{'name':'Inmarsat-C Eik','code':'inmarsatc'}];
        $scope.oceanRegions =[{'name':'AORE','code':'aore'}];

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

        $scope.addNewChannel = function(){
            console.log("ADD NEW CHANNEL");
            $scope.selectedValues.communicationChannels.push({
                "dnid" : makeid()
            });
        };

        $scope.removeChannel = function(channelIndex){
            $scope.selectedValues.communicationChannels.splice(channelIndex, 1);
        };

        $scope.moveChannel = function(oldIndex, newIndex){
            console.log("moveChannel");
            console.log(oldIndex);
            console.log(newIndex);
            $scope.selectedValues.communicationChannels.splice(newIndex, 0, $scope.selectedValues.communicationChannels.splice(oldIndex, 1)[0]);
        };


});