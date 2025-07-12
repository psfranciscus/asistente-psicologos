# 🤖 Asistente de WhatsApp para Psicólogos - Aina

Un asistente inteligente especializado para psicólogos que utiliza WhatsApp Business API e inteligencia artificial para potenciar el trabajo clínico.

## ✨ Características

- **IA Especializada**: Aina, asistente con conocimiento en psicología clínica
- **Análisis Clínico**: Formulación diagnóstica y recomendaciones terapéuticas
- **Interpretación de Técnicas Proyectivas**: HTP, TAT, Rorschach, etc.
- **Soporte Multimodal**: Texto y notas de voz
- **Personalización**: Adaptado a especialidad y orientación del psicólogo
- **Documentación Clínica**: Generación de informes profesionales

## 🚀 Despliegue en Railway

### 1. Preparación
```bash
# Clonar repositorio
git clone <tu-repositorio>
cd asistente-psicologos

# Instalar dependencias
npm install
```

### 2. Variables de Entorno
Crear archivo `.env` con:
```env
# Configuración del servidor
PORT=3000
NODE_ENV=production

# WhatsApp Business API
WHATSAPP_TOKEN=tu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_business_account_id
WHATSAPP_PHONE_NUMBER=tu_numero_telefono
WHATSAPP_VERIFY_TOKEN=tu_verify_token

# OpenAI API
OPENAI_API_KEY=tu_openai_api_key
OPENAI_MODEL=gpt-4

# Base de datos
DATABASE_URL=tu_mongodb_url

# Configuración
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Despliegue en Railway
1. Conectar cuenta de GitHub a Railway
2. Crear nuevo proyecto
3. Seleccionar repositorio
4. Configurar variables de entorno
5. Desplegar

## 📱 Configuración de WhatsApp Business

### Webhook URL
```
https://tu-app.railway.app/api/whatsapp/webhook
```

### Verify Token
Usar el mismo valor de `WHATSAPP_VERIFY_TOKEN`

## 🔧 Uso

### Mensaje de Bienvenida
Al iniciar conversación, Aina solicitará:
- Nombre del psicólogo
- Especialidad (Clínica, Educativa, Laboral, Jurídica)
- Orientación terapéutica (TCC, ACT, Psicodinámica, etc.)

### Comandos Disponibles
- **Análisis clínico**: Describir caso para análisis
- **Técnicas proyectivas**: Enviar descripción de dibujos/pruebas
- **Informes**: Solicitar generación de informes clínicos
- **Documentos**: Cargar archivos para análisis

## 🛠️ Tecnologías

- **Backend**: Node.js, Express
- **IA**: OpenAI GPT-4
- **WhatsApp**: WhatsApp Business API
- **Base de Datos**: MongoDB
- **Despliegue**: Railway

## 📄 Licencia

MIT License

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request 