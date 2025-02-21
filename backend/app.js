const express = require("express");
const WebSocket = require("ws");
const Modbus = require("jsmodbus");
const net = require("net");
const cors = require("cors");

const app = express();
const PORT = 3000;
const WS_PORT = 3001;

app.use(cors());

// Modbus Configuration
const HOST = "192.168.96.234"; // IP kWh meter atau simulator
const MODBUS_PORT = 502;
const UNIT_ID = 1;

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, UNIT_ID);

// WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("💬 Client connected via WebSocket");

  const readData = () => {
    client
      .readHoldingRegisters(0, 2) // Membaca 2 register mulai dari 40001
      .then((response) => {
        const registers = response.response._body.valuesAsArray;
        const energy = (registers[0] << 16) + registers[1]; // Gabungkan dua register
        const data = { energy: energy / 100.0 }; // Konversi ke kWh
        ws.send(JSON.stringify(data)); // Kirim data ke frontend
      })
      .catch((err) => console.error("❌ Modbus error:", err.message));
  };

  // Baca data setiap 5 detik
  const interval = setInterval(readData, 5000);

  ws.on("close", () => {
    console.log("💤 Client disconnected");
    clearInterval(interval);
  });
});

// Connect to Modbus Server
socket.connect({ host: HOST, port: MODBUS_PORT }, () => {
  console.log("✅ Connected to kWh meter");
});

// Express Server
app.get("/", (req, res) => {
  res.send("⚡ kWh Meter Backend is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
