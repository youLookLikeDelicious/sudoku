<template>
  <div class="time-consuming">共用时:
    {{ timeConsuming[2] ? String.prototype.padStart.call(Math.floor(timeConsuming[2]), 2, '0') : '' }} <span v-if="timeConsuming[2]">:</span>
    {{ timeConsuming[1] ? String.prototype.padStart.call(Math.floor(timeConsuming[1]), 2, '0') : '00' }} <span>:</span>
    {{ timeConsuming[0] ? String.prototype.padStart.call(Math.floor(timeConsuming[0]), 2, '0') : '00' }}
  </div>
</template>

<script>
import { reactive, watch } from 'vue'
import { gsap } from 'gsap'

export default {
  props: {
    // 时间,单位s
    time: {
      type: Number,
      default() {
        return 0
      }
    },
    enableGsap: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  setup(props) {
    const timeConsuming = reactive([0, 0, 0])

    // 计算游戏用时
    watch(() => props.time,
      (val) => {
        if (val) {
          const result = []

          // 获取秒
          result.push(val % 60)

          // 获取分钟
          val = parseInt(val / 60)
          result.push(val)

          // 获取小时
          val = parseInt(val / 60)
          result.push(val)

          // 使用动画效果
          if (props.enableGsap) {
            gsap.to(timeConsuming, { duration: 0.7, 0: result[0]})
            if (result[1]) {
              gsap.to(timeConsuming, { duration: 0.7, 1: result[1]})
            }
            if (result[2]) {
              gsap.to(timeConsuming, { duration: 0.7, 2: result[2]})
            }
          } else {
            timeConsuming.splice(0, 3, ...result)
          }
        } else {
          timeConsuming.splice(0, 3, 0, 0, 0)
        }
      })
    return {
      timeConsuming
    }
  }
}
</script>

<style lang="scss">
  // 计时信息
  .time-consuming{
    font-size: 1.4rem;
    // opacity: 0;
    // animation:1s time-consuming cubic-bezier(0.18, 0.89, 0.45, 1.38) 2s 1  forwards;
  }
  @keyframes time-consuming {
    0%{
      opacity: 0;
    }
    100%{
      opacity: 1;
    }
  }
</style>