const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'Aina - Asistente de WhatsApp funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
  console.log(`📱 Aina - Asistente de WhatsApp`);
});

module.exports = app; 