angular.module('unionvmsWeb').filter('stPurposeCode', function() {
    var cachedCodes = [];
    function convertCode(mdrCode){
        var rec = _.findWhere(cachedCodes, {code: mdrCode});
        var code;
        if (angular.isDefined(rec)){
            return rec.text;
        } else {
            //TODO fetch the codes from mdr rest service
            cachedCodes = [{
                code: '1', text: 'Cancellation'
            },{
                code: '3', text: 'Delete'
            },{
                code: '5', text: 'Replacement (correction)'
            },{
                code: '9', text: 'Original report'
            }];
        }
    }
    
    convertCode.$stateful = true;
    return convertCode;
});
