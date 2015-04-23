angular.module('unionvmsWeb')
    .factory('MobileTerminalHistory', function() {

        function MobileTerminalHistory(){
        }

        MobileTerminalHistory.fromJson = function(data){
            var history = new MobileTerminalHistory();
            history.eventCode = data.eventCode;
            history.changeDate = data.changeDate;
            history.comment = data.comments;

            //DNID
            if(angular.isDefined(data.dnid)){
                history.dnid = data.dnid.value;
            }

            //MEMBER ID
            if(angular.isDefined(data.memberId)){
                history.memberId = data.memberId.value;
            }

            //SATELLITE NUMBER
            if(angular.isDefined(data.satelliteNumber)){
                history.satelliteNumber = data.satelliteNumber.value;
            }

            //INSTALLED ON
            if(angular.isDefined(data.installed)){
                history.installed = data.installed.value;
            }        

            //UNINSTALLED
            if(angular.isDefined(data.uninstalled)){
                history.uninstalled = data.uninstalled.value;
            }                       

            return history;
        };


        MobileTerminalHistory.prototype.getFormattedInstalled = function() {
            return moment(this.installed).format("YYYY-MM-DD");
        };

        MobileTerminalHistory.prototype.getFormattedInstalledDateAndTime = function() {
            return moment(this.installed).format("YYYY-MM-DD : h:mm:ss");
        };

        MobileTerminalHistory.prototype.getFormattedUninstalled = function() {
            return moment(this.uninstalled).format("YYYY-MM-DD");
        };

        MobileTerminalHistory.prototype.getFormattedUninstalledAndTime = function() {
            return moment(this.uninstalled).format("YYYY-MM-DD : h:mm:ss");
        };

        MobileTerminalHistory.prototype.getFormattedChangeDate = function() {
            return moment(this.changeDate).format("YYYY-MM-DD");
        };

        MobileTerminalHistory.prototype.getFormattedChangeDateAndTime = function() {
            return moment(this.changeDate).format("YYYY-MM-DD : h:mm:ss");
        };

        return MobileTerminalHistory;
    });
