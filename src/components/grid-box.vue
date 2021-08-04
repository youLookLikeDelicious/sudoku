<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <div class="gird-wrapper">
    <!-- 顶部游戏信息 -->
    <div class="game-info-wrapper">
      <div class="difficulty-wrapper">
        <div class="difficulty-text">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-nandu"></use>
          </svg>难度:
        </div>
        <div class="current-difficalty" @click.stop="clickDifficalty">
          <span>{{ difficultyText[difficultyLevel] }}</span>
          <transition name="difficalty">
            <ul class="difficalty-list" v-if="showDifficalty">
              <li @click.stop="setDifficalty(1)">简单</li>
              <li @click.stop="setDifficalty(2)">中等</li>
              <li @click.stop="setDifficalty(3)">困难</li>
            </ul>
          </transition>
        </div>
      </div>
      <div class="time-consuming-wrapper flex">
        <svg class="icon hourglass" aria-hidden="true">
          <use xlink:href="#icon-shijianjishi-9"></use>
        </svg>
        <time-consuming :time="time"></time-consuming>
        <div class="pause-btn-wrapper" @click="togglePause">
          <svg v-if="!isPause" class="icon pause-btn" aria-hidden="true">
            <use xlink:href="#icon-zantingtingzhi"></use>
          </svg>
          <svg v-else class="icon pause-btn" aria-hidden="true">
            <use xlink:href="#icon-kaishi"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- 数独容器 部分 -->
    <!-- print begin -->
    <transition-group name="cell" tag="div" class="sudoku-container">
      <div v-for="(cell, index) in cells" :key="cell.id" class="cell-wrapper" @click.stop="handleClickCell(index)">
        <div :class="['sudoku-cell', {'selected': selectedGrid.includes(index)}, { 'selected-same': sameItemStack.includes(index) }, {'selected-on': currentIndex === index}, { 'completed-cell': completedCells.includes(index) }]">
          <span v-if="currentCell.remark && currentIndex === index" class="remark">
            <span v-show="cell.remarkList.includes(1)">1</span>
            <span v-show="cell.remarkList.includes(2)">2</span>
            <span v-show="cell.remarkList.includes(3)">3</span>
            <span v-show="cell.remarkList.includes(4)">4</span>
            <span v-show="cell.remarkList.includes(5)">5</span>
            <span v-show="cell.remarkList.includes(6)">6</span>
            <span v-show="cell.remarkList.includes(7)">7</span>
            <span v-show="cell.remarkList.includes(8)">8</span>
            <span v-show="cell.remarkList.includes(9)">9</span>
          </span>
          <span v-else :class="['cell-content', { 'writeable-cell': cell.fixed }]" v-html="cell.number"></span>
        </div>
      </div>
      <div v-if="isPause" class="is-pausing flex" @click.stop="togglePause">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-kaishi"></use>
        </svg>
      </div>
      <div key="loading" :class="{ loading: loading }"></div>
      <success key="convas" @restart="startNewGame" v-model:showCanvas="successed"></success>
    </transition-group>
    <!-- print end -->
    <!-- 菜单部分 -->
    <div class="menus">
      <div class="controller-wrapper flex">
        <a href="/" class="btn new-game" @click.prevent="startNewGame">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-shuduyouxiicon"></use>
        </svg>&nbsp;
        新游戏
      </a>
      <a href="/" :class="['btn', {'btn-disable': !historyStack.length}]" @click.prevent="handleBack">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-undo"></use>
        </svg> 回退</a>
      <a href="/" :class="[currentCell.remark ? 'mark-on' : 'mark-off', 'btn']" @click.prevent="handleClickRemark">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-biaoji"></use>
        </svg>
        标记
      </a>
      <a href="/" class="btn" @click.prevent="handleClickRemark">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-qingchu"></use>
        </svg> 清除</a>
      </div>
      <div class="keybords-wrapper">
        <div v-for="i in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="i" @click="handleClickKey(i)" class="key-box">{{ i }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, defineComponent, onBeforeMount, onUnmounted, reactive, ref, toRaw, watch, watchEffect } from 'vue'
