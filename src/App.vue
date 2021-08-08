<template>
  <!-- eslint-disable vue/no-multiple-template-root -->
  <Grid></Grid>
  <footer class="site-footer">
    <div class="friend-link">
      友情链接: <a href="https://www.blog1997.com" target="_blank" title="blog1997">blog1997</a>
    </div>
    <div>&copy; {{ year }} blog1997 All rights reserved.</div>
  </footer>
</template>

<script setup>
import Grid from '@/components/grid-box.vue'
const startYear = 2021
const currentYear = (new Date()).getFullYear()
const year = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`
</script>
<style lang="scss">
#app {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  transition: margin 1s;
  height: 100%;
  box-sizing: border-box;
}
@media screen and (min-width: 0) {
  #app {
    padding-top: 2rem;
  }
}
@media screen and (min-width: 97rem) {
  #app {
    padding-top: 6rem;
  }
}
.site-footer{
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4.5rem;
  color: #696969;
  font-size: 1.4rem;
  padding: 1.2rem 0;
  border-top: .1rem solid #f5f7fa;
  a{
    color: #696969;
    text-decoration: none;
  }
  .friend-link{
    margin-bottom: 1rem;
  }
}
</style>
