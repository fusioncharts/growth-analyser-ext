'use strict';
class GrowthAnalyser {
  constructor (data) {
    this.data = data;
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
      tempAr = [];

    if (!isNaN(mode)) { // Handling a number
      checkNum = mode;
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          tempAr.push(100 * (num - checkNum) / checkNum);
        }
        nDataAr.push(tempAr);
      }
    } else if (typeof mode === 'function') {
      for (i = 0, ii = dataAr.length; i < ii; ++i) {
        tempAr = [];
        checkNum = mode(dataAr[i]);
        for (j = 0, jj = dataAr[i].length; j < jj; ++j) {
          num = dataAr[i][j];
          tempAr.push(100 * (num - checkNum) / checkNum);
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
