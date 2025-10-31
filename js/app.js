// Main Application for Canvas AI Studio

class CanvasAIStudio {
    constructor() {
        this.canvasEngine = null;
        this.currentTool = 'select';
        this.projectName = 'Проект без названия';
        
        // Initialize Advanced API Client
        this.apiClient = new AdvancedAPIClient();
        
        // AI Chat state
        this.selectedImagesForAI = new Map(); // elementId -> imageData
        this.contextMenuTarget = null;
        this.contextMenuUpdateTimeout = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('🎨 Canvas AI Studio starting...');
        
        // Initialize canvas engine
        const canvas = document.getElementById('mainCanvas');
        const canvasContainer = document.getElementById('canvasContainer');
        
        if (!canvas) {
            console.error('Canvas element not found');
            if (canvasContainer) {
                canvasContainer.classList.add('error');
            }
            return;
        }
        
        // Check canvas support
        if (!canvas.getContext) {
            console.error('Canvas not supported');
            if (canvasContainer) {
                canvasContainer.classList.add('error');
            }
            return;
        }
        
        try {
            // Show loading state
            if (canvasContainer) {
                canvasContainer.classList.add('loading');
            }
            
            this.canvasEngine = new CanvasEngine(canvas);
            
            // Remove loading state
            if (canvasContainer) {
                canvasContainer.classList.remove('loading');
            }
            
            // Setup UI event listeners
            this.setupUIEventListeners();
            
            // Load saved data
            this.loadFromStorage();
            
            // Setup auto-save
            this.setupAutoSave();
            
            console.log('✅ Canvas AI Studio initialized');
            
            // Welcome message removed - UI is self-explanatory
            
        } catch (error) {
            console.error('Failed to initialize canvas engine:', error);
            if (canvasContainer) {
                canvasContainer.classList.remove('loading');
                canvasContainer.classList.add('error');
            }
            showNotification('Не удалось инициализировать холст. Пожалуйста, обновите страницу.', 'error');
        }
    }

