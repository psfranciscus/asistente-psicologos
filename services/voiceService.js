const fs = require('fs');
const OpenAI = require('openai');

class VoiceService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async transcribeAudio(filePath) {
    return await this.transcribeWithWhisper(filePath);
  }

  async transcribeWithWhisper(filePath) {
    try {
      const resp = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-1',
        language: 'es'
      });
      return resp.text;
    } catch (error) {
      console.error('Error transcribiendo con Whisper:', error.message);
      return null;
    }
  }
}

module.exports = VoiceService; 