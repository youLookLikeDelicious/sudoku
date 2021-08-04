<template>
  <Grid></Grid>
</template>

<script setup>
import Grid from '@/components/grid-box.vue'

</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  transition: margin 1s;
}
@media screen and (min-width: 0) {
  #app {
    margin-top: 2rem;
  }
}
@media screen and (min-width: 97rem) {
  #app {
    margin-top: 6rem;
  }
}
</style>