    /**
     * Setup UI event listeners
     */
    setupUIEventListeners() {
        // Toolbar buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = btn.dataset.tool;
                if (tool) {
                    this.setActiveTool(tool);
                } else {
                    // Handle special buttons
                    const id = btn.id;
                    switch (id) {
                        case 'generateImageBtn':
                            this.openImageGenerationModal();
                            break;
                        case 'settingsBtn':
                            this.openAPISettings();
                            break;
                    }
                }
            });
        });
        
        // Project title
        const projectTitle = document.getElementById('projectTitle');
        if (projectTitle) {
            projectTitle.addEventListener('input', (e) => {
                this.projectName = e.target.value || 'Проект без названия';
                this.saveToStorage();
            });
            
            projectTitle.addEventListener('blur', () => {
                if (!projectTitle.value.trim()) {
                    projectTitle.value = 'Проект без названия';
                    this.projectName = 'Проект без названия';
                }
            });
        }
        
        // File input for images
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyDown(e);
        });
        
        // AI Chat functionality
        this.setupAIChat();
        
        // Image selection and context menu
        this.setupImageInteraction();
        
        // Zoom controls
        this.setupZoomControls();
        
        // Prevent default drag behavior on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
        
        // Canvas drag and drop
        const canvasContainer = document.getElementById('canvasContainer');
        if (canvasContainer) {
            canvasContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                canvasContainer.classList.add('drag-over');
            });
            
            canvasContainer.addEventListener('dragleave', (e) => {
                if (!canvasContainer.contains(e.relatedTarget)) {
                    canvasContainer.classList.remove('drag-over');
                }
            });
            
            canvasContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                canvasContainer.classList.remove('drag-over');
                
                const files = Array.from(e.dataTransfer.files).filter(file => 
                    file.type.startsWith('image/')
                );
                
                if (files.length > 0) {
                    this.handleFileUpload(files);
                }
            });
        }
    }

    /**
     * Set active tool
     */
    setActiveTool(tool) {
        this.currentTool = tool;
        
        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Handle tool-specific actions
        switch (tool) {
            case 'image':
                this.addImage();
                break;
            case 'text':
                this.addText();
                break;
        }
        
        // Reset to select tool after action
        if (tool !== 'select') {
            setTimeout(() => this.setActiveTool('select'), 100);
        }
    }

    /**
     * Add image to canvas
     */
    addImage() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }

    /**
     * Add text to canvas
     */
    addText() {
        const center = this.canvasEngine.getCanvasCenter();
        const textElement = new TextElement(center.x - 50, center.y - 15, 'Добавьте ваш текст');
        
        this.canvasEngine.addElement(textElement);
        this.canvasEngine.selectElement(textElement.id);
        this.saveToStorage();
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                showNotification(`Пропускаем ${file.name}: не является файлом изображения`, 'warning');
                continue;
            }
            
            try {
                const image = await loadImageFromFile(file);
                const center = this.canvasEngine.getCanvasCenter();
                
                // Offset multiple images
                const offset = this.canvasEngine.getAllElements().length * 20;
                const imageElement = new ImageElement(
                    center.x - image.width / 2 + offset,
                    center.y - image.height / 2 + offset,
                    image
                );
                
                this.canvasEngine.addElement(imageElement);
                this.canvasEngine.selectElement(imageElement.id);
            } catch (error) {
                console.error('Failed to load image:', error);
                showNotification(`Не удалось загрузить ${file.name}`, 'error');
            }
        }
        
        this.saveToStorage();
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyDown(event) {
        // Don't handle shortcuts when typing in inputs or AI chat
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            // Allow Ctrl+Enter in AI chat
            if (event.target.id === 'aiPromptInput' && event.key === 'Enter' && event.ctrlKey) {
                return; // Let AI chat handle this
            }
            return;
        }
        
        switch (event.key.toLowerCase()) {
            case 'v':
                if (!event.ctrlKey) {
                    this.setActiveTool('select');
                }
                break;
            case 't':
                if (!event.ctrlKey) {
                    this.setActiveTool('text');
                }
                break;
            case 's':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.saveProject();
                }
                break;
            case 'o':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.openProject();
                }
                break;
            case '0':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.canvasEngine.resetZoom();
                }
                break;
            case '1':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.canvasEngine.fitToScreen();
                }
                break;
            case 'arrowup':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.canvasEngine.zoomIn();
                }
                break;
            case 'arrowdown':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.canvasEngine.zoomOut();
                }
                break;
            case '/':
                // Focus AI chat input
                event.preventDefault();
                const promptInput = document.getElementById('aiPromptInput');
                if (promptInput) {
                    promptInput.focus();
                }
                break;
        }
    }

    /**
     * Открыть модальное окно настроек API
     */
    openAPISettings() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="apiModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Настройки API</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="apiKeyInput">Ключ Gemini API:</label>
                            <input type="password" id="apiKeyInput" placeholder="Введите ваш ключ Gemini API" value="${this.apiClient.getApiKey()}">
                            <small>Получите ключ API на <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a></small>
                            <small style="display: block; margin-top: 5px; color: #f39c12;">
                                ⚠️ Бесплатный план имеет ограничения. При превышении квоты рассмотрите 
                                <a href="https://ai.google.dev/pricing" target="_blank">платный план</a>.
                            </small>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="showApiKey"> Показать API ключ
                            </label>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-info" onclick="window.open('https://ai.dev/usage?tab=rate-limit', '_blank')" style="margin-right: 10px;">
                            Проверить квоту
                        </button>
                        <button class="btn btn-primary" onclick="app.saveAPIKey()">Сохранить</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles if not already present
        if (!document.getElementById('modalStyles')) {
            const styles = document.createElement('style');
            styles.id = 'modalStyles';
            styles.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e1e5e9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-header h3 {
                    margin: 0;
                    color: #2c3e50;
                }
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #6c757d;
                }
                .modal-body {
                    padding: 20px;
                }
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #e1e5e9;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #2c3e50;
                }
                .form-group input[type="text"],
                .form-group input[type="password"] {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #e1e5e9;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .form-group small {
                    color: #6c757d;
                    font-size: 12px;
                }
                .form-group small a {
                    color: #3498db;
                }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .btn-primary {
                    background: #3498db;
                    color: white;
                }
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                .btn-info {
                    background: #17a2b8;
                    color: white;
                }
            `;
            document.head.appendChild(styles);
        }
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup modal event listeners
        const showCheckbox = document.getElementById('showApiKey');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        showCheckbox.addEventListener('change', () => {
            apiKeyInput.type = showCheckbox.checked ? 'text' : 'password';
        });
        
        // Focus on input
        apiKeyInput.focus();
    }

    /**
     * Save API key
     */
    saveAPIKey() {
        const apiKeyInput = document.getElementById('apiKeyInput');
        if (apiKeyInput) {
            const newApiKey = apiKeyInput.value.trim();
            this.apiClient.setApiKey(newApiKey);
            
            // Close modal
            const modal = document.getElementById('apiModal');
            if (modal) {
                modal.remove();
            }
            
            // Test connection if key is provided
            if (newApiKey) {
                this.testAPIConnection();
            }
        }
    }

    /**
     * Check available models for diagnostics
     */
    async checkAvailableModels() {
        try {
            console.log("🔍 Проверка доступных моделей...");
            const models = await this.apiClient.listModels();
            
            console.log("📋 Доступные модели:");
            models.forEach(model => {
                console.log(`- ${model.name} (методы: ${model.supportedGenerationMethods?.join(', ') || 'не указаны'})`);
            });
            
            // Найти подходящие модели
            const imageModels = models.filter(m => 
                m.name.includes('image') && 
                m.supportedGenerationMethods?.includes('generateContent')
            );
            
            const textModels = models.filter(m => 
                (m.name.includes('flash') || m.name.includes('pro')) && 
                m.supportedGenerationMethods?.includes('generateContent') &&
                !m.name.includes('image')
            );
            
            console.log("🖼️ Модели для изображений:", imageModels.map(m => m.name));
            console.log("📝 Модели для текста:", textModels.map(m => m.name));
            
            return { imageModels, textModels, allModels: models };
            
        } catch (error) {
            console.error("❌ Не удалось получить список моделей:", error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testAPIConnection() {
        try {
            showNotification('Проверка соединения с API...', 'info', 2000);
            
            // Сначала проверим доступные модели
            try {
                const modelInfo = await this.checkAvailableModels();
                console.log('✅ Модели успешно получены');
            } catch (modelError) {
                console.warn('⚠️ Не удалось получить список моделей, но продолжаем тест:', modelError.message);
            }
            
            const result = await this.apiClient.testConnection();
            
            if (result.success) {
                showNotification('Соединение с API успешно!', 'success', 3000);
            } else {
                // Handle quota errors specifically
                if (result.isQuotaError) {
                    showNotification(
                        'Превышена квота API. Проверьте план подписки или дождитесь сброса лимитов. ' +
                        'Подробности: https://ai.google.dev/gemini-api/docs/rate-limits', 
                        'warning', 
                        8000
                    );
                } else if (result.isModelError) {
                    showNotification(
                        'Модель недоступна. Проверьте консоль браузера для списка доступных моделей.', 
                        'warning', 
                        6000
                    );
                } else {
                    showNotification(`Тест API не прошел: ${result.message}`, 'error', 5000);
                }
            }
        } catch (error) {
            console.error('API test failed:', error);
            showNotification(`Тест API не прошел: ${error.message}`, 'error', 5000);
        }
    }

    /**
     * Save project
     */
    saveProject() {
        const projectData = {
            name: this.projectName,
            canvas: this.canvasEngine.toJSON(),
            savedAt: Date.now()
        };
        
        // Create download
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.projectName.replace(/[^a-z0-9]/gi, '_')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Project exported silently
    }

    /**
     * Open project
     */
    openProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const projectData = JSON.parse(text);
                
                // Load project
                this.projectName = projectData.name || 'Импортированный проект';
                document.getElementById('projectTitle').value = this.projectName;
                
                if (projectData.canvas) {
                    await this.canvasEngine.fromJSON(projectData.canvas);
                }
                
                this.saveToStorage();
                // Project loaded silently
            } catch (error) {
                console.error('Failed to load project:', error);
                showNotification('Не удалось загрузить проект', 'error');
            }
        };
        
        input.click();
    }

    /**
     * Save to local storage
     */
    saveToStorage() {
        const data = {
            projectName: this.projectName,
            canvas: this.canvasEngine.toJSON(),
            lastSaved: Date.now()
        };
        
        Storage.set('canvas_ai_studio_project', data);
    }

    /**
     * Load from local storage
     */
    async loadFromStorage() {
        // API key is handled by apiClient automatically
        
        // Load project
        const projectData = Storage.get('canvas_ai_studio_project');
        if (projectData) {
            this.projectName = projectData.projectName || 'Проект без названия';
            document.getElementById('projectTitle').value = this.projectName;
            
            if (projectData.canvas) {
                try {
                    await this.canvasEngine.fromJSON(projectData.canvas);
                } catch (error) {
                    console.error('Failed to restore project:', error);
                }
            }
        }
    }

    /**
     * Setup auto-save
     */
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveToStorage();
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    /**
     * Setup AI Chat functionality
     */
    setupAIChat() {
        const promptInput = document.getElementById('aiPromptInput');
        const sendBtn = document.getElementById('sendPromptBtn');
        const chatStatus = document.getElementById('chatStatus');
        
        if (!promptInput || !sendBtn) return;
        
        // Auto-resize textarea
        promptInput.addEventListener('input', () => {
            promptInput.style.height = 'auto';
            promptInput.style.height = Math.min(promptInput.scrollHeight, 120) + 'px';
        });
        
        // Send on Ctrl+Enter
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.sendAIPrompt();
            }
        });
        
        // Send button click
        sendBtn.addEventListener('click', () => {
            this.sendAIPrompt();
        });
        
        // Focus input on load
        setTimeout(() => promptInput.focus(), 100);
    }

    /**
     * Send AI prompt
     */
    async sendAIPrompt() {
        const promptInput = document.getElementById('aiPromptInput');
        const sendBtn = document.getElementById('sendPromptBtn');
        const chatStatus = document.getElementById('chatStatus');
        
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showNotification('Пожалуйста, введите запрос', 'warning');
            return;
        }
        
        if (!this.apiClient.getApiKey()) {
            showNotification('Пожалуйста, установите API ключ в настройках', 'warning');
            this.openAPISettings();
            return;
        }
        
        try {
            // Show loading state
            sendBtn.disabled = true;
            chatStatus.textContent = 'Генерация...';
            chatStatus.className = 'chat-status visible generating';
            
            // Get canvas context for AI
            const canvasContext = this.getCanvasContext();
            
            // Call AI API
            const result = await this.callGeminiAPI(prompt, canvasContext);
            
            // Process result
            await this.processAIResult(result);
            
            // Clear input
            promptInput.value = '';
            promptInput.style.height = 'auto';
            
            // Show success
            chatStatus.textContent = 'Успешно сгенерировано!';
            chatStatus.className = 'chat-status visible success';
            
            setTimeout(() => {
                chatStatus.className = 'chat-status';
            }, 3000);
            
        } catch (error) {
            console.error('AI generation failed:', error);
            
            // Handle quota errors specifically
            if (error.message.includes('quota') || error.message.includes('Quota exceeded')) {
                chatStatus.textContent = 'Превышена квота API. Проверьте план подписки.';
                showNotification(
                    'Превышена квота API. Обновите план подписки или дождитесь сброса лимитов.',
                    'warning',
                    6000
                );
            } else {
                chatStatus.textContent = 'Генерация не удалась: ' + error.message;
                showNotification('Генерация ИИ не удалась', 'error');
            }
            
            chatStatus.className = 'chat-status visible error';
            
            setTimeout(() => {
                chatStatus.className = 'chat-status';
            }, 5000);
        } finally {
            sendBtn.disabled = false;
        }
    }

    /**
     * Get canvas context for AI
     */
    getCanvasContext() {
        const elements = this.canvasEngine.getAllElements();
        const selectedElements = this.canvasEngine.getSelectedElements();
        
        return {
            totalElements: elements.length,
            selectedElements: selectedElements.length,
            elementTypes: elements.map(el => el.type),
            canvasSize: {
                width: this.canvasEngine.canvas.width,
                height: this.canvasEngine.canvas.height
            },
            hasImages: elements.some(el => el.type === 'image'),
            hasText: elements.some(el => el.type === 'text'),
            selectedImagesCount: this.selectedImagesForAI.size
        };
    }

    /**
     * Call Gemini API with enhanced capabilities
     */
    async callGeminiAPI(prompt, context) {
        // Prepare selected images for API
        const selectedImages = [];
        for (const [elementId, imageData] of this.selectedImagesForAI) {
            try {
                const element = imageData.element;
                if (element && element.image) {
                    selectedImages.push(element);
                }
            } catch (error) {
                console.warn(`Failed to process image ${elementId}:`, error);
            }
        }

        return await this.apiClient.generateCanvasInstructions(prompt, context, selectedImages);
    }

    /**
     * Process AI result with enhanced actions
     */
    async processAIResult(result) {
        if (!result.actions || !Array.isArray(result.actions)) {
            throw new Error('Invalid AI response format');
        }
        
        for (const action of result.actions) {
            try {
                switch (action.type) {
                    case 'addText':
                        this.addAIText(action.properties);
                        break;
                        
                    case 'generateImage':
                        await this.generateImageFromAI(action.properties);
                        break;
                        
                    case 'editImage':
                        await this.editImageFromAI(action.properties);
                        break;
                        
                    case 'composeImages':
                        await this.composeImagesFromAI(action.properties);
                        break;
                        
                    case 'addImage':
                        showNotification(`ИИ предлагает добавить: ${action.description}`, 'info', 8000);
                        break;
                        
                    case 'modifyElement':
                        this.modifySelectedElements(action.properties);
                        break;
                        
                    case 'removeBackground':
                        if (action.properties && action.properties.elementIds) {
                            for (const id of action.properties.elementIds) {
                                const element = this.canvasEngine.getElement(id);
                                if (element) await this.removeImageBackground(element);
                            }
                        }
                        break;
                        
                    case 'createLayout':
                        this.createLayout(action.properties);
                        break;
                        
                    case 'applyStyle':
                        this.applyStyle(action.properties);
                        break;
                        
                    case 'generateSimilar':
                        showNotification(`ИИ предлагает: ${action.description}`, 'info', 8000);
                        break;
                        
                    default:
                        console.warn('Unknown action type:', action.type);
                }
            } catch (error) {
                console.error(`Failed to execute action ${action.type}:`, error);
                showNotification(`Не удалось выполнить ${action.type}: ${error.message}`, 'error', 4000);
            }
        }
        
        if (result.message) {
            showNotification(result.message, 'success', 3000);
        }
        
        this.saveToStorage();
    }

    /**
     * Add AI generated text
     */
    addAIText(properties) {
        const center = this.canvasEngine.getCanvasCenter();
        const textElement = new TextElement(
            properties.x || center.x - 50,
            properties.y || center.y - 15,
            properties.text || 'Текст, созданный ИИ'
        );
        
        if (properties.fontSize) textElement.fontSize = properties.fontSize;
        if (properties.color) textElement.color = properties.color;
        
        this.canvasEngine.addElement(textElement);
        this.canvasEngine.selectElement(textElement.id);
    }

    /**
     * Modify selected elements
     */
    modifySelectedElements(properties) {
        const selectedElements = this.canvasEngine.getSelectedElements();
        
        selectedElements.forEach(element => {
            if (properties.text && element.type === 'text') {
                element.text = properties.text;
            }
            if (properties.fontSize && element.fontSize !== undefined) {
                element.fontSize = properties.fontSize;
            }
            if (properties.color && element.color !== undefined) {
                element.color = properties.color;
            }
            if (properties.x !== undefined) {
                element.x = properties.x;
            }
            if (properties.y !== undefined) {
                element.y = properties.y;
            }
        });
        
        this.canvasEngine.needsRedraw = true;
    }

    /**
     * Setup image interaction (selection for AI chat)
     */
    setupImageInteraction() {
        // Override canvas engine element selection to handle AI chat
        const originalSelectElement = this.canvasEngine.selectElement.bind(this.canvasEngine);
        const originalClearSelection = this.canvasEngine.clearSelection.bind(this.canvasEngine);
        
        this.canvasEngine.selectElement = (id, multiSelect = false) => {
            originalSelectElement(id, multiSelect);
            
            // Check if selected element is an image
            const element = this.canvasEngine.getElement(id);
            if (element && element.type === 'image') {
                this.addImageToAIChat(element);
                this.showImageContextMenu(element);
            } else {
                // Hide context menu if selecting non-image element
                this.hideImageContextMenu();
            }
        };

        this.canvasEngine.clearSelection = () => {
            originalClearSelection();
            this.hideImageContextMenu();
        };

        // Context menu item handlers
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.context-menu-item');
            if (menuItem && this.contextMenuTarget) {
                const action = menuItem.dataset.action;
                this.handleImageContextAction(action, this.contextMenuTarget);
                // Don't hide menu after action - keep it visible while image is selected
            }
        });
    }

    /**
     * Add image to AI chat area
     */
    addImageToAIChat(element) {
        if (!element.image) return;

        const imageData = {
            id: element.id,
            src: element.image.src,
            element: element
        };

        this.selectedImagesForAI.set(element.id, imageData);
        this.updateAIImagesDisplay();
    }

    /**
     * Remove image from AI chat area
     */
    removeImageFromAIChat(elementId) {
        this.selectedImagesForAI.delete(elementId);
        this.updateAIImagesDisplay();
    }

    /**
     * Clear all selected images from AI chat
     */
    clearAIImages() {
        this.selectedImagesForAI.clear();
        this.updateAIImagesDisplay();
    }

    /**
     * Update AI images display
     */
    updateAIImagesDisplay() {
        const imagesArea = document.getElementById('aiImagesArea');
        const imagesGrid = document.getElementById('aiImagesGrid');
        
        if (this.selectedImagesForAI.size === 0) {
            imagesArea.style.display = 'none';
            return;
        }

        imagesArea.style.display = 'block';
        imagesGrid.innerHTML = '';

        this.selectedImagesForAI.forEach((imageData, elementId) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'ai-image-item';
            imageItem.dataset.elementId = elementId;

            imageItem.innerHTML = `
                <img src="${imageData.src}" alt="Selected image">
                <button class="ai-image-remove" onclick="app.removeImageFromAIChat('${elementId}')">×</button>
            `;

            // Click to select/deselect
            imageItem.addEventListener('click', (e) => {
                if (!e.target.classList.contains('ai-image-remove')) {
                    imageItem.classList.toggle('selected');
                    // Focus on the corresponding canvas element
                    this.canvasEngine.selectElement(elementId);
                }
            });

            imagesGrid.appendChild(imageItem);
        });
    }

    /**
     * Show image context menu
     */
    showImageContextMenu(element) {
        const contextMenu = document.getElementById('imageContextMenu');
        const wasVisible = contextMenu.classList.contains('visible');
        this.contextMenuTarget = element;

        // Position menu above the selected element
        const bounds = element.getBounds();
        const screenPos = this.canvasEngine.viewport.worldToScreen(bounds.x, bounds.y);
        
        contextMenu.style.display = 'flex';
        
        // Position above the element, centered horizontally
        const menuWidth = 140; // Approximate width of horizontal menu
        const centerX = screenPos.x + (bounds.width * this.canvasEngine.viewport.zoom) / 2;
        const left = Math.max(10, Math.min(centerX - menuWidth / 2, window.innerWidth - menuWidth - 10));
        const top = Math.max(10, screenPos.y - 50);
        
        contextMenu.style.left = left + 'px';
        contextMenu.style.top = top + 'px';

        // Only trigger animation if menu wasn't already visible
        if (!wasVisible) {
            requestAnimationFrame(() => {
                contextMenu.classList.add('visible');
            });
        }

        // Menu stays visible while element is selected - no auto-hide
    }

    /**
     * Hide image context menu
     */
    hideImageContextMenu() {
        const contextMenu = document.getElementById('imageContextMenu');
        contextMenu.classList.remove('visible');
        
        // Clear any pending updates
        if (this.contextMenuUpdateTimeout) {
            clearTimeout(this.contextMenuUpdateTimeout);
            this.contextMenuUpdateTimeout = null;
        }
        
        // Hide after animation completes
        setTimeout(() => {
            if (!contextMenu.classList.contains('visible')) {
                contextMenu.style.display = 'none';
            }
        }, 200);
        
        this.contextMenuTarget = null;
    }

    /**
     * Update context menu position (call when viewport changes)
     */
    updateContextMenuPosition() {
        if (this.contextMenuTarget) {
            // Throttle updates to avoid too frequent calls
            if (!this.contextMenuUpdateTimeout) {
                this.contextMenuUpdateTimeout = setTimeout(() => {
                    if (this.contextMenuTarget) {
                        this.showImageContextMenu(this.contextMenuTarget);
                    }
                    this.contextMenuUpdateTimeout = null;
                }, 16); // ~60fps
            }
        }
    }

    /**
     * Handle image context menu actions
     */
    async handleImageContextAction(action, element) {
        switch (action) {
            case 'removeBackground':
                await this.removeImageBackground(element);
                break;
            case 'regenerate':
                await this.regenerateImage(element);
                break;
            case 'copy':
                this.copyImage(element);
                break;
        }
    }

    /**
     * Remove background from image using AI
     */
    async removeImageBackground(element) {
        if (!this.apiClient.getApiKey()) {
            showNotification('Пожалуйста, установите API ключ в настройках', 'warning');
            this.openAPISettings();
            return;
        }

        try {
            showNotification('Удаление фона...', 'info', 2000);
            
            if (!element.image) {
                throw new Error('No image data available');
            }

            // Use AI to remove background
            const editPrompt = 'Remove the background from this image, keeping only the main subject. ' +
                              'Make the background transparent or white. Preserve all details of the main subject.';
            
            const result = await this.apiClient.editImage(element, editPrompt);
            
            // Create new image element with the result
            const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
            const imageElement = new ImageElement(
                element.x + 20, // Offset slightly
                element.y + 20,
                newImage
            );
            
            this.canvasEngine.addElement(imageElement);
            this.canvasEngine.selectElement(imageElement.id);
            this.saveToStorage();
            
            showNotification('Фон успешно удален!', 'success', 3000);
            
        } catch (error) {
            console.error('Background removal failed:', error);
            showNotification(`Не удалось удалить фон: ${error.message}`, 'error', 5000);
        }
    }

    /**
     * Regenerate image based on current image
     */
    async regenerateImage(element) {
        if (!this.apiClient.getApiKey()) {
            showNotification('Пожалуйста, установите API ключ в настройках', 'warning');
            this.openAPISettings();
            return;
        }

        try {
            showNotification('Анализ изображения для создания вариаций...', 'info', 2000);
            
            if (!element.image) {
                throw new Error('No image data available');
            }

            // First analyze the image to understand its content
            const analysis = await this.apiClient.analyzeImage(element, 
                'Describe this image in detail including style, colors, composition, and main elements. ' +
                'Suggest variations that would maintain the same essence but with different details.'
            );

            // Generate variations based on the analysis
            const variationPrompt = `Create a similar image with variations based on this analysis: ${analysis.analysis}. ` +
                                  'Maintain the same style and composition but add creative variations in details, colors, or elements.';

            const result = await this.apiClient.editImage(element, variationPrompt);

            // Create new image element with the result
            const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
            const imageElement = new ImageElement(
                element.x + 30, // Offset to show it's a variation
                element.y + 30,
                newImage
            );
            
            this.canvasEngine.addElement(imageElement);
            this.canvasEngine.selectElement(imageElement.id);
            this.saveToStorage();
            
            showNotification('Вариация изображения успешно создана!', 'success', 3000);
            
        } catch (error) {
            console.error('Image regeneration failed:', error);
            showNotification(`Не удалось перегенерировать изображение: ${error.message}`, 'error', 5000);
        }
    }

    /**
     * Copy (clone) image element
     */
    copyImage(element) {
        const cloned = element.clone();
        this.canvasEngine.addElement(cloned);
        this.canvasEngine.selectElement(cloned.id);
        
        this.saveToStorage();
    }

    /**
     * Setup zoom controls
     */
    setupZoomControls() {
        const zoomDisplay = document.getElementById('zoomDisplay');
        const zoomDropdown = document.getElementById('zoomDropdown');
        
        if (!zoomDisplay || !zoomDropdown) return;
        
        // Toggle dropdown on click
        zoomDisplay.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = zoomDropdown.style.display !== 'none';
            zoomDropdown.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.updateZoomDropdownSelection();
            }
        });
        
        // Handle zoom level selection
        zoomDropdown.addEventListener('click', (e) => {
            const btn = e.target.closest('.zoom-level-btn');
            if (btn) {
                const zoomLevel = parseFloat(btn.dataset.zoom);
                const center = { 
                    x: this.canvasEngine.canvas.width / 2, 
                    y: this.canvasEngine.canvas.height / 2 
                };
                this.canvasEngine.viewport.setZoom(zoomLevel, center.x, center.y);
                this.canvasEngine.viewport.updateZoomIndex();
                this.canvasEngine.needsRedraw = true;
                this.canvasEngine.updateZoomDisplay();
                zoomDropdown.style.display = 'none';
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.zoom-controls')) {
                zoomDropdown.style.display = 'none';
            }
        });
    }

    /**
     * Update zoom dropdown selection
     */
    updateZoomDropdownSelection() {
        const currentZoom = this.canvasEngine.viewport.zoom;
        const buttons = document.querySelectorAll('.zoom-level-btn');
        
        buttons.forEach(btn => {
            const zoomLevel = parseFloat(btn.dataset.zoom);
            btn.classList.toggle('active', Math.abs(zoomLevel - currentZoom) < 0.01);
        });
    }

    /**
     * Generate image from AI prompt
     */
    async generateImageFromAI(properties) {
        const { prompt, style = 'general', aspectRatio = '1:1', quality = 'standard' } = properties;
        
        showNotification('Генерация изображения...', 'info', 2000);
        
        const options = {
            temperature: quality === 'ultra' ? 0.9 : quality === 'high' ? 0.8 : 0.7
        };
        
        const result = await this.apiClient.generateTextToImage(prompt, options);
        
        // Create image element from result
        const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
        const center = this.canvasEngine.getCanvasCenter();
        
        const imageElement = new ImageElement(
            center.x - newImage.width / 2,
            center.y - newImage.height / 2,
            newImage
        );
        
        this.canvasEngine.addElement(imageElement);
        this.canvasEngine.selectElement(imageElement.id);
    }

    /**
     * Edit image from AI instructions
     */
    async editImageFromAI(properties) {
        const { elementId, editPrompt, preserveStyle = true } = properties;
        
        const element = this.canvasEngine.getElement(elementId);
        if (!element || element.type !== 'image') {
            throw new Error('Image element not found');
        }
        
        showNotification('Редактирование изображения...', 'info', 2000);
        
        const fullPrompt = preserveStyle ? 
            `${editPrompt}. Maintain the original style, lighting, and composition.` : 
            editPrompt;
        
        const result = await this.apiClient.editImage(element, fullPrompt);
        
        // Create new image element with the result
        const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
        const imageElement = new ImageElement(
            element.x + 20,
            element.y + 20,
            newImage
        );
        
        this.canvasEngine.addElement(imageElement);
        this.canvasEngine.selectElement(imageElement.id);
    }

    /**
     * Compose images from AI instructions
     */
    async composeImagesFromAI(properties) {
        const { elementIds, compositionPrompt } = properties;
        
        const elements = elementIds.map(id => this.canvasEngine.getElement(id))
                                  .filter(el => el && el.type === 'image');
        
        if (elements.length === 0) {
            throw new Error('No valid image elements found for composition');
        }
        
        showNotification('Композиция изображений...', 'info', 2000);
        
        const result = await this.apiClient.composeImages(elements, compositionPrompt);
        
        // Create new image element with the result
        const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
        const center = this.canvasEngine.getCanvasCenter();
        
        const imageElement = new ImageElement(
            center.x - newImage.width / 2,
            center.y - newImage.height / 2,
            newImage
        );
        
        this.canvasEngine.addElement(imageElement);
        this.canvasEngine.selectElement(imageElement.id);
    }

    /**
     * Create Image element from base64 data
     */
    async createImageFromBase64(base64Data, mimeType = 'image/png') {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error('Failed to load generated image'));
            };
            
            img.src = `data:${mimeType};base64,${base64Data}`;
        });
    }

    /**
     * Create layout with multiple elements
     */
    createLayout(properties) {
        const { elements = [], layout = 'grid', spacing = 20 } = properties;
        const canvasCenter = this.canvasEngine.getCanvasCenter();
        
        elements.forEach((elementData, index) => {
            let x, y;
            
            if (layout === 'grid') {
                const cols = Math.ceil(Math.sqrt(elements.length));
                const col = index % cols;
                const row = Math.floor(index / cols);
                x = canvasCenter.x - 150 + (col * (100 + spacing));
                y = canvasCenter.y - 100 + (row * (80 + spacing));
            } else if (layout === 'vertical') {
                x = canvasCenter.x - 50;
                y = canvasCenter.y - 100 + (index * (60 + spacing));
            } else { // horizontal
                x = canvasCenter.x - 150 + (index * (100 + spacing));
                y = canvasCenter.y;
            }
            
            if (elementData.type === 'text') {
                const textElement = new TextElement(x, y, elementData.text || 'Пример текста');
                if (elementData.fontSize) textElement.fontSize = elementData.fontSize;
                if (elementData.color) textElement.color = elementData.color;
                this.canvasEngine.addElement(textElement);
            }
        });
        
        this.canvasEngine.needsRedraw = true;
    }

    /**
     * Apply styling to selected elements
     */
    applyStyle(properties) {
        const { elementIds, style } = properties;
        
        const elements = elementIds ? 
            elementIds.map(id => this.canvasEngine.getElement(id)).filter(Boolean) :
            this.canvasEngine.getSelectedElements();
        
        elements.forEach(element => {
            if (style.fontSize && element.fontSize !== undefined) {
                element.fontSize = style.fontSize;
            }
            if (style.color && element.color !== undefined) {
                element.color = style.color;
            }
            if (style.fontFamily && element.fontFamily !== undefined) {
                element.fontFamily = style.fontFamily;
            }
        });
        
        this.canvasEngine.needsRedraw = true;
    }

    /**
     * Открыть модальное окно генерации изображений
     */
    openImageGenerationModal() {
        if (!this.apiClient.getApiKey()) {
            showNotification('Сначала установите API ключ', 'warning');
            this.openAPISettings();
            return;
        }

        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="imageGenModal">
                <div class="modal-content image-gen-modal">
                    <div class="modal-header">
                        <h3>Генерация изображения с ИИ</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="imagePromptInput">Опишите изображение, которое хотите создать:</label>
                            <textarea 
                                id="imagePromptInput" 
                                placeholder="Фотореалистичный портрет кота в шляпе волшебника..."
                                rows="3"
                            ></textarea>
                        </div>
                        
                        <div class="generation-options">
                            <div class="option-row">
                                <div class="form-group">
                                    <label for="imageStyle">Стиль:</label>
                                    <select id="imageStyle">
                                        <option value="general">Общий</option>
                                        <option value="photorealistic">Фотореалистичный</option>
                                        <option value="artistic">Художественный</option>
                                        <option value="minimalist">Минималистичный</option>
                                        <option value="dramatic">Драматичный</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label for="imageQuality">Качество:</label>
                                    <select id="imageQuality">
                                        <option value="standard">Стандартное</option>
                                        <option value="high">Высокое</option>
                                        <option value="ultra">Ультра</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="option-row">
                                <div class="form-group">
                                    <label for="batchCount">Генерировать:</label>
                                    <select id="batchCount">
                                        <option value="1">1 изображение</option>
                                        <option value="2">2 варианта</option>
                                        <option value="4">4 варианта</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="generation-status" id="generationStatus" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <span class="status-text">Генерация изображений...</span>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Отмена</button>
                        <button class="btn btn-primary" id="generateImageModalBtn">Генерировать</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup event listeners
        const generateBtn = document.getElementById('generateImageModalBtn');
        const promptInput = document.getElementById('imagePromptInput');
        
        generateBtn.addEventListener('click', () => {
            this.generateImageFromModal();
        });
        
        // Generate on Ctrl+Enter
        promptInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.generateImageFromModal();
            }
        });
        
        // Focus on input
        promptInput.focus();
    }

    /**
     * Generate image from modal
     */
    async generateImageFromModal() {
        const promptInput = document.getElementById('imagePromptInput');
        const styleSelect = document.getElementById('imageStyle');
        const qualitySelect = document.getElementById('imageQuality');
        const batchSelect = document.getElementById('batchCount');
        const generateBtn = document.getElementById('generateImageModalBtn');
        const statusDiv = document.getElementById('generationStatus');
        
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showNotification('Пожалуйста, введите запрос', 'warning');
            return;
        }
        
        const style = styleSelect.value;
        const quality = qualitySelect.value;
        const batchCount = parseInt(batchSelect.value);
        
        try {
            // Show loading state
            generateBtn.disabled = true;
            statusDiv.style.display = 'block';
            statusDiv.querySelector('.status-text').textContent = 
                batchCount > 1 ? `Генерация ${batchCount} изображений...` : 'Генерация изображения...';
            
            let results;
            
            if (batchCount > 1) {
                // Batch generation
                const batchResult = await this.apiClient.generateBatch(prompt, batchCount, {
                    temperature: quality === 'ultra' ? 0.9 : quality === 'high' ? 0.8 : 0.7
                });
                results = batchResult.results.filter(r => !r.error);
                
                if (results.length === 0) {
                    throw new Error('All batch generations failed');
                }
                
                showNotification(`Успешно создано ${results.length} из ${batchCount} изображений`, 'success');
            } else {
                // Single generation
                const result = await this.apiClient.generateTextToImage(prompt, {
                    temperature: quality === 'ultra' ? 0.9 : quality === 'high' ? 0.8 : 0.7
                });
                results = [result];
            }
            
            // Add images to canvas
            const center = this.canvasEngine.getCanvasCenter();
            let offsetX = 0;
            let offsetY = 0;
            
            for (const result of results) {
                try {
                    const newImage = await this.createImageFromBase64(result.imageData, result.mimeType);
                    const imageElement = new ImageElement(
                        center.x - newImage.width / 2 + offsetX,
                        center.y - newImage.height / 2 + offsetY,
                        newImage
                    );
                    
                    this.canvasEngine.addElement(imageElement);
                    
                    // Offset next image
                    offsetX += 30;
                    offsetY += 30;
                } catch (error) {
                    console.error('Failed to create image element:', error);
                }
            }
            
            // Select the first generated image
            if (results.length > 0) {
                const elements = this.canvasEngine.getAllElements();
                const lastElement = elements[elements.length - results.length];
                if (lastElement) {
                    this.canvasEngine.selectElement(lastElement.id);
                }
            }
            
            this.saveToStorage();
            
            // Close modal
            document.getElementById('imageGenModal').remove();
            
            showNotification(
                batchCount > 1 ? 
                `${results.length} изображений успешно создано!` : 
                'Изображение успешно создано!', 
                'success'
            );
            
        } catch (error) {
            console.error('Image generation failed:', error);
            showNotification(`Генерация не удалась: ${error.message}`, 'error', 5000);
        } finally {
            generateBtn.disabled = false;
            statusDiv.style.display = 'none';
        }
    }
}

// Initialize app
const app = new CanvasAIStudio();