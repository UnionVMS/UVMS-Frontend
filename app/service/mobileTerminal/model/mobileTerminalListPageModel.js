angular.module('unionvmsWeb')
    .factory('MobileTerminalListPage', function() {

        function MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages){
            this.mobileTerminals = _.isArray(mobileTerminals) ? mobileTerminals : [];
            this.currentPage = _.isNumber(currentPage) ? currentPage : 0;
            this.totalNumberOfPages = _.isNumber(totalNumberOfPages) ? totalNumberOfPages : 0;
        }

        MobileTerminalListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages;
        };

        MobileTerminalListPage.prototype.getNumberOfItems = function() {
            return this.mobileTerminals.length;
        };

        //Is one or more of the mobileTerminals assigned to a carrier
        MobileTerminalListPage.prototype.isOneOrMoreAssignedToACarrier = function() {
            var result = false;
            $.each(this.mobileTerminals, function(index, mobileTerminal){
                if(angular.isDefined(mobileTerminal.carrierId) && angular.isDefined(mobileTerminal.carrierId.carrierType)){
                    result = true;
                    return false;
                }
            });

            return result;
        };


        return MobileTerminalListPage;
    });

