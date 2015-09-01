angular.module('unionvmsWeb').controller('RulesformCtrl',function($scope, locale, alertService, ruleRestService, Rule){

    $scope.submitAttempted = false;

    //Watch changes to the getCurrentRule model (set in the parent scope)
    $scope.$watch('getCurrentRule()', function(newValue) {
        $scope.currentRule = $scope.getCurrentRule();
        if(angular.isDefined($scope.ruleForm)){
            $scope.ruleForm.$setPristine();
            $scope.submitAttempted = false;
        }
    });    

    //Dropdown values
    //TODO: Get values from config
    $scope.ruleTypes =[    
        {'text': 'MS Reports','code':'MS_REPORT'},
        {'text': 'Unknown','code':'UNKNOWN'}
    ];

    $scope.operationTypes =[    
        {'text': 'OR','code':'OR'},
        {'text': 'AND','code':'AND'}
    ];

    $scope.assetTypes =[    
        {'text': 'Vessel','code':'VESSEL'}
    ];

    $scope.assetAttributes =[    
        {'text': 'Asset id.','code':'ID'},
        {'text': 'Asset name.','code':'NAME'},
    ];

    $scope.compareTypes =[    
        {'text': 'equals to','code':'EQ'},
        {'text': 'not equals to','code':'NEQ'},
    ];    

    $scope.notificationTypes =[    
        {'text': 'E-mail','code':'EMAIL'},
        {'text': 'SMS','code':'SMS'},
    ]; 

    $scope.addAssetDefinition = function(){
        $scope.currentRule.addNewAssetDefinition();
    };
    $scope.addMobileTerminalDefinition = function(){
        $scope.currentRule.addNewMobileTerminalDefinition();
    };
    $scope.addPositionReportDefinition = function(){
        $scope.currentRule.addNewPositionReportDefinition();
    };
    $scope.addNotificationItem = function(){
        $scope.currentRule.addNewNotification();
    };

    $scope.removeRuleDefinition = function(definitionToBeRemoved){
        var indexToRemove = -1;
        $.each($scope.currentRule.definitions, function(i, def){
            if(definitionToBeRemoved === def){
                indexToRemove = i;
                return false;
            }

        });
        if(indexToRemove >= 0){
            $scope.currentRule.definitions.splice(indexToRemove, 1);
        }
    };

    $scope.removeNotificationItem = function(notificationToBeRemoved){
        var indexToRemove = -1;
        $.each($scope.currentRule.notifications, function(i, def){
            if(notificationToBeRemoved === def){
                indexToRemove = i;
                return false;
            }

        });
        if(indexToRemove >= 0){
            $scope.currentRule.notifications.splice(indexToRemove, 1);
        }
    };

    //Check if form is valid and show error message if not
    var isValidForm = function(){
        if(!$scope.ruleForm.$valid){
            alertService.showErrorMessage(locale.getString('alarms.rules_add_new_alert_message_on_form_validation_error'));
            return false;
        }
        ///TODO: More validation of definitions and notification
    };

    //Create the rule
    $scope.createNewRule = function(){
        $scope.submitAttempted = true;

        //Validate form
        isValidForm();        

        //Create
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        ruleRestService.createNewRule($scope.currentRule)
                .then(createNewRuleSuccess, createNewRuleError);
    };

    //Update the rule
    $scope.updateRule = function(){
        $scope.submitAttempted = true;

        //Validate form
        isValidForm();        

        //Update
        $scope.waitingForCreateResponse = true;
        alertService.hideMessage();
        ruleRestService.updateRule($scope.currentRule)
                .then(updateRuleSuccess, updateRuleError);
    };

    //Success creating the rule
    var createNewRuleSuccess = function(rule) {
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('alarms.rules_add_new_alert_message_on_success'));
        $scope.currentRule = rule;
        $scope.setCreateMode(false);
    };

    //Error creating the rule
    var createNewRuleError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('alarms.rules_add_new_alert_message_on_error'));
    };    

    //Success updating the rule
    var updateRuleSuccess = function(updatedRule) {
        $scope.waitingForCreateResponse = false;
        alertService.showSuccessMessageWithTimeout(locale.getString('alarms.rules_update_alert_message_on_success'));
        //TODO: Update currentRule and merge results back to rules list
    };

    //Error updating the rule
    var updateRuleError = function(){
        $scope.waitingForCreateResponse = false;
        alertService.showErrorMessage(locale.getString('alarms.rules_update_alert_message_on_error'));
    };    


    //Clear the form
    $scope.clearForm = function(){
        $scope.currentRule = new Rule();
    };
        
        

});