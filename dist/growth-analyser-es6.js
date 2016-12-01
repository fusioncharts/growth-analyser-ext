(function(window, document, undefined) {
"use strict";

FusionCharts.register('extension', ['private', 'legend-ext', function () {
  function LegendExt () {
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
      nStoreArr = [],
      yAxis = canvas.composition.yAxis;
    // Changing y Axis formattor
    debugger;
    if (mode === 'reset') {
      yAxis.getScaleObj().getIntervalObj().getConfig('intervals').major.formatter = function (val) {
        return val;
      };
    } else {
      yAxis.getScaleObj().getIntervalObj().getConfig('intervals').major.formatter = function (val) {
        return val + '%';
      };
    }
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
      'canvasData',
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
            chartInstance,
            canvasData) {
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
        instance.canvasData = canvasData;
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
      chartContainer = this.graphics.container,
      subCatStyle = {
        'font-size': '12px',
        'color': '#696969'
      };

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
      width: 23,
      height: 23,
      position: 'right',
      stroke: '#ced5d4',
      symbolStroke: '#696969'
    });

    contextArray.push({
      'Growth Analyser': {
        style: {
          'color': '#696969',
          'font-family': 'MyriadPro',
          'font-weight': 'bold'
        }
      }
    });
    popup = function (callback) {
      var box,
        header,
        style = {
          fontSize: 10 + 'px',
          lineHeight: 15 + 'px',
          fontFamily: 'Lucida Grande',
          stroke: '#676767',
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
        fill: '#f7f7f7',
        x: x - 200,
        y: y + 100,
        width: 180,
        height: 80
      }, style, chartContainer);

      header = paper.html('div', {
        fill: '#e8e8e8',
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
        position: 'relative',
        float: 'right',
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
        fill: '#555555'
      }, {
        fontSize: 10 + 'px',
        lineHeight: 15 + 'px',
        fontFamily: 'Lucida Grande',
        fill: '#eaeaea',
        color: '#eaeaea',
        stroke: '#eaeaea',
        cursor: 'pointer'
      }, box);

      applyButton.on('click', function () {
        box.hide();
        callback(inputField.val());
      });
      applyButton.attr({
        text: 'Apply'
      });
      inputField.element.focus();
      function inputFieldNumberHandler () {
        inputField.element.value = inputField.element.value.replace(/[^\d.-]/g, '');
      }
      inputField.element.addEventListener('keyup', inputFieldNumberHandler);
      cross.element.style['position'] = 'relative';
      cross.element.style['backgroundColor'] = '#d2d2d2';
      cross.element.style['border'] = '2px solid #cbcbcb';
      cross.element.style['padding'] = '0px 0px 3.5px 2px';
      cross.element.style['color'] = '#8c8c8c';
      cross.element.style['margin'] = '1px 2px';
      cross.element.style['float'] = 'right';
      inputField.element.style['marginTop'] = '8px';
      inputField.element.style['border'] = '2px solid #dadbda';
      applyButton.element.style['marginTop'] = '8px';
      box.element.style['border'] = '1px solid #d4d2d3';
      header.element.style['border'] = '1px solid #d4d2d3';
      header.element.style['width'] = '179px';
      headerText.element.style['fontSize'] = '11.5px';
      headerText.element.style['marginTop'] = '0.5px';
      headerText.element.style['color'] = '#676767';
      header.element.style['fontFamily'] = 'MyriadPro';
      applyButton.element.style['textAlign'] = 'center';
      applyButton.element.style['fontSize'] = '11px';
      applyButton.element.style['paddingTop'] = '3px';
      applyButton.element.style['borderRadius'] = '3px';
      applyButton.element.style['color'] = '#e4e4e4';
    };

    for (let i in gaOptionsObj) {
      let key,
        obj = {},
        subObj = {};
      if (gaOptionsObj[i] === 'dialogBox') {
        key = '&nbsp; &nbsp; ' + i;
        obj[key] = {};
        obj[key] = {
          style: subCatStyle,
          handler: function () {
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
        obj[key].style = subCatStyle;
        obj[key].handler = [];
        for (let j = 0; j < gaOptionsObj[i].length; j++) {
          let subMenuName = gaOptionsObj[i][j];
          subObj = {};
          subObj['&nbsp;' + subMenuName] = {};
          subObj['&nbsp;' + subMenuName].handler = function () {
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
          subObj['&nbsp;' + subMenuName].style = subCatStyle;
          obj[key].handler.push(subObj);
          if (j !== gaOptionsObj[i].length - 1) {
            obj[key].handler.push({
              '': {
                style: {
                  backgroundColor: '#d5d2d2',
                  height: '1px',
                  margin: '1px',
                  padding: '0px'
                }
              }
            });
          }
        }
      }
      contextArray.push(obj);
      contextArray.push({
        '': {
          style: {
            backgroundColor: '#d5d2d2',
            height: '1px',
            margin: '1px',
            padding: '0px'
          }
        }
      });
    }

    contextArray.push({
      '&nbsp; &nbsp; Reset': {
        handler: function () {
          self.analyser('reset');
        },
        action: 'click',
        style: subCatStyle
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

'use strict';
class GrowthAnalyser {
  constructor (data) {
    this.data = data.map((a) => {
      return a.map((b) => { return b; });
    });
    this.Formulae = Formulae;
  }
  analyse (mode) {
    let i = 0,
      ii = 0,
      j = 0,
      jj = 0,
      num = 0,
      checkArr = [],
      checkNum = 0,
      dataAr = this.data,
      nDataAr = [],
      tempAr = [],
      temp = 0;
    if (typeof mode === 'string' && mode.toLowerCase() === 'reset') {
      return dataAr.map((a) => {
        return a.map((b) => { return b; });
      });
    } else if (!isNaN(mode)) { // Handling a number
      checkNum = +mode;
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          tempAr.push(100 * (num - checkNum) / checkNum);
        }
        nDataAr.push(tempAr);
      }
    } else if (typeof mode === 'string') {
      mode = this.Formulae[mode];
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        checkNum = mode(dataAr[i]);
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          if (checkNum === 0) {
            temp = undefined;
          } else {
            temp = 100 * (num - checkNum) / checkNum;
          }
          tempAr.push(temp);
        }
        nDataAr.push(tempAr);
      }
    } else if (!isNaN(mode.relposition)) {
      mode = mode.relposition;
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          if (j + mode >= 0 && j + mode < jj) {
            checkNum = dataAr[i][j + mode];
          } else {
            checkNum = num;
          }
          tempAr.push(100 * (num - checkNum) / checkNum);
        }
        nDataAr.push(tempAr);
      }
    } else if (!isNaN(mode.position)) {
      mode = mode.position;
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          if (mode >= 0 && mode < jj) {
            checkNum = dataAr[i][mode];
          } else {
            checkNum = num;
          }
          tempAr.push(100 * (num - checkNum) / checkNum);
        }
        nDataAr.push(tempAr);
      }
    } else if (!isNaN(mode.reldatasetposition)) {
      mode = mode.reldatasetposition;
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        if (i + mode >= 0 && i + mode < ii) {
          checkArr = dataAr[i + mode];
        } else {
          checkArr = dataAr[i];
        }
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          checkNum = checkArr[j];
          num = dataAr[i][j];
          tempAr.push(100 * (num - checkNum) / num);
        }
        nDataAr.push(tempAr);
      }
    }
    for (i = 0, ii = nDataAr.length; i < ii; ++i) {
      for (j = 0, jj = nDataAr[i].length; j < jj; ++j) {
        if (!Number.isFinite(nDataAr[i][j])) {
          nDataAr[i][j] = null;
        }
      }
    }
    return nDataAr;
  }
}

