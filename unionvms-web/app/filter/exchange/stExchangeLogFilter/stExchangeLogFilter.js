angular.module('smart-table').filter('stExchangeLogFilter', function($filter){
    return function(srcData, predictedObject){
        var type = predictedObject.messageType;
        
        var finalData = srcData;
        var incStatus;
        if (type === 'incoming'){
            incStatus = true;
        } else if (type === 'outgoing'){
            incStatus = false;
        }
        
        if (angular.isDefined(incStatus)){
            finalData = [];
            $.each(srcData, function(index, item){
                if (item.incoming === incStatus){
                    finalData.push(item);
                }
            });
        }
        
        return finalData;
    };
});