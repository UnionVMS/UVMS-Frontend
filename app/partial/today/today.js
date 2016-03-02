angular.module('unionvmsWeb').controller('TodayCtrl',function($scope, holdingTable){
    $scope.refreshInterval = 60;

        $scope.data = {
            dataset0: [
              {x: 0, val_0: 0, val_1: 0, val_2: 0, val_3: 0},
              {x: 1, val_0: 0.993, val_1: 3.894, val_2: 8.47, val_3: 14.347},
              {x: 2, val_0: 1.947, val_1: 7.174, val_2: 13.981, val_3: 19.991},
              {x: 3, val_0: 2.823, val_1: 9.32, val_2: 14.608, val_3: 13.509},
              {x: 4, val_0: 3.587, val_1: 9.996, val_2: 10.132, val_3: -1.167},
              {x: 5, val_0: 4.207, val_1: 9.093, val_2: 2.117, val_3: -15.136},
              {x: 6, val_0: 4.66, val_1: 6.755, val_2: -6.638, val_3: -19.923},
              {x: 7, val_0: 4.927, val_1: 3.35, val_2: -13.074, val_3: -12.625}
            ]
          };


    $scope.options = {
        series: [
          {
            axis: "y",
            dataset: "dataset0",
            key: "val_0",
            label: "An area series",
            color: "#1f77b4",
            type: ['line', 'dot', 'area'],
            id: 'mySeries0'
          }
        ],
    axes: {x: {key: "x"}}
    };
    
    holdingTable.countOpen().then(function(count) {
        $scope.holdingTableOpenCount = count;
    });

    holdingTable.countAlarms().then(function(count) {
        $scope.alarmCount = count;
    });

    holdingTable.countDraftMovements().then(function(drafts) {
        $scope.drafts = drafts;
    });
	 var chart1 = {};
        chart1.type = "ColumnChart";
        chart1.displayed = false;
        chart1.data = {
            "cols": [{
                id: "month",
                label: "Month",
                type: "string"
            }, {
                id: "holding-id",
                label: "Reports in holding",
                type: "number"
            }, {
                id: "desktop-id",
                label: "Transponder alarms",
                type: "number"
            }, {
                id: "server-id",
                label: "Transponder alarms",
                type: "number"
            }, {
                id: "cost-id",
                label: "E-mail",
                type: "number"
            }],
            "rows": [{
                c: [{
                    v: "Alarms in January"
                }, {
                    v: 19
                }, {
                    v: 12
                }, {
                    v: 7
                }, {
                    v: 4
                }]
            }, {
                c: [{
                    v: "Alarms in February"
                }, {
                    v: 13
                }, {
                    v: 1
                }, {
                    v: 12
                }, {
                    v: 2
                }]
            }, {
                c: [{
                        v: "Alarms in March"
                    }, {
                        v: 24
                    }, {
                        v: 5
                    }, {
                        v: 11
                    }, {
                        v: 6
                    }
                ]
            }]
        };

        chart1.options = {
            "title": "Messages per month",
            "isStacked": "true",
            "fill": 20,
            "displayExactValues": true,
            "vAxis": {
                "title": "Messages unit",
                "gridlines": {
                    "count": 10
                }
            },
            "hAxis": {
                "title": "Month"
            }
        };


        var formatCollection = [{
            name: "color",
            format: [{
                columnNum: 4,
                formats: [{
                    from: 0,
                    to: 3,
                    color: "white",
                    bgcolor: "red"
                }, {
                    from: 3,
                    to: 5,
                    color: "white",
                    fromBgColor: "red",
                    toBgColor: "green"
                }, {
                    from: 6,
                    to: null,
                    color: "black",
                    bgcolor: "#33ff33"
                }]
            }]
        }, {
            name: "arrow",
            checked: false,
            format: [{
                columnNum: 1,
                base: 19
            }]
        }, {
            name: "date",
            format: [{
                columnNum: 5,
                formatType: 'long'
            }]
        }, {
            name: "number",
            format: [{
                columnNum: 4,
                prefix: '$'
            }]
        }, {
            name: "bar",
            format: [{
                columnNum: 1,
                width: 100
            }]
        }];

        chart1.formatters = {};

        $scope.chart = chart1;
        $scope.cssStyle = "height:300px; width:100%;";

        $scope.chartSelectionChange = function() {

            if (($scope.chart.type === 'Table' && $scope.chart.data.cols.length === 6 && $scope.chart.options.tooltip.isHtml === true) ||
                ($scope.chart.type !== 'Table' && $scope.chart.data.cols.length === 6 && $scope.chart.options.tooltip.isHtml === false)) {
                $scope.chart.data.cols.pop();
                delete $scope.chart.data.rows[0].c[5];
                delete $scope.chart.data.rows[1].c[5];
                delete $scope.chart.data.rows[2].c[5];
            }


            if ($scope.chart.type === 'Table') {

                $scope.chart.options.tooltip.isHtml = false;

                $scope.chart.data.cols.push({
                    id: "data-id",
                    label: "Date",
                    type: "date"
                });
                $scope.chart.data.rows[0].c[5] = {
                    v: "Date(2013,01,05)"
                };
                $scope.chart.data.rows[1].c[5] = {
                    v: "Date(2013,02,05)"
                };
                $scope.chart.data.rows[2].c[5] = {
                    v: "Date(2013,03,05)"
                };
            }
        };


        $scope.htmlTooltip = function() {

            if ($scope.chart.options.tooltip.isHtml) {
                $scope.chart.data.cols.push({
                    id: "",
                    "role": "tooltip",
                    "type": "string",
                    "p": {
                        "role": "tooltip",
                        'html': true
                    }
                });
                $scope.chart.data.rows[0].c[5] = {
                    v: " <b>Shippingddd " + $scope.chart.data.rows[0].c[4].v + "</b><br /><img src=\"http://icons.iconarchive.com/icons/antrepo/container-4-cargo-vans/512/Google-Shipping-Box-icon.png\" style=\"height:85px\" />"
                };
                $scope.chart.data.rows[1].c[5] = {
                    v: " <b>Shipping " + $scope.chart.data.rows[1].c[4].v + "</b><br /><img src=\"http://icons.iconarchive.com/icons/antrepo/container-4-cargo-vans/512/Google-Shipping-Box-icon.png\" style=\"height:85px\" />"
                };
                $scope.chart.data.rows[2].c[5] = {
                    v: " <b>Shipping " + $scope.chart.data.rows[2].c[4].v + "</b><br /><img src=\"http://icons.iconarchive.com/icons/antrepo/container-4-cargo-vans/512/Google-Shipping-Box-icon.png\" style=\"height:85px\" />"
                };
            }
            else {
                $scope.chart.data.cols.pop();
                delete $scope.chart.data.rows[0].c[5];
                delete $scope.chart.data.rows[1].c[5];
                delete $scope.chart.data.rows[2].c[5];
            }
        };


        $scope.hideServer = false;
        $scope.selectionChange = function() {
            if ($scope.hideServer) {
                $scope.chart.view = {
                    columns: [0, 1, 2, 4]
                };
            }
            else {
                $scope.chart.view = {};
            }
        };

        $scope.formatCollection = formatCollection;
        $scope.toggleFormat = function(format) {
            $scope.chart.formatters[format.name] = format.format;
        };

        $scope.chartReady = function() {
            fixGoogleChartsBarsBootstrap();
        };

        function fixGoogleChartsBarsBootstrap() {
            // Google charts uses <img height="12px">, which is incompatible with Twitter
            // * bootstrap in responsive mode, which inserts a css rule for: img { height: auto; }.
            // *
            // * The fix is to use inline style width attributes, ie <img style="height: 12px;">.
            // * BUT we can't change the way Google Charts renders its bars. Nor can we change
            // * the Twitter bootstrap CSS and remain future proof.
            // *
            // * Instead, this function can be called after a Google charts render to "fix" the
            // * issue by setting the style attributes dynamically.

            $(".google-visualization-table-table img[width]").each(function(index, img) {
                $(img).css("width", $(img).attr("width")).css("height", $(img).attr("height"));
            });
        }


}).directive('widgetPlaceholder', function() {
    return {
        restrict: 'E',
        template: '<div style="width: 100%; height: 100%; border: 2px dashed #dddddd; border-radius:4px;"></div>'
    };
});
