angular.module('unionvmsWeb').factory('Rule', function(RuleDefinition, RuleNotification) {

        function Rule(){
            this.id = undefined;
            this.name = undefined;
            this.description = undefined;
            this.type = "GLOBAL";
            this.availability = "PUBLIC";
            this.definitions = [];
            this.notifications = [];
            this.recipient = "FMC";
            this.lastTriggered = "2015-02-05 08:00";
            this.createdBy = "antkar";
            this.dateCreated = "2015-08-31 09:00";
        }

        Rule.prototype.addDefinition = function(def){
            this.definitions.push(def);
        };

        Rule.prototype.addNotification = function(not){
            this.notifications.push(not);
        };

        Rule.prototype.getNumberOfDefinitions = function(){
            return this.definitions.length;
        };

        Rule.prototype.getNumberOfNotifications = function(){
            return this.notifications.length;
        };


        Rule.prototype.definitionsAsText = function(){
            var text = '';
            $.each(this.definitions, function(index, def){
                text = text + def.asText() +' ';
            });

            return text;
        };

        Rule.fromJson = function(data){
            //TODO: Implement this
        };

        Rule.prototype.DTO = function(){
            return {
                name : this.name,
                description : this.description,
                type : this.type,
                availability : this.availability,
                definitions : this.definitions.reduce(function(defs, def){
                    defs.push(def.DTO());
                    return defs;
                },[]),
                notifications : this.notifications.reduce(function(nots, not){
                    nots.push(not.DTO());
                    return nots;
                },[]),                
            };
        };

        Rule.prototype.copy = function() {
            var copy = new Rule();

            copy.id = this.id;
            copy.name = this.name;
            copy.type = this.type;
            copy.description = this.description;
            copy.recipient = this.recipient;
            copy.lastTriggered = this.lastTriggered;
            copy.createdBy = this.createdBy;
            copy.dateCreated = this.dateCreated;

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

        //Check if the Rule is equal another Rule
        //Equal means same guid
        Rule.prototype.equals = function(item) {
            return this.id === item.id;
        };

        return Rule;
    });



angular.module('unionvmsWeb').factory('RuleDefinition', function() {

        function RuleDefinition(){
            this.startOperator = '';
            this.criteria = undefined;
            this.subCriteria = undefined;
            this.condition = "EQ";
            this.value = '';
            this.endOperator = '';
            this.logicBoolOperator = 'NONE';
            this.order = undefined; //First one has order 0
        }

        RuleDefinition.prototype.asText = function(){
            var text = this.startOperator;

            //critera
            if(typeof this.criteria === 'string' && this.criteria.trim().length > 0){
                text += this.criteria;
            }else{
                text += 'AAAA';
            }

            //subcriteria
            text +='.';
            if(typeof this.subCriteria === 'string' && this.subCriteria.trim().length > 0){
                text += this.subCriteria;
            }else{
                text += 'BB';
            }

            text +=' ' + this.condition + ' ' ;

            //value
            if(typeof this.value === 'string' && this.value.trim().length > 0){
                text += this.value;
            }else{
                text += '???';
            }

            text += this.endOperator;

            if(this.logicBoolOperator !== 'NONE'){
                 text += ' ' + this.logicBoolOperator;
            }

            return text;
        };


        RuleDefinition.prototype.copy = function() {
            var copy = new RuleDefinition();

            copy.startOperator = this.startOperator;
            copy.criteria = this.criteria;
            copy.subCriteria = this.subCriteria;
            copy.condition = this.condition;
            copy.value = this.value;
            copy.endOperator = this.endOperator;
            copy.logicBoolOperator = this.logicBoolOperator;
            copy.order = this.order;

            return copy;
        };

        RuleDefinition.prototype.DTO = function(){
            return {
                startOperator : this.startOperator,
                criteria : this.criteria,
                subCriteria : this.subCriteria,
                condition : this.condition,
                value : this.value,
                endOperator : this.endOperator,
                logicBoolOperator : this.logicBoolOperator,
                order : this.order,
            };
        };

        return RuleDefinition;
    });


angular.module('unionvmsWeb').factory('RuleNotification', function() {


        function RuleNotification(){
            this.type = "undefined";
            this.text = undefined;
        }

        RuleNotification.prototype.copy = function() {
            var copy = new RuleNotification();

            copy.type = this.type;
            copy.text = this.text;

            return copy;
        };

        RuleNotification.prototype.DTO = function(){
            return {
                type : this.type,
                text : this.text,
            };
        };        

        return RuleNotification;
    });