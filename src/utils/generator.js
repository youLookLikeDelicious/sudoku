import checkCell from './check'

/**
 * 生成数独
 * @param {Int} hiddenNum 随机隐藏的数量 默认是0
 * @return {array}
 */
const generateSudoku = function(hiddenNum = 0) {
  let arrIndex, cellIndex
  const idList = Array.apply(null, { length: 81 }).map((val, index) => index)

  const arr = Array.apply(null, { length: 81 }).map(() => {
    const position = Math.floor(Math.random() * idList.length)
    const tempRandom = idList[position]
    idList.splice(position, 1)
    return {
      id: tempRandom,
      number: 0,
      fixed: false,
      remark: false,
      remarkList: []
    }
  })

  // 生成1 5 9九宫格内的数字
  for (let i = 0, len = 60; i <= len; i += 30) {
    assignRandom(0, arr)
    assignRandom(30, arr)
    assignRandom(60, arr)
  }

  backTracking(arr)

  arr.forEach(item => item.fixed = false)

  // 随机隐藏单元格
  if (hiddenNum) {
    const tempArr = Array.from({ length: 81 }).map((item, index) => index)
    
    for (let i = 0; i < hiddenNum; i++) {
      arrIndex = Math.floor(Math.random() * tempArr.length)
      cellIndex = tempArr[arrIndex]
      arr[cellIndex].number = ''
      arr[cellIndex].fixed = true
      tempArr.splice(arrIndex, 1)
    }
  }

  return arr
}

/**
 * 为小的九宫格分配随机数
 * 
 * @param {int} position 小九宫格的起始位置
 * @param {array} arr 数独列表
 * @returns {void}
 */
const assignRandom = (position, arr) => {
  const numberList = Array.apply(null, { length: 9 }).map((val, index) => index + 1)
  let tempRandom

  for (let j = 0, len = 3; j < len; j++) {
    for (let i = 0, length = 3; i < length; i++) {
      tempRandom = Math.floor(Math.random() * numberList.length)
      arr[position + i] = {
        id: arr[position + i].id,
        number: numberList[tempRandom],
        fixed: true,
        remark: false ,
        remarkList: []
      }
      numberList.splice(tempRandom, 1)
    }
    position += 9
  }
}

/**
 * 使用回溯生成数独表格
 * 
 * @param {array} arr
 */
const backTracking = function (arr) {
  let n = 3 // 数组下标

  while(n >= 3) {
    // 如果值已经被初始化,不进行操作
    if (arr[n].fixed) {
      ++n
      continue
    }

    do {
      ++arr[n].number
    } while(arr[n].number <= 9 && checkCell(n, arr[n].number, arr) === false)

    // 如果数组超过 9,回溯
    if (arr[n].number > 9) {
      arr[n].number = 0
      do{
        --n
      }while(arr[n].fixed)
    } else if (n === 77) {
      // 判断是否结束
      return
    } else {
      ++n
    }
  }
}

export default generateSudoku