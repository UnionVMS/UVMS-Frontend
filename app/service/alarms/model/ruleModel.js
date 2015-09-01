angular.module('unionvmsWeb').factory('Rule', function(RuleDefinition, RuleNotification) {

        function Rule(){
            this.name = undefined;
            this.type = undefined;
            this.definitions = [];
            this.notifications = [];
            this.assetsOperation ="OR";
            this.mobileTerminalsOperation ="OR";

            //Init Rule with empty efinitions and notifications
            this.addNewAssetDefinition();
            this.addNewMobileTerminalDefinition();
            this.addNewPositionReportDefinition();
            this.addNewNotification();
        }

        Rule.prototype.addNewNotification = function(){
            this.notifications.push(new RuleNotification());
        };        

        Rule.prototype.addNewAssetDefinition = function(){
            this.definitions.push(RuleDefinition.createNewAssetRule());
        };

        Rule.prototype.addNewMobileTerminalDefinition = function(){
            this.definitions.push(RuleDefinition.createNewMobileTerminalRule());
        };

        Rule.prototype.addNewPositionReportDefinition = function(){
            this.definitions.push(RuleDefinition.createNewPositionReportRule());
        };

        Rule.prototype.getAssetDefinitions = function(){
            return this.definitions.filter(RuleDefinition.isAssetDefinition); 
        };        
        Rule.prototype.getMobileTerminalsDefinitions = function(){
            return this.definitions.filter(RuleDefinition.isMobileTerminalsDefinition); 
        };      
        Rule.prototype.getPositionReportsDefinitions = function(){
            return this.definitions.filter(RuleDefinition.isPositionReportsDefinition); 
        };

        Rule.fromJson = function(data){
            //TODO: Implement this
        };

        Rule.prototype.DTO = function(){
            //TODO: Implement this
            return {};
        };

        Rule.prototype.copy = function() {
            var copy = new Rule();

            copy.name = this.name;
            copy.type = this.type;
            copy.assetsOperation = this.assetsOperation;
            copy.mobileTerminalsOperation = this.mobileTerminalsOperation;

            copy.definitions = [];
            $.each(this.definitions, function(index, definition){
                copy.definitions.push(definition.copy());
            });

            copy.notifications = [];
            $.each(this.notifications, function(index, notification){
                copy.notifications.push(notification.copy());
            });

            return copy;
        };

        return Rule;
    });


angular.module('unionvmsWeb').factory('RuleDefinition', function() {

    var ASSET_RULE = "ASSET",
        MOBILE_TERMINAL_RULE = "MOBILE_TERMINAL",
        POSITION_REPORT_RULE = "POSITION_REPORT";

        function RuleDefinition(){
            this.section = undefined;
            this.type = "VESSEL";
            this.attribute = "ID";
            this.compareType = "NEQ";
            this.text = undefined;
        }

        RuleDefinition.createNewAssetRule = function(){
            var ruleDefinition = new RuleDefinition();
            ruleDefinition.section = ASSET_RULE;
            return ruleDefinition;
        };

        RuleDefinition.createNewMobileTerminalRule = function(){
            var ruleDefinition = new RuleDefinition();
            ruleDefinition.section = MOBILE_TERMINAL_RULE;
            return ruleDefinition;
        };

        RuleDefinition.createNewPositionReportRule = function(){
            var ruleDefinition = new RuleDefinition();
            ruleDefinition.section = POSITION_REPORT_RULE;
            return ruleDefinition;
        };

        RuleDefinition.isAssetDefinition = function(ruleDef){
            return ruleDef.section === ASSET_RULE;
        };
        RuleDefinition.isMobileTerminalsDefinition = function(ruleDef){
            return ruleDef.section === MOBILE_TERMINAL_RULE;
        };         
        RuleDefinition.isPositionReportsDefinition = function(ruleDef){
            return ruleDef.section === POSITION_REPORT_RULE;
        }; 

        RuleDefinition.prototype.copy = function() {
            var copy = new RuleDefinition();

            copy.section = this.section;
            copy.type = this.type;
            copy.attribute = this.attribute;
            copy.compareType = this.compareType;
            copy.text = this.text;

            return copy;
        };        

        return RuleDefinition;
    });

angular.module('unionvmsWeb').factory('RuleNotification', function() {


        function RuleNotification(){
            this.type = "EMAIL";
            this.text = undefined;
        }

        RuleNotification.prototype.copy = function() {
            var copy = new RuleNotification();

            copy.type = this.type;
            copy.text = this.text;

            return copy;
        };        

        return RuleNotification;
    });