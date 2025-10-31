// Canvas Engine for Canvas AI Studio

class CanvasEngine {
    constructor(canvasElement) {
        if (!canvasElement) {
            throw new Error('Canvas element is required');
        }
        
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('Failed to get 2D context from canvas');
        }
        
        this.viewport = new Viewport();
        this.elements = new Map();
        this.selection = new Set();
        
        // Interaction state
        this.isMouseDown = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.dragStartPos = { x: 0, y: 0 };
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.resizeStartPos = null;
        this.resizeStartBounds = null;
        this.isPanning = false;
        
        // Options
        this.scaleElementsEnabled = false; // Disable by default
        
        // Rendering
        this.needsRedraw = true;
        this.animationId = null;
        
        // Initialize
        this.setupCanvas();
        this.setupEventListeners();
        this.startRenderLoop();
    }

    /**
     * Setup canvas properties
     */
    setupCanvas() {
        // Check canvas support
        if (!this.canvas || !this.ctx) {
            throw new Error('Canvas not supported or canvas element not found');
        }
        
        this.resizeCanvas();
        
        // Setup canvas context properties
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        // Set initial canvas size
        this.canvas.style.display = 'block';
        
        // console.log(`Canvas initialized: ${rect.width}x${rect.height} (DPR: ${dpr})`);
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        if (!container) {
            console.warn('Canvas container not found');
            return;
        }
        
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Check if size actually changed to avoid unnecessary resizes
        const newWidth = rect.width * dpr;
        const newHeight = rect.height * dpr;
        
        if (Math.abs(this.canvas.width - newWidth) < 1 && Math.abs(this.canvas.height - newHeight) < 1) {
            return; // No significant change
        }
        
        // Set actual canvas size (accounting for device pixel ratio)
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Scale context to account for device pixel ratio
        this.ctx.scale(dpr, dpr);
        
        // Restore context properties after resize
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        this.needsRedraw = true;
        
        // console.log(`Canvas resized: ${rect.width}x${rect.height} (${this.canvas.width}x${this.canvas.height})`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
        
        // Context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Window resize
        window.addEventListener('resize', debounce(() => {
            this.resizeCanvas();
        }, 250));
        
        // Keyboard events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    /**
     * Start render loop
     */
    startRenderLoop() {
        const render = () => {
            this.update();
            this.render();
            this.animationId = requestAnimationFrame(render);
        };
        render();
    }

    /**
     * Stop render loop
     */
    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Update logic (called each frame)
     */
    update() {
        // Update viewport animation
        if (this.viewport.update()) {
            this.needsRedraw = true;
        }
    }

    /**
     * Render everything
     */
    render() {
        if (!this.needsRedraw) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context state
        this.ctx.save();
        
        // Apply viewport transformation
        this.ctx.translate(this.viewport.x, this.viewport.y);
        this.ctx.scale(this.viewport.zoom, this.viewport.zoom);
        
        // Render grid if needed
        this.renderGrid();
        
        // Render elements in z-index order
        const sortedElements = Array.from(this.elements.values())
            .sort((a, b) => a.zIndex - b.zIndex);
        
        sortedElements.forEach(element => {
            if (this.isElementVisible(element)) {
                element.render(this.ctx, this.viewport);
            }
        });
        
        // Restore context state
        this.ctx.restore();
        
        // Render UI overlay (selection rectangle, etc.)
        this.renderOverlay();
        
        // Update context menu position if visible
        this.updateContextMenu();
        
        this.needsRedraw = false;
    }

    /**
     * Render dotted background grid
     */
    renderGrid() {
        const ctx = this.ctx;
        const viewport = this.viewport;
        
        // Calculate grid spacing based on zoom level
        let gridSpacing = 20; // Base spacing in world coordinates
        
        // Adjust grid density based on zoom
        while (gridSpacing * viewport.zoom < 10) {
            gridSpacing *= 2;
        }
        while (gridSpacing * viewport.zoom > 100) {
            gridSpacing /= 2;
        }
        
        // Get visible world bounds
        const worldBounds = viewport.getWorldBounds(this.canvas.width, this.canvas.height);
        
        // Calculate grid start positions
        const startX = Math.floor(worldBounds.x / gridSpacing) * gridSpacing;
        const startY = Math.floor(worldBounds.y / gridSpacing) * gridSpacing;
        const endX = worldBounds.x + worldBounds.width;
        const endY = worldBounds.y + worldBounds.height;
        
        // Set dot properties
        ctx.save();
        ctx.fillStyle = '#e1e5e9';
        
        // Calculate dot size based on zoom (but keep it reasonable)
        const dotSize = Math.max(1, Math.min(3, viewport.zoom * 1.5));
        
        // Draw dots
        for (let x = startX; x <= endX; x += gridSpacing) {
            for (let y = startY; y <= endY; y += gridSpacing) {
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.restore();
    }

    /**
     * Render UI overlay
     */
    renderOverlay() {
        // Selection rectangle and other UI elements
        // Will be implemented when needed
    }

    /**
     * Check if element is visible in viewport
     */
    isElementVisible(element) {
        const bounds = element.getBounds();
        return this.viewport.isRectVisible(
            bounds.x, bounds.y, bounds.width, bounds.height,
            this.canvas.width, this.canvas.height
        );
    }

    /**
     * Add element to canvas
     */
    addElement(element) {
        this.elements.set(element.id, element);
        this.needsRedraw = true;
        return element.id;
    }

    /**
     * Remove element from canvas
     */
    removeElement(id) {
        const element = this.elements.get(id);
        if (element) {
            this.elements.delete(id);
            this.selection.delete(id);
            this.needsRedraw = true;
            return element;
        }
        return null;
    }

    /**
     * Get element by ID
     */
    getElement(id) {
        return this.elements.get(id);
    }

    /**
     * Get all elements
     */
    getAllElements() {
        return Array.from(this.elements.values());
    }

    /**
     * Clear all elements
     */
    clearElements() {
        this.elements.clear();
        this.selection.clear();
        this.needsRedraw = true;
    }

    /**
     * Select element
     */
    selectElement(id, multiSelect = false) {
        if (!multiSelect) {
            this.clearSelection();
        }
        
        const element = this.elements.get(id);
        if (element) {
            element.selected = true;
            this.selection.add(id);
            this.needsRedraw = true;
        }
    }

    /**
     * Deselect element
     */
    deselectElement(id) {
        const element = this.elements.get(id);
        if (element) {
            element.selected = false;
            this.selection.delete(id);
            this.needsRedraw = true;
        }
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selection.forEach(id => {
            const element = this.elements.get(id);
            if (element) {
                element.selected = false;
            }
        });
        this.selection.clear();
        this.needsRedraw = true;
    }

    /**
     * Get selected elements
     */
    getSelectedElements() {
        return Array.from(this.selection).map(id => this.elements.get(id)).filter(Boolean);
    }

    /**
     * Find element at position
     */
    getElementAt(worldX, worldY) {
        // Check elements in reverse z-index order (top to bottom)
        const sortedElements = Array.from(this.elements.values())
            .sort((a, b) => b.zIndex - a.zIndex);
        
        for (const element of sortedElements) {
            if (element.visible && element.hitTest(worldX, worldY)) {
                return element;
            }
        }
        return null;
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(event) {
        const mousePos = getMousePos(this.canvas, event);
        const worldPos = this.viewport.screenToWorld(mousePos.x, mousePos.y);
        
        this.isMouseDown = true;
        this.lastMousePos = mousePos;
        this.dragStartPos = worldPos;
        
        // Check for Ctrl+drag (panning)
        if (event.ctrlKey) {
            this.isPanning = true;
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Check for element interaction
        const element = this.getElementAt(worldPos.x, worldPos.y);
        
        if (element) {
            // Check for resize handle
            if (element.selected && element instanceof ImageElement) {
                const handle = element.hitTestHandle(worldPos.x, worldPos.y, this.viewport);
                if (handle) {
                    this.isResizing = true;
                    this.resizeHandle = handle;
                    this.resizeStartPos = worldPos;
                    this.resizeStartBounds = {
                        x: element.x,
                        y: element.y,
                        width: element.width,
                        height: element.height
                    };
                    this.canvas.style.cursor = handle.handle.cursor;
                    return;
                }
            }
            
            // Select element
            const multiSelect = event.shiftKey;
            if (!element.selected || !multiSelect) {
                this.selectElement(element.id, multiSelect);
            }
            
            this.isDragging = true;
            this.canvas.style.cursor = 'move';
        } else {
            // Clear selection if clicking empty space
            if (!event.shiftKey) {
                this.clearSelection();
            }
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(event) {
        const mousePos = getMousePos(this.canvas, event);
        const worldPos = this.viewport.screenToWorld(mousePos.x, mousePos.y);
        
        if (this.isMouseDown) {
            const deltaX = mousePos.x - this.lastMousePos.x;
            const deltaY = mousePos.y - this.lastMousePos.y;
            
            if (this.isPanning) {
                // Pan viewport
                this.viewport.pan(deltaX, deltaY);
                this.needsRedraw = true;
                this.updateContextMenu();
            } else if (this.isResizing && this.resizeHandle) {
                // Resize element with stable calculation
                const selectedElements = this.getSelectedElements();
                if (selectedElements.length === 1) {
                    const element = selectedElements[0];
                    this.resizeElement(element, worldPos);
                    this.needsRedraw = true;
                }
            } else if (this.isDragging) {
                // Move selected elements
                const worldDelta = {
                    x: worldPos.x - this.dragStartPos.x,
                    y: worldPos.y - this.dragStartPos.y
                };
                
                this.getSelectedElements().forEach(element => {
                    element.move(worldDelta.x, worldDelta.y);
                });
                
                this.dragStartPos = worldPos;
                this.needsRedraw = true;
                this.updateContextMenu();
            }
        } else {
            // Update cursor based on hover
            const element = this.getElementAt(worldPos.x, worldPos.y);
            if (element && element.selected && element instanceof ImageElement) {
                const handle = element.hitTestHandle(worldPos.x, worldPos.y, this.viewport);
                this.canvas.style.cursor = handle ? handle.handle.cursor : 'move';
            } else if (element) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
        
        this.lastMousePos = mousePos;
    }

    /**
     * Resize element based on handle and mouse position
     */
    resizeElement(element, currentPos) {
        if (!this.resizeHandle || !this.resizeStartPos || !this.resizeStartBounds) return;
        
        const handleIndex = this.resizeHandle.index;
        const startBounds = this.resizeStartBounds;
        const deltaX = currentPos.x - this.resizeStartPos.x;
        const deltaY = currentPos.y - this.resizeStartPos.y;
        
        let newX = startBounds.x;
        let newY = startBounds.y;
        let newWidth = startBounds.width;
        let newHeight = startBounds.height;
        
        // Calculate new dimensions based on which handle is being dragged
        switch (handleIndex) {
            case 0: // Top-left
                newX = startBounds.x + deltaX;
                newY = startBounds.y + deltaY;
                newWidth = startBounds.width - deltaX;
                newHeight = startBounds.height - deltaY;
                break;
            case 1: // Top-right
                newY = startBounds.y + deltaY;
                newWidth = startBounds.width + deltaX;
                newHeight = startBounds.height - deltaY;
                break;
            case 2: // Bottom-right
                newWidth = startBounds.width + deltaX;
                newHeight = startBounds.height + deltaY;
                break;
            case 3: // Bottom-left
                newX = startBounds.x + deltaX;
                newWidth = startBounds.width - deltaX;
                newHeight = startBounds.height + deltaY;
                break;
        }
        
        // Maintain minimum size
        const minSize = 20;
        if (newWidth < minSize) {
            if (handleIndex === 0 || handleIndex === 3) {
                newX = startBounds.x + startBounds.width - minSize;
            }
            newWidth = minSize;
        }
        if (newHeight < minSize) {
            if (handleIndex === 0 || handleIndex === 1) {
                newY = startBounds.y + startBounds.height - minSize;
            }
            newHeight = minSize;
        }
        
        // For images, maintain aspect ratio by default (can be disabled with Alt key)
        if (element instanceof ImageElement && element.aspectRatio) {
            const maintainAspectRatio = true; // Always maintain aspect ratio for images
            if (maintainAspectRatio) {
                // Maintain aspect ratio
                const aspectRatio = element.aspectRatio;
                const widthBasedHeight = newWidth / aspectRatio;
                const heightBasedWidth = newHeight * aspectRatio;
                
                if (Math.abs(newWidth - startBounds.width) > Math.abs(newHeight - startBounds.height)) {
                    newHeight = widthBasedHeight;
                    // Adjust position for top handles
                    if (handleIndex === 0 || handleIndex === 1) {
                        newY = startBounds.y + startBounds.height - newHeight;
                    }
                } else {
                    newWidth = heightBasedWidth;
                    // Adjust position for left handles
                    if (handleIndex === 0 || handleIndex === 3) {
                        newX = startBounds.x + startBounds.width - newWidth;
                    }
                }
            }
        }
        
        // Apply new dimensions
        element.x = newX;
        element.y = newY;
        element.width = newWidth;
        element.height = newHeight;
        
        // Update context menu position
        this.updateContextMenu();
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(event) {
        this.isMouseDown = false;
        this.isDragging = false;
        this.isResizing = false;
        this.isPanning = false;
        this.resizeHandle = null;
        this.resizeStartPos = null;
        this.resizeStartBounds = null;
        
        this.canvas.style.cursor = 'default';
    }

    /**
     * Handle wheel (no zoom, prevent browser zoom on Ctrl+wheel)
     */
    handleWheel(event) {
        // Prevent browser zoom when Ctrl is held
        if (event.ctrlKey) {
            event.preventDefault();
        }
        // Zoom is now handled by Ctrl+Arrow keys only
    }

    /**
     * Handle key down
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                this.deleteSelectedElements();
                break;
            case 'Escape':
                this.clearSelection();
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.selectAll();
                }
                break;
            case 'ArrowUp':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.zoomIn();
                }
                break;
            case 'ArrowDown':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.zoomOut();
                }
                break;
            case 'e':
            case 'E':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.toggleElementScaling();
                }
                break;
        }
    }

    /**
     * Handle key up
     */
    handleKeyUp(event) {
        // Handle key releases if needed
    }

    /**
     * Delete selected elements
     */
    deleteSelectedElements() {
        const selectedIds = Array.from(this.selection);
        selectedIds.forEach(id => this.removeElement(id));
    }

    /**
     * Select all elements
     */
    selectAll() {
        this.clearSelection();
        this.elements.forEach((element, id) => {
            this.selectElement(id, true);
        });
    }

    /**
     * Update zoom display
     */
    updateZoomDisplay() {
        const zoomDisplay = document.getElementById('zoomDisplay');
        if (zoomDisplay) {
            zoomDisplay.textContent = this.viewport.getZoomPercentage();
        }
    }

    /**
     * Fit all elements to screen
     */
    fitToScreen() {
        const elements = this.getAllElements();
        this.viewport.fitToScreen(elements, this.canvas.width, this.canvas.height);
        this.needsRedraw = true;
        this.updateZoomDisplay();
    }

    /**
     * Reset zoom to 100%
     */
    resetZoom() {
        this.viewport.resetZoom(this.canvas.width, this.canvas.height);
        this.needsRedraw = true;
        this.updateZoomDisplay();
    }

    /**
     * Zoom in (increase zoom level)
     */
    zoomIn() {
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.viewport.zoomIn(center.x, center.y);
        this.needsRedraw = true;
        this.updateZoomDisplay();
        this.updateContextMenu();
    }

    /**
     * Zoom out (decrease zoom level)
     */
    zoomOut() {
        const center = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.viewport.zoomOut(center.x, center.y);
        this.needsRedraw = true;
        this.updateZoomDisplay();
        this.updateContextMenu();
    }

    /**
     * Update context menu position (if app is available)
     */
    updateContextMenu() {
        if (typeof app !== 'undefined' && app.updateContextMenuPosition) {
            app.updateContextMenuPosition();
        }
    }

    /**
     * Scale elements proportionally with zoom (optional feature)
     */
    scaleElementsWithZoom(zoomFactor) {
        if (!this.scaleElementsEnabled) return;
        
        this.elements.forEach(element => {
            if (element instanceof ImageElement) {
                const centerX = element.x + element.width / 2;
                const centerY = element.y + element.height / 2;
                
                // Scale size
                element.width *= zoomFactor;
                element.height *= zoomFactor;
                
                // Adjust position to keep center in same place
                element.x = centerX - element.width / 2;
                element.y = centerY - element.height / 2;
            }
        });
    }

    /**
     * Toggle element scaling with zoom
     */
    toggleElementScaling() {
        this.scaleElementsEnabled = !this.scaleElementsEnabled;
        showNotification(
            `Element scaling with zoom: ${this.scaleElementsEnabled ? 'enabled' : 'disabled'}`,
            'info'
        );
        return this.scaleElementsEnabled;
    }

    /**
     * Get canvas center in world coordinates
     */
    getCanvasCenter() {
        return this.viewport.screenToWorld(this.canvas.width / 2, this.canvas.height / 2);
    }

    /**
     * Serialize canvas state
     */
    toJSON() {
        return {
            viewport: this.viewport.toJSON(),
            elements: Array.from(this.elements.values()).map(el => el.toJSON())
        };
    }

    /**
     * Restore canvas state
     */
    async fromJSON(data) {
        this.clearElements();
        
        // Restore viewport
        if (data.viewport) {
            this.viewport.fromJSON(data.viewport);
        }
        
        // Restore elements
        if (data.elements) {
            for (const elementData of data.elements) {
                let element;
                
                if (elementData.type === 'image') {
                    element = new ImageElement(0, 0, null);
                    await element.fromJSON(elementData);
                } else if (elementData.type === 'text') {
                    element = new TextElement(0, 0);
                    element.fromJSON(elementData);
                }
                
                if (element) {
                    this.addElement(element);
                }
            }
        }
        
        this.needsRedraw = true;
        this.updateZoomDisplay();
    }
}