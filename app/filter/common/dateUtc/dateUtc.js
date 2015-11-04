angular.module('unionvmsWeb').filter('dateUtc', function() {
    return function(date, format) {
        if (date !== null){
            return moment.utc(date).format(format); 
        }
    };
});