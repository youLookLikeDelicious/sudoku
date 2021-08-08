import { reactive, watch, ref, watchEffect, toRaw, computed } from 'vue'
import generateSudoku from '../utils/generator'
import { getGridIndex, getColIndex, getRowIndex, checkRow, checkCol, checkGrid } from '@/utils/check'

/**
 * 生成数独 API
 * @returns {obj}
 */
export const generator = (handleSuccess) => {
  let cellWatcher = [], previousIndex = -1, fillableLength = 0, currentFilledLength = 0
  const currentIndex = ref(-1)
  const [cells, historyStack] = [reactive([]), reactive([])]
  // 正确的行/列/单元格
  const completedCells = reactive([])

  const handleClearWatchCell = () => {
    if (cellWatcher.length) {
      cellWatcher.map(callBack => {
        callBack()
      })
      cellWatcher = ''
    }
  }

  // 监听单元格修改事件
  const handleWatchCell = () => {
    cellWatcher = cells.filter((cell) => {
      return cell.fixed
    }).map((cell) => {
      return watch(
        () => cell.number,
        (newVal, oldVal) => {
          if (newVal === oldVal) {
            return
          }
          
          if (previousIndex != currentIndex.value) {
            previousIndex = currentIndex.value
            if (newVal) ++currentFilledLength
            else --currentFilledLength
          }
          
          historyStack.push({ position: currentIndex.value, newVal, oldVal })

          // 数独已完成
          if (currentFilledLength === fillableLength) {
            handleCheckGame()
          } else {
            const tempCompletedCells = []
            const rawCells = toRaw(cells)
            // checkGrid(currentIndex.value)
            // 检查行
            let ind = checkRow(currentIndex.value, newVal, rawCells, false), len, i
            if (Number.isInteger(ind)) {
              for (i = ind, len = ind + 9; i < len; i++) {
                tempCompletedCells.push(i)
              }
            }

            // 检查列
            ind = checkCol(currentIndex.value, newVal, rawCells, false)
            // 该列符合规则
            if (Number.isInteger(ind)) {
              for (i = ind, len = ind + 72; i <= len; i += 9) {
                tempCompletedCells.push(i)
              }
            }

            // 检查小九宫格
            ind = checkGrid(currentIndex.value, newVal, rawCells, false)

            if (Number.isInteger(ind)) {
              for (i = 0, len = 3; i < len; i++) {
                tempCompletedCells.push(ind)
                tempCompletedCells.push(++ind)
                tempCompletedCells.push(++ind)
                ind += 7
              }
            }

            completedCells.splice(0, 0, ...tempCompletedCells)
          }
        },
        { deep: true }
      )
    })
  }

  // 检查游戏是否结束
  const handleCheckGame = () => {
    const tempCells = toRaw(cells)
    let i, len, cell, result = true
    for (i = 0, len = tempCells.length; i < len; i++) {
      cell = tempCells[i]
      if (!cell.fixed) {
        continue
      }
      if (!Number.isInteger(checkRow(i, cell.number, tempCells, false)) || !Number.isInteger(checkCol(i, cell.number, tempCells, false)) || !Number.isInteger(i, cell.number, tempCells, false)) {
        result = false
        break
      }
    }
    // console.log(checkRow(i, cell.number, tempCells, false), checkCol(i, cell.number, tempCells, false), checkGrid(i, cell.number, tempCells, false))
    if (result) {
      handleSuccess()
    }
  }

  /**
   * 生成数独
   * @param {int} level 难度 1 简单 2 中等 3 困难
   */
  const fillSudoku = (level) => {
    handleClearWatchCell()
    if (currentIndex.value !== -1) {
      currentIndex.value = -1
    }

    let len
    switch(level) {
    // 简单
    case 1:
      len = Math.max(parseInt(Math.random() * 27), 17)
      break
    // 普通
    case 2:
      len = Math.max(parseInt(Math.random() * 40), 30)
      break
    // 困难
    case 3:
      len = Math.max(parseInt(Math.random() * 60), 42)
      break
    }
    
    fillableLength = len

    if (cells.length) {
      cells.splice(0, 81)
    }

    cells.push(...generateSudoku(fillableLength))

    handleWatchCell()
    historyStack.splice(0, historyStack.length)
  }

  
  // 回退操作
  const handleBack = (menuUsable) => {
    if (!historyStack.length || !menuUsable) {
      return
    }
    handleClearWatchCell()
    const item = historyStack.pop()
    cells[item.position].number = item.oldVal
    handleWatchCell()
  }

  // 监听高亮的单元格
  watchEffect(() => {
    if (completedCells.length) {
      setTimeout(() => {
        completedCells.splice(0, completedCells.length)
      }, 500)
    }
  })

  // 当前选中的单元格index
  const selectedGrid = computed({
    get: () => {
      if (currentIndex.value < 0) {
        return []
      }
      const arr = []
      let p = getGridIndex(currentIndex.value), i, len, tempP
      for (i = 0, len = 3; i < len; i++) {
        if (p !== currentIndex.value) {
          arr.push(p)
        }
        if (++p !== currentIndex.value) {
          arr.push(p)
        }
        if (++p !== currentIndex.value) {
          arr.push(p)
        }
        p += 7
      }
  
      p = getColIndex(currentIndex.value)
      for (i = 0, len = 9; i < len; i++) {
        tempP = p + i * 9
        if (tempP !== currentIndex.value) {
          arr.push(tempP)
        }
      }
  
      p = getRowIndex(currentIndex.value)
      for (i = 0, len = 9; i < len; i++) {
        tempP = p + i
        if (tempP !== currentIndex.value) {
          arr.push(tempP)
        }
      }
      return arr
    }
  })

  const currentCell = computed(() => {
    if (currentIndex.value === -1) {
      return ''
    }
    return cells[currentIndex.value]
  })

  const sameItemStack = computed({
    get: () => {
      const arr = []
      const cell = cells[currentIndex.value]
      if (currentIndex.value === -1 || !cell.number) {
        return []
      }
      // 如果是固定值,获取所有相同值的索引
      cells.forEach((item, index) => {
        if (item.number === cell.number) {
          arr.push(index)
        }
      })
      return arr
    }
  })

  return { cells, fillSudoku, historyStack, currentIndex, handleBack, completedCells, selectedGrid, currentCell, sameItemStack }
}