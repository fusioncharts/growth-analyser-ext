var tsChart;
        function getRandomDates (len) {
        var day = 1, months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct', 'Nov','Dec'],
               year = 2015,month = 0,arr = [];

           for (i = 0; i < len; i++) {
               if (month === 11 && day === 31) {
                   year++;
                   month = 0;
               }
               if (day > 30 || (month === 1 && day === 28)) {
                   day = 1;
                   month++;
               }
               if (month > 11) {
                   month = 0;
               }



               dateStr = day + '-' + months[month] + '-' + year;
               arr.push(dateStr);
               day++;
           }
           return arr;
       }

       function getRandomSeries (len) {
           var arr = [];

           for (i = 0; i < len; i++) {
               arr.push(Math.floor(Math.random() * 10));
           }
           return arr;
       }

       function getRandomCandleSeries (len) {
           var arr = [],
               open,
               high,
               low,
               close;

           for (i = 0; i < len; i++) {
               open = Math.floor(Math.random() * 10);
               close = Math.floor(Math.random() * 10);
               high = Math.floor(Math.random() * 10);
               low = Math.floor(Math.random() * 10);

               arr.push([open, high, low, close]);
           }

           return arr;
       }
       var data1;
        FusionCharts.ready(function () {
            tsChart = new FusionCharts({
                type: 'timeseries',
                plottype: 'line',
                renderAt: 'chart-container',
                width: '900',
                height: '550',
                dataFormat: 'json',
                dataSource: {
                    chart: 
                    {
                      'exportEnabled': 1,
                        axes: [
                            {
                                x: { },
                                y: { }
                            }
                        ],
                        datasets: [{
                            category: {
                                dateformat: "%e-%b-%Y",
                                data: getRandomDates(200)
                            },
                            dataset: [
                                {
                                    uid: 'ds-1',
                                    series: [
                                        {
                                            plot: {
                                                type: "column"
                                            },
                                            name: "Series 1",
                                            data: getRandomSeries(200)
                                        },
                                        {
                                            plot: {
                                                type: "line"
                                            },
                                            name: "Series 1",
                                            data: getRandomSeries(200)
                                        }
                                        // {
                                        //     plot: {
                                        //         type: "line",
                                        //         style: {
                                        //           stroke: '#ff0000',
                                        //           'stroke-width': 2
                                        //         }
                                        //     },
                                        //     name: "Series 1",
                                        //     data: getRandomSeries(20)
                                        // }

                                    ]
                                }
                            ]
                        }],
                        canvas: [{
                            axes: function (store) {
                                return store.getAxesByIndex(0);
                            },
                            dataset: function (store) {
                                return store.getDatasetsByIndex(0);
                            }
                        }],
                        caption:[{
                          title: {
                            text: 'Basic Elements'
                          },
                          subtitle: {
                            text: 'Sub-caption'
                          }
                        }]

                    }
                }

            })
            .render();

        console.log(data1);
        });