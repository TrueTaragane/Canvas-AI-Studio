// Element System for Canvas AI Studio

/**
 * Base class for all canvas elements
 */
class CanvasElement {
    constructor(type, x = 0, y = 0) {
        this.id = generateId();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 100;
        this.rotation = 0;
        this.selected = false;
        this.visible = true;
        this.locked = false;
        this.zIndex = 0;
        
        // Creation timestamp
        this.createdAt = Date.now();
    }

    /**
     * Render the element (to be implemented by subclasses)
     */
    render(ctx, viewport) {
        throw new Error('render() method must be implemented by subclass');
    }

    /**
     * Get element bounds
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Check if point hits this element
     */
    hitTest(x, y) {
        return pointInRect(x, y, this.x, this.y, this.width, this.height);
    }

    /**
     * Move element by delta
     */
    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    /**
     * Set position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Resize element
     */
    resize(width, height) {
        this.width = Math.max(10, width); // Minimum size
        this.height = Math.max(10, height);
    }

    /**
     * Clone element
     */
    clone() {
        const cloned = Object.create(Object.getPrototypeOf(this));
        Object.assign(cloned, this);
        cloned.id = generateId();
        cloned.x += 20; // Offset clone position
        cloned.y += 20;
        cloned.selected = false;
        return cloned;
    }

    /**
     * Serialize element
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            rotation: this.rotation,
            visible: this.visible,
            locked: this.locked,
            zIndex: this.zIndex,
            createdAt: this.createdAt
        };
    }

    /**
     * Restore from JSON
     */
    fromJSON(data) {
        Object.assign(this, data);
        this.selected = false; // Never restore selection state
    }
}

/**
 * Image element class
 */
class ImageElement extends CanvasElement {
    constructor(x, y, image) {
        super('image', x, y);
        this.image = image;
        this.aspectRatio = image ? image.width / image.height : 1;
        
        // Set initial size based on image
        if (image) {
            const maxSize = 300;
            if (image.width > image.height) {
                this.width = Math.min(image.width, maxSize);
                this.height = this.width / this.aspectRatio;
            } else {
                this.height = Math.min(image.height, maxSize);
                this.width = this.height * this.aspectRatio;
            }
        }
        
        // Image-specific properties
        this.opacity = 1;
        this.filters = {
            brightness: 1,
            contrast: 1,
            saturation: 1
        };
    }

    /**
     * Render image element
     */
    render(ctx, viewport) {
        if (!this.visible || !this.image) return;

        ctx.save();
        
        // Apply opacity
        ctx.globalAlpha = this.opacity;
        
        // Apply filters (basic implementation)
        if (this.filters.brightness !== 1 || this.filters.contrast !== 1) {
            ctx.filter = `brightness(${this.filters.brightness}) contrast(${this.filters.contrast})`;
        }
        
        // Transform for rotation
        if (this.rotation !== 0) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(this.rotation);
            ctx.translate(-centerX, -centerY);
        }
        
        // Draw image
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        
        // Draw selection outline
        if (this.selected) {
            this.renderSelection(ctx);
        }
        
        ctx.restore();
    }

    /**
     * Render selection outline and handles
     */
    renderSelection(ctx) {
        ctx.save();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2 / ctx.getTransform().a; // Adjust for zoom
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Draw resize handles
        const handleSize = 8 / ctx.getTransform().a;
        ctx.fillStyle = '#3498db';
        ctx.setLineDash([]);
        
        const handles = this.getResizeHandles();
        handles.forEach(handle => {
            ctx.fillRect(
                handle.x - handleSize / 2,
                handle.y - handleSize / 2,
                handleSize,
                handleSize
            );
        });
        
        ctx.restore();
    }

    /**
     * Get resize handle positions
     */
    getResizeHandles() {
        return [
            { x: this.x, y: this.y, cursor: 'nw-resize' }, // Top-left
            { x: this.x + this.width, y: this.y, cursor: 'ne-resize' }, // Top-right
            { x: this.x + this.width, y: this.y + this.height, cursor: 'se-resize' }, // Bottom-right
            { x: this.x, y: this.y + this.height, cursor: 'sw-resize' } // Bottom-left
        ];
    }

    /**
     * Check if point hits a resize handle
     */
    hitTestHandle(x, y, viewport = null) {
        // Adjust handle size based on zoom level for better usability
        let handleSize = 8;
        if (viewport && viewport.zoom) {
            handleSize = Math.max(6, 8 / viewport.zoom);
        }
        
        const handles = this.getResizeHandles();
        
        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];
            if (pointInRect(x, y, handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)) {
                return { index: i, handle };
            }
        }
        return null;
    }

    /**
     * Resize maintaining aspect ratio
     */
    resizeProportional(newWidth, newHeight) {
        if (this.aspectRatio) {
            if (Math.abs(newWidth - this.width) > Math.abs(newHeight - this.height)) {
                this.width = Math.max(10, newWidth);
                this.height = this.width / this.aspectRatio;
            } else {
                this.height = Math.max(10, newHeight);
                this.width = this.height * this.aspectRatio;
            }
        } else {
            this.resize(newWidth, newHeight);
        }
    }

    /**
     * Serialize image element
     */
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            src: this.image ? this.image.src : null,
            aspectRatio: this.aspectRatio,
            opacity: this.opacity,
            filters: { ...this.filters }
        };
    }

    /**
     * Restore image element from JSON
     */
    async fromJSON(data) {
        super.fromJSON(data);
        this.aspectRatio = data.aspectRatio || 1;
        this.opacity = data.opacity || 1;
        this.filters = { ...data.filters } || { brightness: 1, contrast: 1, saturation: 1 };
        
        // Load image if src is provided
        if (data.src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.image = img;
                    resolve(this);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = data.src;
            });
        }
        
        return Promise.resolve(this);
    }
}

