angular.module('unionvmsWeb').factory('SanityRule', function() {

    function SanityRule(){
        this.guid = undefined;
        this.name = undefined;
        this.description = undefined;
        this.expression = undefined;
        this.updatedBy = undefined;
        this.dateUpdated = undefined;
    }


    SanityRule.fromDTO = function(dto){
        var sanityRule = new SanityRule();

        sanityRule.guid = dto.guid;
        sanityRule.name = dto.name;
        sanityRule.description = dto.description;
        sanityRule.expression = dto.expression;
        sanityRule.updatedBy = dto.updatedBy;
        sanityRule.dateUpdated = dto.updated;

        return sanityRule;
    };


    return SanityRule;
});

