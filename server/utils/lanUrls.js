const os = require('os');

/** IPv4 de interfaces locales (Wi‑Fi/Ethernet), sin loopback. */
function getLanIPv4Addresses() {
  const nets = os.networkInterfaces();
  const addrs = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addrs.push(net.address);
      }
    }
  }
  return [...new Set(addrs)];
}

function buildClientOrigins(port = 5173) {
  const origins = new Set(
    (process.env.CLIENT_URL || 'http://localhost:5173')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  for (const ip of getLanIPv4Addresses()) {
    origins.add(`http://${ip}:${port}`);
  }
  return [...origins];
}

module.exports = { getLanIPv4Addresses, buildClientOrigins };
