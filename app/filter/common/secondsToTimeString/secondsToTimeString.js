angular.module('unionvmsWeb').filter('secondsToTimeString', function(locale) {
  return function(seconds) {
    if(angular.isUndefined(seconds)){
        return "";
    }

    //Less than 60 seconds
    if(seconds < 60){
        return seconds +" " +locale.getString('common.time_second_short');
    }
    //Return hour and minutes, e.g. 2h 45 min
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var text = "";
    if(hours > 0){
        text += hours + locale.getString('common.time_hour_short');
    }
    if(minutes > 0){
        text += (text.length === 0) ? "" : " ";
        text += minutes + " " +locale.getString('common.time_minute_short');
    }
    return text;
 };
});