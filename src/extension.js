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
      let chartInstance = params.chartInstance,
        store = chartInstance.apiInstance.getComponentStore(),
        storeDatasets = store.getAllDatasets(),
        allDatasetArr = [],
        i = 0,
        ii = 0,
        j = 0,
        currentDs = {},
        growthAnalyserArr = [];
      for (i = 0; storeDatasets[i]; ++i) {
        allDatasetArr[i] = [];
        currentDs = storeDatasets[i];
        if (currentDs && currentDs.series) {
          for (j = 0; currentDs.series[j] && currentDs.series[j].data; ++j) {
            allDatasetArr[i].push(currentDs.series[j].data);
          }
        }
      }
      // Getting growth analyser object from dataset array
      for (i = 0, ii = allDatasetArr.length; i < ii; ++i) {
        growthAnalyserArr.push(new GrowthAnalyser(allDatasetArr[i]));
      }
      // Saving retrieved growth analyser array to instance
      instance.tsObject.growthAnalyserArr = growthAnalyserArr;
      // saving dataset to instance
      instance.tsObject.dataStore = storeDatasets;
      window.g = params.globalReactiveModel;
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
    var i = 0,
      ii = 0,
      j = 0,
      jj = 0,
      dataStore = this.tsObject.dataStore,
      gaArr = this.tsObject.growthAnalyserArr,
      gaOb = {};
    for (i = 0, ii = gaArr.length; i < ii; ++i) {
      gaOb = gaArr[i].analyse(mode);
      for (j = 0, jj = gaOb.length; j < jj; ++j) {
        dataStore[i].series[j].data = gaOb[j];
      }
    }
    // Rendering the change
    this.renderChange();
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