var Formulae = {
  Minimum: (arr) => {
    return arr.reduce((a, b) => {
      return a > b ? b : a;
    });
  },
  Maximum: (arr) => {
    return arr.reduce((a, b) => {
      return a < b ? b : a;
    });
  },
  Mean: (arr) => {
    return arr.reduce((a, b) => {
      return a + b;
    }) / arr.length;
  },
  Median: (arr) => {
    return arr.map((a) => a).sort((a, b) => { return a - b; })[arr.length / 2];
  },
  'Standard Deviation': (values) => {
    function average (data) {
      var sum, avg;
      sum = data.reduce(function (sum, value) {
        return sum + value;
      }, 0);

      avg = sum / data.length;
      return avg;
    }
    var avg = 0,
      squareDiffs = 0,
      sqrDiff = 0,
      avgSquareDiff = 0,
      stdDev = 0,
      diff = 0;
    avg = average(values);
    squareDiffs = values.map(function (value) {
      diff = value - avg;
      sqrDiff = diff * diff;
      return sqrDiff;
    });
    avgSquareDiff = average(squareDiffs);
    stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
  }
};
}(this, document));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJncm93dGgtYW5hbHlzZXItZXM2LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblwidXNlIHN0cmljdFwiO1xuXG5GdXNpb25DaGFydHMucmVnaXN0ZXIoJ2V4dGVuc2lvbicsIFsncHJpdmF0ZScsICdsZWdlbmQtZXh0JywgZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBMZWdlbmRFeHQgKCkge1xuICAgIHRoaXMudG9vbGJveCA9IEZ1c2lvbkNoYXJ0cy5nZXRDb21wb25lbnQoJ2FwaScsICd0b29sYm94Jyk7XG4gICAgdGhpcy5Ib3Jpem9udGFsVG9vbGJhciA9IHRoaXMudG9vbGJveC5Ib3Jpem9udGFsVG9vbGJhcjtcbiAgICB0aGlzLkNvbXBvbmVudEdyb3VwID0gdGhpcy50b29sYm94LkNvbXBvbmVudEdyb3VwO1xuICAgIHRoaXMuU3ltYm9sU3RvcmUgPSB0aGlzLnRvb2xib3guU3ltYm9sU3RvcmU7XG4gIH1cbiAgTGVnZW5kRXh0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExlZ2VuZEV4dDtcblxuICBMZWdlbmRFeHQucHJvdG90eXBlLnJlbmRlckNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2hhcnRJbnN0YW5jZSA9IHRoaXMudHNPYmplY3QuY2hhcnRJbnN0YW5jZSxcbiAgICAgIGNvbXBvbmVudFN0b3JlID0gY2hhcnRJbnN0YW5jZS5hcGlJbnN0YW5jZS5nZXRDb21wb25lbnRTdG9yZSgpLFxuICAgICAgaSA9IDA7XG4gICAgZm9yIChpID0gMDsgY29tcG9uZW50U3RvcmUuZ2V0Q2FudmFzQnlJbmRleChpKTsgKytpKSB7XG4gICAgICBjb21wb25lbnRTdG9yZS5nZXRDYW52YXNCeUluZGV4KGkpLmdldENvbXBvc2l0aW9uKCkuUGxvdE1hbmFnZXIucGxvdCgpO1xuICAgIH1cbiAgfTtcblxuICBMZWdlbmRFeHQucHJvdG90eXBlLmFuYWx5c2VyID0gZnVuY3Rpb24gKG1vZGUpIHtcbiAgICB2YXIgZ2EgPSB0aGlzLmdhIHx8IHt9LFxuICAgICAgc3RvcmUgPSB0aGlzLnRzT2JqZWN0LmFwaUluc3RhbmNlLmdldENvbXBvbmVudFN0b3JlKCksXG4gICAgICBjYW52YXMgPSBzdG9yZS5nZXRDYW52YXNCeUluZGV4KDApLFxuICAgICAgbmF2ID0gc3RvcmUuZ2V0TmF2aWdhdG9yQnlJbmRleCgwKSxcbiAgICAgIGNvbXAgPSBjYW52YXMuZ2V0Q29tcG9zaXRpb24oKSxcbiAgICAgIGRzID0gZ2EuZHMgfHwgY29tcC5kYXRhc2V0LFxuICAgICAgaSxcbiAgICAgIGlkTWFwID0gZ2EuaWRNYXAgfHwge30sXG4gICAgICBzdG9yZUFyID0gZ2Euc3RvcmVBciB8fCBbXSxcbiAgICAgIG5TdG9yZUFyciA9IFtdLFxuICAgICAgeUF4aXMgPSBjYW52YXMuY29tcG9zaXRpb24ueUF4aXM7XG4gICAgLy8gQ2hhbmdpbmcgeSBBeGlzIGZvcm1hdHRvclxuICAgIGRlYnVnZ2VyO1xuICAgIGlmIChtb2RlID09PSAncmVzZXQnKSB7XG4gICAgICB5QXhpcy5nZXRTY2FsZU9iaigpLmdldEludGVydmFsT2JqKCkuZ2V0Q29uZmlnKCdpbnRlcnZhbHMnKS5tYWpvci5mb3JtYXR0ZXIgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICB5QXhpcy5nZXRTY2FsZU9iaigpLmdldEludGVydmFsT2JqKCkuZ2V0Q29uZmlnKCdpbnRlcnZhbHMnKS5tYWpvci5mb3JtYXR0ZXIgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIHJldHVybiB2YWwgKyAnJSc7XG4gICAgICB9O1xuICAgIH1cbiAgICAvLyBEZWNsYXJhdGlvbiBlbmRzXG4gICAgdGhpcy5nYSA9IGdhO1xuICAgIGlmICghZ2Euc3RvcmVBcikge1xuICAgICAgc3RvcmUgPSB7fTtcbiAgICAgIGlmICghZ2EuaWRNYXApIHtcbiAgICAgICAgZHMuZm9yRWFjaFNlcmllcyhmdW5jdGlvbiAoYSwgYiwgYywgc2VyaWVzKSB7XG4gICAgICAgICAgc3RvcmVbc2VyaWVzLmdldElkKCldID0gc2VyaWVzLmdldE9yaWdpbmFsRGF0YSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChpIGluIHN0b3JlKSB7XG4gICAgICAgICAgc3RvcmVBci5wdXNoKHN0b3JlW2ldKTtcbiAgICAgICAgICBpZE1hcFtpXSA9IHN0b3JlQXIubGVuZ3RoIC0gMTtcbiAgICAgICAgICAvLyA9IHN0b3JlW2ldLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gMjAgKiBlICsgKE1hdGgucmFuZG9tKCkgKiAxMDAwKTsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2EuaWRNYXAgPSBpZE1hcDtcbiAgICAgICAgZ2EuZHMgPSBkcztcbiAgICAgICAgZ2Euc3RvcmVBciA9IHN0b3JlQXI7XG4gICAgICAgIGdhLmdBbmFseXNlciA9IG5ldyBHcm93dGhBbmFseXNlcihzdG9yZUFyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgblN0b3JlQXJyID0gZ2EuZ0FuYWx5c2VyLmFuYWx5c2UobW9kZSk7XG4gICAgZHMuc2V0RGF0YUJ5U2VyaWVzKGZ1bmN0aW9uIChzZXJpZXMpIHtcbiAgICAgIGlmIChuU3RvcmVBcnIubGVuZ3RoKSB7XG4gICAgICAgIHNlcmllcy5zZXRPcmlnaW5hbERhdGEoblN0b3JlQXJyW2lkTWFwW3Nlcmllcy5nZXRJZCgpXV0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbXAuaW1wbC51cGRhdGUoKTtcbiAgfTtcblxuICBMZWdlbmRFeHQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAocmVxdWlyZSkge1xuICAgIHZhciBpbnN0YW5jZSA9IHRoaXM7XG4gICAgcmVxdWlyZShbXG4gICAgICAneEF4aXMnLFxuICAgICAgJ3lBeGlzJyxcbiAgICAgICdncmFwaGljcycsXG4gICAgICAnY2hhcnQnLFxuICAgICAgJ2RhdGFzZXQnLFxuICAgICAgJ1Bsb3RNYW5hZ2VyJyxcbiAgICAgICdjYW52YXNDb25maWcnLFxuICAgICAgJ01hcmtlck1hbmFnZXInLFxuICAgICAgJ3JlYWN0aXZlTW9kZWwnLFxuICAgICAgJ2dsb2JhbFJlYWN0aXZlTW9kZWwnLFxuICAgICAgJ3NwYWNlTWFuYWdlckluc3RhbmNlJyxcbiAgICAgICdzbWFydExhYmVsJyxcbiAgICAgICdjaGFydEluc3RhbmNlJyxcbiAgICAgICdjYW52YXNEYXRhJyxcbiAgICAgIGZ1bmN0aW9uIChcbiAgICAgICAgICAgIHhBeGlzLFxuICAgICAgICAgICAgeUF4aXMsXG4gICAgICAgICAgICBncmFwaGljcyxcbiAgICAgICAgICAgIGNoYXJ0LFxuICAgICAgICAgICAgZGF0YXNldCxcbiAgICAgICAgICAgIHBsb3RNYW5hZ2VyLFxuICAgICAgICAgICAgY2FudmFzQ29uZmlnLFxuICAgICAgICAgICAgbWFya2VyTWFuYWdlcixcbiAgICAgICAgICAgIHJlYWN0aXZlTW9kZWwsXG4gICAgICAgICAgICBnbG9iYWxSZWFjdGl2ZU1vZGVsLFxuICAgICAgICAgICAgc3BhY2VNYW5hZ2VySW5zdGFuY2UsXG4gICAgICAgICAgICBzbWFydExhYmVsLFxuICAgICAgICAgICAgY2hhcnRJbnN0YW5jZSxcbiAgICAgICAgICAgIGNhbnZhc0RhdGEpIHtcbiAgICAgICAgaW5zdGFuY2UueEF4aXMgPSB4QXhpcztcbiAgICAgICAgaW5zdGFuY2UueUF4aXMgPSB5QXhpcztcbiAgICAgICAgaW5zdGFuY2UuZ3JhcGhpY3MgPSBncmFwaGljcztcbiAgICAgICAgaW5zdGFuY2UuY2hhcnQgPSBjaGFydDtcbiAgICAgICAgaW5zdGFuY2UuZGF0YXNldCA9IGRhdGFzZXQ7XG4gICAgICAgIGluc3RhbmNlLnBsb3RNYW5hZ2VyID0gcGxvdE1hbmFnZXI7XG4gICAgICAgIGluc3RhbmNlLm1hcmtlck1hbmFnZXIgPSBtYXJrZXJNYW5hZ2VyO1xuICAgICAgICBpbnN0YW5jZS5jYW52YXNDb25maWcgPSBjYW52YXNDb25maWc7XG4gICAgICAgIGluc3RhbmNlLnJlYWN0aXZlTW9kZWwgPSByZWFjdGl2ZU1vZGVsO1xuICAgICAgICBpbnN0YW5jZS5nbG9iYWxSZWFjdGl2ZU1vZGVsID0gZ2xvYmFsUmVhY3RpdmVNb2RlbDtcbiAgICAgICAgaW5zdGFuY2Uuc3BhY2VNYW5hZ2VySW5zdGFuY2UgPSBzcGFjZU1hbmFnZXJJbnN0YW5jZTtcbiAgICAgICAgaW5zdGFuY2Uuc21hcnRMYWJlbCA9IHNtYXJ0TGFiZWw7XG4gICAgICAgIGluc3RhbmNlLmNoYXJ0SW5zdGFuY2UgPSBjaGFydEluc3RhbmNlO1xuICAgICAgICBpbnN0YW5jZS5jYW52YXNEYXRhID0gY2FudmFzRGF0YTtcbiAgICAgIH1cbiAgICBdKTtcbiAgICB0aGlzLnNwYWNlTWFuYWdlckluc3RhbmNlID0gaW5zdGFuY2Uuc3BhY2VNYW5hZ2VySW5zdGFuY2U7XG4gICAgdGhpcy5nbG9iYWxSZWFjdGl2ZU1vZGVsID0gaW5zdGFuY2UuZ2xvYmFsUmVhY3RpdmVNb2RlbDtcbiAgICB0aGlzLnRzT2JqZWN0ID0gaW5zdGFuY2UuY2hhcnRJbnN0YW5jZTtcbiAgICB0aGlzLnN0YXJ0RHQgPSBpbnN0YW5jZS5nbG9iYWxSZWFjdGl2ZU1vZGVsLm1vZGVsWyd4LWF4aXMtdmlzaWJsZS1yYW5nZS1zdGFydCddO1xuICAgIHRoaXMuZW5kRHQgPSBpbnN0YW5jZS5nbG9iYWxSZWFjdGl2ZU1vZGVsLm1vZGVsWyd4LWF4aXMtdmlzaWJsZS1yYW5nZS1lbmQnXTtcbiAgICB0aGlzLnN0YXJ0RGF0YXNldCA9IGluc3RhbmNlLmdsb2JhbFJlYWN0aXZlTW9kZWwubW9kZWxbJ3gtYXhpcy1hYnNvbHV0ZS1yYW5nZS1zdGFydCddO1xuICAgIHRoaXMuZW5kRGF0YXNldCA9IGluc3RhbmNlLmdsb2JhbFJlYWN0aXZlTW9kZWwubW9kZWxbJ3gtYXhpcy1hYnNvbHV0ZS1yYW5nZS1lbmQnXTtcbiAgICB0aGlzLnRvb2xiYXJzID0gW107XG4gICAgdGhpcy5tZWFzdXJlbWVudCA9IHt9O1xuICAgIHRoaXMudG9vbGJhcnMucHVzaCh0aGlzLmNyZWF0ZVRvb2xiYXIoKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgTGVnZW5kRXh0LnByb3RvdHlwZS5jcmVhdGVUb29sYmFyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0b29sYmFyLFxuICAgICAgZ3JvdXAsXG4gICAgICBzZWxmID0gdGhpcyxcbiAgICAgIGNvbnRleHRNZW51LFxuICAgICAgY29udGV4dEFycmF5ID0gW10sXG4gICAgICBnYU9wdGlvbnNPYmogPSB7fSxcbiAgICAgIHBvcHVwLFxuICAgICAgcGFwZXIgPSB0aGlzLmdyYXBoaWNzLnBhcGVyLFxuICAgICAgY2hhcnRDb250YWluZXIgPSB0aGlzLmdyYXBoaWNzLmNvbnRhaW5lcixcbiAgICAgIHN1YkNhdFN0eWxlID0ge1xuICAgICAgICAnZm9udC1zaXplJzogJzEycHgnLFxuICAgICAgICAnY29sb3InOiAnIzY5Njk2OSdcbiAgICAgIH07XG5cbiAgICB0b29sYmFyID0gbmV3IHRoaXMuSG9yaXpvbnRhbFRvb2xiYXIoe1xuICAgICAgcGFwZXI6IHRoaXMuZ3JhcGhpY3MucGFwZXIsXG4gICAgICBjaGFydDogdGhpcy5jaGFydCxcbiAgICAgIHNtYXJ0TGFiZWw6IHRoaXMuc21hcnRMYWJlbCxcbiAgICAgIGNoYXJ0Q29udGFpbmVyOiB0aGlzLmdyYXBoaWNzLmNvbnRhaW5lclxuICAgIH0pO1xuXG4gICAgdG9vbGJhci5zZXRDb25maWcoe1xuICAgICAgZmlsbDogJyNmZmYnLFxuICAgICAgYm9yZGVyVGhpY2tuZXNzOiAwXG4gICAgfSk7XG5cbiAgICBncm91cCA9IG5ldyB0aGlzLnRvb2xib3guQ29tcG9uZW50R3JvdXAoe1xuICAgICAgcGFwZXI6IHRoaXMuZ3JhcGhpY3MucGFwZXIsXG4gICAgICBjaGFydDogdGhpcy5jaGFydCxcbiAgICAgIHNtYXJ0TGFiZWw6IHRoaXMuc21hcnRMYWJlbCxcbiAgICAgIGNoYXJ0Q29udGFpbmVyOiB0aGlzLmdyYXBoaWNzLmNvbnRhaW5lclxuICAgIH0pO1xuXG4gICAgZ3JvdXAuc2V0Q29uZmlnKHtcbiAgICAgIGZpbGw6ICcjZmZmJyxcbiAgICAgIGJvcmRlclRoaWNrbmVzczogMFxuICAgIH0pO1xuXG4gICAgZ2FPcHRpb25zT2JqID0ge1xuICAgICAgJ0ZpeGVkLU51bWJlcic6ICdkaWFsb2dCb3gnLFxuICAgICAgJ0Z1bmN0aW9ucyc6IFsnTWluaW11bScsICdNYXhpbXVtJywgJ01lYW4nLCAnTWVkaWFuJywgJ1N0YW5kYXJkIERldmlhdGlvbiddLFxuICAgICAgJ1Bvc2l0aW9uJzogJ2RpYWxvZ0JveCcsXG4gICAgICAnRGF0YXNldCc6IFsnUHJldmlvdXMgRGF0YXNldCcsICdOZXh0IERhdGFzZXQnXSxcbiAgICAgICdSZWxhdGl2ZS1Qb3NpdGlvbic6IFsnTmV4dCcsICdQcmV2aW91cyddXG4gICAgfTtcblxuICAgIGNvbnRleHRNZW51ID0gbmV3IHRoaXMudG9vbGJveC5TeW1ib2xXaXRoQ29udGV4dCgnQ29udGV4dEljb24nLCB7XG4gICAgICBwYXBlcjogdGhpcy5ncmFwaGljcy5wYXBlcixcbiAgICAgIGNoYXJ0OiB0aGlzLmNoYXJ0LFxuICAgICAgc21hcnRMYWJlbDogdGhpcy5zbWFydExhYmVsLFxuICAgICAgY2hhcnRDb250YWluZXI6IHRoaXMuZ3JhcGhpY3MuY29udGFpbmVyXG4gICAgfSwge1xuICAgICAgd2lkdGg6IDIzLFxuICAgICAgaGVpZ2h0OiAyMyxcbiAgICAgIHBvc2l0aW9uOiAncmlnaHQnLFxuICAgICAgc3Ryb2tlOiAnI2NlZDVkNCcsXG4gICAgICBzeW1ib2xTdHJva2U6ICcjNjk2OTY5J1xuICAgIH0pO1xuXG4gICAgY29udGV4dEFycmF5LnB1c2goe1xuICAgICAgJ0dyb3d0aCBBbmFseXNlcic6IHtcbiAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAnY29sb3InOiAnIzY5Njk2OScsXG4gICAgICAgICAgJ2ZvbnQtZmFtaWx5JzogJ015cmlhZFBybycsXG4gICAgICAgICAgJ2ZvbnQtd2VpZ2h0JzogJ2JvbGQnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICBwb3B1cCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdmFyIGJveCxcbiAgICAgICAgaGVhZGVyLFxuICAgICAgICBzdHlsZSA9IHtcbiAgICAgICAgICBmb250U2l6ZTogMTAgKyAncHgnLFxuICAgICAgICAgIGxpbmVIZWlnaHQ6IDE1ICsgJ3B4JyxcbiAgICAgICAgICBmb250RmFtaWx5OiAnTHVjaWRhIEdyYW5kZScsXG4gICAgICAgICAgc3Ryb2tlOiAnIzY3Njc2NycsXG4gICAgICAgICAgJ3N0cm9rZS13aWR0aCc6ICcyJ1xuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJXaWR0aCA9IDE4MCxcbiAgICAgICAgaGVhZGVyVGV4dCxcbiAgICAgICAgY3Jvc3MsXG4gICAgICAgIGlucHV0RmllbGQsXG4gICAgICAgIGFwcGx5QnV0dG9uLFxuICAgICAgICB4ID0gNTAwLFxuICAgICAgICB5ID0gMTAwO1xuXG4gICAgICBib3ggPSBwYXBlci5odG1sKCdkaXYnLCB7XG4gICAgICAgIGZpbGw6ICcjZjdmN2Y3JyxcbiAgICAgICAgeDogeCAtIDIwMCxcbiAgICAgICAgeTogeSArIDEwMCxcbiAgICAgICAgd2lkdGg6IDE4MCxcbiAgICAgICAgaGVpZ2h0OiA4MFxuICAgICAgfSwgc3R5bGUsIGNoYXJ0Q29udGFpbmVyKTtcblxuICAgICAgaGVhZGVyID0gcGFwZXIuaHRtbCgnZGl2Jywge1xuICAgICAgICBmaWxsOiAnI2U4ZThlOCcsXG4gICAgICAgIHdpZHRoOiBoZWFkZXJXaWR0aCxcbiAgICAgICAgaGVpZ2h0OiAyMFxuICAgICAgfSwgc3R5bGUsIGJveCk7XG5cbiAgICAgIGhlYWRlclRleHQgPSBwYXBlci5odG1sKCdkaXYnLCB7XG4gICAgICAgIGZpbGw6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIHdpZHRoOiBoZWFkZXJXaWR0aCAqIDAuNixcbiAgICAgICAgaGVpZ2h0OiAyMCxcbiAgICAgICAgeDogMTAsXG4gICAgICAgIHk6IDJcbiAgICAgIH0sIHN0eWxlLCBoZWFkZXIpO1xuXG4gICAgICBoZWFkZXJUZXh0LmF0dHIoe1xuICAgICAgICB0ZXh0OiAnUHJvdmlkZSBTcGVjaWZpYyBWYWx1ZSdcbiAgICAgIH0pO1xuXG4gICAgICBjcm9zcyA9IHBhcGVyLmh0bWwoJ2RpdicsIHtcbiAgICAgICAgZmlsbDogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgd2lkdGg6IDEwLFxuICAgICAgICBoZWlnaHQ6IDEwLFxuICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgICAgZmxvYXQ6ICdyaWdodCcsXG4gICAgICAgIHRleHQ6ICdYJyxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcidcbiAgICAgIH0sIHN0eWxlLCBoZWFkZXIpO1xuXG4gICAgICBjcm9zcy5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGJveC5oaWRlKCk7XG4gICAgICB9KTtcblxuICAgICAgaW5wdXRGaWVsZCA9IHBhcGVyLmh0bWwoJ2lucHV0Jywge1xuICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICBoZWlnaHQ6IDIwLFxuICAgICAgICB4OiAxMCxcbiAgICAgICAgeTogMzBcbiAgICAgIH0sIHN0eWxlLCBib3gpO1xuXG4gICAgICBhcHBseUJ1dHRvbiA9IHBhcGVyLmh0bWwoJ2RpdicsIHtcbiAgICAgICAgd2lkdGg6IDUwLFxuICAgICAgICBoZWlnaHQ6IDIwLFxuICAgICAgICB4OiAxMjAsXG4gICAgICAgIHk6IDMwLFxuICAgICAgICBmaWxsOiAnIzU1NTU1NSdcbiAgICAgIH0sIHtcbiAgICAgICAgZm9udFNpemU6IDEwICsgJ3B4JyxcbiAgICAgICAgbGluZUhlaWdodDogMTUgKyAncHgnLFxuICAgICAgICBmb250RmFtaWx5OiAnTHVjaWRhIEdyYW5kZScsXG4gICAgICAgIGZpbGw6ICcjZWFlYWVhJyxcbiAgICAgICAgY29sb3I6ICcjZWFlYWVhJyxcbiAgICAgICAgc3Ryb2tlOiAnI2VhZWFlYScsXG4gICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXG4gICAgICB9LCBib3gpO1xuXG4gICAgICBhcHBseUJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGJveC5oaWRlKCk7XG4gICAgICAgIGNhbGxiYWNrKGlucHV0RmllbGQudmFsKCkpO1xuICAgICAgfSk7XG4gICAgICBhcHBseUJ1dHRvbi5hdHRyKHtcbiAgICAgICAgdGV4dDogJ0FwcGx5J1xuICAgICAgfSk7XG4gICAgICBpbnB1dEZpZWxkLmVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIGZ1bmN0aW9uIGlucHV0RmllbGROdW1iZXJIYW5kbGVyICgpIHtcbiAgICAgICAgaW5wdXRGaWVsZC5lbGVtZW50LnZhbHVlID0gaW5wdXRGaWVsZC5lbGVtZW50LnZhbHVlLnJlcGxhY2UoL1teXFxkLi1dL2csICcnKTtcbiAgICAgIH1cbiAgICAgIGlucHV0RmllbGQuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGlucHV0RmllbGROdW1iZXJIYW5kbGVyKTtcbiAgICAgIGNyb3NzLmVsZW1lbnQuc3R5bGVbJ3Bvc2l0aW9uJ10gPSAncmVsYXRpdmUnO1xuICAgICAgY3Jvc3MuZWxlbWVudC5zdHlsZVsnYmFja2dyb3VuZENvbG9yJ10gPSAnI2QyZDJkMic7XG4gICAgICBjcm9zcy5lbGVtZW50LnN0eWxlWydib3JkZXInXSA9ICcycHggc29saWQgI2NiY2JjYic7XG4gICAgICBjcm9zcy5lbGVtZW50LnN0eWxlWydwYWRkaW5nJ10gPSAnMHB4IDBweCAzLjVweCAycHgnO1xuICAgICAgY3Jvc3MuZWxlbWVudC5zdHlsZVsnY29sb3InXSA9ICcjOGM4YzhjJztcbiAgICAgIGNyb3NzLmVsZW1lbnQuc3R5bGVbJ21hcmdpbiddID0gJzFweCAycHgnO1xuICAgICAgY3Jvc3MuZWxlbWVudC5zdHlsZVsnZmxvYXQnXSA9ICdyaWdodCc7XG4gICAgICBpbnB1dEZpZWxkLmVsZW1lbnQuc3R5bGVbJ21hcmdpblRvcCddID0gJzhweCc7XG4gICAgICBpbnB1dEZpZWxkLmVsZW1lbnQuc3R5bGVbJ2JvcmRlciddID0gJzJweCBzb2xpZCAjZGFkYmRhJztcbiAgICAgIGFwcGx5QnV0dG9uLmVsZW1lbnQuc3R5bGVbJ21hcmdpblRvcCddID0gJzhweCc7XG4gICAgICBib3guZWxlbWVudC5zdHlsZVsnYm9yZGVyJ10gPSAnMXB4IHNvbGlkICNkNGQyZDMnO1xuICAgICAgaGVhZGVyLmVsZW1lbnQuc3R5bGVbJ2JvcmRlciddID0gJzFweCBzb2xpZCAjZDRkMmQzJztcbiAgICAgIGhlYWRlci5lbGVtZW50LnN0eWxlWyd3aWR0aCddID0gJzE3OXB4JztcbiAgICAgIGhlYWRlclRleHQuZWxlbWVudC5zdHlsZVsnZm9udFNpemUnXSA9ICcxMS41cHgnO1xuICAgICAgaGVhZGVyVGV4dC5lbGVtZW50LnN0eWxlWydtYXJnaW5Ub3AnXSA9ICcwLjVweCc7XG4gICAgICBoZWFkZXJUZXh0LmVsZW1lbnQuc3R5bGVbJ2NvbG9yJ10gPSAnIzY3Njc2Nyc7XG4gICAgICBoZWFkZXIuZWxlbWVudC5zdHlsZVsnZm9udEZhbWlseSddID0gJ015cmlhZFBybyc7XG4gICAgICBhcHBseUJ1dHRvbi5lbGVtZW50LnN0eWxlWyd0ZXh0QWxpZ24nXSA9ICdjZW50ZXInO1xuICAgICAgYXBwbHlCdXR0b24uZWxlbWVudC5zdHlsZVsnZm9udFNpemUnXSA9ICcxMXB4JztcbiAgICAgIGFwcGx5QnV0dG9uLmVsZW1lbnQuc3R5bGVbJ3BhZGRpbmdUb3AnXSA9ICczcHgnO1xuICAgICAgYXBwbHlCdXR0b24uZWxlbWVudC5zdHlsZVsnYm9yZGVyUmFkaXVzJ10gPSAnM3B4JztcbiAgICAgIGFwcGx5QnV0dG9uLmVsZW1lbnQuc3R5bGVbJ2NvbG9yJ10gPSAnI2U0ZTRlNCc7XG4gICAgfTtcblxuICAgIGZvciAobGV0IGkgaW4gZ2FPcHRpb25zT2JqKSB7XG4gICAgICBsZXQga2V5LFxuICAgICAgICBvYmogPSB7fSxcbiAgICAgICAgc3ViT2JqID0ge307XG4gICAgICBpZiAoZ2FPcHRpb25zT2JqW2ldID09PSAnZGlhbG9nQm94Jykge1xuICAgICAgICBrZXkgPSAnJm5ic3A7ICZuYnNwOyAnICsgaTtcbiAgICAgICAgb2JqW2tleV0gPSB7fTtcbiAgICAgICAgb2JqW2tleV0gPSB7XG4gICAgICAgICAgc3R5bGU6IHN1YkNhdFN0eWxlLFxuICAgICAgICAgIGhhbmRsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGxldCBwb3B1cFZhbCA9IHBvcHVwKGZ1bmN0aW9uIChzdHIpIHtcbiAgICAgICAgICAgIC8vICAgc2VsZi5hbmFseXNlcihwYXJzZUludChzdHIpKTtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgaWYgKGkgPT09ICdGaXhlZC1OdW1iZXInKSB7XG4gICAgICAgICAgICAgIC8vIHNlbGYuYW5hbHlzZXIocGFyc2VJbnQod2luZG93LnByb21wdCgnRW50ZXIgdmFsdWUnKSkpO1xuICAgICAgICAgICAgICBsZXQgcG9wdXBWYWwgPSBwb3B1cChmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hbmFseXNlcihwYXJzZUludChzdHIpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGkgPT09ICdQb3NpdGlvbicpIHtcbiAgICAgICAgICAgICAgbGV0IHBvcHVwVmFsID0gcG9wdXAoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgICAgIHNlbGYuYW5hbHlzZXIoe3Bvc2l0aW9uOiBzdHJ9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhY3Rpb246ICdjbGljaydcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGtleSA9ICcmIzk2NjYmbmJzcDsgJyArIGk7XG4gICAgICAgIG9ialtrZXldID0ge307XG4gICAgICAgIG9ialtrZXldLmFjdGlvbiA9ICdjbGljayc7XG4gICAgICAgIG9ialtrZXldLnN0eWxlID0gc3ViQ2F0U3R5bGU7XG4gICAgICAgIG9ialtrZXldLmhhbmRsZXIgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBnYU9wdGlvbnNPYmpbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBsZXQgc3ViTWVudU5hbWUgPSBnYU9wdGlvbnNPYmpbaV1bal07XG4gICAgICAgICAgc3ViT2JqID0ge307XG4gICAgICAgICAgc3ViT2JqWycmbmJzcDsnICsgc3ViTWVudU5hbWVdID0ge307XG4gICAgICAgICAgc3ViT2JqWycmbmJzcDsnICsgc3ViTWVudU5hbWVdLmhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBbJ01pbmltdW0nLCAnTWF4aW11bScsICdNZWFuJywgJ01lZGlhbicsICdTdGFuZGFyZCBEZXZpYXRpb24nXVxuICAgICAgICAgICAgLy8gWydQcmV2aW91cyBEYXRhc2V0JywgJ05leHQgRGF0YXNldCddXG4gICAgICAgICAgICAvLyBbJ05leHQnLCAnUHJldmlvdXMnXVxuICAgICAgICAgICAgaWYgKHN1Yk1lbnVOYW1lID09PSAnTWluaW11bScgfHxcbiAgICAgICAgICAgICAgc3ViTWVudU5hbWUgPT09ICdNYXhpbXVtJyB8fCBzdWJNZW51TmFtZSA9PT0gJ01lYW4nIHx8XG4gICAgICAgICAgICAgIHN1Yk1lbnVOYW1lID09PSAnTWVkaWFuJyB8fCBzdWJNZW51TmFtZSA9PT0gJ1N0YW5kYXJkIERldmlhdGlvbicpIHtcbiAgICAgICAgICAgICAgc2VsZi5hbmFseXNlcihzdWJNZW51TmFtZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN1Yk1lbnVOYW1lID09PSAnUHJldmlvdXMgRGF0YXNldCcpIHtcbiAgICAgICAgICAgICAgc2VsZi5hbmFseXNlcih7cmVsZGF0YXNldHBvc2l0aW9uOiAtMX0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzdWJNZW51TmFtZSA9PT0gJ05leHQgRGF0YXNldCcpIHtcbiAgICAgICAgICAgICAgc2VsZi5hbmFseXNlcih7cmVsZGF0YXNldHBvc2l0aW9uOiAxfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN1Yk1lbnVOYW1lID09PSAnTmV4dCcpIHtcbiAgICAgICAgICAgICAgc2VsZi5hbmFseXNlcih7cmVscG9zaXRpb246IC0xfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN1Yk1lbnVOYW1lID09PSAnUHJldmlvdXMnKSB7XG4gICAgICAgICAgICAgIHNlbGYuYW5hbHlzZXIoe3JlbHBvc2l0aW9uOiAxfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBzdWJPYmpbJyZuYnNwOycgKyBzdWJNZW51TmFtZV0uYWN0aW9uID0gJ2NsaWNrJztcbiAgICAgICAgICBzdWJPYmpbJyZuYnNwOycgKyBzdWJNZW51TmFtZV0uc3R5bGUgPSBzdWJDYXRTdHlsZTtcbiAgICAgICAgICBvYmpba2V5XS5oYW5kbGVyLnB1c2goc3ViT2JqKTtcbiAgICAgICAgICBpZiAoaiAhPT0gZ2FPcHRpb25zT2JqW2ldLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIG9ialtrZXldLmhhbmRsZXIucHVzaCh7XG4gICAgICAgICAgICAgICcnOiB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNkNWQyZDInLFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMXB4JyxcbiAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzFweCcsXG4gICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMHB4J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb250ZXh0QXJyYXkucHVzaChvYmopO1xuICAgICAgY29udGV4dEFycmF5LnB1c2goe1xuICAgICAgICAnJzoge1xuICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjZDVkMmQyJyxcbiAgICAgICAgICAgIGhlaWdodDogJzFweCcsXG4gICAgICAgICAgICBtYXJnaW46ICcxcHgnLFxuICAgICAgICAgICAgcGFkZGluZzogJzBweCdcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnRleHRBcnJheS5wdXNoKHtcbiAgICAgICcmbmJzcDsgJm5ic3A7IFJlc2V0Jzoge1xuICAgICAgICBoYW5kbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5hbmFseXNlcigncmVzZXQnKTtcbiAgICAgICAgfSxcbiAgICAgICAgYWN0aW9uOiAnY2xpY2snLFxuICAgICAgICBzdHlsZTogc3ViQ2F0U3R5bGVcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNvbnRleHRNZW51LmFwcGVuZEFzTGlzdChjb250ZXh0QXJyYXkpO1xuXG4gICAgdGhpcy5TeW1ib2xTdG9yZS5yZWdpc3RlcignQ29udGV4dEljb24nLCBmdW5jdGlvbiAocG9zeCwgcG9zeSwgcmFkKSB7XG4gICAgICB2YXIgeCA9IHBvc3gsXG4gICAgICAgIHkgPSBwb3N5LFxuICAgICAgICByID0gcmFkICogMixcbiAgICAgICAgc3BhY2UgPSBNYXRoLnJvdW5kKHIgLyA0KSxcbiAgICAgICAgaGFsZldpZHRoID0gTWF0aC5yb3VuZChyIC8gMikgKiAwLjcsXG4gICAgICAgIHN0YXJ0WCA9ICh4IC0gaGFsZldpZHRoKSxcbiAgICAgICAgZW5kWCA9ICh4ICsgaGFsZldpZHRoKSxcbiAgICAgICAgc3RhcnRZID0gKHkgKyBzcGFjZSksXG4gICAgICAgIGVuZFkgPSAoeSAtIHNwYWNlKTtcbiAgICAgIHJldHVybiBbJ00nLCBzdGFydFgsIHksICdMJywgZW5kWCwgeSwgJ00nLCBzdGFydFgsIHN0YXJ0WSwgJ0wnLCBlbmRYLCBzdGFydFksICdNJywgc3RhcnRYLCBlbmRZLCAnTCcsIGVuZFgsIGVuZFldO1xuICAgIH0pO1xuXG4gICAgZ3JvdXAuYWRkU3ltYm9sKGNvbnRleHRNZW51KTtcbiAgICB0b29sYmFyLmFkZENvbXBvbmVudChncm91cCk7XG4gICAgcmV0dXJuIHRvb2xiYXI7XG4gIH07XG5cbiAgTGVnZW5kRXh0LnByb3RvdHlwZS5nZXRMb2dpY2FsU3BhY2UgPSBmdW5jdGlvbiAoYXZhaWxhYmxlV2lkdGgsIGF2YWlsYWJsZUhlaWdodCkge1xuICAgIGF2YWlsYWJsZVdpZHRoIC89IDI7XG4gICAgdmFyIGxvZ2ljYWxTcGFjZSxcbiAgICAgIHdpZHRoID0gMCxcbiAgICAgIGhlaWdodCA9IDAsXG4gICAgICBpLFxuICAgICAgbG47XG5cbiAgICBmb3IgKGkgPSAwLCBsbiA9IHRoaXMudG9vbGJhcnMubGVuZ3RoOyBpIDwgbG47IGkrKykge1xuICAgICAgbG9naWNhbFNwYWNlID0gdGhpcy50b29sYmFyc1tpXS5nZXRMb2dpY2FsU3BhY2UoYXZhaWxhYmxlV2lkdGgsIGF2YWlsYWJsZUhlaWdodCk7XG4gICAgICB3aWR0aCA9IE1hdGgubWF4KGxvZ2ljYWxTcGFjZS53aWR0aCwgd2lkdGgpO1xuICAgICAgaGVpZ2h0ICs9IGxvZ2ljYWxTcGFjZS5oZWlnaHQ7XG4gICAgICB0aGlzLnRvb2xiYXJzW2ldLndpZHRoID0gbG9naWNhbFNwYWNlLndpZHRoO1xuICAgICAgdGhpcy50b29sYmFyc1tpXS5oZWlnaHQgPSBsb2dpY2FsU3BhY2UuaGVpZ2h0O1xuICAgIH1cbiAgICBoZWlnaHQgKz0gdGhpcy5wYWRkaW5nO1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogd2lkdGggPiBhdmFpbGFibGVXaWR0aCA/IDAgOiB3aWR0aCxcbiAgICAgIGhlaWdodDogaGVpZ2h0ID4gYXZhaWxhYmxlSGVpZ2h0ID8gMCA6IGhlaWdodFxuICAgIH07XG4gIH07XG5cbiAgTGVnZW5kRXh0LnByb3RvdHlwZS5wbGFjZUluQ2FudmFzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnBhZGRpbmcgPSA1O1xuICAgIHNlbGYuc3BhY2VNYW5hZ2VySW5zdGFuY2UuYWRkKFt7XG4gICAgICBuYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAnVG9vbEJveEV4dCc7XG4gICAgICB9LFxuICAgICAgcmVmOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiBvYmpbJzAnXTtcbiAgICAgIH0sXG4gICAgICBzZWxmOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAyO1xuICAgICAgfSxcbiAgICAgIGxheW91dDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gb2JqLmlubGluZTtcbiAgICAgIH0sXG4gICAgICBvcmllbnRhdGlvbjogW3tcbiAgICAgICAgdHlwZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgIHJldHVybiBvYmouaG9yaXpvbnRhbDtcbiAgICAgICAgfSxcbiAgICAgICAgcG9zaXRpb246IFt7XG4gICAgICAgICAgdHlwZTogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iai50b3A7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhbGlnbm1lbnQ6IFt7XG4gICAgICAgICAgICB0eXBlOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgIHJldHVybiBvYmoucmlnaHQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGltZW5zaW9uczogW2Z1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuZ2V0UGFyZW50Q29tcG9uZW50R3JvdXAoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuZ2V0TG9naWNhbFNwYWNlKHBhcmVudC5nZXRXaWR0aCgpLCBwYXJlbnQuZ2V0SGVpZ2h0KCkpO1xuICAgICAgICAgICAgfV1cbiAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgICAgfV1cbiAgICB9XSk7XG4gIH07XG5cbiAgTGVnZW5kRXh0LnByb3RvdHlwZS5zZXREcmF3aW5nQ29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBncm91cCkge1xuICAgIHZhciBtZXMgPSB0aGlzLm1lYXN1cmVtZW50O1xuICAgIG1lcy54ID0geDtcbiAgICBtZXMueSA9IHk7XG4gICAgbWVzLndpZHRoID0gd2lkdGg7XG4gICAgbWVzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMucGFyZW50R3JvdXAgPSBncm91cDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIExlZ2VuZEV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uICh4LCB5LCB3aWR0aCwgaGVpZ2h0LCBncm91cCkge1xuICAgIHZhciBtZWFzdXJlbWVudCA9IHRoaXMubWVhc3VyZW1lbnQsXG4gICAgICB0b29sYmFycyA9IHRoaXMudG9vbGJhcnMsXG4gICAgICBsbixcbiAgICAgIGksXG4gICAgICB0b29sYmFyO1xuICAgIHggPSB4ID09PSB1bmRlZmluZWQgPyBtZWFzdXJlbWVudC54IDogeDtcbiAgICB5ID0geSA9PT0gdW5kZWZpbmVkID8gbWVhc3VyZW1lbnQueSA6IHk7XG4gICAgd2lkdGggPSB3aWR0aCA9PT0gdW5kZWZpbmVkID8gbWVhc3VyZW1lbnQud2lkdGggOiB3aWR0aDtcbiAgICBoZWlnaHQgPSBoZWlnaHQgPT09IHVuZGVmaW5lZCA/IG1lYXN1cmVtZW50LmhlaWdodCA6IGhlaWdodDtcbiAgICBncm91cCA9IGdyb3VwID09PSB1bmRlZmluZWQgPyB0aGlzLnBhcmVudEdyb3VwIDogZ3JvdXA7XG4gICAgaWYgKHdpZHRoICYmIGhlaWdodCkge1xuICAgICAgZm9yIChpID0gMCwgbG4gPSB0b29sYmFycy5sZW5ndGg7IGkgPCBsbjsgaSsrKSB7XG4gICAgICAgIHRvb2xiYXIgPSB0b29sYmFyc1tpXTtcbiAgICAgICAgdG9vbGJhci5kcmF3KHgsIHkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBGdXNpb25DaGFydHMucmVnaXN0ZXJDb21wb25lbnQoJ2V4dGVuc2lvbnMnLCAnbGVnZW5kRXh0JywgTGVnZW5kRXh0KTtcbn1dKTtcblxuJ3VzZSBzdHJpY3QnO1xuY2xhc3MgR3Jvd3RoQW5hbHlzZXIge1xuICBjb25zdHJ1Y3RvciAoZGF0YSkge1xuICAgIHRoaXMuZGF0YSA9IGRhdGEubWFwKChhKSA9PiB7XG4gICAgICByZXR1cm4gYS5tYXAoKGIpID0+IHsgcmV0dXJuIGI7IH0pO1xuICAgIH0pO1xuICAgIHRoaXMuRm9ybXVsYWUgPSBGb3JtdWxhZTtcbiAgfVxuICBhbmFseXNlIChtb2RlKSB7XG4gICAgbGV0IGkgPSAwLFxuICAgICAgaWkgPSAwLFxuICAgICAgaiA9IDAsXG4gICAgICBqaiA9IDAsXG4gICAgICBudW0gPSAwLFxuICAgICAgY2hlY2tBcnIgPSBbXSxcbiAgICAgIGNoZWNrTnVtID0gMCxcbiAgICAgIGRhdGFBciA9IHRoaXMuZGF0YSxcbiAgICAgIG5EYXRhQXIgPSBbXSxcbiAgICAgIHRlbXBBciA9IFtdLFxuICAgICAgdGVtcCA9IDA7XG4gICAgaWYgKHR5cGVvZiBtb2RlID09PSAnc3RyaW5nJyAmJiBtb2RlLnRvTG93ZXJDYXNlKCkgPT09ICdyZXNldCcpIHtcbiAgICAgIHJldHVybiBkYXRhQXIubWFwKChhKSA9PiB7XG4gICAgICAgIHJldHVybiBhLm1hcCgoYikgPT4geyByZXR1cm4gYjsgfSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKCFpc05hTihtb2RlKSkgeyAvLyBIYW5kbGluZyBhIG51bWJlclxuICAgICAgY2hlY2tOdW0gPSArbW9kZTtcbiAgICAgIGZvciAoaSA9IDAsIGlpID0gZGF0YUFyLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICAgICAgdGVtcEFyID0gW107XG4gICAgICAgIGZvciAoaiA9IDAsIGpqID0gZGF0YUFyW2ldLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICAgICAgICBudW0gPSBkYXRhQXJbaV1bal07XG4gICAgICAgICAgdGVtcEFyLnB1c2goMTAwICogKG51bSAtIGNoZWNrTnVtKSAvIGNoZWNrTnVtKTtcbiAgICAgICAgfVxuICAgICAgICBuRGF0YUFyLnB1c2godGVtcEFyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2RlID09PSAnc3RyaW5nJykge1xuICAgICAgbW9kZSA9IHRoaXMuRm9ybXVsYWVbbW9kZV07XG4gICAgICBmb3IgKGkgPSAwLCBpaSA9IGRhdGFBci5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgICAgIHRlbXBBciA9IFtdO1xuICAgICAgICBjaGVja051bSA9IG1vZGUoZGF0YUFyW2ldKTtcbiAgICAgICAgZm9yIChqID0gMCwgamogPSBkYXRhQXJbaV0ubGVuZ3RoOyBqIDwgamo7ICsraikge1xuICAgICAgICAgIG51bSA9IGRhdGFBcltpXVtqXTtcbiAgICAgICAgICBpZiAoY2hlY2tOdW0gPT09IDApIHtcbiAgICAgICAgICAgIHRlbXAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXAgPSAxMDAgKiAobnVtIC0gY2hlY2tOdW0pIC8gY2hlY2tOdW07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRlbXBBci5wdXNoKHRlbXApO1xuICAgICAgICB9XG4gICAgICAgIG5EYXRhQXIucHVzaCh0ZW1wQXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIWlzTmFOKG1vZGUucmVscG9zaXRpb24pKSB7XG4gICAgICBtb2RlID0gbW9kZS5yZWxwb3NpdGlvbjtcbiAgICAgIGZvciAoaSA9IDAsIGlpID0gZGF0YUFyLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICAgICAgdGVtcEFyID0gW107XG4gICAgICAgIGZvciAoaiA9IDAsIGpqID0gZGF0YUFyW2ldLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICAgICAgICBudW0gPSBkYXRhQXJbaV1bal07XG4gICAgICAgICAgaWYgKGogKyBtb2RlID49IDAgJiYgaiArIG1vZGUgPCBqaikge1xuICAgICAgICAgICAgY2hlY2tOdW0gPSBkYXRhQXJbaV1baiArIG1vZGVdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja051bSA9IG51bTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGVtcEFyLnB1c2goMTAwICogKG51bSAtIGNoZWNrTnVtKSAvIGNoZWNrTnVtKTtcbiAgICAgICAgfVxuICAgICAgICBuRGF0YUFyLnB1c2godGVtcEFyKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKCFpc05hTihtb2RlLnBvc2l0aW9uKSkge1xuICAgICAgbW9kZSA9IG1vZGUucG9zaXRpb247XG4gICAgICBmb3IgKGkgPSAwLCBpaSA9IGRhdGFBci5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgICAgIHRlbXBBciA9IFtdO1xuICAgICAgICBmb3IgKGogPSAwLCBqaiA9IGRhdGFBcltpXS5sZW5ndGg7IGogPCBqajsgKytqKSB7XG4gICAgICAgICAgbnVtID0gZGF0YUFyW2ldW2pdO1xuICAgICAgICAgIGlmIChtb2RlID49IDAgJiYgbW9kZSA8IGpqKSB7XG4gICAgICAgICAgICBjaGVja051bSA9IGRhdGFBcltpXVttb2RlXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tOdW0gPSBudW07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRlbXBBci5wdXNoKDEwMCAqIChudW0gLSBjaGVja051bSkgLyBjaGVja051bSk7XG4gICAgICAgIH1cbiAgICAgICAgbkRhdGFBci5wdXNoKHRlbXBBcik7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghaXNOYU4obW9kZS5yZWxkYXRhc2V0cG9zaXRpb24pKSB7XG4gICAgICBtb2RlID0gbW9kZS5yZWxkYXRhc2V0cG9zaXRpb247XG4gICAgICBmb3IgKGkgPSAwLCBpaSA9IGRhdGFBci5sZW5ndGg7IGkgPCBpaTsgKytpKSB7XG4gICAgICAgIHRlbXBBciA9IFtdO1xuICAgICAgICBpZiAoaSArIG1vZGUgPj0gMCAmJiBpICsgbW9kZSA8IGlpKSB7XG4gICAgICAgICAgY2hlY2tBcnIgPSBkYXRhQXJbaSArIG1vZGVdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNoZWNrQXJyID0gZGF0YUFyW2ldO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaiA9IDAsIGpqID0gZGF0YUFyW2ldLmxlbmd0aDsgaiA8IGpqOyArK2opIHtcbiAgICAgICAgICBjaGVja051bSA9IGNoZWNrQXJyW2pdO1xuICAgICAgICAgIG51bSA9IGRhdGFBcltpXVtqXTtcbiAgICAgICAgICB0ZW1wQXIucHVzaCgxMDAgKiAobnVtIC0gY2hlY2tOdW0pIC8gbnVtKTtcbiAgICAgICAgfVxuICAgICAgICBuRGF0YUFyLnB1c2godGVtcEFyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChpID0gMCwgaWkgPSBuRGF0YUFyLmxlbmd0aDsgaSA8IGlpOyArK2kpIHtcbiAgICAgIGZvciAoaiA9IDAsIGpqID0gbkRhdGFBcltpXS5sZW5ndGg7IGogPCBqajsgKytqKSB7XG4gICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKG5EYXRhQXJbaV1bal0pKSB7XG4gICAgICAgICAgbkRhdGFBcltpXVtqXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5EYXRhQXI7XG4gIH1cbn1cblxudmFyIEZvcm11bGFlID0ge1xuICBNaW5pbXVtOiAoYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhID4gYiA/IGIgOiBhO1xuICAgIH0pO1xuICB9LFxuICBNYXhpbXVtOiAoYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhIDwgYiA/IGIgOiBhO1xuICAgIH0pO1xuICB9LFxuICBNZWFuOiAoYXJyKSA9PiB7XG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIHJldHVybiBhICsgYjtcbiAgICB9KSAvIGFyci5sZW5ndGg7XG4gIH0sXG4gIE1lZGlhbjogKGFycikgPT4ge1xuICAgIHJldHVybiBhcnIubWFwKChhKSA9PiBhKS5zb3J0KChhLCBiKSA9PiB7IHJldHVybiBhIC0gYjsgfSlbYXJyLmxlbmd0aCAvIDJdO1xuICB9LFxuICAnU3RhbmRhcmQgRGV2aWF0aW9uJzogKHZhbHVlcykgPT4ge1xuICAgIGZ1bmN0aW9uIGF2ZXJhZ2UgKGRhdGEpIHtcbiAgICAgIHZhciBzdW0sIGF2ZztcbiAgICAgIHN1bSA9IGRhdGEucmVkdWNlKGZ1bmN0aW9uIChzdW0sIHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBzdW0gKyB2YWx1ZTtcbiAgICAgIH0sIDApO1xuXG4gICAgICBhdmcgPSBzdW0gLyBkYXRhLmxlbmd0aDtcbiAgICAgIHJldHVybiBhdmc7XG4gICAgfVxuICAgIHZhciBhdmcgPSAwLFxuICAgICAgc3F1YXJlRGlmZnMgPSAwLFxuICAgICAgc3FyRGlmZiA9IDAsXG4gICAgICBhdmdTcXVhcmVEaWZmID0gMCxcbiAgICAgIHN0ZERldiA9IDAsXG4gICAgICBkaWZmID0gMDtcbiAgICBhdmcgPSBhdmVyYWdlKHZhbHVlcyk7XG4gICAgc3F1YXJlRGlmZnMgPSB2YWx1ZXMubWFwKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgZGlmZiA9IHZhbHVlIC0gYXZnO1xuICAgICAgc3FyRGlmZiA9IGRpZmYgKiBkaWZmO1xuICAgICAgcmV0dXJuIHNxckRpZmY7XG4gICAgfSk7XG4gICAgYXZnU3F1YXJlRGlmZiA9IGF2ZXJhZ2Uoc3F1YXJlRGlmZnMpO1xuICAgIHN0ZERldiA9IE1hdGguc3FydChhdmdTcXVhcmVEaWZmKTtcbiAgICByZXR1cm4gc3RkRGV2O1xuICB9XG59O1xufSh0aGlzLCBkb2N1bWVudCkpO1xuIl0sImZpbGUiOiJncm93dGgtYW5hbHlzZXItZXM2LmpzIn0=
