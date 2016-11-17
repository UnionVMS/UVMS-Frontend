/**
 * @memberof unionvmsWeb
 * @ngdoc service
 * @name activityRestFactory
 * @param $resource {service} angular resource service
 * @param $http {service} angular http service 
 * @description
 *  REST factory for the activity module
 */
angular.module('unionvmsWeb').factory('activityRestFactory', function ($resource, $http) {
    return {
        getUserPreferences: function () {
            return $resource('/activity/rest/config/user', {}, {
                'get': {
                    method: 'GET'
                }
            });
        },
        getActivityList: function () {
            return $resource('/activity/rest/fa/list', {}, {
                'get': {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCronology: function () {
            return $resource('/activity/rest/trip/cronology/:id/:nrItems', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripVessel: function () {
            return $resource('/activity/rest/trip/vessel/details/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripMessageCount: function () {
            return $resource('/activity/rest/trip/messages/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripCatches: function () {
            return $resource('/activity/rest/trip/catches/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        },
        getTripReports: function () {
            return $resource('/activity/rest/trip/reports/:id', {}, {
                'get': {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            });
        }, getTripCatchDetail: function () {
            return {

                "tripID": "BEL-TRP-O16-2016_0021",
                "vesselName": "Beagle(BEL123456789)",
                "departure": "yy-mm-dd hh:mm",
                "departureAt": ["BEZEE"],
                "arrival": "yy-mm-dd hh:mm",
                "arrivalAt": ["BEOST"],
                "Landing": "yy-mm-dd hh:mm",
                "LandingAt": ["BEOST"]

            };

        }, getTripCatchesLandingDetails: function () {

            return {
                "differencePercentage": {
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
                        }

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
                },
                "catchesDetailsData": {
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
                },
                "landingDetailsData": {
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
                }
            };

        }

    };

})
    /**
     * @memberof unionvmsWeb
     * @ngdoc service
     * @name activityRestService
     * @param $q {service} angular $q service
     * @param activityRestFactory {service} The REST factory for the activity module <p>{@link unionvmsWeb.activityRestFactory}</p> 
     * @description
     *  REST services for the activity module
     */
    .service('activityRestService', function ($q, activityRestFactory) {
        var activityService = {
            /**
             * Get the user preferences for the activty module
             * 
             * @memberof activityRestService
             * @public
             * @returns {Promise} A promise with either the user preferences of the activity module or reject error
             */
            getUserPreferences: function () {
                var deferred = $q.defer();
                activityRestFactory.getUserPreferences().get(function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    console.log('Error getting user preferences for activity');
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get a list of fishing activity reports according to search criteria
             * 
             * @memberof activityRestService
             * @public
             * @param {Object} data - The search criteria and table pagination data object
             * @returns {Promise} A promise with either the list of activities or reject error
             */
            getActivityList: function (data) {
                var deferred = $q.defer();
                activityRestFactory.getActivityList().get(angular.toJson(data), function (response) {
                    deferred.resolve(response.data);
                }, function (error) {
                    console.log('Error getting list of activity reports');
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the trip cronology of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @param {Number} nrItems - The number of trips to display in trip cronology
             * @returns {Promise} A promise with either the trip cronology or reject error
             */
            getTripCronology: function (id, nrItems) {
                var deferred = $q.defer();
                activityRestFactory.getTripCronology().get({ id: id, nrItems: nrItems }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the vessel and roles details of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the vessel and roles details or reject error
             */
            getTripVessel: function (id) {
                var deferred = $q.defer();
                activityRestFactory.getTripVessel().get({ id: id }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the message type count of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the vessel and roles details or reject error
             */
            getTripMessageCount: function (id) {
                var deferred = $q.defer();
                activityRestFactory.getTripMessageCount().get({ id: id }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the catch details of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the vessel and roles details or reject error
             */
            getTripCatches: function (id) {
                var deferred = $q.defer();
                activityRestFactory.getTripCatches().get({ id: id }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the trip reports of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the vessel and roles details or reject error
             */
            getTripReports: function (id) {
                var deferred = $q.defer();
                activityRestFactory.getTripReports().get({ id: id }, function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
                return deferred.promise;
            },
            /**
             * Get the Catch Details of a specific trip
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the trip catch details or reject error
             */
            getTripCatchDetail: function (id) {
                return activityRestFactory.getTripCatchDetail();

            },
            /**
             * Get the Catches and Landing Details for Tables. 
             * 
             * @memberof activityRestService
             * @public
             * @param {String} id - The trip id of the selected trip
             * @returns {Promise} A promise with either the trip catch details or reject error
             */
            getTripCatchesLandingDetails: function (id) {
                return activityRestFactory.getTripCatchesLandingDetails();

            }

        };

        return activityService;
    });