/**
 * Text element class
 */
class TextElement extends CanvasElement {
    constructor(x, y, text = 'Добавьте ваш текст') {
        super('text', x, y);
        this.text = text;
        this.fontSize = 24;
        this.fontFamily = 'Arial, sans-serif';
        this.color = '#2c3e50';
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.align = 'left';
        this.lineHeight = 1.2;
        
        // Calculate initial size
        this.updateSize();
    }

    /**
     * Update element size based on text content
     */
    updateSize() {
        // Create temporary canvas to measure text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = this.getFont();
        
        const lines = this.text.split('\n');
        let maxWidth = 0;
        
        lines.forEach(line => {
            const metrics = ctx.measureText(line);
            maxWidth = Math.max(maxWidth, metrics.width);
        });
        
        this.width = Math.max(50, maxWidth + 20); // Add padding
        this.height = Math.max(30, lines.length * this.fontSize * this.lineHeight + 10);
    }

    /**
     * Get font string for canvas
     */
    getFont() {
        let font = '';
        if (this.italic) font += 'italic ';
        if (this.bold) font += 'bold ';
        font += `${this.fontSize}px ${this.fontFamily}`;
        return font;
    }

    /**
     * Render text element
     */
    render(ctx, viewport) {
        if (!this.visible) return;

        ctx.save();
        
        // Set font and color
        ctx.font = this.getFont();
        ctx.fillStyle = this.color;
        ctx.textAlign = this.align;
        ctx.textBaseline = 'top';
        
        // Transform for rotation
        if (this.rotation !== 0) {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(this.rotation);
            ctx.translate(-centerX, -centerY);
        }
        
        // Draw text background if selected
        if (this.selected) {
            ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Draw text
        ctx.fillStyle = this.color;
        const lines = this.text.split('\n');
        const lineHeight = this.fontSize * this.lineHeight;
        
        lines.forEach((line, index) => {
            let textX = this.x + 10; // Padding
            if (this.align === 'center') textX = this.x + this.width / 2;
            else if (this.align === 'right') textX = this.x + this.width - 10;
            
            const textY = this.y + 5 + index * lineHeight; // Padding
            ctx.fillText(line, textX, textY);
            
            // Draw underline if needed
            if (this.underline) {
                const metrics = ctx.measureText(line);
                ctx.beginPath();
                ctx.moveTo(textX, textY + this.fontSize);
                ctx.lineTo(textX + metrics.width, textY + this.fontSize);
                ctx.stroke();
            }
        });
        
        // Draw selection outline
        if (this.selected) {
            this.renderSelection(ctx);
        }
        
        ctx.restore();
    }

    /**
     * Render selection outline
     */
    renderSelection(ctx) {
        ctx.save();
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2 / ctx.getTransform().a;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    /**
     * Set text content and update size
     */
    setText(text) {
        this.text = text;
        this.updateSize();
    }

    /**
     * Set font size and update size
     */
    setFontSize(size) {
        this.fontSize = Math.max(8, Math.min(200, size));
        this.updateSize();
    }

    /**
     * Serialize text element
     */
    toJSON() {
        const base = super.toJSON();
        return {
            ...base,
            text: this.text,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            color: this.color,
            bold: this.bold,
            italic: this.italic,
            underline: this.underline,
            align: this.align,
            lineHeight: this.lineHeight
        };
    }

    /**
     * Restore text element from JSON
     */
    fromJSON(data) {
        super.fromJSON(data);
        this.text = data.text || 'Добавьте ваш текст';
        this.fontSize = data.fontSize || 24;
        this.fontFamily = data.fontFamily || 'Arial, sans-serif';
        this.color = data.color || '#2c3e50';
        this.bold = data.bold || false;
        this.italic = data.italic || false;
        this.underline = data.underline || false;
        this.align = data.align || 'left';
        this.lineHeight = data.lineHeight || 1.2;
        this.updateSize();
    }
}