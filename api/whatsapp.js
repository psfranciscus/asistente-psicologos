const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const WhatsAppService = require('../services/whatsappService');
const VoiceService = require('../services/voiceService');
const AIService = require('../services/aiService');
const Conversation = require('../models/Conversation');

// Configuración de multer para archivos de audio
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /ogg|mp3|wav|m4a|aac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio (ogg, mp3, wav, m4a, aac)'));
    }
  }
});

// Instanciar servicios
const whatsappService = new WhatsAppService();
const voiceService = new VoiceService();
const aiService = new AIService();

// Webhook para recibir mensajes de WhatsApp
router.post('/webhook', async (req, res) => {
  try {
    const { body } = req;
    
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        const from = message.from;
        const timestamp = message.timestamp;
        
        console.log(`📱 Mensaje recibido de ${from}:`, message);
        
        // Procesar mensaje según el tipo
        if (message.type === 'text') {
          await handleTextMessage(from, message.text.body, timestamp);
        } else if (message.type === 'audio') {
          await handleAudioMessage(from, message.audio, timestamp);
        } else if (message.type === 'voice') {
          await handleVoiceMessage(from, message.voice, timestamp);
        } else {
          // Mensaje no soportado
          await whatsappService.sendMessage(from, 
            'Lo siento, solo puedo procesar mensajes de texto y notas de voz por el momento.');
        }
      }
      
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  } catch (error) {
    console.error('Error en webhook de WhatsApp:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificación del webhook
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verificado');
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } else {
    res.status(400).json({ error: 'Bad Request' });
  }
});

// Función para manejar mensajes de texto
async function handleTextMessage(from, text, timestamp) {
  try {
    console.log(`📝 Procesando mensaje de texto: "${text}"`);
    
    // Verificar si es información del psicólogo
    if (text.toLowerCase().includes('soy') && (text.toLowerCase().includes('especialidad') || text.toLowerCase().includes('orientación'))) {
      const response = await handlePsychologistInfo(from, text);
      await whatsappService.sendMessage(from, response);
      return;
    }
    
    // Generar respuesta usando AI con ID del psicólogo
    const response = await aiService.generateResponse(text, 'text', from);
    
    // Enviar respuesta
    await whatsappService.sendMessage(from, response);
    
    // Guardar en base de datos
    await saveMessageToDatabase(from, 'text', text, response, timestamp);
    
  } catch (error) {
    console.error('Error procesando mensaje de texto:', error);
    await whatsappService.sendMessage(from, 
      'Lo siento, hubo un error procesando tu mensaje. Por favor, intenta de nuevo.');
  }
}

// Función para manejar información del psicólogo
async function handlePsychologistInfo(from, text) {
  try {
    // Extraer información del texto usando regex
    const nameMatch = text.match(/soy\s+([^,]+)/i);
    const specialtyMatch = text.match(/especialidad\s+([^,]+)/i);
    const orientationMatch = text.match(/orientación\s+([^,]+)/i);
    
    if (nameMatch && specialtyMatch && orientationMatch) {
      const name = nameMatch[1].trim();
      const specialty = specialtyMatch[1].trim();
      const orientation = orientationMatch[1].trim();
      
      // Guardar información del psicólogo
      const response = aiService.savePsychologistInfo(from, name, specialty, orientation);
      return response;
    } else {
      return 'Por favor, proporciona la información en el formato: "Soy [Nombre], especialidad [Clínica/Educativa/Laboral/Jurídica], orientación [TCC/ACT/Psicodinámica/Sistémica/Humanista/Integrativa]"';
    }
  } catch (error) {
    console.error('Error procesando información del psicólogo:', error);
    return 'Error procesando la información. Por favor, intenta de nuevo.';
  }
}

