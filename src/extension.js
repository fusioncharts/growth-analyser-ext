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
    *
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

    preGrowthHook (val) {
      this.highlight(val);
      this.updateAxisName(val);
    }

    highlight (key, checkFlag) {
      let contextMenu = this.contextMenu,
        containers = contextMenu && contextMenu.dropDownMenu.containerData,
        i = containers.length,
        paper = this.graphics.paper,
        d3 = paper.getInstances().d3,
        container = {};
      for (; i--;) {
        container = containers[i].container.container;
        container.selectAll('div').each(function (d) {
          if (d.name && d.name.indexOf(key) + 1) {
            d3.select(this).classed('fc-dropdown-list-selected', true);
            // d.parentListItem.classed('fc-dropdown-list-selected', true);
            // if (d.parentListName) {
              // self.highlight(d.parentListName, true);
              // d.parentContainer.container.selectAll('div');
              // d3.select(this).classed('fc-dropdown-list-selected', true);
            // }
          } else {
            d3.select(this).classed('fc-dropdown-list-selected', false);
          }
        });
        /* list = containers[i];
        noneFound = true;
        if (list.name.indexOf(key) + 1) {
          list.node.style.fontWeight = 'bold';
        } else {
          list.node.style.fontWeight = '';
        }
        for (j = list.subConRef && list.subConRef.containers.length || 0; j--;) {
          subList = list.subConRef.containers[j];
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
        } */
      }
    }

    addCssRules (classNames, styles) {
      var key,
        className,
        paper = this.graphics.paper;
      for (key in classNames) {
        className = classNames[key];
        switch (key) {
          case 'container':
            styles.container && paper.cssAddRule('.' + className, styles.container.style);
            break;
          case 'text':
            styles.text && paper.cssAddRule('.' + className, styles.text.style);
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
        key,
        dm,
        component,
        components,
        state,
        states,
        paper = this.graphics.paper,
        d3 = paper.getInstances().d3,
        chartContainer = this.graphics.container,
        userStyle = self.extData && self.extData.style || {},
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
        button = {
          height: 22,
          radius: 1,
          className: 'standard-period-selector',
          container: {
            style: {
              fill: '#FFFFFF',
              'stroke-width': '1px',
              stroke: '#CED5D4'
            }
          },
          symbol: {
            style: {
              'fill': '#4b4b4b'
            }
          },
          states: {
            hover: {
              className: 'standard-period-selector-state-hover',
              container: {
                style: {
                  'stroke-width': '1px',
                  stroke: '#6d6d6d',
                  cursor: 'pointer',
                  fill: '#d7d7d7'
                }
              }
            }
          }
        },
        dropDown = {
          container: {
            style: {
              background: '#fff',
              'border-color': '#898b8b',
              'border-radius': '1px',
              'border-style': 'solid',
              'border-width': '1px',
              'font-size': '11px',
              'font-family': '"Lucida Grande", sans-serif',
              'box-shadow': 'rgb(153, 153, 153) 0px 0px 5px'
            }
          },
          listItem: {
            style: {},
            states: {
              hover: {
                className: 'fc-dropdown-list-item-hover',
                style: {
                  'background': '#e7e8e8',
                  'color': '#696969',
                  'cursor': 'pointer'
                }
              },
              selected: {
                className: 'fc-dropdown-list-item-selected',
                style: {
                  'background': '#898b8b',
                  'color': '#fff'
                }
              }
            }
          }
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

      function symbolFn (x, y, width, height) {
        return {
          type: 'path',
          attrs: {
            d: ['M', x, y, 'L', (x + width), y, 'M', x, (y + height / 2), 'L', (x + width), (y + height / 2),
              'M', x, (y + height), 'L', (x + width), (y + height)].join(' '),
            stroke: '#696969',
            'stroke-width': '2px'
          }
        };
      }

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

      contextMenu = d3.buttonWithContextMenu(symbolFn, this.graphics.container).setConfig({
        width: 24,
        height: 22,
        position: 'right',
        radius: '1',
        className: button.className,
        states: {
          hover: button.states.hover.className
        },
        padding: {
          top: 6,
          bottom: 6,
          left: 6,
          right: 6
        }
      });

      self.addCssRules(contextMenu.getIndividualClassNames(contextMenu.getClassName()), button);
      self.addCssRules(contextMenu.getIndividualClassNames(contextMenu.config.states.hover), button.states.hover);
      dm = contextMenu.config.dropDownMenu;
      for (components in dm) {
        component = dm[components];
        switch (components) {
          case 'container':
            paper.cssAddRule('.' + component.className, dropDown.container.style);
            break;
          case 'listItem':
            paper.cssAddRule('.' + component.className, dropDown.listItem.style);
            states = component.states;
            for (state in states) {
              paper.cssAddRule('.' + states[state], dropDown.listItem.states[state].style);
            }
            break;
        }
      }
      // contextMenu = new this.toolbox.SymbolWithContext('ContextIcon', {
      //   paper: this.graphics.paper,
      //   chart: this.chart,
      //   smartLabel: this.smartLabel,
      //   chartContainer: this.graphics.container
      // }, {
      //   width: 24,
      //   height: 24,
      //   position: 'right',
      //   stroke: '#ced5d4',
      //   strokeWidth: '1',
      //   radius: '1',
      //   symbolStroke: '#696969',
      //   symbolStrokeWidth: '2'
      // });
      this.contextMenu = contextMenu;

      contextArray.push({
        name: 'Show Growth Over',
        interactivity: false,
        className: 'fc-dropdown-list-header'
      });

      popup = function (callback) {
        var box = document.createElement('div'),
          style = popupStyle,
          containerBox = document.createElement('div'),
          button = document.createElement('button'),
          input = document.createElement('input'),
          header = document.createElement('div'),
          title = document.createElement('div'),
          crossButton = document.createElement('button'),
          key,
          svgContainer,
          shadow,
          headerWidth = 180,
          onClickClose = function () {
            box.parentElement.removeChild(box);
            shadow.remove();
          },
          applyValue = function () {
            var value = input.value;
            onClickClose();
            callback(value);
          },
          chartWidth = self.chart && self.chart.width || 0,
          chartHeight = self.chart && self.chart.height || 0,
          x = (chartWidth / 2) - 90,
          y = (chartHeight / 2) - 40;
        // appending to box
        // style['font-family'] = '"Lucida Grande", sans-serif';

        svgContainer = d3.select(chartContainer);

        shadow = svgContainer.select('svg').append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', chartWidth)
                    .attr('height', chartHeight)
                    .attr('fill', '#000')
                    .attr('opacity', '0.35');

        // chartContainer.appendChild(svgContainer);
        chartContainer.appendChild(box);

        box.unselectable = 'on';
        box.style.position = 'absolute';
        box.style.fill = '#f7f7f7';
        box.style.left = x + 'px';
        box.style.top = y + 'px';
        box.style.border = '1px solid rgb(212, 210, 211)';
        box.style.stroke = 'rgb(103, 103, 103)';
        box.style.width = headerWidth + 'px';
        box.style.backgroundColor = 'rgb(247, 247, 247)';
        box.style.height = 80 + 'px';
        box.style.fontFamily = '"Lucida Grande", sans-serif';

        for (key in style) {
          box.style[key] = style[key];
        }

        crossButton.innerHTML = 'X';
        crossButton.style.paddingTop = '-3px';
        crossButton.type = 'button';
        crossButton.style.float = 'right';
        crossButton.style.display = 'inline';
        crossButton.style.marginTop = '-3px';
        crossButton.style.cursor = 'pointer';
        // crossButton.style.marginleft = '2px';
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
        for (key in style) {
          header.style[key] = style[key];
        }

        input.style.width = '54%';
        input.style.height = '17px';
        input.style.border = '2px solid rgb(218, 219, 218)';
        input.style.stroke = 'rgb(103, 103, 103)';
        input.addEventListener('keyup', function (e) {
          if (e.keyCode === 13) {
            applyValue();
          } else {
            input.value = input.value.replace(/[^\d.-]/g, '');
          }
        });

        input.addEventListener('keydown', function (e) {
          input.value = input.value.replace(/[^\d.-]/g, '');
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

        button.addEventListener('click', applyValue);
        // input customization
        button.innerHTML = 'Apply';

        containerBox.style.textAlign = 'center';
        containerBox.style.paddingTop = '18px';
        containerBox.style.paddingRight = '10px';
        // appending to containerBox
        header.appendChild(title);
        header.appendChild(crossButton);
        containerBox.appendChild(input);
        containerBox.appendChild(button);

        // appending popup
        box.appendChild(header);
        box.appendChild(containerBox);
        input.focus();
      };

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

      for (let i in gaOptionsObj) {
        let key,
          obj = {},
          subObj = {};
        if (!gaOptionsObj[i].submenu) {
          key = i;
          // obj[key] = {};
          obj = {
            name: key,
            className: 'fc-dropdown-list-item-cat',
            padding: {
              left: 20
            },
            handler: function () {
              self.analyser(gaOptionsObj[i]);
              self.preGrowthHook(i);
            },
            action: 'click'
          };
        } else {
          obj = {};
          key = i;
          obj.name = key;
          obj.action = 'click';
          // obj.style = subCatStyle;
          obj.className = 'fc-dropdown-list-item-cat';
          obj.handler = [];
          obj.padding = {
            left: 20
          };
          for (let j in gaOptionsObj[i]) {
            let subMenuName = j,
              subMenuValue = gaOptionsObj[i][j];
            if (j === 'submenu') {
              continue;
            }
            subObj = {};
            subObj.className = 'fc-dropdown-list-item-subcat';
            subObj.parentListName = i;
            subObj.name = subMenuName;
            subObj.handler = function () {
              if (typeof subMenuValue === 'function') {
                subMenuValue(popup);
              } else {
                self.analyser(subMenuValue);
                self.preGrowthHook(subMenuName);
              }
            };
            subObj.action = 'click';
            subObj.style = subCatStyle;
            obj.handler.push(subObj);
            if (j.indexOf('Custom') === -1) {
              obj.handler.push({
                divider: true,
                interactivity: false,
                className: 'fc-dropdown-list-divider'
              });
            }
          }
        }
        contextArray.push(obj);
        if (i.indexOf('Specific') === -1) {
          contextArray.push({
            divider: true,
            className: 'fc-dropdown-list-divider'
          });
        }
      }

      contextMenu.add(contextArray);

      group.addSymbol(contextMenu);
      toolbar.addComponent(group);
      this.growthOverMode();
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
      // this.growthOverMode();
      x = x === undefined ? measurement.x : x;
      y = y === undefined ? measurement.y : y;
      width = width === undefined ? measurement.width : width;
      height = height === undefined ? measurement.height : height;
      group = group === undefined ? this.parentGroup : group;
      if (width && height) {
        for (i = 0, ln = toolbars.length; i < ln; i++) {
          toolbar = toolbars[i];
          toolbar.draw(x, y, group);
        }
      }
    };
  };
  FusionCharts.registerComponent('extensions', 'growth-analyser', GrowthAnalyserExt);
}]);
