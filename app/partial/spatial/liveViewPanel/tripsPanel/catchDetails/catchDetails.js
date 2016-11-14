angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function ($scope, activityRestService, tripSummaryService) {
    //$scope.tripSummServ = tripSummaryService;

    var init = function () {
        // data for catch detail from activityRestService.    
        var response = activityRestService.getTripCatchDetail('1234');
        $scope.trip = response;
      
        /*activityRestService.getTripCatchDetail('1234').then(function(response){
            
                    $scope.trip.fromJson('vessel',response.data);
                 loadingStatus.isLoading('TripSummary', false);
                }, function(error){
                    $anchorScroll();
                    $scope.alert.hasAlert = true;
                    $scope.alert.hasError = true;
                    $scope.alert.alertMessage = locale.getString('activity.error_loading_trip_summary_vessel_data');
                    $scope.alert.hideAlert();
                    loadingStatus.isLoading('TripSummary', false);
                });*/


        // mock JSON for catches table in catch details.

        $scope.differencePercentage = {

            "catches": {
                "LSC": {
                    "COD": "1222",
                    "SOL": "1222",
                    "LEM": "1333",
                    "TUR": "1333"


                },
                "BMS": {
                    "COD": "23",
                    "SOL": "22"

                }

            },
            "Landed": {
                "LSC": {
                    "COD": "1283",
                    "SOL": "1161",
                    "LEM": "1666",
                    "TUR": "1466"


                },
                "BMS": {
                    "COD": "24",
                    "SOL": "20"

                },

            },
            "Difference": {
                "LSC": {
                    "COD": "615(+5)",
                    "SOL": "1161(+5)",
                    "LEM": "1666(+5)",
                    "TUR": "1466(+5)"


                },
                "BMS": {
                    "COD": "24(+5)",
                    "SOL": "20(+5)"

                }
            }
        };

        $scope.catchesDetailsData =
            {
                "total": {
                    "LSC": {
                        "COD": "5555",
                        "SOL": "6666",
                        "LEM": "7777",
                        "TUR": "8888"
                    },
                    "BMS": {
                        "COD": "9999",
                        "SOL": "9999"
                    },
                    "DIS": {
                        "COD": "1111",
                        "LEM": "5555"
                    },
                    "DIM": {
                        "SOL": "9876"
                    }
                },
                "items": [{
                    "Date": "21-04-1879",
                    "Area": "235 RUE DU PROGRESS",
                    "LSC": {
                        "COD": "1111",
                        "SOL": "1111",
                        "LEM": "00001",
                        "TUR": "12341"
                    },
                    "BMS": {
                        "COD": "1231",
                        "SOL": "1111"
                    },
                    "DIS": {
                        "COD": "3451",
                        "LEM": "1231"
                    },
                    "DIM": {
                        "SOL": "5671"
                    }
                }, {
                    "Date": "21-04-1880",
                    "Area": "236 RUE DU PROGRESS1",
                    "LSC": {
                        "COD": "1112",
                        "SOL": "1112",
                        "LEM": "00002",
                        "TUR": "12342"
                    },
                    "BMS": {
                        "COD": "1232",
                        "SOL": "1112"
                    },
                    "DIS": {
                        "COD": "3452",
                        "LEM": "1232"
                    },
                    "DIM": {
                        "SOL": "5672"
                    }
                }, {
                    "Date": "21-04-1881",
                    "Area": "237 RUE DU PROGRESS2",
                    "LSC": {
                        "COD": "1113",
                        "SOL": "1113",
                        "LEM": "00003",
                        "TUR": "12343"
                    },
                    "BMS": {
                        "COD": "5363",
                        "SOL": "1113"
                    },
                    "DIS": {
                        "COD": "8753",
                        "LEM": "1233"
                    },
                    "DIM": {
                        "SOL": "5673"
                    }
                }]
            };

        // MOCK DATA FOR LANDING TABLE IN CATCH details

        $scope.landingDetailsData = {
            "total": {
                "LSC": {
                    "COD": {
                        "WHL": "777",
                        "GUT": "444"
                    },
                    "SOL": {
                        "WHL": "123",
                        "GUT": "876"
                    },
                    "LEM": {
                        "WHL": "666"
                    },
                    "TUR": {
                        "WHL": "000"
                    }
                },
                "BMS": {
                    "COD": {

                        "GUT": "444"
                    },
                    "SOL": {
                        "WHL": "777",
                        "GUT": "444"
                    }
                }
            },
            "items": [{
                "Area": "235 RUE DU PROGRESS",
                "LSC": {
                    "COD": {
                        "WHL": "777",
                        "GUT": "444"
                    },
                    "SOL": {
                        "WHL": "777",
                        "GUT": "444"
                    },
                    "LEM": {
                        "WHL": "888"
                    },
                    "TUR": {
                        "WHL": "777"
                    }
                },
                "BMS": {
                    "COD": {

                        "GUT": "444"
                    },
                    "SOL": {
                        "WHL": "777",
                        "GUT": "444"
                    }
                }

            }, {
                "Area": "235 RUE DU PROGRESS1",
                "LSC": {
                    "COD": {
                        "WHL": "7772",
                        "GUT": "4442"
                    },
                    "SOL": {
                        "WHL": "7772",
                        "GUT": "4442"
                    },
                    "LEM": {
                        "WHL": "7772"
                    },
                    "TUR": {
                        "WHL": "7772"
                    }
                },
                "BMS": {
                    "COD": {

                        "GUT": "4442"
                    },
                    "SOL": {
                        "WHL": "7772",
                        "GUT": "4442"
                    }
                }

            }, {
                "Area": "235 RUE DU PROGRESS2",
                "LSC": {
                    "COD": {
                        "WHL": "7773",
                        "GUT": "4443"
                    },
                    "SOL": {
                        "WHL": "7773",
                        "GUT": "4443"
                    },
                    "LEM": {
                        "WHL": "7773"
                    },
                    "TUR": {
                        "WHL": "7773"
                    }
                },
                "BMS": {
                    "COD": {

                        "GUT": "444"
                    },
                    "SOL": {
                        "WHL": "777",
                        "GUT": "444"
                    }
                }

            }]
        };

        // Landing Table:: headers

        var lseLandingData = [];
        var bmsLandingData = [];
        $scope.headerLSE = [];
        $scope.headerBSE = [];
        angular.forEach($scope.landingDetailsData.total.LSC, function (value, key) {
            var nrColumns = 0;
            angular.forEach(value, function (value, key) {
                lseLandingData.push({ text: key, totals: value });
                  nrColumns++;
                });
             $scope.headerLSE.push({ text: key, width: nrColumns });

        });

        $scope.LSE = lseLandingData;
       
        angular.forEach($scope.landingDetailsData.total.BMS, function (value, key) {

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

        angular.forEach($scope.landingDetailsData.items, function (item) {
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