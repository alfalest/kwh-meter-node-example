const express = require("express");
const WebSocket = require("ws");
const Modbus = require("jsmodbus");
const net = require("net");
const cors = require("cors");
const winston = require("winston");

const app = express();
const PORT = 3000;
const WS_PORT = 3001;

// ✅ CORS Configuration untuk Production
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"], // Ubah sesuai domain frontend Anda
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

// ✅ Logger dengan Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}] ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

// ✅ Modbus Configuration
const HOST = "192.168.96.234"; // IP kWh meter dari hardware IoT atau simulator
const MODBUS_PORT = 502;
const UNIT_ID = 1;

const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, UNIT_ID);

// ✅ WebSocket Server
const wss = new WebSocket.Server({ port: WS_PORT });
let isConnected = false;

// ✅ WebSocket Broadcasting
wss.on("connection", (ws) => {
  logger.info("💬 Client connected via WebSocket");

  ws.on("close", () => {
    logger.warn("💤 Client disconnected");
  });
});

// ✅ Modbus Reading dan Broadcasting ke Semua Client
const readData = () => {
  if (isConnected) {
    client
      .readHoldingRegisters(0, 2)
      .then((response) => {
        const registers = response.response._body.valuesAsArray;
        const energy = (registers[0] << 16) + registers[1];
        const data = { energy: energy / 100.0 };

        // ✅ Broadcast ke Semua Client WebSocket
        wss.clients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
          }
        });
      })
      .catch((err) => logger.error(`❌ Modbus read error: ${err.message}`));
  }
};

// ✅ Loop untuk Membaca Data Setiap 5 Detik
setInterval(readData, 5000);

// ✅ Modbus Connection Error Handling & Reconnect
socket.on("connect", () => {
  isConnected = true;
  logger.info("✅ Connected to kWh meter");
});

socket.on("error", (err) => {
  isConnected = false;
  logger.error(`❌ Modbus connection error: ${err.message}`);
  setTimeout(() => reconnectModbus(), 5000);
});

socket.on("close", () => {
  isConnected = false;
  logger.warn("⚠️ Modbus connection closed, attempting to reconnect...");
  setTimeout(() => reconnectModbus(), 5000);
});

// ✅ Function untuk Reconnect Modbus
const reconnectModbus = () => {
  socket.connect({ host: HOST, port: MODBUS_PORT }, () => {
    isConnected = true;
    logger.info("🔁 Reconnected to kWh meter");
  });
};

// ✅ Connect ke Modbus Server Pertama Kali
reconnectModbus();

// ✅ Express Server
app.get("/", (req, res) => {
  res.send("⚡ kWh Meter Backend is running!");
});

app.listen(PORT, () => {
  logger.info(`🚀 Backend running on http://localhost:${PORT}`);
});
