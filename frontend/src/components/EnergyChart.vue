<template>
  <div class="chart-container">
    <h1>⚡ Real-Time kWh Meter</h1>
    <h2>Total Energi: {{ energy.toFixed(2) }} kWh</h2>

    <div class="chart-wrapper">
      <LineChart width="600" height="300" :data="data">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="energy" stroke="#8884d8" />
      </LineChart>
    </div>
  </div>
</template>

<script>
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  components: { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend },
  setup() {
    const energy = ref(0);
    const data = ref([]);

    let ws;

    onMounted(() => {
      ws = new WebSocket('ws://localhost:3001'); // Hubungkan ke WebSocket server

      ws.onmessage = event => {
        const jsonData = JSON.parse(event.data);
        energy.value = jsonData.energy;
        data.value.push({ name: new Date().toLocaleTimeString(), energy: jsonData.energy });
        if (data.value.length > 20) data.value.shift(); // Batasi data hanya 20 titik
      };
    });

    onUnmounted(() => {
      if (ws) ws.close();
    });

    return { energy, data };
  }
};
</script>

<style scoped>
.chart-container {
  text-align: center;
  margin-top: 50px;
}

.chart-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>