import generateSudoku from '@/utils/generator'
import success from './success.vue'
import { getGridIndex, getColIndex, getRowIndex, checkRow, checkCol, checkGrid } from '@/utils/check'
import timeConsuming from './time-consuming.vue'
export default defineComponent({
  components: {success, timeConsuming},
  setup() {
    const [cells, historyStack] = [reactive([]), reactive([])]
    // 正确的行/列/单元格
    const completedCells = reactive([])
    // 当前选中的元素多索引
    const currentIndex = ref(-1)
    const loading = ref(false)
    const successed = ref(false)
    
    // 耗时
    const time = ref(0)
    // 暂停的状态
    const isPause = ref(false)
    // 显示难度列表
    const showDifficalty = ref(false)
    const difficultyText = {
      1: '简单',
      2: '中等',
      3: '困难'
    }
    let fillableLength = 0, currentFilledLength = 0, cellWatcher = [], previousIndex = -1, timeHandler

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
    const currentCell = computed(() => {
      if (currentIndex.value === -1) {
        return ''
      }
      return cells[currentIndex.value]
    })
    const menuUsable = computed(() => {
      return !successed.value && !isPause.value
    })

    // 计时
    const countTime = () => {
      timeHandler = setTimeout(() => {
        ++time.value
        countTime()
      }, 1000)
    }

    // 随机隐藏单元格
    const hideSudoku = () => {
      handleClearWatchCell()
      const arr = Array.from({ length: 81 }).map((item, index) => index)
      let i = 0, len, arrIndex, cellIndex
      switch(difficultyLevel.value) {
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
      len = 1
      fillableLength = len
      cells.forEach(item => item.fixed = false)
      for (; i < len; i++) {
        arrIndex = Math.floor(Math.random() * arr.length)
        cellIndex = arr[arrIndex]
        cells[cellIndex].number = ''
        cells[cellIndex].fixed = true
        arr.splice(arrIndex, 1)
      }

      handleWatchCell()
      time.value = 0
      clearTimeout(timeHandler)
      countTime()
      historyStack.splice(0, historyStack.length)
    }

    // 监听单元格的值修改事件
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
        clearTimeout(timeHandler)
        successed.value = true
      }
    }

    // 监听游戏的结果
    watch(
      successed,
      () => {
        currentIndex.value = -1
        completedCells.push(...Array.from({ length: 81 }).map((item, index) => {
          return index
        }))
      }
    )

    const handleClearWatchCell = () => {
      if (cellWatcher.length) {
        cellWatcher.map(callBack => {
          callBack()
        })
        cellWatcher = ''
      }
    }
    // 初始化数独游戏
    const init = () => {
      cells.push(...generateSudoku())
      hideSudoku()
    }

    let difficultyLevel = ref(1)

    // 点击标记按钮
    const handleClickRemark = () => {
      if (!currentCell.value || !menuUsable.value) return
      currentCell.value.remark = !currentCell.value.remark
    }

    // 选中当前的元素
    const handleClickCell = (index) => {
      currentIndex.value = currentIndex.value === index ? -1 : index
    }

    // 处理键盘按下事件
    const handleKeyUp = (event) => {
      let val = event.key
      if (currentIndex.value === -1 || !cells[currentIndex.value].fixed || !menuUsable.value) {
        return
      }

      let tempCurrentCell = currentCell.value
      // 输入的是数字
      if (!isNaN(val) && val > 0) {
        val = +val
        // 标记模式
        if (tempCurrentCell.remark) {
          if (tempCurrentCell.number) {
            tempCurrentCell.number = ''
          }
          const remarkIndex = tempCurrentCell.remarkList.indexOf(val)
          if (remarkIndex === -1) {
            tempCurrentCell.remarkList.push(val)
          } else {
            tempCurrentCell.remarkList.splice(remarkIndex, 1)
          }
          return
        }
        // 赋值模式
        tempCurrentCell.number = tempCurrentCell.number === val ? '' : val
      } else {
        switch (val) {
        case 'r':
          currentCell.value.remark = !currentCell.value.remark
          break
        }
      }
    }

    // 监听高亮的单元格
    watchEffect(() => {
      if (completedCells.length) {
        setTimeout(() => {
          completedCells.splice(0, completedCells.length)
        }, 500)
      }
    })

    onBeforeMount(() => {
      document.addEventListener('keyup', handleKeyUp)
    })
    onUnmounted(() => {
      document.removeEventListener('keyup', handleKeyUp)
    })

    // 钩子函数
    init()

    // 开始新游戏
    const startNewGame = () => {
      currentFilledLength = 0
      if (loading.value) {
        return
      }
      new Promise(resolve => {
        loading.value = true
        window.setTimeout(() => {
          resolve(0)
        }, 100)
      }).then(() => {
        new Promise((resolve) => {
          currentIndex.value = -1
          cells.splice(0, 81, ...generateSudoku())
          hideSudoku()
          window.setTimeout(() => {
            resolve(0)
          }, 1100)
        }).then(() => {
          loading.value = false
        })
      })
    }

    // 回退操作
    const handleBack = () => {
      if (!historyStack.length || !menuUsable.value) {
        return
      }
      handleClearWatchCell()
      const item = historyStack.pop()
      cells[item.position].number = item.oldVal
      handleWatchCell()
    }

    // 点击软键盘事件
    const handleClickKey = (key) => {
      if (currentIndex.value === -1 || !menuUsable.value) {
        return
      }
      handleKeyUp({ key: key })
    }

    // 设置游戏难度
    const setDifficalty = (level) => {
      difficultyLevel.value = level
      hiddenDifficaltyList()
      document.removeEventListener('click', hiddenDifficaltyList)
      startNewGame()
    }

    // 隐藏难度菜单
    const hiddenDifficaltyList = () => {
      showDifficalty.value = false
      document.removeEventListener('click', hiddenDifficaltyList)
    }
    // 点击难度按钮
    const clickDifficalty = () => {
      showDifficalty.value = !showDifficalty.value
      document.removeEventListener('click', hiddenDifficaltyList)
      document.addEventListener('click', hiddenDifficaltyList)
    }

    // 暂停|开始按钮
    const togglePause = () => {
      // 游戏结束状态下,不做任何操作
      if (successed.value) {
        return
      }
      isPause.value = !isPause.value
      if (isPause.value) {
        clearTimeout(timeHandler)
      } else {
        countTime()
      }
    }

    // 页面切换和最小化的时候,停止计时
    // 页面可见的时候,重新开始计时
    document.addEventListener('visibilitychange', () => {
      clearTimeout(timeHandler)
      if (document.visibilityState === 'visible' && !isPause.value) {
        countTime()
      }
    })

    return {
      loading,
      cells,
      difficultyLevel,
      handleClickRemark,
      historyStack,
      successed,
      handleClickCell,
      handleKeyUp,
      currentIndex,
      selectedGrid,
      sameItemStack,
      startNewGame,
      handleBack,
      completedCells,
      currentCell,
      handleClickKey,
      difficultyText,
      showDifficalty,
      setDifficalty,
      clickDifficalty,
      time,
      isPause,
      togglePause
    }
  }
})
</script>

