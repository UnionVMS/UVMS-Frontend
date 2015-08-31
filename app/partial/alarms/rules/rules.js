angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, Rule){

    $scope.activeTab = "RULES";

    //Keep track of visibility statuses
    $scope.isVisible = {
        rulesForm : false
    };

    $scope.createNewMode = false;
    $scope.currentRule = undefined;

    //Toggle (show/hide) new rule
    $scope.toggleAddNewRule = function(){
        $scope.createNewMode = true;
        toggleRuleForm(new Rule());
    };

    //Toggle (show/hide) viewing of a rule
    $scope.toggleRuleDetails = function(rule){
        $scope.createNewMode = false;
        if (rule) {
            rule = rule.copy();
        }

        toggleRuleForm(rule);
    };

    var toggleRuleForm = function(rule){
        if(angular.isDefined(rule)){
            $scope.currentRule = rule;
        }

        $scope.isVisible.rulesForm = !$scope.isVisible.rulesForm;
    };

    $scope.getCurrentRule = function(bool){
        return $scope.currentRule;
    };    

    //Are we in create mode?
    $scope.isCreateNewMode = function(){
        return $scope.createNewMode;
    };

    $scope.setCreateMode = function(bool){
        $scope.createNewMode = bool;
    };    


});