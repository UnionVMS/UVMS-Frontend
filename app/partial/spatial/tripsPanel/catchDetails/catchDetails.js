/*
Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
*/
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
angular.module('unionvmsWeb').controller('CatchdetailsCtrl', function ($scope, activityRestService, locale, tableService, reportService, loadingStatus, tripSummaryService) {

    /**
    * Initialization function
    * 
    * @memberof CatchdetailsCtrl
    * @private
    */
	var init = function () {

		$scope.tripId = tripSummaryService.trip.id;
		if (angular.isDefined($scope.tripId)) {
			loadingStatus.isLoading('TripSummary', true, 1);
			//FIXME change with proper trip id
			activityRestService.getTripCatchDetail($scope.tripId).then(function (response) {
				$scope.fishingTripDetails = response;
				loadingStatus.isLoading('TripSummary', false);
			}, function (error) {
				//TODO deal with error from service
			});

			loadingStatus.isLoading('TripSummary', true, 1);
			//FIXME change with proper trip id
			/* activityRestService.getTripCatchesLandingDetails($scope.tripId).then(function(response){
				 $scope.tables = response;
				 processTables();
			 }, function(error){
				 //TODO deal with error from service
			 });*/
			catchDetailsData();
		} else {
            /*loadingStatus.isLoading('TripSummary', true, 1);

            var items = [];
            angular.forEach(reportService.criteria.recordDTOs, function(item){
                items.push(_.extendOwn(angular.copy(item.summaryTable.summaryFishSize), item.summaryTable.summaryFaCatchType));

                angular.forEach(item.groups, function(group){
                    items[items.length-1][group.key] = group.value;
                });
            });
            
            var total = reportService.criteria.total;
            total = _.extendOwn(angular.copy(total.summaryFishSize),total.summaryFaCatchType);


            var fishHeaders = ['LSC','BMS','DISCARDED','DIM'];
            var defaults = {};
            angular.forEach(items, function(row){
                angular.forEach(row, function(classItem,className){
                    if(fishHeaders.indexOf(className) !== -1){
                        if(!angular.isDefined(defaults[className])){
                            defaults[className] = {};
                        }
                        angular.forEach(classItem, function(specie,specieName){
                            if(!angular.isDefined(defaults[className][specieName])){
                                defaults[className][specieName] = 0;
                            }
                        });
                    }
                });
            });

            angular.forEach(items, function(row){
                angular.forEach(defaults, function(classItem,className){
                    if(angular.isDefined(row[className])){
                        angular.forEach(classItem, function(specie,specieName){
                            if(!angular.isDefined(row[className][specieName])){
                                row[className][specieName] = specie;
                            }
                        });
                    }else{
                        row[className] = classItem;
                    }
                });
            });

            $scope.tables = {
                catches: {
                    items: items,
                    total: total
                }
            };
            processTables();*/
		}
	};

	/*var serviceData = {
		"data": {
			"catches": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "15"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.2.a.2"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "30F0"
					},
					{
						"key": "TERRITORY",
						"value": "NOR"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"LEM": 109,
								"DAB": 150
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "15"
					},
					{
						"key": "FAO_AREA",
						"value": "27.2.a.2"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "30F0"
					},
					{
						"key": "TERRITORY",
						"value": "NOR"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"DAB": 1137
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "15"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.4.b"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "37F8"
					},
					{
						"key": "TERRITORY",
						"value": "XEU"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"SOL": 988,
								"WHG": 171,
								"COD": 240,
								"DAB": 142,
								"PLE": 2100
							}
						},
						"summaryFaCatchType": null
					}
				}
				],
				"total": {
					"summaryFishSize": {
						"LSC": {
							"SOL": 988,
							"LEM": 109,
							"WHG": 171,
							"COD": 240,
							"PLE": 2100,
							"DAB": 1429
						}
					},
					"summaryFaCatchType": null
				}
			},
			"landing": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "16"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.4.b"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "37F8"
					},
					{
						"key": "TERRITORY",
						"value": "XEU"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"SOL": {
									"GUT": 913
								},
								"HOM": {
									"WHL": 500
								},
								"COD": {
									"ROE-C": 51,
									"GUT": 178
								},
								"PLE": {
									"GUT": 2094
								},
								"DAB": {
									"WHL": 36,
									"GUT": 1106
								}
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "16"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.2.a.2"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "30F0"
					},
					{
						"key": "TERRITORY",
						"value": "NOR"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"DAB": {
									"GUT": 1025
								},
								"PLE": {
									"GUT": 190
								}
							}
						},
						"summaryFaCatchType": null
					}
				}
				],
				"total": {
					"summaryFishSize": {
						"LSC": {
							"SOL": {
								"GUT": 913
							},
							"HOM": {
								"WHL": 500
							},
							"COD": {
								"ROE-C": 51,
								"GUT": 178
							},
							"DAB": {
								"WHL": 36,
								"GUT": 1106
							},
							"PLE": {
								"GUT": 2094
							}
						}
					},
					"summaryFaCatchType": null
				}
			}
		},
		"code": 200
	};*/
	var serviceData = {
		"data": {
			"catches": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "30D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 207.99,
								"ANF": 630.01,
								"HKE": 218.5,
								"SQI": 140,
								"JOD": 22,
								"LEZ": 216.01
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "28D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"ANF": 840,
								"SQI": 336,
								"HKE": 321,
								"NEP": 36,
								"LEZ": 72
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "29D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"POK": 26,
								"GFB": 14,
								"ANF": 280,
								"SQI": 28,
								"HKE": 92,
								"LIN": 26,
								"LEZ": 36
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "J"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "33D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"POL": 26,
								"WHG": 78,
								"ANF": 1015,
								"COD": 26,
								"HKE": 11.5,
								"JOD": 22,
								"LEZ": 156
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "J"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "32D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 78,
								"ANF": 175,
								"HKE": 23,
								"LEZ": 36
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "27D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"ANF": 140,
								"SQI": 350,
								"HKE": 126.5,
								"LEZ": 48
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "31D8"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"HAD": 338,
								"ANF": 315,
								"COD": 26,
								"SQI": 1260,
								"HKE": 80.5,
								"JOD": 154,
								"LEZ": 240.01
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "09"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "B"
					},
					{
						"key": "FAO_AREA",
						"value": "27.7.j"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "27D9"
					},
					{
						"key": "TERRITORY",
						"value": "IRL"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"SOL": 13,
								"TUR": 13,
								"GFB": 314,
								"ANF": 545,
								"COD": 26,
								"SQI": 56,
								"HKE": 458,
								"SQC": 13,
								"LIN": 52,
								"JOD": 22,
								"LEZ": 420
							}
						},
						"summaryFaCatchType": null
					}
				}
				],
				"total": {
					"summaryFishSize": {
						"LSC": {
							"GFB": 328,
							"WHG": 78,
							"HKE": 1331,
							"SQI": 2170,
							"NEP": 36,
							"SQC": 13,
							"JOD": 220,
							"LIN": 78,
							"TUR": 13,
							"SOL": 13,
							"POK": 26,
							"HAD": 623.99,
							"POL": 26,
							"COD": 78,
							"ANF": 3940.01,
							"LEZ": 1224.02
						}
					},
					"summaryFaCatchType": null
				}
			},
			"landing": {
				"recordDTOs": [{
					"groups": [{
						"key": "DATE_DAY",
						"value": "16"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.4.b"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "37F8"
					},
					{
						"key": "TERRITORY",
						"value": "XEU"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"SOL": {
									"GUT": 913
								},
								"HOM": {
									"WHL": 500
								},
								"COD": {
									"ROE-C": 51,
									"GUT": 178
								},
								"PLE": {
									"GUT": 2094
								},
								"DAB": {
									"WHL": 36,
									"GUT": 1106
								}
							}
						},
						"summaryFaCatchType": null
					}
				},
				{
					"groups": [{
						"key": "DATE_DAY",
						"value": "16"
					},
					{
						"key": "EFFORT_ZONE",
						"value": "A"
					},
					{
						"key": "FAO_AREA",
						"value": "27.2.a.2"
					},
					{
						"key": "ICES_STAT_RECTANGLE",
						"value": "30F0"
					},
					{
						"key": "TERRITORY",
						"value": "NOR"
					}
					],
					"summaryTable": {
						"summaryFishSize": {
							"LSC": {
								"DAB": {
									"GUT": 1025
								},
								"PLE": {
									"GUT": 190
								}
							}
						},
						"summaryFaCatchType": null
					}
				}
				],
				"total": {
					"summaryFishSize": {
						"LSC": {
							"SOL": {
								"GUT": 913
							},
							"HOM": {
								"WHL": 500
							},
							"COD": {
								"ROE-C": 51,
								"GUT": 178
							},
							"DAB": {
								"WHL": 36,
								"GUT": 1106
							},
							"PLE": {
								"GUT": 2094
							}
						}
					},
					"summaryFaCatchType": null
				}
			}
		},
		"code": 200
	}
	
	function prepareCatchData() {
		// catches
		var items = [];

		angular.forEach(serviceData.data.catches.recordDTOs, function (item) {
			items.push(_.extendOwn(item.summaryTable.summaryFishSize, item.summaryTable.summaryFaCatchType));
			angular.forEach(item.groups, function (group) {
				items[items.length - 1][group.key] = group.value;
			});
		});

		var total = serviceData.data.catches.total;
		total = _.extendOwn(total.summaryFishSize, total.summaryFaCatchType);


		var fishHeaders = ['LSC', 'BMS', 'DISCARDED', 'DIM'];
		var defaults = {};
		angular.forEach(items, function (row) {
			angular.forEach(row, function (classItem, className) {
				if (fishHeaders.indexOf(className) !== -1) {
					if (!angular.isDefined(defaults[className])) {
						defaults[className] = {};
					}
					angular.forEach(classItem, function (specie, specieName) {
						if (!angular.isDefined(defaults[className][specieName])) {
							defaults[className][specieName] = 0;
						}
					});
				} else {
					if (!angular.isDefined(defaults[className])) {
						defaults[className] = "";
					}
				}

			});
		});

		angular.forEach(items, function (row) {
			angular.forEach(defaults, function (classItem, className) {
				if (angular.isDefined(row[className])) {
					angular.forEach(classItem, function (specie, specieName) {
						if (!angular.isDefined(row[className][specieName])) {
							row[className][specieName] = specie;
						}
					});
				} else {
					row[className] = classItem;
				}
			});
		});

		
		return {
			items: items,
			total: total
		};
	}


	function prepareLandingData(landingItems, orderedDefaultLanding) {

		var landingdata = [];
		angular.forEach(landingItems, function (row) {
			var currentLandingRow = [];
			angular.forEach(orderedDefaultLanding, function (item, defaultKey) {
				angular.forEach(row, function (rowItem, key) {
					if (item.key == key) {
						if (angular.isObject(rowItem)) {
							angular.forEach(item.value, function (defaultSpecie, defaultSpecieName) {
								angular.forEach(rowItem, function (Specie, SpecieName) {
									if (defaultSpecieName === SpecieName) {
										angular.forEach(defaultSpecie, function (defaultSubSpecie, defaultSubSpecieName) {
											angular.forEach(Specie, function (subSpecie, subSpecieName) {
												if (defaultSubSpecieName === subSpecieName) {
													currentLandingRow.push({
														key: subSpecieName,
														value: subSpecie
													});
												}
											});
										});
									}
								});
							});
						} else {
							currentLandingRow.push({
								key: item.key,
								value: rowItem
							});
						}
					}

				});
			});
			landingdata.push(currentLandingRow);
		});
		return landingdata;

	}

	
    function catchDetailsData() {
		
		var catchData = prepareCatchData();

		// landing
		var landingItems = [];
		angular.forEach(serviceData.data.landing.recordDTOs, function (item) {

			landingItems.push(_.extendOwn(item.summaryTable.summaryFishSize, item.summaryTable.summaryFaCatchType));
			angular.forEach(item.groups, function (group) {
				landingItems[landingItems.length - 1][group.key] = group.value;
			});
		});

		var landingTotal = serviceData.data.landing.total;
		landingTotal = _.extendOwn(landingTotal.summaryFishSize, landingTotal.summaryFaCatchType);



		var fishHeaders = ['LSC', 'BMS', 'DISCARDED', 'DIM'];
		var lanDefaults = {};
		angular.forEach(landingItems, function (row) {
			angular.forEach(row, function (classItem, className) {
				if (fishHeaders.indexOf(className) !== -1) {
					if (!angular.isDefined(lanDefaults[className])) {
						lanDefaults[className] = {};
					}
					angular.forEach(classItem, function (specie, specieName) {
						if (!angular.isDefined(lanDefaults[className][specieName])) {
							lanDefaults[className][specieName] = {};
						}
						if (angular.isObject(specie)) {
							angular.forEach(specie, function (subSpecie, subSpecieName) {
								if (!angular.isDefined(lanDefaults[className][specieName][subSpecieName])) {
									lanDefaults[className][specieName][subSpecieName] = 0;
								}
							});
						}
					});
				} else {
					if (!angular.isDefined(lanDefaults[className])) {
						lanDefaults[className] = "";
					}
				}

			});
		});

		angular.forEach(landingItems, function (row) {
			angular.forEach(lanDefaults, function (classItem, className) {

				if (angular.isDefined(row[className])) {
					angular.forEach(classItem, function (specie, specieName) {
						if (!angular.isDefined(row[className][specieName])) {
							row[className][specieName] = specie;
						}
						if (angular.isDefined(row[className][specieName])) {
							angular.forEach(specie, function (subSpecie, subSpecieName) {
								if (!angular.isDefined(row[className][specieName][subSpecieName])) {
									row[className][specieName][subSpecieName] = subSpecie;

								}
							});
						}
					});
				} else {
					row[className] = classItem;
				}
			});
		});

		var orderedDefaultLanding = [];
		angular.forEach(lanDefaults, function (value, key) {
			if (!angular.isObject(value)) {
				orderedDefaultLanding.push({
					key: key,
					value: value
				});
			}
		});

		angular.forEach(lanDefaults, function (value, key) {
			if (angular.isObject(value)) {
				orderedDefaultLanding.push({
					key: key,
					value: value
				});
			}

		});

		var landingRows = prepareLandingData(landingItems, orderedDefaultLanding);
		var landingTotals = prepareLandingData([landingTotal], orderedDefaultLanding);

		$scope.tables = {
			catches: {
				items: catchData.items,
				total: catchData.total
			},
			landing: {
				header: landingItems[0],
				items: landingRows,
				total: _.flatten(landingTotals, true)
			}
		};

		processTables();
	}

	function processTables() {
		var tableOrder = {
			catches: 0,
			landing: 1,
			difference: 2
		};

        /*if(angular.isDefined($scope.tables.difference)){
            var newItems = [];
            angular.forEach($scope.tables.difference.items,function(value,key) {
                var item = angular.copy(value);
                item._ = locale.getString('activity.catch_details_' + key);
                newItems.push(item);
            });
            $scope.tables.difference.items = newItems;
        }*/

		if (angular.isDefined($scope.tables) && _.keys($scope.tables).length) {
			var newTables = [];
			angular.forEach($scope.tables, function (tableData, tableName) {
				var newtable = tableService.convertDataToTable(tableData, 'activity.catch_details_column_', tableName);
				if (tableName !== 'difference') {
					newtable.title = tableName;
				}
				newtable.order = tableOrder[tableName];
				newTables.push(newtable);
			});

			$scope.tables = newTables;
			$scope.isCatchDetailsLoaded = true;
		}
		loadingStatus.isLoading('TripSummary', false);
	}

	init();
});