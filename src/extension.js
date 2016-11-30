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
      self = this,
      contextMenu,
      contextArray = [],
      gaOptionsObj = {},
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
      'Functions': ['Minimum', 'Maximum', 'Mean', 'Median', 'Standard Deviation'],
      'Position': 'dialogBox',
      'Dataset': ['Previous Dataset', 'Next Dataset'],
      'Relative-Position': ['Next', 'Previous']
    };

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
            // ['Minimum', 'Maximum', 'Mean', 'Median', 'Standard Deviation']
            // ['Previous Dataset', 'Next Dataset']
            // ['Next', 'Previous']
            if (subMenuName === 'Minimum' ||
              subMenuName === 'Maximum' || subMenuName === 'Mean' ||
              subMenuName === 'Median' || subMenuName === 'Standard Deviation') {
              self.analyser(subMenuName);
            } else if (subMenuName === 'Previous Dataset') {
              self.analyser({reldatasetposition: -1});
            } else if (subMenuName === 'Next Dataset') {
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
      // console.log(contextArray);
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

    contextArray.push({
      '&nbsp; &nbsp; Reset': {
        handler: function () {
          // console.log('Reset');
          self.analyser('reset');
        },
        action: 'click'
      }
    });

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
