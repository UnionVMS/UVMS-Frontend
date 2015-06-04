angular.module('unionvmsWeb').factory('MobileTerminalHistory', function(MobileTerminal) {

    function MobileTerminalHistory(){
        this.changeDate = undefined;
        this.comment = undefined;
        this.eventCode = undefined;
        this.mobileTerminal = undefined;
    }

    MobileTerminalHistory.fromJson = function(data){
        var history = new MobileTerminalHistory();
        history.eventCode = data.eventCode;
        history.changeDate = data.changeDate;
        history.comment = data.comments;
        history.mobileTerminal = MobileTerminal.fromJson(data.mobileTerminal);
        return history;
    };

    return MobileTerminalHistory;
});
