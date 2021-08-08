<template>
  <teleport to=".sudoku-container-wrap">
    <transition name="canvas" appear>
      <div v-show="showCanvas" class="canvas-effect">
        <canvas ref="canvas"></canvas>
        <div class="finished-game-content">
          <div class="finish-title">恭喜完成挑战</div>
          <time-consuming :time="delayTime" :enableGsap="true" class="success-time-wrapper"></time-consuming>
          <div class="restart-btn" @click="handleNewGame">新游戏</div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { inject, onBeforeUnmount, ref, watch } from 'vue'
import timeConsuming from './time-consuming.vue'
let ctx, cw, ch
  

class Ball {
  constructor() {
    this.fillStyle = ''
    this.x = parseInt(Math.random() * cw + 50)
    this.y = parseInt(Math.random() * ch + 50)
    this.radius = parseInt(Math.random() * 12 + 2)
    this.xStep = +Math.random().toFixed(1)
    this.yStep = +Math.random().toFixed(1)
    this.direction = parseInt(Math.random() * 4)
    this.generateFillStyle()
  }

  generateDirection() {
    let preDirection = this.direction, tmpDirection
    do {
      tmpDirection = parseInt(Math.random() * 4)
    } while(preDirection === tmpDirection)
    this.direction = tmpDirection
  }
  generateFillStyle() {
    let alpha = +(Math.random() + 0.1).toFixed(1)
    alpha = alpha > 1 ? 1 : alpha
    this.fillStyle = `rgba(0, 102, 158, ${alpha})`
  }
  update() {
    let x, y
    switch (this.direction) {
    case 0:
      x = this.x + this.xStep
      y = this.y + this.yStep
      break
    case 1:
      x = this.x - this.xStep
      y = this.y + this.yStep
      break
    case 2:
      x = this.x + this.xStep
      y = this.y - this.yStep
      break
    case 3:
      x = this.x - this.xStep
      y = this.y - this.yStep
    }
    if (x < 0 || x > cw || y > ch || y < 0) {
      this.generateDirection()
    }

    this.x = x
    this.y = y
  }

  draw() {
    ctx.beginPath()
    ctx.fillStyle = this.fillStyle
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
    ctx.fill()
    this.update()
  }
}
let ballList

export default {
  props: {
    showCanvas: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  components: { timeConsuming },
  emits: ['restart'],
  setup(props, context) {
    let reqFrameId
    const canvas = ref('')
    const float = () => {
      reqFrameId = requestAnimationFrame.call(window, float)
      ctx.clearRect(0, 0, cw, ch)
      ballList.forEach((ball => {
        ball.draw()
      }))
    }
  
    const time = inject('time')
    // 设置canvas的宽高
    watch(canvas,
      (canvas) => {
        if (!canvas) {
          cancelAnimationFrame(reqFrameId)
          return
        }
        ctx = canvas.getContext('2d')
        ctx.globalCompositeOperation = 'destination-over'
        canvas.width = cw = canvas.parentElement.parentElement.offsetWidth
        canvas.height = ch = canvas.parentElement.parentElement.offsetHeight
        ballList = Array.from({length: 81}).map(() => new Ball())
      })

    watch(() => props.showCanvas,
      (val)=> {
        if (val) {
          float()
          setTimeout(() => {
            delayTime.value = time.value
          }, 2500)
        }
        else {
          cancelAnimationFrame(reqFrameId)
        }
      }
    )
    const delayTime = ref(0)

    // 取消动画
    onBeforeUnmount(() => {
      cancelAnimationFrame(reqFrameId)
    })
    
    // 开始新游戏
    const handleNewGame = () => {
      delayTime.value = 0
      context.emit('restart')
    }
    return {
      canvas,
      delayTime,
      handleNewGame
    }
  }
}
</script>

<style lang="scss">
.canvas-effect{
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  position: absolute;
  canvas{
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    background-color: rgb(0, 45, 108);
  }
  .finished-game-content{
    position: relative;
    z-index: 999;
    letter-spacing: .3rem;
    color: #fff;
    transform: translateY(100%);
    font-size: 2.7rem;
    font-weight: 400;
    .finish-title{
      margin-bottom: 2.1rem;
    }
  }
  // 新游戏按钮样式
  .restart-btn{
    width: 17rem;
    height: 5.5rem;
    cursor: pointer;
    line-height: 5rem;
    margin: 2rem auto;
    font-size: 1.6rem;
    font-weight: 600;
    position: relative;
    transition: color .5s;
    box-sizing: border-box;
    border: .2rem solid #fff;
    &:hover{
      color: rgb(0, 153, 255);
    }
    &:hover::after{
      width: 100%;
      height: calc(100% + .2rem);
      visibility: visible;
      transition: width .5s, height .5s .8s;
    }
    &:left::after{
      width: 100%;
      height: calc(100% + .2rem);
      visibility: visible;
      transition: width .5s, height .5s .8s;
    }
    &:hover::before{
      width: 100%;
      height: calc(100% + .2rem);
      visibility: visible;
      transition: width .5s, height .5s .8s;
    }
    &::after{
      visibility: hidden;
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      background-color: transparent;
      top: -.2rem;
      left: 0;
      border-top: .2rem solid rgb(0, 153, 255);
      border-right: .2rem solid rgb(0, 153, 255);
    }
    &::before{
      visibility: hidden;
      content: '';
      width: 0;
      height: 0;
      position: absolute;
      background-color: transparent;
      bottom: -.2rem;
      right: 0;
      border-bottom: .2rem solid rgb(0, 153, 255);
      border-left: .2rem solid rgb(0, 153, 255);
    }
  }
}
// 遮罩的过度动画
.canvas-enter-active, .canvas-leave-active{
  transition: transform 3s, opacity .7s;
  .success-time-wrapper{
    transition: opacity 1s 2s;
  }
  .finish-title {
    transition: transform .7s, opacity .7s;
  }
  .restart-btn{
    transition: transform .7s 1s, opacity .7s 1s;
  }
}
.canvas-enter-from, .canvas-leave-to{
  opacity: 0;
  .success-time-wrapper{
    opacity: 0;
  }
  .finish-title{
    opacity: 0;
    transform: translateY(-5rem) translateX(-13rem);
  }
  .restart-btn {
    opacity: 0;
    transform: translateY(-5rem) translateX(-12rem);
  }
}
.canvas-enter-to, .canvas-leave-from{
  .restart-btn{
    opacity: 1;
  }
}
</style>