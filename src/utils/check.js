// 计算 p所属的行 起始位置
const getRowIndex = function (p) {
  return parseInt(p / 9) * 9
}
  
/**
 * 边界条件的判定
 * 判断行的值
 * 
 * @param {int} p 位置
 * @param {int} v 值
 * @param {array} arr 数独列表
 * @return {boolean}
 */
const checkRow = (p, v, arr, isBackTracking = true) => {
  // 计算 p所属的行 起始位置
  let i = getRowIndex(p), position = i

  if (isBackTracking) {
    for (const len = i + 9; i < len; i++) {
      if (arr[i].number && p !== i && arr[i].number === v) {
        return false
      }
    }
  } else {
    // console.log(i + 9 + '--len')
    for (const len = i + 9; i < len; i++) {
      // console.log(i)
      if (!arr[i].number || (p !== i && arr[i].number === v)) {
        return false
      }
    }
  }

  return position
}

export { getRowIndex, checkRow }

// 计算该元素所属的列
const getColIndex = function (p) {
  return  p % 9
}

/**
 * 边界条件的判定
 * 判断列的值
 * 
 * @param {int} p 位置
 * @param {int} v 值
 * @param {array} arr 数独列表
 * @return {int} col
 */
const checkCol = (p, v, arr, isBackTracking = true) => {
  // 计算该元素所属的列
  let col = getColIndex(p), position = col
  
  if (isBackTracking) {
    for (const len = col + 72; col <= len; col += 9) {
      if (arr[col].number && p !== col && arr[col].number === v) {
        return false
      }
    }
  } else {
    for (const len = col + 72; col <= len; col += 9) {
      if (!arr[col].number || (p !== col && arr[col].number === v)) {
        return false
      }
    }
  }

  return position
}

export { getColIndex, checkCol }

// 计算 p 位置所在的小九宫格的第一个元素下标
const getGridIndex = function(p) {
  return parseInt(p % 9 / 3) * 3 + parseInt(parseInt(p / 9) / 3) * 27
}

/**
 * 边界条件的判定
 * 判断小九宫格的值
 * 
 * @param {int} p 位置
 * @param {int} v 值
 * @param {array} arr 数独列表
 * @return {int} position
 */
const checkGrid = (p, v, arr, isBackTracking = true) => {
  // 计算 p 位置所在的小九宫格的第一个元素下标
  let index = getGridIndex(p), position = index

  if (isBackTracking) {
    for (let i = 0, len = 3; i < len; i++) {
      if (arr[index] && p !== index && arr[index].number === v) {
        return false
      }
  
      if (arr[++index] && p !== index && arr[index].number === v) {
        return false
      }
  
      if (arr[++index] && p !== index && arr[index].number === v) {
        return false
      }
  
      index += 7
    }
  } else {
    for (let i = 0, len = 3; i < len; i++) {
      if (p !== index && arr[index].number === v || !arr[index].number) {
        return false
      }
  
      if (p !== ++index && arr[index].number === v || !arr[index].number) {
        return false
      }
  
      if (p !== ++index && arr[index].number === v || !arr[index].number) {
        return false
      }
  
      index += 7
    }
  }

  return position
}


export { getGridIndex, checkGrid }

/**
 * 综合判定边界条件
 * 
 * @param {int} p 位置
 * @param {int} v 值
 * @param {array} arr 数独列表
 * @return {boolean}
 */
const checkCell = function (p, v, arr) {
  if (!v) return false
  return Number.isInteger(checkGrid(p, v, arr)) && Number.isInteger(checkRow(p, v, arr)) && Number.isInteger(checkCol(p, v, arr))
}

export default checkCell