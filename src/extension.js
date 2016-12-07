const GrowthAnalyser = require('./growthanalyser');

FusionCharts.register('extension', ['private', 'growth-analyser', function () {
  class GrowthAnalyserExt {
    /**
    * An extension for FusionTime XT charts.
    * Helps to analyse growth of data based on posisitions
    * specific formulae and custom values.
    * Growth analyser supports pre analysis of data
    * which can be provided in chart configuration
    * @example
    * {
    *   datasource: {
    *     extensions: {
    *       'growth-analyser': {
    *         'growthOver': 'firstIndex'
    *        }
    *     }
    *   }
    * }
    * Available 'growthOver' options are 'firstIndex', 'prevIndex', 'Minimum', 'Maximum',
    * 'Average', 'Median' & 'Standard Deviation'.
    */
    constructor () {
      var self = this;
      this.toolbox = FusionCharts.getComponent('api', 'toolbox');
      this.HorizontalToolbar = this.toolbox.HorizontalToolbar;
      this.ComponentGroup = this.toolbox.ComponentGroup;
      this.SymbolStore = this.toolbox.SymbolStore;
      this.analyserOptionsObject = {
        'First Data': {position: 0},
        'Previous Data': {relposition: -1},
        'Specific Value': {
          'submenu': true,
          'Minimum': 'Minimum',
          'Maximum': 'Maximum',
          'Average': 'Mean',
          'Median': 'Median',
          'Standard Deviation': 'Standard Deviation',
          'Custom Value...': (fn) => {
            fn((val) => {
              self.currentValue = val + '';
              self.analyser(val);
              self.preGrowthHook('Custom');
            });
          }
        }
      };
    }

    analyser (mode) {
      var self = this,
        ga = this.ga || {},
        store = this.tsObject.apiInstance.getComponentStore(),
        canvas = store.getCanvasByIndex(0),
        comp = canvas.getComposition(),
        ds = ga.ds || comp.dataset,
        i,
        idMap = ga.idMap || {},
        storeAr = ga.storeAr || [],
        nStoreArr = [],
        yAxis = canvas.composition.yAxis;
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
      // Changing y Axis formattor
      if (mode === 'reset' || !nStoreArr.changed) {
        yAxis.getScaleObj().getIntervalObj().getConfig('intervals').major.formatter = function (val, arg) {
          return arg.numberFormatter.yAxis(val);
        };
        self.contextMenu && self.contextMenu.hideListItem('reset');
      } else {
        yAxis.getScaleObj().getIntervalObj().getConfig('intervals').major.formatter = function (val, arg) {
          return arg.numberFormatter.yAxis(val) + '%';
        };
        self.contextMenu && self.contextMenu.showListItem('reset');
      }
      // Update data
      ds.setDataBySeries(function (series) {
        if (nStoreArr.value.length) {
          series.setOriginalData(nStoreArr.value[idMap[series.getId()]]);
        }
      });
      comp.impl.update();
    };

    init (require) {
      var instance = this,
        requiredParams = [
          'graphics',
          'chart',
          'globalReactiveModel',
          'spaceManagerInstance',
          'smartLabel',
          'chartInstance',
          'extData',
          function acquire () {
            let i = 0,
              ii = requiredParams.length - 1,
              param = '';
            for (i = 0; i < ii; ++i) {
              param = requiredParams[i];
              instance[param] = arguments[i];
            }
          }];
      require(requiredParams);
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

    growthOverMode () {
      let self = this,
        growthOver = this.extData && this.extData.growthOver,
        analyserOptionsObject = this.analyserOptionsObject,
        exists = false;

      function check (ob) {
        var key, value;
        for (key in ob) {
          value = ob[key];
          if (typeof value === 'object' && value.submenu) {
            check(value);
          }
          if (key.indexOf(growthOver) + 1) {
            exists = true;
          }
        }
      }
      check(analyserOptionsObject);
      if (!exists) {
        self.contextMenu && self.contextMenu.hideListItem('reset');
        return;
      }

      if (!isNaN(growthOver)) {
        self.analyser(growthOver);
        self.preGrowthHook('Custom');
      } else if (growthOver === 'firstIndex') {
        self.preGrowthHook('First');
        self.analyser({position: 0});
      } else if (growthOver === 'prevIndex') {
        self.preGrowthHook('Previous');
        self.analyser({relposition: -1});
      } else {
        self.preGrowthHook(growthOver);
        self.analyser(growthOver);
      }
    }

    updateAxisName (mode) {
      let self = this,
        apiInstance = this.chartInstance && this.chartInstance.apiInstance,
        origAxisName = this.origAxisName || apiInstance.getAxisName('y'),
        userFn = this.extData && this.extData.axisFormatter,
        renameFn = function (prevData, mode) {
          let text = mode + '';
          if (text === 'Custom') {
            text = self.currentValue + '';
          }
          text = text.toLowerCase();
          prevData = prevData + '';
          return prevData + ' (Growth over ' + text + ')';
        },
        analyserOptionsObject = this.analyserOptionsObject,
        exists = false,
        key = '',
        value;

      function check (ob) {
        for (key in ob) {
          value = ob[key];
          if (typeof value === 'object' && value.submenu) {
            check(value);
          }
          if (key.indexOf(mode) + 1) {
            exists = true;
          }
        }
      }
      check(analyserOptionsObject);

      this.origAxisName = origAxisName;
      if (exists) {
        changeAxis(renameFn(origAxisName, mode));
      } else {
        changeAxis(origAxisName);
      }
      function changeAxis (val) {
        if (!origAxisName) {
          return;
        }
        apiInstance.getAxisName('y', {
          text: val
        });
      }
    }

    preGrowthHook (val) {
      this.highlight(val);
      this.updateAxisName(val);
    }

    highlight (key) {
      let contextMenu = this.contextMenu,
        atomicLists = contextMenu && contextMenu.listContainerManager.container.atomicLists,
        i = atomicLists.length,
        j = 0,
        list = {},
        subList = {},
        noneFound = true;
      for (; i-- - 1;) {
        list = atomicLists[i];
        noneFound = true;
        if (list.name.indexOf(key) + 1) {
          list.node.style.fontWeight = 'bold';
        } else {
          list.node.style.fontWeight = '';
        }
        for (j = list.subConRef && list.subConRef.atomicLists.length || 0; j--;) {
          subList = list.subConRef.atomicLists[j];
          if (subList.name.indexOf(key) + 1) {
            subList.node.style.fontWeight = 'bold';
            list.node.style.fontWeight = 'bold';
            noneFound = false;
          } else {
            subList.node.style.fontWeight = '';
          }
          if (noneFound) {
            list.node.style.fontWeight = '';
          }
        }
      }
    }

    createToolbar () {
      var toolbar,
        group,
        self = this,
        contextMenu,
        contextArray = [],
        gaOptionsObj = {},
        popup,
        paper = this.graphics.paper,
        chartContainer = this.graphics.container,
        userStyle = self.extData && self.extData.style || {},
        subCatStyle = {
          'font-size': '12px',
          'color': '#696969',
          'font-family': '"Lucida Grande", Sans-serif'
        },
        catStyle = {
          'font-size': '13px',
          'color': '#4b4b4b',
          'font-family': '"Lucida Grande", Sans-serif',
          'fontWeight': 'bold'
        },
        popupStyle = {
          'fontSize': 10 + 'px',
          'lineHeight': 15 + 'px',
          'font-family': '"Lucida Grande", Sans-serif',
          'stroke': '#676767',
          'stroke-width': '2'
        };

      userStyle.category = userStyle.category || {};
      userStyle.subCategory = userStyle.subCategory || {};
      userStyle.popup = userStyle.popup || {};
      Object.assign(catStyle, userStyle.category);
      Object.assign(subCatStyle, userStyle.subCategory);
      Object.assign(popupStyle, userStyle.popup);

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

      gaOptionsObj = this.analyserOptionsObject;

      contextMenu = new this.toolbox.SymbolWithContext('ContextIcon', {
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      }, {
        width: 24,
        height: 24,
        position: 'right',
        stroke: '#ced5d4',
        strokeWidth: '1',
        radius: '1',
        symbolStroke: '#696969',
        symbolStrokeWidth: '2'
      });
      this.contextMenu = contextMenu;

      contextArray.push({
        'Show Growth Over': {
          style: catStyle
        }
      });
      popup = function (callback) {
        var box,
          header,
          style = popupStyle,
          headerWidth = 180,
          headerText,
          cross,
          inputField,
          applyButton,
          chartWidth = self.chart && self.chart.width || 0,
          chartHeight = self.chart && self.chart.height || 0,
          x = (chartWidth / 2) - 90,
          y = (chartHeight / 2) - 40,
          shadow;

        shadow = paper.rect({
          x: 0,
          y: 0,
          width: chartWidth,
          height: chartHeight,
          fill: '#000',
          opacity: '0.35'
        });

        box = paper.html('div', {
          fill: '#f7f7f7',
          x: x,
          y: y,
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
          text: 'Provide value'
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
          shadow.remove();
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
          'font-family': '"Lucida Grande", Sans-serif',
          fill: '#eaeaea',
          color: '#eaeaea',
          stroke: '#eaeaea',
          cursor: 'pointer'
        }, box);

        function applyValue () {
          box.hide();
          shadow.remove();
          callback(inputField.val());
        }
        applyButton.on('click', () => {
          applyValue();
        });
        inputField.on('keyup', (e) => {
          if (e.keyCode === 13) {
            applyValue();
          }
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
        header.element.style['font-family'] = '"Lucida Grande", Sans-serif';
        applyButton.element.style['textAlign'] = 'center';
        applyButton.element.style['fontSize'] = '11px';
        applyButton.element.style['paddingTop'] = '3px';
        applyButton.element.style['borderRadius'] = '3px';
        applyButton.element.style['color'] = '#e4e4e4';
      };

      // Pusing reset Button
      contextArray.push({
        '&nbsp; &nbsp; Reset View': {
          id: 'reset',
          handler: function () {
            self.analyser('reset');
            self.preGrowthHook('reset');
          },
          action: 'click',
          style: subCatStyle
        }
      });
      contextArray.push({
        '': {
          id: 'reset',
          style: {
            backgroundColor: '#d5d2d2',
            height: '1px',
            margin: '1px',
            padding: '0px'
          }
        }
      });

      for (let i in gaOptionsObj) {
        let key,
          obj = {},
          subObj = {};
        if (!gaOptionsObj[i].submenu) {
          key = '&nbsp; &nbsp; ' + i;
          obj[key] = {};
          obj[key] = {
            style: subCatStyle,
            handler: function () {
              self.analyser(gaOptionsObj[i]);
              self.preGrowthHook(i);
            },
            action: 'click'
          };
        } else {
          key = '&#9666&nbsp; ' + i;
          obj[key] = {};
          obj[key].action = 'click';
          obj[key].style = subCatStyle;
          obj[key].handler = [];
          for (let j in gaOptionsObj[i]) {
            let subMenuName = j,
              subMenuValue = gaOptionsObj[i][j];
            if (j === 'submenu') {
              continue;
            }
            subObj = {};
            subObj['&nbsp;' + subMenuName] = {};
            subObj['&nbsp;' + subMenuName].handler = function () {
              if (typeof subMenuValue === 'function') {
                subMenuValue(popup);
              } else {
                self.analyser(subMenuValue);
                self.preGrowthHook(subMenuName);
              }
            };
            subObj['&nbsp;' + subMenuName].action = 'click';
            subObj['&nbsp;' + subMenuName].style = subCatStyle;
            obj[key].handler.push(subObj);
            if (j.indexOf('Custom') === -1) {
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
        if (i.indexOf('Specific') === -1) {
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

      group.addSymbol(contextMenu);
      toolbar.addComponent(group);
      return toolbar;
    };

    getLogicalSpace (availableWidth, availableHeight) {
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

    placeInCanvas () {
      var self = this,
        config = this.extData || {},
        posWrtCanvas = config.posWrtCanvas || 'top',
        layout = config.layout || 'inline',
        alignment = config.alignment || 'right',
        orientation = config.orientation || 'horizontal';
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
          return obj[layout];
        },
        orientation: [{
          type: function (obj) {
            return obj[orientation];
          },
          position: [{
            type: function (obj) {
              return obj[posWrtCanvas];
            },
            alignment: [{
              type: function (obj) {
                return obj[alignment];
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

    setDrawingConfiguration (x, y, width, height, group) {
      var mes = this.measurement;
      mes.x = x;
      mes.y = y;
      mes.width = width;
      mes.height = height;

      this.parentGroup = group;

      return this;
    };

    draw (x, y, width, height, group) {
      var measurement = this.measurement,
        toolbars = this.toolbars,
        ln,
        i,
        toolbar;
      // Setting initial growth mode
      this.growthOverMode();
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
  };
  FusionCharts.registerComponent('extensions', 'growth-analyser', GrowthAnalyserExt);
}]);
