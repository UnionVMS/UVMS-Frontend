
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


angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function ($scope, activityRestService) {

    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */

    var init = function () {

        /** @function getTripCatchDetail 
         * data of current Fish Trip from activityRestService.
        */
        var response = activityRestService.getTripCatchDetail('1234');
        $scope.fishingTripDetails = response;


        /** @function getTripCatchesLandingDetails 
          * data for Catches, Landing and Difference % tables from activityRestService.
        */

        $scope.tables = activityRestService.getTripCatchesLandingDetails('1234');

        // Catches Table :: column lengths
        $scope.catchesLSC = _.keys($scope.tables.catchesDetailsData.total.LSC).length;
        $scope.catchesBMS = _.keys($scope.tables.catchesDetailsData.total.BMS).length;
        $scope.catchesDIS = _.keys($scope.tables.catchesDetailsData.total.DIS).length;
        $scope.catchesDIM = _.keys($scope.tables.catchesDetailsData.total.DIM).length;

        // Difference Table :: column lengths
        $scope.differenceLSC = _.keys($scope.tables.differencePercentage.catches.LSC).length;
        $scope.differenceBMS = _.keys($scope.tables.differencePercentage.catches.BMS).length;
        // Landing Table:: headers


        var lseLandingData = [];
        var bmsLandingData = [];
        $scope.headerLSE = [];
        $scope.headerBSE = [];
        angular.forEach($scope.tables.landingDetailsData.total.LSC, function (value, key) {
            var nrColumns = 0;
            angular.forEach(value, function (value, key) {
                lseLandingData.push({ text: key, totals: value });
                nrColumns++;
            });
            $scope.headerLSE.push({ text: key, width: nrColumns });

        });

        $scope.LSE = lseLandingData;

        angular.forEach($scope.tables.landingDetailsData.total.BMS, function (value, key) {

            var nrColumns = 0;
            angular.forEach(value, function (value, key) {
                bmsLandingData.push({ text: key, totals: value });

                nrColumns++;

            });
            $scope.headerBSE.push({ text: key, width: nrColumns });
        });
        $scope.BMS = bmsLandingData;



        // Landing Table :: Rows

        $scope.finalarray = [];

        angular.forEach($scope.tables.landingDetailsData.items, function (item) {
            var record = [];
            record.push(item.Area);


            angular.forEach(item.LSC, function (value, key) {
                angular.forEach(value, function (innerVal, innerKey) {
                    record.push(innerVal);

                });
            });

            angular.forEach(item.BMS, function (value, key) {
                angular.forEach(value, function (innerVal, innerKey) {
                    record.push(innerVal);

                });
            });
            $scope.finalarray.push(record);
        });

    }

    init();

});