// Función para manejar mensajes de audio
async function handleAudioMessage(from, audio, timestamp) {
  try {
    console.log(`🎵 Procesando mensaje de audio`);
    
    // Descargar archivo de audio
    const audioUrl = audio.url;
    const audioId = audio.id;
    const audioFile = await whatsappService.downloadMedia(audioId);
    
    // Convertir audio a texto
    const transcribedText = await voiceService.transcribeAudio(audioFile);
    
    if (!transcribedText) {
      await whatsappService.sendMessage(from, 
        'No pude entender el audio. Por favor, intenta grabar de nuevo o envía un mensaje de texto.');
      return;
    }
    
    console.log(`🎵 Audio transcrito: "${transcribedText}"`);
    
    // Generar respuesta usando AI
    const response = await aiService.generateResponse(transcribedText, 'voice');
    
    // Enviar respuesta
    await whatsappService.sendMessage(from, response);
    
    // Guardar en base de datos
    await saveMessageToDatabase(from, 'voice', transcribedText, response, timestamp);
    
  } catch (error) {
    console.error('Error procesando mensaje de audio:', error);
    await whatsappService.sendMessage(from, 
      'Lo siento, hubo un error procesando tu nota de voz. Por favor, intenta de nuevo.');
  }
}

// Función para manejar mensajes de voz
async function handleVoiceMessage(from, voice, timestamp) {
  try {
    console.log(`🎤 Procesando mensaje de voz`);
    
    // Descargar archivo de voz
    const voiceUrl = voice.url;
    const voiceId = voice.id;
    const voiceFile = await whatsappService.downloadMedia(voiceId);
    
    // Convertir voz a texto
    const transcribedText = await voiceService.transcribeAudio(voiceFile);
    
    if (!transcribedText) {
      await whatsappService.sendMessage(from, 
        'No pude entender la nota de voz. Por favor, intenta grabar de nuevo o envía un mensaje de texto.');
      return;
    }
    
    console.log(`🎤 Voz transcrita: "${transcribedText}"`);
    
    // Generar respuesta usando AI
    const response = await aiService.generateResponse(transcribedText, 'voice');
    
    // Enviar respuesta
    await whatsappService.sendMessage(from, response);
    
    // Guardar en base de datos
    await saveMessageToDatabase(from, 'voice', transcribedText, response, timestamp);
    
  } catch (error) {
    console.error('Error procesando mensaje de voz:', error);
    await whatsappService.sendMessage(from, 
      'Lo siento, hubo un error procesando tu nota de voz. Por favor, intenta de nuevo.');
  }
}

// Función para guardar mensaje en base de datos
async function saveMessageToDatabase(from, type, input, response, timestamp) {
  try {
    // Solo guardar si hay conexión a base de datos
    if (!process.env.DATABASE_URL && !process.env.MONGODB_URI) {
      console.log(`💾 Mensaje registrado (sin persistencia): ${from}`);
      return;
    }
    
    // Buscar conversación existente o crear nueva
    let conversation = await Conversation.findOne({ psychologistId: from });
    
    if (!conversation) {
      conversation = new Conversation({
        psychologistId: from,
        messages: []
      });
    }
    
    // Agregar mensaje a la conversación
    conversation.messages.push({
      type,
      input,
      response,
      timestamp: new Date(timestamp * 1000)
    });
    
    await conversation.save();
    console.log(`💾 Mensaje guardado en base de datos para ${from}`);
  } catch (error) {
    console.error('Error guardando mensaje en base de datos:', error);
    console.log(`💾 Mensaje registrado (error DB): ${from}`);
  }
}

// Ruta para enviar mensaje manualmente
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos',
        message: 'Se requiere "to" y "message"'
      });
    }
    
    const result = await whatsappService.sendMessage(to, message);
    
    res.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: result
    });
    
  } catch (error) {
    console.error('Error enviando mensaje:', error);
    res.status(500).json({
      error: 'Error enviando mensaje',
      message: error.message
    });
  }
});

// Ruta para obtener estado de WhatsApp
router.get('/status', async (req, res) => {
  try {
    const status = await whatsappService.getStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({
      error: 'Error obteniendo estado',
      message: error.message
    });
  }
});

module.exports = router; 