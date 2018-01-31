angular.module('unionvmsWeb').filter('stRemoveEndOfTime', function() {
    return function(date) {
        var tempDate = moment.utc(date);
        if (tempDate.year() === 9999){
            date = undefined;
        }
        return date;
    };
});