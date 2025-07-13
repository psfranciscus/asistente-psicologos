# Asistente de WhatsApp con IA (flujo simple)

Este proyecto es un asistente de WhatsApp que responde automáticamente a mensajes de texto y notas de voz usando inteligencia artificial (OpenAI GPT-4 y Whisper).

## Características
- Responde a cualquier mensaje de texto o voz con IA
- Sin lógica de bienvenida, nombre ni pasos intermedios
- Código simple y fácil de mantener

## Uso
1. Clona el repositorio
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno en Railway o en un archivo `.env`:
   ```env
   WHATSAPP_TOKEN=tu_token_de_whatsapp
   WHATSAPP_PHONE_NUMBER_ID=tu_id_de_numero
   OPENAI_API_KEY=tu_api_key_de_openai
   OPENAI_MODEL=gpt-4
   PORT=3000
   NODE_ENV=production
   ```
4. Despliega en Railway o ejecuta localmente:
   ```bash
   npm start
   ```

## Webhook
Configura el webhook en Facebook Developers:
- URL: `https://<tu-app>.railway.app/api/whatsapp/webhook`
- Token de verificación: el que definas en tus variables

## ¿Cómo funciona?
- Cualquier mensaje recibido (texto o voz) se procesa y se responde usando OpenAI.
- Si hay un error, responde: "Lo siento, no pude procesar tu mensaje. Intenta de nuevo."

## Dependencias mínimas
- express
- axios
- openai
- dotenv

---

¡Listo para usar y extender! 