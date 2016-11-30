FusionCharts.register('extension', ['private', 'legend-ext', function () {
  function LegendExt () {
    window.ga = this;
    this.toolbox = FusionCharts.getComponent('api', 'toolbox');
    this.HorizontalToolbar = this.toolbox.HorizontalToolbar;
    this.ComponentGroup = this.toolbox.ComponentGroup;
    this.SymbolStore = this.toolbox.SymbolStore;
  }
  LegendExt.prototype.constructor = LegendExt;

  LegendExt.prototype.renderChange = function () {
    var chartInstance = this.tsObject.chartInstance,
      componentStore = chartInstance.apiInstance.getComponentStore(),
      i = 0;
    for (i = 0; componentStore.getCanvasByIndex(i); ++i) {
      componentStore.getCanvasByIndex(i).getComposition().PlotManager.plot();
    }
  };

  LegendExt.prototype.analyser = function (mode) {
    var ga = this.ga || {},
      store = this.tsObject.apiInstance.getComponentStore(),
      canvas = store.getCanvasByIndex(0),
      nav = store.getNavigatorByIndex(0),
      comp = canvas.getComposition(),
      ds = ga.ds || comp.dataset,
      i,
      idMap = ga.idMap || {},
      storeAr = ga.storeAr || [],
      nStoreArr = [];
    // Declaration ends
    this.ga = ga;
    if (!ga.storeAr) {
      store = {};
      if (!ga.idMap) {
        ds.forEachSeries(function (a, b, c, series) {
          store[series.getId()] = series.getOriginalData();
        });
        for (i in store) {
          storeAr.push(store[i]);
          idMap[i] = storeAr.length - 1;
          // = store[i].map(function (e) { return 20 * e + (Math.random() * 1000); });
        }
        ga.idMap = idMap;
        ga.ds = ds;
        ga.storeAr = storeAr;
        ga.gAnalyser = new GrowthAnalyser(storeAr);
      }
    }
    nStoreArr = ga.gAnalyser.analyse(mode);
    ds.setDataBySeries(function (series) {
      if (nStoreArr.length) {
        series.setOriginalData(nStoreArr[idMap[series.getId()]]);
      }
    });
    comp.impl.update();
  };

  LegendExt.prototype.init = function (require) {
    var instance = this;
    require([
      'xAxis',
      'yAxis',
      'graphics',
      'chart',
      'dataset',
      'PlotManager',
      'canvasConfig',
      'MarkerManager',
      'reactiveModel',
      'globalReactiveModel',
      'spaceManagerInstance',
      'smartLabel',
      'chartInstance',
      function (
            xAxis,
            yAxis,
            graphics,
            chart,
            dataset,
            plotManager,
            canvasConfig,
            markerManager,
            reactiveModel,
            globalReactiveModel,
            spaceManagerInstance,
            smartLabel,
            chartInstance) {
        instance.xAxis = xAxis;
        instance.yAxis = yAxis;
        instance.graphics = graphics;
        instance.chart = chart;
        instance.dataset = dataset;
        instance.plotManager = plotManager;
        instance.markerManager = markerManager;
        instance.canvasConfig = canvasConfig;
        instance.reactiveModel = reactiveModel;
        instance.globalReactiveModel = globalReactiveModel;
        instance.spaceManagerInstance = spaceManagerInstance;
        instance.smartLabel = smartLabel;
        instance.chartInstance = chartInstance;
      }
    ]);
    this.spaceManagerInstance = instance.spaceManagerInstance;
    this.globalReactiveModel = instance.globalReactiveModel;
    this.tsObject = instance.chartInstance;
    this.startDt = instance.globalReactiveModel.model['x-axis-visible-range-start'];
    this.endDt = instance.globalReactiveModel.model['x-axis-visible-range-end'];
    this.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
    this.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];
    this.toolbars = [];
    this.measurement = {};
    this.toolbars.push(this.createToolbar());
    return this;
  };

  LegendExt.prototype.createToolbar = function () {
    var toolbar,
      group,
      selectMenu,
      self = this,
      resetButton,
      label,
      contextMenu,
      contextArray = [],
      i,
      gaOptionsObj = {},
      key,
      obj = {},
      popup,
      paper = this.graphics.paper,
      chartContainer = this.graphics.container;

    toolbar = new this.HorizontalToolbar({
      paper: this.graphics.paper,
      chart: this.chart,
      smartLabel: this.smartLabel,
      chartContainer: this.graphics.container
    });

    toolbar.setConfig({
      fill: '#fff',
      borderThickness: 0
    });

    group = new this.toolbox.ComponentGroup({
      paper: this.graphics.paper,
      chart: this.chart,
      smartLabel: this.smartLabel,
      chartContainer: this.graphics.container
    });

    group.setConfig({
      fill: '#fff',
      borderThickness: 0
    });

    gaOptionsObj = {
      'Fixed-Number': 'dialogBox',
      'Functions': ['min', 'max', 'mean', 'median', 'sd'],
      'Position': 'dialogBox',
      'Dataset': ['Dataset ' + '1', 'Dataset ' + '2'],
      'Relative-Position': ['Next', 'Previous']
    };

    // selectMenu = new this.toolbox.SelectSymbol({
    //   width: 100,
    //   height: 22
    // }, {
    //   paper: this.graphics.paper,
    //   chart: this.chart,
    //   smartLabel: this.smartLabel,
    //   chartContainer: this.graphics.container
    // }, [{
    //   name: 'Fixed Number',
    //   value: 'analyse-fixed-number'
    // },
    // {
    //   name: 'Functions',
    //   value: 'analyse-functions'
    // }, {
    //   name: 'Position',
    //   value: 'analyse-position'
    // }, {
    //   name: 'Dataset',
    //   value: 'analyse-dataset'
    // }, {
    //   name: 'Relative position',
    //   value: 'analyse-relposition'
    // }], {
    //   strokeWidth: 1,
    //   stroke: 'rgba(102,102,102,0.5)',
    //   symbolStrokeWidth: 0,
    //   labelFill: '#000000',
    //   btnTextStyle: {
    //     fontSize: 14
    //   }
    // });

    // selectMenu.attachEventHandlers({
    //   textOnChange: function () {
    //     // self.fromDate.blur();
    //     // self.startDate = self.fromDate.getText();
    //     // `.log(self.fromDate.getText());
    //     if (selectMenu.value() === 'analyse-fixed-number') {
    //       self.analyser(parseInt(window.prompt('Enter value')));
    //     } else if (selectMenu.value() === 'analyse-functions') {
    //       let str = window.prompt('Enter value');
    //       self.analyser(str);
    //     } else if (selectMenu.value() === 'analyse-position') {
    //       self.analyser({position: 0});
    //     } else if (selectMenu.value() === 'analyse-dataset') {
    //       self.analyser({reldatasetposition: -1});
    //     } else if (selectMenu.value() === 'analyse-relposition') {
    //       self.analyser({relposition: -20});
    //     }
    //   }
    // });

    // resetButton = new this.toolbox.Symbol('RESET', true, {
    //   paper: this.graphics.paper,
    //   chart: this.chart,
    //   smartLabel: this.smartLabel,
    //   chartContainer: this.graphics.container
    // }, {
    //   fill: '#555',
    //   labelFill: '#00ff00',
    //   hoverFill: '#00ff00',
    //   width: 30,
    //   height: 20,
    //   btnTextStyle: {
    //     fontSize: 11
    //   }
    // }).attachEventHandlers({
    //   click: function () {
    //       // apply(1);
    //   }
    // });

    // contextMenu = new this.toolbox.SymbolWithContext('ContextIcon', {
    //   paper: this.graphics.paper,
    //   chart: this.chart,
    //   smartLabel: this.smartLabel,
    //   chartContainer: this.graphics.container
    // }, {
    //   width: 15,
    //   height: 15,
    //   strokeWidth: 1,
    //   stroke: '#7f7f7f',
    //   radius: 2
    // });

    // contextMenu.appendAsList([
    //   {
    //     'Export In PNG': {
    //       handler: function () {
    //           // console.log('Reset');
    //       },
    //       action: 'click'
    //     }
    //   },
    //   {
    //     'Export In PDF': {
    //       handler: function () {
    //           // console.log('Update');
    //       },
    //       action: 'click'
    //     }
    //   }
    // ]);

    contextMenu = new this.toolbox.SymbolWithContext('ContextIcon', {
      paper: this.graphics.paper,
      chart: this.chart,
      smartLabel: this.smartLabel,
      chartContainer: this.graphics.container
    }, {
      width: 20,
      height: 20,
      position: 'right'
    });

    contextArray.push({
      '<b>Growth Analyser</b>': {}
    });
    popup = function (callback) {
      var box,
        header,
        style = {
          fontSize: 10 + 'px',
          lineHeight: 15 + 'px',
          fontFamily: 'Lucida Grande',
          stroke: '#000000',
          'stroke-width': '2'
        },
        headerWidth = 180,
        headerText,
        cross,
        inputField,
        applyButton,
        x = 500,
        y = 100;

      box = paper.html('div', {
        fill: '#f1e8e8',
        x: x,
        y: y,
        width: 180,
        height: 80
      }, style, chartContainer);

      header = paper.html('div', {
        fill: '#afa695',
        width: headerWidth,
        height: 20
      }, style, box);

      headerText = paper.html('div', {
        fill: 'transparent',
        width: headerWidth * 0.6,
        height: 20,
        x: 10,
        y: 2
      }, style, header);

      headerText.attr({
        text: 'Provide Specific Value'
      });

      cross = paper.html('div', {
        fill: 'transparent',
        width: 10,
        height: 10,
        x: 10 + (headerWidth * 0.6),
        y: 2,
        text: 'X',
        cursor: 'pointer'
      }, style, header);

      cross.on('click', function () {
        box.hide();
      });

      inputField = paper.html('input', {
        width: 100,
        height: 20,
        x: 10,
        y: 30
      }, style, box);

      applyButton = paper.html('div', {
        width: 50,
        height: 20,
        x: 120,
        y: 30,
        fill: '#525252'
      }, {
        fontSize: 10 + 'px',
        lineHeight: 15 + 'px',
        fontFamily: 'Lucida Grande',
        fill: '#ffffff',
        cursor: 'pointer'
      }, box);

      applyButton.on('click', function () {
        box.hide();
        callback(inputField.val());
      });

      applyButton.attr({
        text: 'APPLY'
      });
    };

    for (let i in gaOptionsObj) {
      let key,
        obj = {},
        subObj = {};
      if (gaOptionsObj[i] === 'dialogBox') {
        key = '&nbsp; &nbsp; ' + i;
        obj[key] = {};
        obj[key] = {
          handler: function () {
            console.log(i);
            // let popupVal = popup(function (str) {
            //   self.analyser(parseInt(str));
            // });
            if (i === 'Fixed-Number') {
              // self.analyser(parseInt(window.prompt('Enter value')));
              let popupVal = popup(function (str) {
                self.analyser(parseInt(str));
              });
            } else if (i === 'Position') {
              let popupVal = popup(function (str) {
                self.analyser({position: str});
              });
            }
          },
          action: 'click'
        };
      } else {
        key = '&#9666&nbsp; ' + i;
        obj[key] = {};
        obj[key].action = 'click';
        obj[key].handler = [];
        for (let j = 0; j < gaOptionsObj[i].length; j++) {
          let subMenuName = gaOptionsObj[i][j];
          subObj = {};
          subObj['&nbsp;' + subMenuName] = {};
          console.log(subMenuName);
          subObj['&nbsp;' + subMenuName].handler = function () {
            console.log(subMenuName, i, j);
            // ['min', 'max', 'mean', 'median', 'sd']
            // ['Dataset ' + '1', 'Dataset ' + '2']
            // ['Next', 'Previous']
            if (subMenuName === 'min' ||
              subMenuName === 'max' || subMenuName === 'mean' ||
              subMenuName === 'median' || subMenuName === 'sd') {
              self.analyser(subMenuName);
            } else if (subMenuName === 'Dataset ' + '1') {
              self.analyser({reldatasetposition: -1});
            } else if (subMenuName === 'Dataset ' + '2') {
              self.analyser({reldatasetposition: 1});
            } else if (subMenuName === 'Next') {
              self.analyser({relposition: -1});
            } else if (subMenuName === 'Previous') {
              self.analyser({relposition: 1});
            }
          };
          subObj['&nbsp;' + subMenuName].action = 'click';
          obj[key].handler.push(subObj);
        }
      }
      console.log(contextArray);
      contextArray.push(obj);
      contextArray.push({
        '': {
          style: {
            backgroundColor: '#000000',
            height: '1px',
            margin: '1px',
            padding: '0px',
            opacity: '0.3'

          }
        }
      });
    }

    contextMenu.appendAsList(contextArray);

    this.SymbolStore.register('ContextIcon', function (posx, posy, rad) {
      var x = posx,
        y = posy,
        r = rad * 2,
        space = Math.round(r / 4),
        halfWidth = Math.round(r / 2) * 0.7,
        startX = (x - halfWidth),
        endX = (x + halfWidth),
        startY = (y + space),
        endY = (y - space);
      return ['M', startX, y, 'L', endX, y, 'M', startX, startY, 'L', endX, startY, 'M', startX, endY, 'L', endX, endY];
    });

    // this.SymbolStore.register('textBoxIcon', function (x, y, rad, w, h, padX, padY) {
    //   var x1 = x - w / 2 + padX / 2,
    //     x2 = x + w / 2 - padX / 2,
    //     y1 = y - h / 2 + padY / 2,
    //     y2 = y + h / 2 - padY / 2;

    //   return ['M', x1, y1, 'L', x2, y1, 'L', x2, y2, 'L', x1, y2, 'Z'];
    // });

    // group.addSymbol(selectMenu);
    // group.addSymbol(resetButton);
    group.addSymbol(contextMenu);
    toolbar.addComponent(group);
    return toolbar;
  };

  LegendExt.prototype.getLogicalSpace = function (availableWidth, availableHeight) {
    availableWidth /= 2;
    var logicalSpace,
      width = 0,
      height = 0,
      i,
      ln;

    for (i = 0, ln = this.toolbars.length; i < ln; i++) {
      logicalSpace = this.toolbars[i].getLogicalSpace(availableWidth, availableHeight);
      width = Math.max(logicalSpace.width, width);
      height += logicalSpace.height;
      this.toolbars[i].width = logicalSpace.width;
      this.toolbars[i].height = logicalSpace.height;
    }
    height += this.padding;
    return {
      width: width > availableWidth ? 0 : width,
      height: height > availableHeight ? 0 : height
    };
  };

  LegendExt.prototype.placeInCanvas = function () {
    var self = this;
    self.padding = 5;
    self.spaceManagerInstance.add([{
      name: function () {
        return 'ToolBoxExt';
      },
      ref: function (obj) {
        return obj['0'];
      },
      self: function () {
        return self;
      },
      priority: function () {
        return 2;
      },
      layout: function (obj) {
        return obj.inline;
      },
      orientation: [{
        type: function (obj) {
          return obj.horizontal;
        },
        position: [{
          type: function (obj) {
            return obj.top;
          },
          alignment: [{
            type: function (obj) {
              return obj.right;
            },
            dimensions: [function () {
              var parent = this.getParentComponentGroup();
              return self.getLogicalSpace(parent.getWidth(), parent.getHeight());
            }]
          }]
        }]
      }]
    }]);
  };

  LegendExt.prototype.setDrawingConfiguration = function (x, y, width, height, group) {
    var mes = this.measurement;
    mes.x = x;
    mes.y = y;
    mes.width = width;
    mes.height = height;

    this.parentGroup = group;

    return this;
  };

  LegendExt.prototype.draw = function (x, y, width, height, group) {
    var measurement = this.measurement,
      toolbars = this.toolbars,
      ln,
      i,
      toolbar;
    x = x === undefined ? measurement.x : x;
    y = y === undefined ? measurement.y : y;
    width = width === undefined ? measurement.width : width;
    height = height === undefined ? measurement.height : height;
    group = group === undefined ? this.parentGroup : group;
    if (width && height) {
      for (i = 0, ln = toolbars.length; i < ln; i++) {
        toolbar = toolbars[i];
        toolbar.draw(x, y);
      }
    }
  };

  FusionCharts.registerComponent('extensions', 'legendExt', LegendExt);
}]);
