# Google Gemini API Setup Guide

This guide will help you set up Google Gemini API access for Canvas AI Studio.

## 🚀 Quick Setup

### Step 1: Get Your API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key (keep it secure!)

### Step 2: Configure Canvas AI Studio

1. Open Canvas AI Studio in your browser
2. Click the settings icon (⚙️) in the left toolbar
3. Paste your API key in the "Ключ Gemini API" field
4. Click "Сохранить" (Save)
5. The system will automatically test your connection

## 🔍 Detailed Setup Instructions

### Creating a Google AI Studio Account

1. **Navigate to Google AI Studio**

   - Go to [https://ai.google.dev/](https://ai.google.dev/)
   - Click "Get started" or "Try Gemini API"

2. **Sign In**

   - Use your existing Google account
   - Or create a new Google account if needed

3. **Accept Terms of Service**
   - Review and accept the terms of service
   - Agree to the usage policies

### Generating Your API Key

1. **Access API Keys Section**

   - In Google AI Studio, look for "API Keys" in the navigation
   - Or go directly to the API key management page

2. **Create New Key**

   - Click "Create API Key"
   - Choose "Create API key in new project" (recommended)
   - Or select an existing Google Cloud project

3. **Copy Your Key**
   - Your API key will be displayed once
   - **Important**: Copy it immediately and store it securely
   - You won't be able to see the full key again

### API Key Security

⚠️ **Important Security Notes:**

- Never share your API key publicly
- Don't commit API keys to version control
- Store keys securely (password manager recommended)
- Regenerate keys if compromised
- Monitor your API usage regularly

## 🔧 Configuration in Canvas AI Studio

### Setting Up Your Key

1. **Open Settings Modal**

   - Click the gear icon (⚙️) in the left toolbar
   - The "Настройки API" modal will open

2. **Enter Your Key**

   - Paste your API key in the password field
   - Optionally check "Показать API ключ" to verify
   - Click "Сохранить" to save

3. **Test Connection**
   - The system automatically tests your connection
   - Check the browser console for detailed diagnostics
   - Look for "✅ Модели успешно получены" message

### Troubleshooting Connection Issues

#### Common Error Messages:

**"API key not set"**

- Solution: Enter your API key in settings

**"Invalid API key"**

- Solution: Verify your key is correct and active
- Try regenerating a new key

**"Quota exceeded"**

- Solution: Check your usage limits in Google AI Studio
- Consider upgrading to a paid plan

**"Model not found"**

- Solution: Your key may not have access to required models
- Check available models in the console

## 📊 Understanding API Models

### Available Models

Canvas AI Studio automatically detects available models:

- **gemini-1.5-flash** - Fast, efficient model
- **gemini-1.5-pro** - More capable, slower model
- **gemini-1.0-pro** - Legacy model
- **text-embedding-004** - For embeddings (not used)

### Model Adaptation

The application automatically adapts based on available models:

- **Image Generation Available**: Creates actual images
- **Text Models Only**: Creates detailed image descriptions
- **No Access**: Shows appropriate error messages

## 💰 Pricing and Quotas

### Free Tier

- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 32,000
- **Tokens per day**: 50,000

### Paid Tiers

- Higher rate limits
- More requests per day
- Priority access
- Additional features

### Monitoring Usage

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Check your usage dashboard
3. Monitor quota consumption
4. Set up billing alerts

## 🔍 Diagnostics and Testing

### Browser Console Diagnostics

Open browser developer tools (F12) and look for:

```
🔍 Проверка доступных моделей...
📋 Доступные модели:
- models/gemini-1.5-flash (методы: generateContent)
- models/gemini-1.5-pro (методы: generateContent)
✅ Модели успешно получены
```

### Testing Your Setup

1. **API Connection Test**

   - Save your API key in settings
   - Check for success message
   - Verify in browser console

2. **AI Chat Test**

   - Type a simple message like "привет"
   - Press Ctrl+Enter or click send
   - Check for response

3. **Image Generation Test**
   - Click the magic wand icon (✨)
   - Enter an image description
   - Click "Генерировать"
   - Should create text description

## 🛠️ Advanced Configuration

### Custom Model Selection

Currently, Canvas AI Studio automatically selects the best available model. Future versions may allow manual model selection.

### API Endpoint Configuration

The application uses the standard Google AI endpoint:

```
https://generativelanguage.googleapis.com/v1
```

### Request Configuration

Default settings:

- **Temperature**: 0.7
- **Top K**: 40
- **Top P**: 0.95
- **Max Output Tokens**: 4096

## 🔒 Privacy and Data Handling

### Data Flow

1. **Your Input** → Canvas AI Studio
2. **API Request** → Google Gemini API
3. **AI Response** → Canvas AI Studio
4. **Result** → Your Browser

### Privacy Notes

- API keys stored locally in your browser only
- No data sent to Canvas AI Studio servers
- All communication directly with Google
- No tracking or analytics

### Data Retention

- Google may retain API requests according to their privacy policy
- Local data stays in your browser's localStorage
- No server-side data storage by Canvas AI Studio

## 📞 Support and Resources

### Official Resources

- [Google AI Studio](https://ai.google.dev/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Pricing](https://ai.google.dev/pricing)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)

### Canvas AI Studio Support

- [GitHub Issues](https://github.com/yourusername/canvas-ai-studio/issues)
- [Technical Specification](../Canvas_AI_Studio_Technical_Specification.md)
- Browser console diagnostics

### Common Issues

1. **CORS Errors**: Use HTTPS when possible
2. **Network Issues**: Check firewall/proxy settings
3. **Quota Issues**: Monitor usage in Google AI Studio
4. **Browser Compatibility**: Use modern browsers

---

**Need Help?** Open an issue on GitHub with:

- Your browser and version
- Error messages from console
- Steps you've tried
- Screenshots if helpful
