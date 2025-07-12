const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'Asistente de WhatsApp para Psicólogos - Aina',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Webhook básico de WhatsApp
app.get('/api/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('🔍 Verificación de webhook:', { mode, token, challenge });
  
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verificado');
      res.status(200).send(challenge);
    } else {
      console.log('❌ Token inválido');
      res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    console.log('❌ Parámetros faltantes');
    res.status(400).json({ error: 'Bad Request' });
  }
});

app.post('/api/whatsapp/webhook', (req, res) => {
  console.log('📱 Webhook recibido:', req.body);
  res.status(200).json({ status: 'ok' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    error: 'Algo salió mal en el servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
  });
});

// Ruta para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor simplificado iniciado en puerto ${PORT}`);
  console.log(`📱 Asistente de WhatsApp para Psicólogos - Aina`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Variables de entorno:`);
  console.log(`   - WHATSAPP_TOKEN: ${process.env.WHATSAPP_TOKEN ? '✅ Configurado' : '❌ Faltante'}`);
  console.log(`   - WHATSAPP_PHONE_NUMBER_ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID ? '✅ Configurado' : '❌ Faltante'}`);
  console.log(`   - OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ Faltante'}`);
});

module.exports = app; 