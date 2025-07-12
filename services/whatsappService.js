const axios = require('axios');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_TOKEN;
    this.apiURL = `${this.baseURL}/${this.phoneNumberId}`;
  }

  // Enviar mensaje de texto
  async sendMessage(to, message) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(
        `${this.apiURL}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Mensaje enviado a ${to}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error.response?.data || error.message);
      throw new Error(`Error enviando mensaje: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Enviar mensaje con botones
  async sendMessageWithButtons(to, message, buttons) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: message
          },
          action: {
            buttons: buttons.map((button, index) => ({
              type: 'reply',
              reply: {
                id: `btn_${index}`,
                title: button.title
              }
            }))
          }
        }
      };

      const response = await axios.post(
        `${this.apiURL}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Mensaje con botones enviado a ${to}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error enviando mensaje con botones:', error.response?.data || error.message);
      throw new Error(`Error enviando mensaje con botones: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Enviar mensaje con lista
  async sendMessageWithList(to, message, sections) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'interactive',
        interactive: {
          type: 'list',
          body: {
            text: message
          },
          action: {
            button: 'Ver opciones',
            sections: sections
          }
        }
      };

      const response = await axios.post(
        `${this.apiURL}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Mensaje con lista enviado a ${to}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error enviando mensaje con lista:', error.response?.data || error.message);
      throw new Error(`Error enviando mensaje con lista: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Descargar archivo multimedia
  async downloadMedia(mediaId) {
    try {
      // Obtener URL del archivo
      const mediaResponse = await axios.get(
        `${this.baseURL}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      const mediaUrl = mediaResponse.data.url;

      // Descargar archivo
      const fileResponse = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'arraybuffer'
      });

      // Crear directorio si no existe
      const uploadDir = path.join(__dirname, '../../uploads/media');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Guardar archivo
      const fileName = `${mediaId}_${Date.now()}.ogg`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, fileResponse.data);

      console.log(`✅ Archivo descargado: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('❌ Error descargando archivo:', error.response?.data || error.message);
      throw new Error(`Error descargando archivo: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Obtener estado del servicio
  async getStatus() {
    try {
      const response = await axios.get(
        `${this.apiURL}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        connected: true,
        phoneNumber: response.data.phone_numbers?.[0]?.display_phone_number,
        verifiedName: response.data.phone_numbers?.[0]?.verified_name,
        qualityRating: response.data.phone_numbers?.[0]?.quality_rating
      };
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error.response?.data || error.message);
      return {
        connected: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Verificar webhook
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verificado correctamente');
      return challenge;
    } else {
      throw new Error('Token de verificación inválido');
    }
  }

  // Procesar mensaje entrante
  processIncomingMessage(message) {
    const { from, timestamp, type } = message;
    
    let content = null;
    let mediaUrl = null;
    let mediaId = null;

    switch (type) {
      case 'text':
        content = message.text.body;
        break;
      case 'audio':
        content = 'Mensaje de audio';
        mediaUrl = message.audio.url;
        mediaId = message.audio.id;
        break;
      case 'voice':
        content = 'Nota de voz';
        mediaUrl = message.voice.url;
        mediaId = message.voice.id;
        break;
      case 'image':
        content = 'Imagen';
        mediaUrl = message.image.url;
        mediaId = message.image.id;
        break;
      case 'document':
        content = 'Documento';
        mediaUrl = message.document.url;
        mediaId = message.document.id;
        break;
      default:
        content = 'Tipo de mensaje no soportado';
    }

    return {
      from,
      timestamp,
      type,
      content,
      mediaUrl,
      mediaId
    };
  }

  // Enviar mensaje de bienvenida
  async sendWelcomeMessage(to) {
    const welcomeMessage = `¡Hola! 👋 Soy tu asistente virtual para consultas psicológicas.

🤖 Puedo ayudarte con:
• Información sobre trastornos psicológicos
• Técnicas de relajación y manejo del estrés
• Orientación sobre cuándo buscar ayuda profesional
• Recursos de autoayuda

💬 Puedes escribirme o enviarme notas de voz.

⚠️ Recuerda: No soy un sustituto de la terapia profesional. Si tienes una emergencia, contacta a un profesional de la salud mental.

¿En qué puedo ayudarte hoy?`;

    return await this.sendMessage(to, welcomeMessage);
  }

  // Enviar mensaje de error
  async sendErrorMessage(to, errorType = 'general') {
    const errorMessages = {
      general: 'Lo siento, hubo un error procesando tu mensaje. Por favor, intenta de nuevo.',
      audio: 'No pude entender el audio. Por favor, intenta grabar de nuevo o envía un mensaje de texto.',
      timeout: 'La solicitud tardó demasiado. Por favor, intenta de nuevo.',
      unsupported: 'Este tipo de mensaje no está soportado. Por favor, envía texto o una nota de voz.'
    };

    const message = errorMessages[errorType] || errorMessages.general;
    return await this.sendMessage(to, message);
  }
}

module.exports = WhatsAppService; 