<style lang="scss">
$size: 5.5rem;
$width: $size * 9 + 5.1rem;
  @keyframes spin-reverse {
    0% { 
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }
.loading {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 999;
  display: block;
  background-color: rgba(#fff, .7);
  &::before {
    content: "";
    position: absolute;
    top: 36%;
    left: 36%;
    right: .5rem;
    bottom: .5rem;
    width: 28%;
    height: 28%;
    border-radius: 50%;
    border: .3rem solid transparent;
    border-top-color: #3cb1e7;
    z-index: 100;
    animation: spin-reverse .7s linear infinite;
  }
  &::after{
    content: "";
    position: absolute;
    top: 32%;
    left: 33%;
    right: .5rem;
    bottom: .5rem;
    width: 37%;
    height: 37%;
    border-radius: 50%;
    border: .3rem solid transparent;
    border-top-color: #1ce6a9;
    z-index: 100;
    animation: spin-reverse .7s linear reverse infinite;
  }
}
// 游戏盒子样式
.sudoku-container{
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  border-right: 0;
  color: #304455;
  font-weight: 200;
  border-bottom: 0;
  overflow: hidden;
  position: relative;
  justify-content: stretch;
  font-smooth: antialiased;
  // border: .2rem solid #304455;
  // background-color: rgba($color: #fff, $alpha: .7);
  .cell-wrapper{
    flex-grow: 1;
    flex-basis: 10%;
    padding-top: 10%;
    margin-right: -.1rem;
    position: relative;
    margin-bottom: -.1rem;
    background-color: #fff;
    border: .1rem solid #dbe4f1;
    transition: transform 1s, border-color .3s;
    &:nth-child(3n) {
      margin-right: 0rem;
      border-right: .2rem solid #304455;
    }
    &:nth-child(1) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(10) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(19) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(28) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(37) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(46) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(55) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(64) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(73) {
      border-left: .2rem solid #304455;
    }
    &:nth-child(-n + 9) {
      border-top: 2px solid #344861;
    }
    &:nth-child(27n + 19) {
      @extend %row-line;
    }
    &:nth-child(27n + 20) {
      @extend %row-line;
    }
    &:nth-child(27n + 21) {
      @extend %row-line;
    }
    &:nth-child(27n + 22) {
      @extend %row-line;
    }
    &:nth-child(27n + 23) {
      @extend %row-line;
    }
    &:nth-child(27n + 24) {
      @extend %row-line;
    }
    &:nth-child(27n + 25) {
      @extend %row-line;
    }
    &:nth-child(27n + 26) {
      @extend %row-line;
    }
    &:nth-child(27n + 27) {
      @extend %row-line;
    }
  }
  .writeable-cell{
    color: rgb(37, 145, 218);
  }
  .completed-cell {
    background-color: #64b3f4 !important;
  }
  .sudoku-cell{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    outline: none;
    padding: .2rem;
    cursor: pointer;
    color: #304455;
    color: transparent;
    align-items: center;
    box-sizing: border-box;
    justify-content: center;
    background-color: #fff;
    text-shadow: 0 0 0 #666;
    transition: background-color .3s;
    .remark{
      display: flex;
      font-size: 1.4rem;
      width: $size;
      height: $size;
      flex-wrap: wrap;
      color: #424852;
      span{
        padding: .1rem;
        width: $size / 3;
        height: $size / 3;
        display: block;
        box-sizing: border-box;
      }
    }
    .cell-content{
      width: 100%;
      z-index: 2;
      display: flex;
      justify-items: center;
      justify-content: center;
    }
  }
}
// 游戏暂停的样式
.is-pausing{
  align-items: center;
  justify-content: center;
  content: '';
  width: 100%;
  top: -.2rem;
  height: 100%;
  left: -.4rem;
  z-index: 9999;
  cursor: pointer;
  position: absolute;
  background-color: #fff;
  transition: background-color 1s ease-in-out;
  svg{
    $size: 5rem;
    width: $size;
    height: $size;
    border-radius: $size;
    padding: 2rem;
    background-color: #d4deec;
  }
}
@media screen and (min-width: 0) {
  .game-info-wrapper, .sudoku-container, .menus{
    padding: 0 2rem;
  }
  .sudoku-container{
    margin-bottom: 2.1rem;
  }
  .gird-wrapper{
    flex-wrap: wrap;
  }
  .menus {
    margin-left: 0;
    flex-basis: 100%;
    .btn{
      padding: 1.3rem 0 !important;
    }
  }
  .sudoku-cell{
    font-size: 1.8rem;
  }
  // 软键盘样式
  .keybords-wrapper{
    flex-wrap: nowrap;
    .key-box{
      flex-basis: 2.1rem;
      &:hover{
        background-color: none;
      }
    }
  }
}
@media screen and (min-width: 57rem) {
  .sudoku-cell{
    font-size: 2.5rem;
  }
}
@media screen and (min-width: 97rem) {
  .game-info-wrapper, .sudoku-container, .menus{
    padding: 0;
  }
  .sudoku-container{
    max-width: $width;
  }
  .sudoku-cell{
    font-size: 2.5rem;
  }
  .menus{
    margin-top: 0;
    flex-basis: 26rem;
    margin-left: 2.1rem;
    background-color: none;
    .new-game{
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
  }
  // 软键盘样式
  .keybords-wrapper{
    flex-wrap: wrap;
    .key-box{
      flex-basis: 32%;
      border-radius: .5rem;
      background-color: #f5f7fa;
      &:hover{
        background-color: #eaeef4;
      }
    }
  }
}
.cell-move{
  border-color: #dbe4f1 !important;
}
.btn{
  color: #fff;
  position: relative;
  border-radius: .3rem;
  text-decoration: none;
  padding: .7rem 1.7rem;
  display: inline-block;
  box-sizing: border-box;
  background-color: rgb(89, 180, 241);
  border: .1rem solid rgb(89, 180, 241);
  transition: background-color .3s;
  &:hover{
    background-color: rgb(37, 145, 218);
  }
}
.btn-disable{
  cursor: not-allowed;
  &:hover{
    background-color: rgb(89, 180, 241) !important;
  }
}
.gird-wrapper{
  width: 100%;
  display: flex;
  margin: 0 auto;
  max-width: 90rem;
  box-sizing: border-box;
  justify-content: space-between;
}
.menus {
  width: 100%;
  display: flex;
  height: fit-content;
  flex-direction: row;
  align-items: baseline;
  flex-wrap: wrap;
  font-size: 1.6rem;
  transition: all .3s;
  justify-content: space-between;
  .controller-wrapper{
    flex-basis: 100%;
    flex-wrap: wrap;
    font-size: 1.4rem;
    justify-content: space-between;
    .new-game{
      flex: 1 1 100%;
      margin-bottom: 2.1rem;
      font-weight: bold;
    }
    a{
      flex-basis: 30%;
      padding: .7rem 0;
    }
  }
}
.mark-on {
  background-color: rgb(0, 153, 255);
  border: .1rem solid rgb(0, 153, 255);
  &::after{
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    font-size: 1.2rem;
    content: 'on';
    display: inline-block;
    position: absolute;
    top: -1.2rem;
    right: -1.2rem;
    color: #fff;
    border-radius: 2.5rem;
    background-color: rgb(67, 172, 243);
  }
}
.mark-off{
  &::after{
    width: 2.5rem;
    height: 2.5rem;
    line-height: 2.5rem;
    font-size: 1.2rem;
    content: 'off';
    display: inline-block;
    position: absolute;
    top: -1.2rem;
    right: 0;
    color: #fff;
    border-radius: 2.5rem;
    right: -1.2rem;
    background-color: rgb(67, 172, 243);
  }
}
.selected {
  background-color: #eaeef4 !important
}
.selected-same{
  background-color: rgb(195, 215, 234) !important
}
.selected-on{
  background-color: #BBDEFB !important
}
// 软键盘样式
.keybords-wrapper{
  width: 100%;
  display: flex;
  $size: 6.5rem;
  margin-top: 2.1rem;
  justify-content: space-between;
  .key-box{
    height: $size;
    font-weight: 500;
    font-size: 2rem;
    cursor: pointer;
    text-align: center;
    line-height: $size;
    margin-bottom: 1.2rem;
    color: rgb(0, 153, 255);
    transition: background-color .5s;
  }
}
// 游戏信息
.game-info-wrapper{
  display: flex;
  flex-basis: 100%;
  font-size: 1.5rem;
  margin-bottom: 2.1rem;
  box-sizing: border-box;
  justify-content: space-between;
  .difficulty-wrapper{
    .difficulty-text{
      font-weight: bold;
      color: #666;
    }
    .current-difficalty{
      color: #666;
      cursor: pointer;
      position: relative;
      margin-left: 1.2rem;
    }
    div{
      display: inline-block;
    }
    .difficalty-list{
      top: 3.5rem;
      width: 12rem;
      z-index: 99999;
      text-align: left;
      list-style: none;
      position: absolute;
      box-shadow: .3rem .2rem 2rem 0rem rgba($color: #000000, $alpha: .2);
      border-radius: .5rem;
      background-color: #fff;
      li{
        padding: 1.2rem;
        transition: background-color .5s;
        &:hover{
          background-color: #d4deec;
        }
      }
    }
    // 难度列表过度动画
    .difficalty-enter-active, .difficalty-leave-active{
      transition: transform .3s, opacity .3s;
    }
    .difficalty-enter-from, .difficalty-leave-to {
      transform: translateY(-2rem) scaleY(.7);
      opacity: 0;
    }
  }
}
.time-consuming-wrapper{
  align-items: center;
  .pause-btn-wrapper{
    margin-left: 1.2rem;
    span{
      width: $size;
      $size: 2.1rem;
      height: $size;
      display: block;
      cursor: pointer;
      border-radius: $size;
      background-color: #f5f7fa;
      &:hover{
        background-color: #eaeef4;
      }
    }
    .pause-btn {
      cursor: pointer;
      color: #666;
      transition: color .7s;
      &:hover{
        color: #333;
      }
    }
  }
  .hourglass{
    margin-right: .7rem;
    color: #515355;
  }
}
</style>