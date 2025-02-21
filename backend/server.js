const express = require("express");
const Modbus = require("jsmodbus");
const net = require("net");

const app = express();
const PORT = 3000;

const HOST = "192.168.1.100";
const MODBUS_PORT = 502;
const UNIT_ID = 1;

app.get("/data", (req, res) => {
  const socket = new net.Socket();
  const client = new Modbus.client.TCP(socket, UNIT_ID);

  socket.connect({ host: HOST, port: MODBUS_PORT }, () => {
    client
      .readHoldingRegisters(0, 2)
      .then((response) => {
        const registers = response.response._body.valuesAsArray;
        const energy = (registers[0] << 16) + registers[1];
        res.json({ energy: energy / 100.0 });
        socket.end();
      })
      .catch((err) => {
        res.status(500).json({ error: err.message });
        socket.end();
      });
  });

  socket.on("error", (err) => {
    res.status(500).json({ error: err.message });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
