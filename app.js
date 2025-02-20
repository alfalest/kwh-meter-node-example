const Modbus = require("jsmodbus");
const net = require("net");

// Konfigurasi koneksi ke kWh meter
const HOST = "127.0.0.1"; // IP lokal simulator
const PORT = 502; // Port default Modbus TCP
const UNIT_ID = 1;

// Buat koneksi TCP
const socket = new net.Socket();
const client = new Modbus.client.TCP(socket, UNIT_ID);

socket.connect({ host: HOST, port: PORT }, () => {
  console.log("✅ Terhubung ke kWh meter.");
  client
    .readHoldingRegisters(0, 2)
    .then((response) => {
      const registers = response.response._body.valuesAsArray;
      const energy = (registers[0] << 16) + registers[1];
      console.log(`⚡ Total Energi: ${(energy / 100.0).toFixed(2)} kWh`);
      socket.end();
    })
    .catch((err) => {
      console.error("❌ Gagal membaca data:", err.message);
      socket.end();
    });
});

socket.on("error", (err) => {
  console.error("❗ Koneksi gagal:", err.message);
});
