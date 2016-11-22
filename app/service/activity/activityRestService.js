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
                "departure": "2016-10-21T08:28:21",
                "departureAt": ["BEZEE"],
                "arrival": "2016-10-21T08:28:21",
                "arrivalAt": ["BEOST"],
                "landing": "2016-10-21T08:28:21",
                "landingAt": ["BEOST"]

            };

        }, getTripCatchesLandingDetails: function () {

            return {
                "differencePercentage": {
                    "catches": {
                        "lsc": {
                            "cod": "1222",
                            "sol": "1222",
                            "lem": "1333",
                            "tur": "1333"
                        },
                        "bms": {
                            "cod": "23",
                            "sol": "22"
                        }
                    },
                    "Landed": {
                        "lsc": {
                            "cod": "1283",
                            "sol": "1161",
                            "lem": "1666",
                            "tur": "1466"
                        },
                        "bms": {
                            "cod": "24",
                            "sol": "20"
                        }

                    },
                    "Difference": {
                        "lsc": {
                            "cod": "615(+5)",
                            "sol": "1161(+5)",
                            "lem": "1666(+5)",
                            "tur": "1466(+5)"
                        },
                        "bms": {
                            "cod": "24(+5)",
                            "sol": "20(+5)"
                        }
                    }
                },
                "catchesDetailsData": {
                    "total": {
                        "lsc": {
                            "cod": "5555",
                            "sol": "6666",
                            "lem": "7777",
                            "tur": "8888"
                        },
                        "bms": {
                            "cod": "9999",
                            "sol": "9999"
                        },
                        "dis": {
                            "cod": "1111",
                            "lem": "5555"
                        },
                        "dim": {
                            "sol": "9876"
                        }
                    },
                    "items": [{
                        "date": "21-04-1879",
                        "area": "235 RUE DU PROGRESS",
                        "lsc": {
                            "cod": "1111",
                            "sol": "1111",
                            "lem": "00001",
                            "tur": "12341"
                        },
                        "bms": {
                            "cod": "1231",
                            "sol": "1111"
                        },
                        "dis": {
                            "cod": "3451",
                            "lem": "1231"
                        },
                        "dim": {
                            "sol": "5671"
                        }
                    }, {
                        "date": "21-04-1880",
                        "area": "236 RUE DU PROGRESS1",
                        "lsc": {
                            "cod": "1112",
                            "sol": "1112",
                            "lem": "00002",
                            "tur": "12342"
                        },
                        "bms": {
                            "cod": "1232",
                            "sol": "1112"
                        },
                        "dis": {
                            "cod": "3452",
                            "lem": "1232"
                        },
                        "dim": {
                            "sol": "5672"
                        }
                    }, {
                        "date": "21-04-1881",
                        "area": "237 RUE DU PROGRESS2",
                        "lsc": {
                            "cod": "1113",
                            "sol": "1113",
                            "lem": "00003",
                            "tur": "12343"
                        },
                        "bms": {
                            "cod": "5363",
                            "sol": "1113"
                        },
                        "dis": {
                            "cod": "8753",
                            "lem": "1233"
                        },
                        "dim": {
                            "sol": "5673"
                        }
                    }]
                },
                "landingDetailsData": {
                    "total": {
                        "lsc": {
                            "cod": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "123",
                                "gut": "876"
                            },
                            "lem": {
                                "whl": "666"
                            },
                            "tur": {
                                "whl": "000"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            }
                        }
                    },
                    "items": [{
                        "area": "235 RUE DU PROGRESS",
                        "lsc": {
                            "cod": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            },
                            "lem": {
                                "whl": "888"
                            },
                            "tur": {
                                "whl": "777"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
                            }
                        }
                    }, {
                        "area": "235 RUE DU PROGRESS1",
                        "lsc": {
                            "cod": {
                                "whl": "7772",
                                "gut": "4442"
                            },
                            "sol": {
                                "whl": "7772",
                                "gut": "4442"
                            },
                            "lem": {
                                "whl": "7772"
                            },
                            "tur": {
                                "whl": "7772"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "4442"
                            },
                            "sol": {
                                "whl": "7772",
                                "gut": "4442"
                            }
                        }
                    }, {
                        "area": "235 RUE DU PROGRESS2",
                        "lsc": {
                            "cod": {
                                "whl": "7773",
                                "gut": "4443"
                            },
                            "sol": {
                                "whl": "7773",
                                "gut": "4443"
                            },
                            "lem": {
                                "whl": "7773"
                            },
                            "tur": {
                                "whl": "7773"
                            }
                        },
                        "bms": {
                            "cod": {
                                "gut": "444"
                            },
                            "sol": {
                                "whl": "777",
                                "gut": "444"
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
