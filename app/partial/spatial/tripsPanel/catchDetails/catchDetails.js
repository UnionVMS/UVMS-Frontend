
/**
 * @memberof unionvmsWeb
 * @ngdoc controller
 * @name CatchdetailsCtrl
 * @param $scope {Service} controller scope
 * @param activityRestService {Service} the activity REST service <p>{@link unionvmsWeb.activityRestService}</p>
 * @param locale {Service} angular locale service
 * @description
 *  The controller for the Catch Details.  
 */


angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function($scope, activityRestService) {

    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */

    var init = function() {

        var lseLandingData = [];
        var bmsLandingData = [];
        $scope.outerHeaders = [];//  data for outer headers and colspan :: Landing table
        var fishCat = ['lsc', 'bms', 'dis', 'dim'];
        $scope.finalarray = [];
        $scope.fishCategoryLength = [];
        $scope.fishingTripDetails = activityRestService.getTripCatchDetail('1234');
        $scope.tables = activityRestService.getTripCatchesLandingDetails('1234');



        // calculates the colspan for the headers of catches and Difference % tables

        function calcHeaderLength() {
            for (var i = 0; i < fishCat.length; i++) {
                $scope.fishCategoryLength.push(_.keys($scope.tables.catchesDetailsData.total[fishCat[i]]).length);
            }
            for (var i = 0; i < 2; i++) {
                $scope.fishCategoryLength.push(_.keys($scope.tables.differencePercentage.catches[fishCat[i]]).length);
            }
        }
        calcHeaderLength();

       // prepares the data needed to display the LANDING HEADERS

        for (i = 0; i < 2; i++) {

            angular.forEach($scope.tables.landingDetailsData.total[fishCat[i]], function(value, key) {
                var nrColumns = 0;
                if (i == 0) {
                    angular.forEach(value, function(value, key) {
                        lseLandingData.push({ text: key, totals: value });
                        nrColumns++;
                    });
                }
                else {
                    angular.forEach(value, function(value, key) {
                        bmsLandingData.push({ text: key, totals: value });
                        nrColumns++;
                    });
                }
                $scope.outerHeaders.push({ text: key, width: nrColumns });
            });
        }

        $scope.LSE = lseLandingData;
        $scope.BMS = bmsLandingData;



        // prepares an array with data needed to display the LANDING ROWS


        angular.forEach($scope.tables.landingDetailsData.items, function(item) {
            var record = [];
            record.push(item.area);

            for (i = 0; i < 2; i++) {
                angular.forEach(item[fishCat[i]], function(value, key) {
                    angular.forEach(value, function(innerVal, innerKey) {
                        record.push(innerVal);

                    });
                });
            }
            $scope.finalarray.push(record);
        });

    }

    init();

});