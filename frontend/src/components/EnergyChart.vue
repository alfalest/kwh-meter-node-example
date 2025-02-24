<template>
  <div class="chart-container">
    <h1>⚡ Real-Time kWh Meter by Heiszco ⚡</h1>
    <h2>Energy Usage: {{ energy.toFixed(2) }} kWh</h2>
    <div class="canvas-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
/* Container utama */
.chart-container {
  text-align: center;
  margin-top: 30px;
  background: #1B1212; /* Warna background utama */
  color: #ffffff; /* Warna font */
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Judul */
h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
}

/* Subjudul */
h2 {
  font-size: 1.4rem;
  margin-bottom: 20px;
}

/* Container canvas */
.canvas-wrapper {
  width: 600px;
  height: 350px;
  margin: auto;
  border: 1px solid #ffffff; /* Border putih agar kontras */
  border-radius: 10px;
  overflow: hidden;
  background: #282828; /* Background canvas lebih terang */
}

/* Canvas */
canvas {
  width: 100%;
  height: 100%;
}
</style>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import Chart from 'chart.js/auto';

export default {
  setup() {
    const energy = ref(0);
    const data = ref([]);
    const chartCanvas = ref(null);
    let chartInstance = null;
    let ws;

    const updateChart = () => {
      if (chartInstance) {
        chartInstance.data.labels = data.value.map((d) => d.name);
        chartInstance.data.datasets[0].data = data.value.map((d) => d.energy);
        chartInstance.update();
      }
    };

    onMounted(() => {
      // Inisialisasi WebSocket
      ws = new WebSocket('ws://localhost:3001');
      ws.onmessage = (event) => {
        const jsonData = JSON.parse(event.data);
        energy.value = jsonData.energy;

        // Update data array
        data.value.push({
          name: new Date().toLocaleTimeString(),
          energy: jsonData.energy,
        });
        if (data.value.length > 20) data.value.shift();

        updateChart(); // Perbarui chart setiap kali data baru diterima
      };

      // Inisialisasi Chart.js
      chartInstance = new Chart(chartCanvas.value, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Energy Usage (kWh)',
              data: [],
              borderColor: '#8884d8',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });

    onUnmounted(() => {
      if (ws) ws.close();
      if (chartInstance) chartInstance.destroy();
    });

    return { energy, data, chartCanvas };
  },
};
</script>

<style scoped>
.chart-container {
  text-align: center;
  margin-top: 30px;
}

canvas {
  width: 800px;
  height: 400px;
  margin: auto;
}
</style>
