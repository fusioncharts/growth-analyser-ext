FusionCharts.register('extension', ['private', 'legend-ext', function () {
  function LegendExt () {}
  LegendExt.prototype.constructor = LegendExt;

  LegendExt.prototype.init = function (require) {
    var instance = this,
      saveTo = 'tsObject',
      requiredParams = [
        'chartInstance',
        'graphics',
        'globalReactiveModel',
        function acquire () {
          let i = 0,
            ii = requiredParams.length - 1,
            param = '';
          instance[saveTo] = instance[saveTo] || {};
          instance.requiredParams = {};
          for (i = 0; i < ii; ++i) {
            param = requiredParams[i];
            instance[saveTo][param] = arguments[i];
          }
          onInit(instance[saveTo]);
        }
      ];
    require(requiredParams);
    // Init additional logic here
    function onInit (params) {
    }
    window.a = this;
    return this;
  };

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

  LegendExt.prototype.getLogicalSpace = function () {
    return {
      width: 70,
      height: 30
    };
  };

  LegendExt.prototype.placeInCanvas = function (containerInstance) {
    var logicalSpace = this.getLogicalSpace();

    containerInstance.addComponent([{
      pIndex: 3,
      type: 'HorizontalSwimLane',
      components: [{
        type: 'VerticalSwimLane',
        components: [{
          width: logicalSpace.width,
          height: logicalSpace.height,
          name: 'LegendExt',
          x: function () {
            return this.get('x', 'Canvas0Group') + this.get('width', 'Canvas0Group') / 2 - logicalSpace.width;
          },
          type: 'Modules',
          ref: this
        }]
      }]
    }], 0);
  };

  LegendExt.prototype.draw = function (x, y, width, height) {
    this.tsObject.graphics.paper.rect(0, 0, width, height);
  };

  LegendExt.prototype.dispose = function () {

  };

  FusionCharts.registerComponent('extensions', 'legendExt', LegendExt);
}]);
