const fs = require('fs');
const OpenAI = require('openai');
const { SpeechClient } = require('@google-cloud/speech');

class VoiceService {
  constructor() {
    this.useWhisper = process.env.USE_WHISPER === 'true';
    if (this.useWhisper) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      this.speechClient = new SpeechClient({
        key: process.env.GOOGLE_CLOUD_SPEECH_API_KEY
      });
    }
  }

  async transcribeAudio(filePath) {
    if (this.useWhisper) {
      return await this.transcribeWithWhisper(filePath);
    } else {
      return await this.transcribeWithGoogle(filePath);
    }
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

  async transcribeWithGoogle(filePath) {
    try {
      const file = fs.readFileSync(filePath);
      const audioBytes = file.toString('base64');
      const audio = { content: audioBytes };
      const config = {
        encoding: 'OGG_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'es-ES',
      };
      const request = { audio, config };
      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      return transcription;
    } catch (error) {
      console.error('Error transcribiendo con Google:', error.message);
      return null;
    }
  }
}

module.exports = VoiceService; 