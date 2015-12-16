angular.module('unionvmsWeb').factory('RuleSubscriptionUpdate', function() {

    function RuleSubscriptionUpdate(type, ruleGuid){
        this.operation = undefined;
        this.owner = undefined;
        this.ruleGuid = ruleGuid;
        this.type = type;
    }

    RuleSubscriptionUpdate.prototype.DTO = function(){
        return {
            operation : this.operation,
            subscription : {
                owner : this.owner,
                type : this.type
            },
            ruleGuid : this.ruleGuid,
        };
    };

    RuleSubscriptionUpdate.prototype.setOwner = function(s) {
        this.owner = s;
    };

    RuleSubscriptionUpdate.prototype.setOperationToAdd = function() {
        this.operation = 'ADD';
    };

    RuleSubscriptionUpdate.prototype.setOperationToRemove = function() {
        this.operation = 'REMOVE';
    };

    return RuleSubscriptionUpdate;
});