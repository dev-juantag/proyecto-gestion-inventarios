
const fetch = require('node-fetch');

async function runTest() {
  const data = {
    wo: "5645899",
    numeroLote: "L1",
    modelo: "Discover",
    fechaIntervencion: "2026-04-24",
    fechaProduccion: "2026-05-09",
    composicion: {
      CHASIS: 12,
      PLASTICO: 13,
      MOTORES: 2,
      TORNILERIA: 1
    }
  };

  try {
    const res = await fetch('http://localhost:3000/api/inbound/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

runTest();
