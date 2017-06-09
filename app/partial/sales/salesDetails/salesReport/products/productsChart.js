(function () {
    'use strict';

    angular
    .module('unionvmsWeb')
    .component('salesProductsChart', {
        templateUrl: 'partial/sales/salesDetails/salesReport/products/productsChart.html',
        controller: productsChartCtrl,
        controllerAs: 'vm',
        bindings: {
            products: '<',
            filterProducts: '='
        }
    });

    function productsChartCtrl($scope) {
        /* jshint validthis:true */
        var vm = this;

        //Define $onInit event handler
        vm.$onInit = onInit;

        //Define click event handler
        vm.chartClick = chartClick;

        ////////////////////

        function onInit() {

            vm.labels = [];
            var lsc = [], bms = [], avg = [], min = [], max = [], total = [], count = 0, index = -1, species = '';
            vm.colors = {
                lsc: '#97bbcd',
                bms: '#dcdcdc',
                avg: '#f7464a',
                max: '#46bfbd',
                min: '#fdb45c'
            };

            //Sort products by species
            var products = _.sortBy(vm.products, 'species');

            //Group data by species
            products.forEach(function (product) {
                if (species !== product.species) {
                    index++;
                    species = product.species;
                    vm.labels.push(species);
                    lsc.push(0);
                    bms.push(0);
                    min.push(0);
                    max.push(0);
                    total.push(0);

                    //calculate previous average
                    if (index !== 0) {
                        avg.push(calculateAvg(total[index - 1], count));
                    }

                    count = 0;
                }

                count++;

                //Sum weight per class (LSC = legal size class, BMS = below minimum size)
                if (product.distributionClass === 'LSC') {
                    lsc[index] += product.weight;
                } else if (product.distributionClass === 'BMS') {
                    bms[index] += product.weight;
                }

                //Update minimum price
                if (count === 1 || product.price < min[index]) {
                    min[index] = product.price;
                }

                //Update maximum price
                if (count === 1 || product.price > max[index]) {
                    max[index] = product.price;
                }

                //Update total price
                total[index] += product.price;
            });

            //calculate last average
            avg.push(calculateAvg(total[index], count));

            //define data sets
            vm.data = [lsc, bms, avg, max, min];

            //define chart color list
            vm.colorlist = [vm.colors.lsc, vm.colors.bms, vm.colors.avg, vm.colors.max, vm.colors.min];

            //define options
            vm.options = {
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var txt = data.datasets[tooltipItem.datasetIndex].label + ': ' + tooltipItem.yLabel.toFixed(2);
                            if (tooltipItem.datasetIndex < 2){
                                return txt + ' kg';
                            }
                            return txt + ' €';
                        }
                    }
                    //enabled: false
                },
                //scaleUse2X: true,
                scaleUse2Y: true,
                scales: {
                    xAxes: [
                        {
                            stacked: true
                        }
                    ],
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            stacked: true,
                            display: false
                        },
                        {
                            id: 'y-axis-2',
                            stacked: false,
                            display: false
                        }
                    ]
                }
            };


            //Override the dataset formatting to allow for bar and line chart combo
            vm.datasetOverride = [
                {
                    label: "LSC",
                    borderWidth: 1,
                    type: 'bar',
                    yAxisID: 'y-axis-1'
                },
                {
                    label: "BMS",
                    borderWidth: 1,
                    type: 'bar',
                    yAxisID: 'y-axis-1'
                },
                {
                    label: "Avg price",
                    borderWidth: 2,
                    type: 'line',
                    backgroundColor: 'transparent',
                    yAxisID: 'y-axis-2'
                },
                {
                    label: "Max price",
                    borderWidth: 2,
                    type: 'line',
                    backgroundColor: 'transparent',
                    yAxisID: 'y-axis-2'
                },
                {
                    label: "Min price",
                    borderWidth: 2,
                    type: 'line',
                    backgroundColor: 'transparent',
                    yAxisID: 'y-axis-2'
                }
            ];

            //Filter on first species
            vm.filterProducts(vm.labels[0]);
        }

        function calculateAvg(total, count) {
            return Math.round((total / count) * 100) / 100;
        }

        //Handle click event on chart. Filter products based on species.
        function chartClick(points, evt) {
            if (angular.isDefined(points) && angular.isDefined(points[0]) && angular.isDefined(points[0]._model) && angular.isDefined(points[0]._model.label)) {
                vm.filterProducts(points[0]._model.label);
            }
        }
    }
})();
