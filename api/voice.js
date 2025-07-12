const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const VoiceService = require('../services/voiceService');

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

const voiceService = new VoiceService();

// Ruta para transcribir audio
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se proporcionó archivo de audio',
        message: 'Por favor, sube un archivo de audio válido'
      });
    }

    console.log(`🎵 Procesando archivo de audio: ${req.file.filename}`);
    
    const transcription = await voiceService.transcribeAudio(req.file.path);
    
    if (!transcription) {
      return res.status(400).json({
        error: 'No se pudo transcribir el audio',
        message: 'El archivo de audio no pudo ser procesado. Verifica que sea un archivo válido.'
      });
    }

    // Limpiar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      transcription: transcription,
      message: 'Audio transcrito correctamente'
    });

  } catch (error) {
    console.error('Error transcribiendo audio:', error);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: 'Error procesando audio',
      message: error.message
    });
  }
});

// Ruta para obtener información del servicio de voz
router.get('/status', (req, res) => {
  try {
    const status = {
      service: 'Voice Transcription Service',
      provider: process.env.USE_WHISPER === 'true' ? 'OpenAI Whisper' : 'Google Cloud Speech-to-Text',
      supportedFormats: ['ogg', 'mp3', 'wav', 'm4a', 'aac'],
      maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
      status: 'active'
    };

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error obteniendo estado del servicio de voz:', error);
    res.status(500).json({
      error: 'Error obteniendo estado',
      message: error.message
    });
  }
});

module.exports = router; 