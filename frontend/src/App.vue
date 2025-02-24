<!-- App.vue -->
<template>
  <div class="app-container">
    <EnergyChart />
  </div>
</template>

<script>
import EnergyChart from './components/EnergyChart.vue';

export default {
  components: { EnergyChart },
};
</script>

<style>
body, html {
  background: #1B1212;
  color: #ffffff;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  height: 100%;
}

/* Container utama */
.app-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}
</style>
