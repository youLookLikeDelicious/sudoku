<template>
  <teleport to=".sudoku-container-wrap">
    <transition name="pause" appear>
      <div v-if="isPause" class="is-pausing flex" @click.stop="$emit('togglePause')">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-kaishi"></use>
        </svg>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: {
    isPause: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  emits: ['togglePause']
}
</script>

<style lang="scss">
// 游戏暂停的样式
.is-pausing{
  top: 0;
  left: 0;
  bottom: 0;
  content: '';
  width: calc(100% + .1rem);
  height: calc(100% + .1rem);
  z-index: 9999;
  cursor: pointer;
  position: absolute;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  svg{
    $size: 5rem;
    width: $size;
    height: $size;
    border-radius: $size;
    padding: 2rem;
    background-color: #d4deec;
  }
}
// 暂停遮罩动画
.pause-enter-active, .pause-leave-active {
  transition: transform .5s, opacity .5s;
}
.pause-enter-from, .pause-leave-to{
  opacity: 0;
  transform: scaleY(.5) translateY(-15rem);
}
.pause-enter-to, .pause-leave-from{
  opacity: 1;
  transform: scaleY(1) translateY(0);
}
</style>