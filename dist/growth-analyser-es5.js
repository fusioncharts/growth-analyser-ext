/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GrowthAnalyser = __webpack_require__(1);

	FusionCharts.register('extension', ['private', 'growth-analyser', function () {
	  var GrowthAnalyserExt = function () {
	    function GrowthAnalyserExt() {
	      _classCallCheck(this, GrowthAnalyserExt);

	      this.toolbox = FusionCharts.getComponent('api', 'toolbox');
	      this.HorizontalToolbar = this.toolbox.HorizontalToolbar;
	      this.ComponentGroup = this.toolbox.ComponentGroup;
	      this.SymbolStore = this.toolbox.SymbolStore;
	    }

	    _createClass(GrowthAnalyserExt, [{
	      key: 'renderChange',
	      value: function renderChange() {
	        var chartInstance = this.tsObject.chartInstance,
	            componentStore = chartInstance.apiInstance.getComponentStore(),
	            i = 0;
	        for (i = 0; componentStore.getCanvasByIndex(i); ++i) {
	          componentStore.getCanvasByIndex(i).getComposition().PlotManager.plot();
	        }
	      }
	    }, {
	      key: 'analyser',
	      value: function analyser(mode) {
	        var ga = this.ga || {},
	            store = this.tsObject.apiInstance.getComponentStore(),
	            canvas = store.getCanvasByIndex(0),
	            comp = canvas.getComposition(),
	            ds = ga.ds || comp.dataset,
	            i,
	            idMap = ga.idMap || {},
	            storeAr = ga.storeAr || [],
	            nStoreArr = [],
	            yAxis = canvas.composition.yAxis;
	        // Changing y Axis formattor
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
	      }
	    }, {
	      key: 'init',
	      value: function init(require) {
	        var instance = this;
	        require(['xAxis', 'yAxis', 'graphics', 'chart', 'dataset', 'PlotManager', 'canvasConfig', 'MarkerManager', 'reactiveModel', 'globalReactiveModel', 'spaceManagerInstance', 'smartLabel', 'chartInstance', 'extData', 'canvasData', function (xAxis, yAxis, graphics, chart, dataset, plotManager, canvasConfig, markerManager, reactiveModel, globalReactiveModel, spaceManagerInstance, smartLabel, chartInstance, extData, canvasData) {
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
	          instance.extData = extData;
	        }]);
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
	        setTimeout(instance.growthOverMode.bind(instance), 50);
	        return this;
	      }
	    }, {
	      key: 'growthOverMode',
	      value: function growthOverMode() {
	        var self = this,
	            growthOver = this.extData && this.extData.growthOver;
	        console.log(this.extData, growthOver);
	        if (!isNaN(growthOver)) {
	          self.analyser(growthOver);
	        } else if (growthOver === 'firstIndex') {
	          self.analyser({ position: 0 });
	        } else if (growthOver === 'prevIndex') {
	          self.analyser({ relposition: -1 });
	        } else {
	          self.analyser(growthOver);
	        }
	      }
	    }, {
	      key: 'createToolbar',
	      value: function createToolbar() {
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

	        gaOptionsObj = {
	          'First Index': { position: 0 },
	          'Previous Index': { relposition: -1 },
	          'Specific Value': {
	            'submenu': true,
	            'Minimum': 'Minimum',
	            'Maximum': 'Maximum',
	            'Mean': 'Mean',
	            'Median': 'Median',
	            'Standard Deviation': 'Standard Deviation',
	            'Custom Value...': function CustomValue() {
	              popup(function (val) {
	                return self.analyser(val);
	              });
	            }
	          }
	        };

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

	        contextArray.push({
	          'Growth Analyser': {
	            style: catStyle
	          }
	        });
	        popup = function popup(callback) {
	          var box,
	              header,
	              style = popupStyle,
	              headerWidth = 180,
	              headerText,
	              cross,
	              inputField,
	              applyButton,
	              x = self.chart.width * 0.47 - 90,
	              y = self.chart.height / 2 - 40;

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

	          function applyValue() {
	            box.hide();
	            callback(inputField.val());
	          }
	          applyButton.on('click', function () {
	            applyValue();
	          });
	          inputField.on('keyup', function (e) {
	            if (e.keyCode === 13) {
	              applyValue();
	            }
	          });
	          applyButton.attr({
	            text: 'Apply'
	          });
	          inputField.element.focus();
	          function inputFieldNumberHandler() {
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

	        var _loop = function _loop(i) {
	          var key = void 0,
	              obj = {},
	              subObj = {};
	          if (!gaOptionsObj[i].submenu) {
	            key = '&nbsp; &nbsp; ' + i;
	            obj[key] = {};
	            obj[key] = {
	              style: subCatStyle,
	              handler: function handler() {
	                self.analyser(gaOptionsObj[i]);
	              },
	              action: 'click'
	            };
	          } else {
	            key = '&#9666&nbsp; ' + i;
	            obj[key] = {};
	            obj[key].action = 'click';
	            obj[key].style = subCatStyle;
	            obj[key].handler = [];

	            var _loop2 = function _loop2(j) {
	              var subMenuName = j,
	                  subMenuValue = gaOptionsObj[i][j];
	              if (j === 'submenu') {
	                return 'continue';
	              }
	              subObj = {};
	              subObj['&nbsp;' + subMenuName] = {};
	              subObj['&nbsp;' + subMenuName].handler = function () {
	                if (typeof subMenuValue === 'function') {
	                  subMenuValue();
	                } else {
	                  self.analyser(subMenuValue);
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
	            };

	            for (var j in gaOptionsObj[i]) {
	              var _ret2 = _loop2(j);

	              if (_ret2 === 'continue') continue;
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
	        };

	        for (var i in gaOptionsObj) {
	          _loop(i);
	        }

	        contextArray.push({
	          '&nbsp; &nbsp; Reset View': {
	            handler: function handler() {
	              self.analyser('reset');
	            },
	            action: 'click',
	            style: subCatStyle
	          }
	        });
	        console.log(contextMenu);
	        window.ctx = contextMenu;
	        contextMenu.appendAsList(contextArray);

	        this.SymbolStore.register('ContextIcon', function (posx, posy, rad) {
	          var x = posx,
	              y = posy,
	              r = rad * 2,
	              space = Math.round(r / 4),
	              halfWidth = Math.round(r / 2) * 0.7,
	              startX = x - halfWidth,
	              endX = x + halfWidth,
	              startY = y + space,
	              endY = y - space;
	          return ['M', startX, y, 'L', endX, y, 'M', startX, startY, 'L', endX, startY, 'M', startX, endY, 'L', endX, endY];
	        });

	        group.addSymbol(contextMenu);
	        toolbar.addComponent(group);
	        return toolbar;
	      }
	    }, {
	      key: 'getLogicalSpace',
	      value: function getLogicalSpace(availableWidth, availableHeight) {
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
	      }
	    }, {
	      key: 'placeInCanvas',
	      value: function placeInCanvas() {
	        var _self = this;
	        _self.padding = 5;
	        _self.spaceManagerInstance.add([{
	          name: function name() {
	            return 'ToolBoxExt';
	          },
	          ref: function ref(obj) {
	            return obj['0'];
	          },
	          self: function self() {
	            return _self;
	          },
	          priority: function priority() {
	            return 2;
	          },
	          layout: function layout(obj) {
	            return obj.inline;
	          },
	          orientation: [{
	            type: function type(obj) {
	              return obj.horizontal;
	            },
	            position: [{
	              type: function type(obj) {
	                return obj.top;
	              },
	              alignment: [{
	                type: function type(obj) {
	                  return obj.right;
	                },
	                dimensions: [function () {
	                  var parent = this.getParentComponentGroup();
	                  return _self.getLogicalSpace(parent.getWidth(), parent.getHeight());
	                }]
	              }]
	            }]
	          }]
	        }]);
	      }
	    }, {
	      key: 'setDrawingConfiguration',
	      value: function setDrawingConfiguration(x, y, width, height, group) {
	        var mes = this.measurement;
	        mes.x = x;
	        mes.y = y;
	        mes.width = width;
	        mes.height = height;

	        this.parentGroup = group;

	        return this;
	      }
	    }, {
	      key: 'draw',
	      value: function draw(x, y, width, height, group) {
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
	      }
	    }]);

	    return GrowthAnalyserExt;
	  }();

	  ;
	  FusionCharts.registerComponent('extensions', 'growth-analyser', GrowthAnalyserExt);
	}]);

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var GrowthAnalyser = function () {
	  function GrowthAnalyser(data) {
	    _classCallCheck(this, GrowthAnalyser);

	    this.data = data.map(function (a) {
	      return a.map(function (b) {
	        return b;
	      });
	    });
	    this.Formulae = Formulae;
	  }

	  _createClass(GrowthAnalyser, [{
	    key: 'analyse',
	    value: function analyse(mode) {
	      var i = 0,
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
	      if (mode === undefined) {
	        return this.data.map(function (a) {
	          return a.map(function (b) {
	            return undefined;
	          });
	        });
	      }
	      if (typeof mode === 'string' && mode.toLowerCase() === 'reset') {
	        return dataAr.map(function (a) {
	          return a.map(function (b) {
	            return b;
	          });
	        });
	      } else if (!isNaN(mode)) {
	        // Handling a number
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
	        if (!mode) {
	          return this.data.map(function (a) {
	            return a.map(function (b) {
	              return undefined;
	            });
	          });
	        }
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
	      } else if (!isNaN(mode.position) || typeof mode.position === 'string') {
	        mode = mode.position;
	        for (i = 0, ii = dataAr.length; i < ii; ++i) {
	          tempAr = [];
	          for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
	            num = dataAr[i][j];
	            if (mode === 'last') {
	              checkNum = dataAr[i][jj - 1];
	            } else if (mode === 'mid') {
	              checkNum = dataAr[i][jj / 2];
	            } else if (mode >= 0 && mode < jj) {
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
	      } else {
	        return this.data.map(function (a) {
	          return a.map(function (b) {
	            return undefined;
	          });
	        });
	      }
	      for (i = 0, ii = nDataAr.length; i < ii; ++i) {
	        for (j = 0, jj = nDataAr[i].length; j < jj; ++j) {
	          if (!Number.isFinite(nDataAr[i][j])) {
	            nDataAr[i][j] = null;
	          }
	        }
	      }
	      var roundToTwo = function roundToTwo(num) {
	        return +(Math.round(num + 'e+2') + 'e-2');
	      };
	      // Rounding values
	      for (i = 0, ii = nDataAr.length; i < ii; ++i) {
	        for (j = 0, jj = nDataAr[i].length; j < jj; ++j) {
	          nDataAr[i][j] = roundToTwo(nDataAr[i][j]);
	        }
	      }
	      for (i = nDataAr.length; i--;) {
	        for (j = nDataAr[i].length; j--;) {
	          temp = parseInt(nDataAr[i][j] * 100);
	          nDataAr[i][j] = temp / 100;
	        }
	      }
	      return nDataAr;
	    }
	  }]);

	  return GrowthAnalyser;
	}();

	var Formulae = {
	  Minimum: function Minimum(arr) {
	    return arr.reduce(function (a, b) {
	      return a > b ? b : a;
	    });
	  },
	  Maximum: function Maximum(arr) {
	    return arr.reduce(function (a, b) {
	      return a < b ? b : a;
	    });
	  },
	  Mean: function Mean(arr) {
	    return arr.reduce(function (a, b) {
	      return a + b;
	    }) / arr.length;
	  },
	  Median: function Median(arr) {
	    return arr.map(function (a) {
	      return a;
	    }).sort(function (a, b) {
	      return a - b;
	    })[arr.length / 2];
	  },
	  'Standard Deviation': function StandardDeviation(values) {
	    function average(data) {
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

	module.exports = GrowthAnalyser;

/***/ }
/******/ ]);