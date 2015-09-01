angular.module('unionvmsWeb').controller('RulesCtrl',function($scope, Rule, alertService){

    $scope.activeTab = "RULES";

    //Keep track of visibility statuses
    $scope.isVisible = {
        rulesForm : false
    };

    //TEST RULE
    $scope.mockRule = new Rule();
    $scope.mockRule.name = "First rule ever";
    $scope.mockRule.type = "MS_REPORT";
    $scope.mockRule.addNewNotification();
    $scope.mockRule.addNewMobileTerminalDefinition();
    $scope.mockRule.notifications[0].text = "test@test.com";
    $scope.mockRule.notifications[1].type = "SMS";
    $scope.mockRule.notifications[1].text = "0123456789";
    $scope.mockRule.definitions[0].text = "MONDAY";
    $scope.mockRule.definitions[1].text = "TUESDAY";
    $scope.mockRule.definitions[2].text = "TUESDAY";    
    $scope.mockRule.definitions[2].compareType = "EQ";
    $scope.mockRule.definitions[3].text = "SUNDAY";


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
        alertService.hideMessage();
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