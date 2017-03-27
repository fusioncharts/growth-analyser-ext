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

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	const GrowthAnalyser = __webpack_require__(2);

	FusionCharts.register('extension', ['private', 'growth-analyser', function () {
	  class GrowthAnalyserExt {

	    constructor () {
	      var self = this;
	      this.toolbox = FusionCharts.getComponent('api', 'toolbox');
	      this.HorizontalToolbar = this.toolbox.HorizontalToolbar;
	      this.ComponentGroup = this.toolbox.ComponentGroup;
	      this.SymbolStore = this.toolbox.SymbolStore;
	      // configure the options
	      this.analyserOptionsObject = {
	        'Previous Data': {
	          relposition: -1
	        },
	        'Specific Value': (val, index) => {
	          self.currentValue = `${val}`;
	          self.analyser(val, index);
	          self.preGrowthHook('Custom', index);
	        },
	        'First Data': (val, index) => {
	          self.currentValue = val;
	          self.analyser(val, index);
	          self.preGrowthHook('Custom', index);
	        },
	        'Statistical Value': (val, index) => {
	          self.currentValue = val;
	          self.analyser(val, index);
	          self.preGrowthHook('Custom', index);
	        }
	      };
	    }

	    analyser (mode, index) {
	      var self = this,
	        ga = this.ga || {},
	        store = this.tsObject.apiInstance.getComponentStore(),
	        canvas = store.getCanvasByIndex(index), // index should be changed
	        comp = canvas.getComposition(),
	        ds = /* ga.ds || */ comp.dataset,
	        i,
	        idMap = /* ga.idMap || */ {},
	        storeAr = /* ga.storeAr || */ [],
	        nStoreArr = [],
	        yAxis = canvas.composition.yAxis,
	        canvasGroups = store.getAllCanvas(),
	        cogWheel = canvasGroups[index].composition.impl.getMenu();

	      self.contextMenu = cogWheel._contextMenu;
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
	      // get desired result with specific mode
	      nStoreArr = ga.gAnalyser.analyse(mode);
	      // Changing y Axis formattor
	      if (mode === 'reset' || !nStoreArr.changed) {
	        yAxis.getScaleObj()
	          .getIntervalObj()
	          .getConfig('intervals')
	          .major.formatter = function (val, arg) {
	            var numberFormatter = arg.numberFormatter;
	            return numberFormatter.prefix + numberFormatter.formatter.format(val) + numberFormatter.suffix;
	            // return arg.numberFormatter.yAxis(val);
	          };
	        self.contextMenu && self.contextMenu.hideListItem('reset');
	      } else {
	        yAxis.getScaleObj()
	          .getIntervalObj()
	          .getConfig('intervals')
	          .major.formatter = function (val, arg) {
	            var numberFormatter = arg.numberFormatter;
	            return numberFormatter.prefix + numberFormatter.formatter.format(val) + numberFormatter.suffix + '%';
	            // return arg.numberFormatter.yAxis(val) + '%';
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
	          }
	        ];
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

	      return this;
	    };

	    configure () {
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
	        self.analyser({
	          position: 0
	        });
	      } else if (growthOver === 'prevIndex') {
	        self.preGrowthHook('Previous');
	        self.analyser({
	          relposition: -1
	        });
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
	        renameFn = typeof userFn === 'function' && userFn || function (prevData, mode) {
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

	    preGrowthHook (val, index) {
	      this.highlight(val, index);
	      // this.updateAxisName(val,index);
	    }

	    highlight (key, index) {
	      let componentStore = this.chartInstance.apiInstance.getComponentStore(),
	        canvasGroups = componentStore.getAllCanvas(),
	        cogWheel = canvasGroups[index].composition.impl.getMenu(),
	        contextMenu = cogWheel._contextMenu,
	        containers = contextMenu && contextMenu.dropDownMenu.containerData,
	        i = containers.length,
	        paper = this.graphics.paper,
	        d3 = paper.getInstances()
	        .d3,
	        container = {};
	      for (; i--;) {
	        container = containers[i].container.container;
	        container.selectAll('div')
	          .each(function (d) {
	            if (d.name && d.name.indexOf(key) + 1) {
	              d3.select(this)
	                .classed('fc-dropdown-list-selected', true);
	            } else {
	              d3.select(this)
	                .classed('fc-dropdown-list-selected', false);
	            }
	          });
	      }
	    }

	    createToolbar () {
	      var toolbar,
	        group,
	        self = this,
	        contextMenu = this.chartMenu,
	        contextArray = [],
	        contextArrayX,
	        gaOptionsObj = {},
	        createPopUp,
	        getIntervals,
	        iterate,
	        key,
	        dm,
	        component,
	        components,
	        state,
	        states,
	        paper = this.graphics.paper,
	        d3 = paper.getInstances()
	        .d3,
	        chartContainer = this.graphics.container,
	        userStyle = self.extData && self.extData.style || {},
	        componentStore = this.chartInstance.apiInstance.getComponentStore(),
	        canvasGroups = componentStore.getAllCanvas(),
	        // style attrs
	        subCatStyle = {
	          'font-size': '12px',
	          'color': '#696969',
	          'font-family': '"Lucida Grande", Sans-serif'
	        },
	        catStyle = {
	          'font-size': '12px',
	          'color': '#4b4b4b',
	          'font-family': '"Lucida Grande", Sans-serif'
	        },
	        listItemSelectedStyle = {
	          'font-weight': 'bold'
	        },
	        popupStyle = {
	          'font-size': 10 + 'px',
	          'line-height': 15 + 'px',
	          'font-family': '"Lucida Grande", Sans-serif',
	          'stroke': '#676767',
	          'stroke-width': '2'
	        },
	        header = {
	          'font-size': '13px',
	          'font-weight': 'bold',
	          'color': '#4b4b4b',
	          'font-family': '"Lucida Grande", Sans-serif'
	        },
	        divider = {
	          backgroundColor: '#d5d2d2'
	        },
	        listItemStyles = {
	          'fc-dropdown-list-item-cat': catStyle,
	          'fc-dropdown-list-item-subcat': subCatStyle,
	          'fc-dropdown-list-divider': divider,
	          'fc-dropdown-list-header': header,
	          'fc-dropdown-list-selected': listItemSelectedStyle
	        };

	      for (key in listItemStyles) {
	        paper.cssAddRule('.' + key, listItemStyles[key]);
	      }

	      userStyle.category = userStyle.category || {};
	      userStyle.subCategory = userStyle.subCategory || {};
	      userStyle.popup = userStyle.popup || {};
	      Object.assign(catStyle, userStyle.category);
	      Object.assign(subCatStyle, userStyle.subCategory);
	      Object.assign(popupStyle, userStyle.popup);

	      gaOptionsObj = this.analyserOptionsObject;

	      createPopUp = function (callback, __conf) {
	        /*  type1 : simple input field
	            type2 : withouy method
	            type3 : withmethod
	        */
	        var _conf = __conf || {},
	          type = _conf.type || 1,
	          _index = _conf.index,
	          containerBox = document.createElement('div'),
	          box = document.createElement('div'),
	          boxElem = document.createElement('div'),
	          transparentBack = document.createElement('div'),
	          header = document.createElement('div'),
	          title = document.createElement('div'),
	          crossButton = document.createElement('button'),
	          button = document.createElement('button'),
	          svgContainer = d3.select(chartContainer),
	          chartWidth = self.chart && self.chart.width || 0,
	          chartHeight = self.chart && self.chart.height || 0,
	          modalConf = {
	            3: [240, 135],
	            2: [220, 110],
	            1: [180, 80]
	          },
	          x = (chartWidth / 2) - modalConf[type][0] / 2,
	          y = (chartHeight / 2) - modalConf[type][1] / 2,
	          headerWidth = modalConf[type][0],
	          modalHeight = modalConf[type][1],
	          data = _conf.data,
	          _label,
	          input,
	          key,
	          val,
	          hiddenIntevals,
	          selectMethods,
	          formElement,
	          shadow = svgContainer.select('svg')
	          .append('rect')
	          .attr('x', 0)
	          .attr('y', 0)
	          .attr('width', chartWidth)
	          .attr('height', chartHeight)
	          .attr('fill', '#000')
	          .attr('opacity', '0.35'),
	          _data = ['Minimum', 'Maximum', 'Average', 'Median', 'Standard Deviation'],
	          onClickClose = function () {
	            box.parentElement.removeChild(box);
	            shadow.remove();
	          },
	          applyValue = function (val) {
	            var value = val;
	            onClickClose();
	            callback(value, _index);
	          },
	          addOption = function (arr, parent) {
	            for (let i = 0, ii = arr.length; i < ii; i++) {
	              let option = document.createElement('option');
	              option.value = arr[i];
	              option.id = 'option_' + i;
	              option.text = arr[i];
	              parent.appendChild(option);
	            }
	          },
	          createRadioBtns = function (arr, parent) {
	            for (let i = 0, ii = arr.length; i < ii; i++) {
	              let inputno = document.createElement('input'),
	                label = document.createElement('label');
	              inputno.type = 'radio';
	              inputno.name = 'chooseOption';
	              inputno.id = 'option_' + i;
	              inputno.value = arr[i].value;
	              inputno.style.cursor = 'pointer';
	              inputno.style.marginRight = '5px';

	              label.appendChild(inputno);
	              label.id = 'option_label' + i;
	              label.innerHTML += arr[i].value;
	              label.style.display = 'block';
	              label.style.fontSize = '11px';

	              label.addEventListener('click', arr[i].callback);
	              parent.appendChild(label);
	            }
	          },
	          createCommonElems = function () {
	            selectMethods = document.createElement('select');
	            addOption(data, selectMethods);

	            selectMethods.addEventListener('change', function () {
	              applyValue(selectMethods.options[selectMethods.selectedIndex].value);
	            });

	            formElement = document.createElement('form');
	            createRadioBtns(radioOptions, formElement);

	            containerBox.appendChild(formElement);
	            containerBox.appendChild(selectMethods);

	            formElement.style.display = 'block';
	            formElement.style.width = '100%';
	            formElement.style.textAlign = 'left';

	            selectMethods.style.display = 'none';
	            selectMethods.style.marginTop = '7px';
	          },
	          radioOptions = [{
	            value: 'Visible Range',
	            callback: function () {
	              val = 'visiblerange';
	              selectMethods.style.display = 'none';
	              applyValue(val);
	            }
	          }, {
	            value: 'Full Range',
	            callback: function () {
	              val = 'fullrange';
	              selectMethods.style.display = 'none';
	              applyValue(val);
	            }
	          }, {
	            value: 'Standard Time Interval',
	            callback: function () {
	              // show the Standard time itervals
	              selectMethods.style.display = 'block';
	              box.style.height = modalHeight + 17 + 'px';
	            }
	          }];

	        box.unselectable = 'on';
	        box.style.position = 'absolute';
	        box.style.fill = '#f7f7f7';
	        box.style.left = x + 'px';
	        box.style.top = y + 'px';
	        box.style.border = '1px solid rgb(212, 210, 211)';
	        box.style.stroke = 'rgb(103, 103, 103)';
	        box.style.width = headerWidth + 'px';
	        box.style.backgroundColor = 'rgb(247, 247, 247)';
	        box.style.height = modalHeight + 'px';
	        box.style.fontFamily = '"Lucida Grande", sans-serif';
	        // global popup style
	        for (key in popupStyle) {
	          box.style[key] = popupStyle[key];
	        }
	        // setting up cross button
	        crossButton.innerHTML = 'X';
	        crossButton.style.paddingTop = '-3px';
	        crossButton.type = 'button';
	        crossButton.style.float = 'right';
	        crossButton.style.display = 'inline';
	        crossButton.style.marginTop = '-3px';
	        crossButton.style.cursor = 'pointer';
	        crossButton.style.height = '21px';
	        crossButton.style.lineHeight = '1';
	        crossButton.style.width = '24px';
	        crossButton.style.border = '2px solid rgb(203, 203, 203)';
	        crossButton.style.backgroundColor = 'rgb(210, 210, 210)';
	        crossButton.style.color = 'rgb(140, 140, 140)';
	        crossButton.style.stroke = 'rgb(103, 103, 103)';
	        crossButton.addEventListener('click', onClickClose);

	        // title.style.padding = '5' + 'px';
	        title.innerHTML = 'Provide Value';
	        title.style.fontSize = '10px';
	        title.style.display = 'inline-block';
	        title.style.stroke = 'rgb(103, 103, 103)';
	        title.style.width = (headerWidth - 50) + 'px';
	        title.style.color = 'rgb(103, 103, 103)';

	        // appending to header
	        header.style.position = 'relative';
	        header.style.paddingTop = '3px';
	        header.style.paddingLeft = '11px';
	        header.style.left = 0 + 'px';
	        header.style.top = 0 + 'px';
	        header.style.backgroundColor = 'rgb(232, 232, 232)';
	        header.style.border = '1px solid rgb(212, 210, 211)';
	        header.style.stroke = 'rgb(103, 103, 103)';
	        header.style.width = (headerWidth - 12) + 'px';
	        header.style.height = 18 + 'px';
	        for (key in popupStyle) {
	          header.style[key] = popupStyle[key];
	        }

	        containerBox.style.textAlign = 'left';
	        containerBox.style.padding = '12px';

	        header.appendChild(title);
	        header.appendChild(crossButton);

	        switch (type) {
	          case 1:
	            let val;
	            input = document.createElement('input');
	            // style input box
	            input.style.width = '54%';
	            input.style.height = '20px';
	            input.style.border = '2px solid rgb(218, 219, 218)';
	            input.style.stroke = 'rgb(103, 103, 103)';
	            input.style.margin = '0px';
	            input.style['font-size'] = '13px';
	            input.addEventListener('keyup', function (e) {
	              if (e.keyCode === 13) {
	                applyValue(input.value);
	              } else {
	                val = input.value.replace(/[^\d.-]/g, '');
	              }
	            });
	            // on key down event listener
	            input.addEventListener('keydown', function (e) {
	              val = input.value.replace(/[^\d.-]/g, '');
	            });

	            // click listener
	            button.style.float = 'right';
	            button.style.borderRadius = '1px';
	            button.style.color = '#fff';
	            button.style.background = '#555555';
	            button.style.fontSize = '10px';
	            button.style.borderRadius = '5px';
	            button.style.border = '1px solid rgba(0,0,0,0.4)';
	            button.style.height = '22px';
	            button.style.width = '50px';
	            button.style.cursor = 'pointer';
	            button.addEventListener('click', function (e) {
	              applyValue(val);
	            });
	            // input customization
	            button.innerHTML = 'Apply';

	            containerBox.appendChild(input);
	            containerBox.appendChild(button);
	            break;
	          case 2:
	            createCommonElems();
	            break;
	          case 3:
	            _label = document.createElement('label');

	            hiddenIntevals = document.createElement('select');
	            hiddenIntevals.style.marginBottom = '5px';
	            hiddenIntevals.addEventListener('click', function () {
	              // applyValue(selectMethods.options[selectMethods.selectedIndex].value);
	            });
	            addOption(_data, hiddenIntevals);
	            _label.id = 'methods';
	            _label.innerHTML += 'Methods : ';
	            _label.style.fontSize = '11px';
	            containerBox.appendChild(_label);
	            containerBox.appendChild(hiddenIntevals);
	            createCommonElems();
	            hiddenIntevals.style.display = 'inline-block';
	            break;
	        } // end of switch case

	        // appending popup
	        box.appendChild(header);
	        box.appendChild(containerBox);
	        box.id = 'modal';
	        chartContainer.appendChild(box);

	        type === 1 && input.focus();
	      };
	      // function that returns the intervals
	      getIntervals = function () {
	        return ['yearly', 'monthly', 'daily', 'hourly'];
	      };
	      iterate = function (obj, isSubCat, index) {
	        let tempOb,
	          arr = [];

	        for (let property in obj) {
	          tempOb = {};
	          tempOb.action = 'click';
	          tempOb.padding = {
	            left: 20
	          };
	          tempOb.name = property;
	          if (obj.hasOwnProperty(property)) {
	            if (typeof obj[property] === 'object' && obj[property]['submenu']) {
	              tempOb.className = 'fc-dropdown-list-item-cat';
	              tempOb.handler = iterate(obj[property], true, index);
	            } else {
	              // not a object
	              // reject submenu option
	              if (property === 'submenu') {
	                continue;
	              }
	              tempOb.className = isSubCat ? 'fc-dropdown-list-item-cat' : 'fc-dropdown-list-item-subcat';
	              tempOb.handler = function () {
	                if (typeof obj[property] === 'function') {
	                  // obj[property](createPopUp);
	                  if (property === 'Specific Value') {
	                    createPopUp(obj[property], {
	                      type: 1,
	                      index: index
	                    });
	                  } else if (property === 'First Data') {
	                    createPopUp(obj[property], {
	                      type: 2,
	                      index: index,
	                      data: getIntervals()
	                    });
	                  } else if (property === 'Statistical Value') {
	                    createPopUp(obj[property], {
	                      type: 3,
	                      index: index,
	                      data: getIntervals()
	                    });
	                  }
	                } else {
	                  self.analyser(obj[property]);
	                  self.preGrowthHook(property);
	                }
	              };
	              tempOb.style = subCatStyle;
	            } // end of else
	            arr.push(tempOb);
	          }
	        }
	        return arr;
	      };

	      for (let i = (Object.keys(canvasGroups))
	          .length - 1; i >= 0; i--) {
	        contextMenu = canvasGroups[i].composition.impl.getMenu();
	        contextArray = [];
	        contextArray.push({
	          name: 'Show Growth Over',
	          interactivity: false,
	          className: 'fc-dropdown-list-header'
	        });
	        // Pusing reset Button
	        contextArray.push({
	          name: 'Reset View',
	          // className: 'fc-dropdown-list-divider',
	          id: 'reset',
	          className: 'fc-dropdown-list-item-cat',
	          padding: {
	            left: 20
	          },
	          handler: function () {
	            self.analyser('reset');
	            self.preGrowthHook('reset');
	          },
	          action: 'click'
	        });

	        contextArray.push({
	          id: 'reset',
	          divider: true,
	          interactivity: false,
	          className: 'fc-dropdown-list-divider'
	        });
	        contextArrayX = iterate(gaOptionsObj, undefined, i);
	        for (let i = 0, ii = contextArrayX.length; i < ii; i++) {
	          contextArrayX[i] && contextArray.push(contextArrayX[i]);
	        }
	        contextMenu.appendList(contextArray);
	      };
	      this.growthOverMode();
	      return toolbar;
	    };

	    placeInCanvas () {
	      return;
	    };

	    draw () {
	      return;
	    };
	  };
	  FusionCharts.registerComponent('extensions', 'growth-analyser', GrowthAnalyserExt);
	}]);


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	// Polyfill for Number.isFinite
	Number.isFinite = Number.isFinite || function (value) {
	  return typeof value === 'number' && isFinite(value);
	};

	class GrowthAnalyser {
	  constructor (data) {
	    this.data = data.map((a) => {
	      return a.map((b) => { return b; });
	    });
	    this.Formulae = Formulae;
	  }

	  getAnalyser (mode) {
	    return this.analyse.bind(this, mode);
	  }

	  analyse (mode, rData) {
	    let i = 0,
	      ii = 0,
	      j = 0,
	      jj = 0,
	      num = 0,
	      Formulae = this.Formulae,
	      origData = rData || this.data,
	      checkArr = [],
	      checkNum = 0,
	      dataAr = origData,
	      nDataAr = [],
	      tempAr = [],
	      temp = 0,
	      unchanged = {
	        changed: false,
	        value: origData.map((a) => {
	          return a.map((b) => { return undefined; });
	        })
	      },
	      dataReset = {
	        changed: false,
	        value: origData.map((a) => {
	          return a.map((b) => { return b; });
	        })
	      };
	    if (mode === undefined) {
	      return dataReset;
	    }
	    if (typeof mode === 'string' && mode.toLowerCase() === 'reset') {
	      return dataReset;
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
	      mode = Formulae[mode];
	      if (!mode) {
	        return dataReset;
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
	      return dataReset;
	    }
	    // Rounding and checking
	    for (i = 0, ii = nDataAr.length; i < ii; ++i) {
	      for (j = 0, jj = nDataAr[i].length; j < jj; ++j) {
	        if (!Number.isFinite(nDataAr[i][j])) {
	          nDataAr[i][j] = null;
	        }
	        temp = parseInt(nDataAr[i][j] * 100);
	        nDataAr[i][j] = temp / 100;
	      }
	    }
	    return {
	      changed: true,
	      value: nDataAr
	    };
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
	    return arr.map((a) => a).sort((a, b) => { return a - b; })[arr.length >> 1];
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

	module.exports = GrowthAnalyser;



/***/ }
/******/ ]);