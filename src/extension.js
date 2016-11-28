FusionCharts.register('extension', ['private', 'legend-ext', function () {
  function LegendExt () {
    console.log('hello');
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
      store = this.tsObject.chartInstance.apiInstance.getComponentStore(),
      canvas = store.getCanvasByIndex(0),
      nav = store.getNavigatorByIndex(0),
      comp = canvas.getComposition(),
      ds = ga.ds || comp.dataset,
      i,
      idMap = ga.idMap || {},
      storeAr = ga.storeAr || [];
    // Declaration ends
    window.a = this;
    this.ga = ga;
    store = {};
    if (!ga.idMap) {
      console.log(1);
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
    }
    console.log(storeAr[0]);
    storeAr = storeAr.map((a) => {
      return a.map((b) => { return b; });
    });
    storeAr = new GrowthAnalyser(storeAr).analyse(mode);
    ds.setDataBySeries(function (series) {
      series.setOriginalData(storeAr[idMap[series.getId()]]);
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
            smartLabel) {
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
      }
    ]);
    this.spaceManagerInstance = instance.spaceManagerInstance;
    this.globalReactiveModel = instance.globalReactiveModel;
    this.startDt = instance.globalReactiveModel.model['x-axis-visible-range-start'];
    this.endDt = instance.globalReactiveModel.model['x-axis-visible-range-end'];
    this.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
    this.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];
    this.toolbars = [];
    this.measurement = {};
    this.toolbars.push(this.createToolbar());
    // console.log(this.createToolbar());
    // console.log(this.dateStart, this.dateEnd);
    return this;
  };

  LegendExt.prototype.createToolbar = function () {
    var toolbar,
      group,
      selectMenu;

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

    selectMenu = new this.toolbox.SelectSymbol({
      width: 100,
      height: 22
    }, {
      paper: this.graphics.paper,
      chart: this.chart,
      smartLabel: this.smartLabel,
      chartContainer: this.graphics.container
    }, [{
      name: 'Fixed Number',
      value: 'analyse-fixed-number'
    },
    {
      name: 'Functions',
      value: 'analyse-functions'
    }, {
      name: 'Position',
      value: 'analyse-position'
    }, {
      name: 'Dataset',
      value: 'analyse-dataset'
    }], {
      strokeWidth: 1,
      stroke: 'rgba(102,102,102,0.5)',
      symbolStrokeWidth: 0,
      labelFill: '#000000',
      btnTextStyle: {
        fontSize: 14
      }
    });

    selectMenu.attachEventHandlers({
      textOnChange: function () {
        // self.fromDate.blur();
        // self.startDate = self.fromDate.getText();
        // console.log(self.fromDate.getText());
        var obj = {};
        console.log(selectMenu.value());
        // obj['analyse-fixed-number']
        // obj['analyse-functions']
        // obj['analyse-position']
        // obj['analyse-dataset']
        // obj['analyse-functions']
      }
    });

    this.SymbolStore.register('textBoxIcon', function (x, y, rad, w, h, padX, padY) {
      var x1 = x - w / 2 + padX / 2,
        x2 = x + w / 2 - padX / 2,
        y1 = y - h / 2 + padY / 2,
        y2 = y + h / 2 - padY / 2;

      return ['M', x1, y1, 'L', x2, y1, 'L', x2, y2, 'L', x1, y2, 'Z'];
    });

    group.addSymbol(selectMenu);
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
      logicalSpace = this.toolbars[i].getLogicalSpace();
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
              return obj.left;
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
