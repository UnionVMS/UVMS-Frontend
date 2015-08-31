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
            //TODO: Implement this
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
        return RuleDefinition;
    });

angular.module('unionvmsWeb').factory('RuleNotification', function() {


        function RuleNotification(){
            this.type = "EMAIL";
            this.text = undefined;
        }

        return RuleNotification;
    });