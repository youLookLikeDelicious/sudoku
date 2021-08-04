<template>
  <transition name="canvas">
    <div v-show="showCanvas" class="canvas-effect">
      <canvas ref="canvas"></canvas>
      <div class="finished-game-content">
        <div class="finish-title">恭喜完成挑战</div>
        <time-consuming :time="delayTime" :enableGsap="true"></time-consuming>
        <div class="restart-btn" @click="handleNewGame">新游戏</div>
      </div>
    </div>
  </transition>
</template>

<script>
import { onBeforeUnmount, ref, watch } from 'vue'
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
    },
    time: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  components: { timeConsuming },
  emits: ['restart'],
  setup(props, { emit }) {
    const canvas = ref('')
    let reqFrameId, timeHandler
    const float = () => {
      reqFrameId = requestAnimationFrame.call(window, float)
      ctx.clearRect(0, 0, cw, ch)
      ballList.forEach((ball => {
        ball.draw()
      }))
    }
  

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
        if (val) float()
        else cancelAnimationFrame(reqFrameId)
      }
    )
    const delayTime = ref(0)
    watch(
      () => props.time,
      (val) => {
        if (!val) return
        clearTimeout(timeHandler)
        timeHandler = setTimeout(() => {
          delayTime.value = val
        }, 2000)
      }
    )
    // 取消动画
    onBeforeUnmount(() => {
      cancelAnimationFrame(reqFrameId)
    })
    
    // 开始新游戏
    const handleNewGame = () => {
      emit('update:showCanvas', false)
      emit('restart')
      delayTime.value = 0
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
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
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
    transform: translateY(20rem);
    font-size: 2.7rem;
    font-weight: 400;
    .finish-title{
      opacity: 0;
      margin-bottom: 2.1rem;
      animation: finish-title .5s cubic-bezier(0, 0.68, 0.35, 1.41) 1s 1 forwards;
    }
  }
  // 新游戏按钮样式
  .restart-btn{
    width: 17rem;
    height: 5.5rem;
    line-height: 5rem;
    cursor: pointer;
    margin: 2rem auto;
    opacity: 0;
    font-size: 1.6rem;
    font-weight: 600;
    position: relative;
    border: .2rem solid #fff;
    transition: color .5s;
    box-sizing: border-box;
    animation:1s restart-btn cubic-bezier(0.18, 0.89, 0.45, 1.38) 1.6s 1  forwards;
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
@keyframes finish-title {
  0%{
    transform: translateY(-5rem) translateX(-13rem);
    opacity: 0;
  }
  100%{
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes restart-btn {
  0%{
    opacity: 0;
    transform: translateY(-5rem) translateX(-12rem);
  }
  100%{
    opacity: 1;
    transform: translateY(0);
  }
}
.cell-enter-to{
  // transform: rotate3d(.1, .7, .7, 360deg) !important;
  opacity: 1;
}
.cell-enter-from{
  opacity: 0;
}
.cell-enter-active{
  transition: opacity 1s ease-in;
  z-index: 9999;
}
</style>