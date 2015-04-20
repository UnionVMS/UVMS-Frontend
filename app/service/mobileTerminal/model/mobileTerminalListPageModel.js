angular.module('unionvmsWeb')
    .factory('MobileTerminalListPage', function() {

        function MobileTerminalListPage(mobileTerminals, currentPage, totalNumberOfPages){
            this.mobileTerminals = mobileTerminals;
            this.currentPage = currentPage;
            this.totalNumberOfPages = totalNumberOfPages;
        }

        MobileTerminalListPage.prototype.isLastPage = function() {
            return this.currentPage === this.totalNumberOfPages;
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

