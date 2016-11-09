FusionCharts.register('extension', ['private', 'legend-ext', function () {
  function LegendExt () {}
  LegendExt.prototype.constructor = LegendExt;

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
        globalReactiveModel) {
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
        console.log(arguments);
      }
    ]);
    return this;
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
    var rect = this.graphics.paper.rect(0, 0, width, height);
    rect.attr('fill', '#349e26');
    rect.animate({
      fill: '#12978e',
      height: 10.23 * height,
      width: 8.4 * width
    }, 3000, 'linear');
  };

  LegendExt.prototype.dispose = function () {

  };

  FusionCharts.registerComponent('extensions', 'legendExt', LegendExt);
}]);
