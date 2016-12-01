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

module.exports = GrowthAnalyser;
