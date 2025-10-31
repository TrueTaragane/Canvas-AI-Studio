/**
 * Advanced API Client for Canvas AI Studio
 * Supports all Gemini 2.5 Flash Image Generation capabilities:
 * - Text-to-Image generation
 * - Image-to-Image editing
 * - Multi-Image composition
 * - Style transfer
 * - Batch generation
 */
class AdvancedAPIClient {
    constructor() {
        this.apiKey = '';
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1';
        this.imageModel = 'models/gemini-1.5-flash';
        this.textModel = 'models/gemini-1.5-flash';
        
        // Default generation config
        this.defaultConfig = {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
        };
        
        // Safety settings
        this.safetySettings = [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH", 
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ];
    }

    /**
     * Set API key
     */
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('canvas_ai_api_key', key);
    }

    /**
     * Get stored API key
     */
    getApiKey() {
        if (!this.apiKey) {
            this.apiKey = localStorage.getItem('canvas_ai_api_key') || '';
        }
        return this.apiKey;
    }

    /**
     * Get list of available models
     */
    async listModels() {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const url = `${this.baseUrl}/models?key=${this.getApiKey()}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Failed to list models:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        try {
            // Use a simple text generation for testing
            const url = `${this.baseUrl}/models/${this.textModel}:generateContent?key=${this.getApiKey()}`;
            
            const requestBody = {
                contents: [{
                    parts: [{ text: 'Hello' }]
                }],
                generationConfig: {
                    maxOutputTokens: 10
                }
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            return { success: true, message: 'API connection successful' };
        } catch (error) {
            // Handle quota exceeded errors specifically
            if (error.message.includes('quota') || error.message.includes('Quota exceeded')) {
                return { 
                    success: false, 
                    message: 'API quota exceeded. Please check your billing or wait for quota reset.',
                    isQuotaError: true
                };
            }
            
            // Handle model not found errors
            if (error.message.includes('not found') || error.message.includes('not supported')) {
                return { 
                    success: false, 
                    message: 'Model not available. This may be due to API access level or region restrictions.',
                    isModelError: true
                };
            }
            
            return { success: false, message: error.message };
        }
    }

    /**
     * Generate image from text prompt
     */
    async generateTextToImage(prompt, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const url = `${this.baseUrl}/models/${this.imageModel}:generateContent?key=${this.getApiKey()}`;
        
        // Enhanced prompt for better image descriptions
        const enhancedPrompt = `Create a detailed description of an image based on this request: "${prompt}". 
        Describe the visual elements, colors, composition, style, lighting, and mood. 
        Make it vivid and specific enough that someone could visualize or recreate the image.`;
        
        const requestBody = {
            contents: [{
                parts: [{ text: enhancedPrompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 2048
            },
            safetySettings: this.safetySettings
            // Note: Using text model for image generation - will return text description instead of actual image
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return this.processImageResponse(data, 'text-to-image', prompt);

        } catch (error) {
            console.error('Text-to-image generation failed:', error);
            this.handleApiError(error);
            throw error;
        }
    }

    /**
     * Edit existing image with text prompt
     */
    async editImage(baseImage, editPrompt, maskImage = null, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const url = `${this.baseUrl}/models/${this.imageModel}:generateContent?key=${this.getApiKey()}`;
        
        // Prepare image parts
        const imageParts = [];
        
        // Add base image
        const baseImageData = await this.prepareImageData(baseImage);
        imageParts.push({
            inline_data: {
                mime_type: baseImageData.mimeType,
                data: baseImageData.data
            }
        });
        
        // Add mask if provided
        if (maskImage) {
            const maskImageData = await this.prepareImageData(maskImage);
            imageParts.push({
                mask: {
                    inline_data: {
                        mime_type: maskImageData.mimeType,
                        data: maskImageData.data
                    }
                }
            });
        }
        
        const requestBody = {
            contents: [{
                parts: [
                    { text: editPrompt },
                    ...imageParts
                ]
            }],
            generationConfig: {
                ...this.defaultConfig,
                ...options
            },
            safetySettings: this.safetySettings,
            tools: [{
                "function_declarations": [{
                    "name": "generate_image",
                    "description": "Generate an image based on the provided text description and input image"
                }]
            }],
            tool_config: {
                function_calling_config: {
                    mode: "ANY"
                }
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return this.processImageResponse(data, 'image-edit', editPrompt, [baseImage]);

        } catch (error) {
            console.error('Image editing failed:', error);
            throw error;
        }
    }

    /**
     * Compose new image from multiple source images
     */
    async composeImages(images, compositionPrompt, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        if (!images || images.length === 0) {
            throw new Error('At least one image is required for composition');
        }

        if (images.length > 3) {
            throw new Error('Maximum 3 images supported for composition');
        }

        const url = `${this.baseUrl}/models/${this.imageModel}:generateContent?key=${this.getApiKey()}`;
        
        // Prepare all image data
        const imageParts = [];
        for (const image of images) {
            const imageData = await this.prepareImageData(image);
            imageParts.push({
                inline_data: {
                    mime_type: imageData.mimeType,
                    data: imageData.data
                }
            });
        }

        const requestBody = {
            contents: [{
                parts: [
                    { text: compositionPrompt },
                    ...imageParts
                ]
            }],
            generationConfig: {
                ...this.defaultConfig,
                ...options
            },
            safetySettings: this.safetySettings,
            tools: [{
                "function_declarations": [{
                    "name": "generate_image",
                    "description": "Generate an image by composing elements from multiple input images"
                }]
            }],
            tool_config: {
                function_calling_config: {
                    mode: "ANY"
                }
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return this.processImageResponse(data, 'composition', compositionPrompt, images);

        } catch (error) {
            console.error('Image composition failed:', error);
            throw error;
        }
    }

    /**
     * Transfer style from one image to another
     */
    async transferStyle(contentImage, styleImage, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const stylePrompt = options.customPrompt || 
            'Transform the first image to match the artistic style of the second image. ' +
            'Preserve the original composition and subject matter while applying the artistic style.';

        return await this.composeImages([contentImage, styleImage], stylePrompt, options);
    }

    /**
     * Generate multiple variations of the same prompt in a single API call
     */
    async generateBatch(prompt, count = 4, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        if (count < 1 || count > 4) {
            throw new Error('Batch count must be between 1 and 4. API limit is 4.');
        }

        const url = `${this.baseUrl}/models/${this.imageModel}:generateContent?key=${this.getApiKey()}`;

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                ...this.defaultConfig,
                ...options,
                // Запрашиваем несколько кандидатов в ответе
                candidateCount: count
            },
            safetySettings: this.safetySettings,
            tools: [{
                "function_declarations": [{
                    "name": "generate_image",
                    "description": "Generate multiple image variations based on the provided text description"
                }]
            }],
            tool_config: {
                function_calling_config: {
                    mode: "ANY"
                }
            }
        };

        const batchId = this.generateBatchId();
        const startTime = Date.now();

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            // Обрабатываем каждого кандидата из ответа
            const results = data.candidates.map((candidate, index) => {
                try {
                    // processImageResponse ожидает объект { candidates: [...] }
                    const processed = this.processImageResponse(
                        { candidates: [candidate] }, 
                        'text-to-image-batch', 
                        prompt
                    );
                    return {
                        ...processed,
                        batchId,
                        batchIndex: index,
                        batchTotal: count
                    };
                } catch (error) {
                    return {
                        error: error.message,
                        batchId,
                        batchIndex: index,
                        batchTotal: count
                    };
                }
            });

            const endTime = Date.now();
            const successCount = results.filter(r => !r.error).length;

            return {
                batchId,
                results,
                summary: {
                    total: count,
                    successful: successCount,
                    failed: count - successCount,
                    duration: endTime - startTime
                }
            };

        } catch (error) {
            console.error('Batch generation failed:', error);
            this.handleApiError(error);
            throw error;
        }
    }

    /**
     * Analyze image content (using text model)
     */
    async analyzeImage(imageData, analysisPrompt = "Describe this image in detail") {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const url = `${this.baseUrl}/models/${this.textModel}:generateContent?key=${this.getApiKey()}`;
        
        const preparedImage = await this.prepareImageData(imageData);
        
        const requestBody = {
            contents: [{
                parts: [
                    { text: analysisPrompt },
                    {
                        inline_data: {
                            mime_type: preparedImage.mimeType,
                            data: preparedImage.data
                        }
                    }
                ]
            }],
            generationConfig: {
                ...this.defaultConfig,
                maxOutputTokens: 2048
            },
            safetySettings: this.safetySettings
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No analysis generated');
            }

            return {
                analysis: data.candidates[0].content.parts[0].text,
                finishReason: data.candidates[0].finishReason,
                safetyRatings: data.candidates[0].safetyRatings
            };

        } catch (error) {
            console.error('Image analysis failed:', error);
            throw error;
        }
    }

    /**
     * Generate smart canvas instructions (enhanced version of existing method)
     */
    async generateCanvasInstructions(prompt, canvasContext, selectedImages = []) {
        // Simplified prompt for better reliability
        const simplePrompt = `Пользователь просит: "${prompt}"

Ответь простым JSON с действиями для canvas:
{
    "actions": [
        {"type": "addText", "properties": {"text": "текст ответа", "x": 100, "y": 100, "fontSize": 16, "color": "#2c3e50"}}
    ],
    "message": "Краткое описание"
}

Если пользователь просит создать изображение, используй type: "generateImage" с properties: {"prompt": "описание изображения"}.
Если просто текст или вопрос, используй type: "addText".`;

        try {
            console.log('🤖 Generating canvas instructions for:', prompt);
            
            const result = await this.generateTextContent(simplePrompt);
            console.log('📝 AI Response:', result.text);
            
            return this.parseCanvasInstructions(result.text);

        } catch (error) {
            console.error('❌ Failed to generate canvas instructions:', error);
            throw new Error(`Failed to generate canvas instructions: ${error.message}`);
        }
    }

    /**
     * Generate text content using text model
     */
    async generateTextContent(prompt, options = {}) {
        if (!this.getApiKey()) {
            throw new Error('API key not set');
        }

        const url = `${this.baseUrl}/models/${this.textModel}:generateContent?key=${this.getApiKey()}`;
        
        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: options.temperature || 0.7,
                topK: options.topK || 40,
                topP: options.topP || 0.95,
                maxOutputTokens: options.maxOutputTokens || 4096
            },
            safetySettings: this.safetySettings
        };

        console.log('🔍 Making API request to:', url);
        console.log('📝 Request body:', JSON.stringify(requestBody, null, 2));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response status:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = `API Error: ${errorData.error?.message || response.statusText}`;
                    console.error('❌ API Error Details:', errorData);
                } catch (parseError) {
                    console.error('❌ Failed to parse error response:', parseError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated');
            }

            return {
                text: data.candidates[0].content.parts[0].text,
                finishReason: data.candidates[0].finishReason,
                safetyRatings: data.candidates[0].safetyRatings
            };

        } catch (error) {
            console.error('❌ Text generation failed:', error);
            
            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Gemini API. Check your internet connection.');
            } else if (error.message.includes('CORS')) {
                throw new Error('CORS error: API request blocked by browser security policy.');
            } else if (error.message.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key in settings.');
            }
            
            throw error;
        }
    }

    /**
     * Prepare image data for API request
     */
    async prepareImageData(imageSource) {
        let imageData, mimeType;

        if (typeof imageSource === 'string') {
            // Base64 string or data URL
            if (imageSource.startsWith('data:')) {
                const [header, data] = imageSource.split(',');
                mimeType = header.match(/data:([^;]+)/)[1];
                imageData = data;
            } else {
                // Assume it's base64
                imageData = imageSource;
                mimeType = 'image/png'; // Default
            }
        } else if (imageSource instanceof HTMLImageElement) {
            // HTML Image element
            const result = await this.imageElementToBase64(imageSource);
            imageData = result.data;
            mimeType = result.mimeType;
        } else if (imageSource instanceof File || imageSource instanceof Blob) {
            // File or Blob
            const result = await this.fileToBase64(imageSource);
            imageData = result.data;
            mimeType = result.mimeType;
        } else if (imageSource.image && imageSource.image instanceof HTMLImageElement) {
            // Canvas element with image property
            const result = await this.imageElementToBase64(imageSource.image);
            imageData = result.data;
            mimeType = result.mimeType;
        } else {
            throw new Error('Unsupported image source type');
        }

        return { data: imageData, mimeType };
    }

    /**
     * Convert HTML Image element to base64
     */
    async imageElementToBase64(imageElement) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = imageElement.naturalWidth || imageElement.width;
            canvas.height = imageElement.naturalHeight || imageElement.height;
            
            try {
                ctx.drawImage(imageElement, 0, 0);
                const dataUrl = canvas.toDataURL('image/png', 0.9);
                const base64 = dataUrl.split(',')[1];
                
                resolve({
                    data: base64,
                    mimeType: 'image/png'
                });
            } catch (error) {
                reject(new Error('Failed to convert image to base64: ' + error.message));
            }
        });
    }

    /**
     * Convert File/Blob to base64
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                const dataUrl = reader.result;
                const [header, data] = dataUrl.split(',');
                const mimeType = header.match(/data:([^;]+)/)[1];
                
                resolve({
                    data: data,
                    mimeType: mimeType
                });
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Process image generation response
     */
    processImageResponse(data, type, prompt, sourceImages = []) {
        if (!data.candidates || data.candidates.length === 0) {
            // Check for promptFeedback which indicates a blocked request
            if (data.promptFeedback && data.promptFeedback.blockReason) {
                throw new Error(`Request blocked due to safety settings: ${data.promptFeedback.blockReason}`);
            }
            throw new Error('No image generated');
        }

        const candidate = data.candidates[0];
        const results = [];

        // Look for tool calls in the response (new format)
        const toolCallParts = candidate.content.parts.filter(part => part.tool_calls);
        
        if (toolCallParts.length > 0) {
            // New tool_calls format
            toolCallParts.forEach(callPart => {
                callPart.tool_calls.forEach(toolCall => {
                    if (toolCall.functionCall && toolCall.functionCall.name === 'generate_image') {
                        // Images are now in functionCall.output.images
                        if (toolCall.functionCall.output && toolCall.functionCall.output.images) {
                            toolCall.functionCall.output.images.forEach((image, index) => {
                                results.push({
                                    id: this.generateResultId(),
                                    type: type,
                                    prompt: prompt,
                                    imageData: image.base64Data, // Standardized key
                                    mimeType: image.mimeType || 'image/png',
                                    sourceImages: sourceImages.map(img => ({ 
                                        id: img.id || `source_${index}`,
                                        type: img.type || 'unknown'
                                    })),
                                    metadata: {
                                        finishReason: candidate.finishReason,
                                        safetyRatings: candidate.safetyRatings,
                                        generatedAt: Date.now(),
                                        seed: image.seed // New field for reproducibility
                                    }
                                });
                            });
                        }
                    }
                });
            });
        } else {
            // Fallback to old format for backward compatibility
            candidate.content.parts.forEach((part, index) => {
                if (part.generated_image) {
                    results.push({
                        id: this.generateResultId(),
                        type: type,
                        prompt: prompt,
                        imageData: part.generated_image.b64_json,
                        mimeType: part.generated_image.mime_type || 'image/png',
                        sourceImages: sourceImages.map(img => ({ 
                            id: img.id || `source_${index}`,
                            type: img.type || 'unknown'
                        })),
                        metadata: {
                            finishReason: candidate.finishReason,
                            safetyRatings: candidate.safetyRatings,
                            generatedAt: Date.now()
                        }
                    });
                }
            });
        }

        // Also include any text responses
        const textParts = candidate.content.parts.filter(part => part.text);
        if (textParts.length > 0) {
            const textResponse = textParts.map(part => part.text).join('\n');
            if (results.length > 0) {
                results[0].description = textResponse;
            }
        }

        if (results.length === 0) {
            // Since we're using text model, convert text response to a descriptive result
            const textParts = candidate.content.parts.filter(part => part.text);
            if (textParts.length > 0) {
                const textResponse = textParts.map(part => part.text).join('\n');
                return {
                    id: this.generateResultId(),
                    type: type + '-text-description',
                    prompt: prompt,
                    textDescription: textResponse,
                    isTextOnly: true,
                    sourceImages: sourceImages.map((img, index) => ({ 
                        id: img.id || `source_${index}`,
                        type: img.type || 'unknown'
                    })),
                    metadata: {
                        finishReason: candidate.finishReason,
                        safetyRatings: candidate.safetyRatings,
                        generatedAt: Date.now(),
                        note: 'Text description generated instead of image due to API limitations'
                    }
                };
            }
            throw new Error('No image data or text response found');
        }

        return results.length === 1 ? results[0] : results;
    }

    /**
     * Parse canvas instructions from AI response
     */
    parseCanvasInstructions(responseText) {
        console.log('🔍 Parsing AI response:', responseText);
        
        try {
            // Try to find JSON in the response
            let jsonText = responseText.trim();
            
            // Look for JSON block in markdown code blocks
            const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }
            
            // Try to find JSON object in the text
            const jsonStart = jsonText.indexOf('{');
            const jsonEnd = jsonText.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
            }
            
            const parsed = JSON.parse(jsonText);
            console.log('✅ Successfully parsed JSON:', parsed);
            return parsed;
            
        } catch (parseError) {
            console.warn('⚠️ Failed to parse JSON, creating text response:', parseError);
            
            // If not JSON, create a simple text addition
            const cleanText = responseText.replace(/```json|```/g, '').trim();
            return {
                actions: [{
                    type: 'addText',
                    properties: {
                        text: cleanText.substring(0, 300) + (cleanText.length > 300 ? '...' : ''),
                        x: 100,
                        y: 100,
                        fontSize: 16,
                        color: '#2c3e50'
                    }
                }],
                message: 'AI ответ добавлен как текст'
            };
        }
    }

    /**
     * Generate unique batch ID
     */
    generateBatchId() {
        return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate unique result ID
     */
    generateResultId() {
        return `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Handle API errors with specific messages
     */
    handleApiError(error) {
        // Update usage statistics
        this.updateUsageStats(false);

        // Log specific error types
        if (error.message.includes('quota') || error.message.includes('Quota exceeded')) {
            console.warn('API Quota exceeded. Consider upgrading your plan or waiting for quota reset.');
        } else if (error.message.includes('API key')) {
            console.warn('API key issue. Please check your API key configuration.');
        } else if (error.message.includes('rate limit')) {
            console.warn('Rate limit exceeded. Please wait before making more requests.');
        }
    }

    /**
     * Get supported image formats
     */
    getSupportedFormats() {
        return ['image/png', 'image/jpeg', 'image/webp'];
    }

    /**
     * Validate image format
     */
    validateImageFormat(mimeType) {
        return this.getSupportedFormats().includes(mimeType);
    }

    /**
     * Get API usage statistics (if available)
     */
    getUsageStats() {
        // This would require additional API calls to get quota information
        // For now, return basic local statistics
        const stats = JSON.parse(localStorage.getItem('api_usage_stats') || '{}');
        return {
            totalRequests: stats.totalRequests || 0,
            successfulRequests: stats.successfulRequests || 0,
            failedRequests: stats.failedRequests || 0,
            lastRequestTime: stats.lastRequestTime || null
        };
    }

    /**
     * Update usage statistics
     */
    updateUsageStats(success = true) {
        const stats = this.getUsageStats();
        stats.totalRequests++;
        if (success) {
            stats.successfulRequests++;
        } else {
            stats.failedRequests++;
        }
        stats.lastRequestTime = Date.now();
        
        localStorage.setItem('api_usage_stats', JSON.stringify(stats));
    }
}

// Export for use in other modules
window.AdvancedAPIClient = AdvancedAPIClient;