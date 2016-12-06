'use strict';
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

