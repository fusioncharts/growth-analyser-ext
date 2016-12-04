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
       function getRandomMS (len) {
        var timeNow = +new Date - 1.5 * 365 * 24 * 60 * 60 * 1000,
          arr = [],
          i = 0,
          per = 0,
          incr = 47304000000 / len,
          floor = Math.floor;

        for(i = 0; i < len; ++i) {
          per = i / len;
          if (per < 0.25) {
            timeNow += incr * 2;
          } else if (per < 0.5) {
            timeNow += incr * 1;
          } else if (per < 0.75) {
            timeNow += incr / 4;
          } else if (per < 0.8) {
            timeNow += incr / 8;
          } else if (per < 0.85) {
            timeNow += incr / 800000;
          } else if (per < 0.9) {
            timeNow += incr / 1200000;
          } else {
            timeNow += 10;
          }
          window.arr = arr;
          arr.push(floor(timeNow))
        }

        return arr;
       }

       function getRandomSeries (len) {
           var arr = [];

           for (i = 0; i < len; i++) {
               arr.push(Math.floor(Math.random() * 150));
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
            window.data = {
                type: 'timeseries',
                plottype: 'line',
                renderAt: 'chart-container',
                width: '800',
                height: '450',
                dataFormat: 'json',
                dataSource: {
                    chart: 
                    {
                      'exportEnabled': 1,
                        axes: [
                            {
                                x: { },
                                y: {
                                  name: {
                                    text: 'Sale'
                                  }
                                }
                            }
                        ],
                        datasets: [{
                            category: {
                                data: getRandomMS(50)
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
                                            data: getRandomSeries(50)
                                        },
                                        {
                                            plot: {
                                                type: "line"
                                            },
                                            name: "Series 1",
                                            data: getRandomSeries(50)
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
                    },
                    'extensions': {
                      'growth-analyser': {
                        'growthOver': '3', // Minimum, Maximum, Mean, Median, Standard Deviation
                                                   // prevIndex, firstIndex
                        'axisFormatter': function (prevData, mode) {
                            mode = mode + '';
                            return 'Growth of ' + prevData + ' over ' + mode.toLowerCase();
                        },
                        'posWrtCanvas': 'top',
                        'layout': 'inline',
                        'alignment': 'right',
                        'orientation': 'horizontal',
                        'style': {
                          'category': {
                            'font-size': '13px',
                            'color': '#4b4b4b',
                            'font-family': '"Lucida Grande", Sans-serif',
                            'fontWeight': 'bold'
                          },
                          'subCategory': {
                            'font-size': '12px',
                            'color': '#4b4b4b',
                            'font-family': '"Lucida Grande", Sans-serif'
                          },
                          'popup': {
                            'fontSize': '10px',
                            'lineHeight': '15px',
                            'font-family': '"Lucida Grande", Sans-serif',
                            'stroke': '#676767',
                            'stroke-width': '2'
                          }
                        }
                      }
                    }
                 }

            };
            tsChart = new FusionCharts(window.data)
            .render();

        console.log(data1);
        });