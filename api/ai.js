const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

const aiService = new AIService();

// Ruta para generar respuesta clínica
router.post('/generate-response', async (req, res) => {
  try {
    const { userInput, inputType = 'text', psychologistId } = req.body;
    
    if (!userInput) {
      return res.status(400).json({
        error: 'Falta el input del usuario',
        message: 'Se requiere el campo userInput'
      });
    }

    console.log(`🤖 Generando respuesta para: "${userInput}"`);
    
    const response = await aiService.generateResponse(userInput, inputType, psychologistId);
    
    res.json({
      success: true,
      response: response,
      message: 'Respuesta generada correctamente'
    });

  } catch (error) {
    console.error('Error generando respuesta IA:', error);
    res.status(500).json({
      error: 'Error generando respuesta',
      message: error.message
    });
  }
});

// Ruta para guardar información del psicólogo
router.post('/save-psychologist', async (req, res) => {
  try {
    const { psychologistId, name, specialty, orientation } = req.body;
    
    if (!psychologistId || !name || !specialty || !orientation) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'Se requieren psychologistId, name, specialty y orientation'
      });
    }

    const response = aiService.savePsychologistInfo(psychologistId, name, specialty, orientation);
    
    res.json({
      success: true,
      message: response
    });

  } catch (error) {
    console.error('Error guardando información del psicólogo:', error);
    res.status(500).json({
      error: 'Error guardando información',
      message: error.message
    });
  }
});

// Ruta para analizar técnica proyectiva
router.post('/analyze-projective', async (req, res) => {
  try {
    const { imageDescription, testType } = req.body;
    
    if (!imageDescription || !testType) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        message: 'Se requieren imageDescription y testType'
      });
    }

    console.log(`🎨 Analizando técnica proyectiva: ${testType}`);
    
    const analysis = await aiService.analyzeProjectiveTest(imageDescription, testType);
    
    res.json({
      success: true,
      analysis: analysis,
      message: 'Análisis de técnica proyectiva completado'
    });

  } catch (error) {
    console.error('Error analizando técnica proyectiva:', error);
    res.status(500).json({
      error: 'Error analizando técnica proyectiva',
      message: error.message
    });
  }
});

// Ruta para generar informe clínico
router.post('/generate-report', async (req, res) => {
  try {
    const { patientData, sessionData } = req.body;
    
    if (!patientData || !sessionData) {
      return res.status(400).json({
        error: 'Faltan datos requeridos',
        message: 'Se requieren patientData y sessionData'
      });
    }

    console.log(`📋 Generando informe clínico`);
    
    const report = await aiService.generateClinicalReport(patientData, sessionData);
    
    res.json({
      success: true,
      report: report,
      message: 'Informe clínico generado correctamente'
    });

  } catch (error) {
    console.error('Error generando informe clínico:', error);
    res.status(500).json({
      error: 'Error generando informe clínico',
      message: error.message
    });
  }
});

// Ruta para obtener mensaje de bienvenida
router.get('/welcome', (req, res) => {
  try {
    const welcomeMessage = aiService.getWelcomeMessage();
    
    res.json({
      success: true,
      message: welcomeMessage
    });

  } catch (error) {
    console.error('Error obteniendo mensaje de bienvenida:', error);
    res.status(500).json({
      error: 'Error obteniendo mensaje de bienvenida',
      message: error.message
    });
  }
});

// Ruta para obtener información del servicio de IA
router.get('/status', (req, res) => {
  try {
    const status = {
      service: 'Aina AI Service',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      provider: 'OpenAI',
      features: [
        'Análisis Clínico Integral',
        'Formulación Psicológica',
        'Interpretación de Técnicas Proyectivas',
        'Insights Clínicos Profundos',
        'Recomendaciones Terapéuticas',
        'Documentación Clínica'
      ],
      status: 'active'
    };

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error obteniendo estado del servicio de IA:', error);
    res.status(500).json({
      error: 'Error obteniendo estado',
      message: error.message
    });
  }
});

module.exports = router; 