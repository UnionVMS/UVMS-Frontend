angular.module('unionvmsWeb').factory('subscriptionsService',function() {

    var subscriptionsService = {
        layoutStatus: {
            isForm: false,
            isNewSub: false
        }
    };

    return subscriptionsService;
});