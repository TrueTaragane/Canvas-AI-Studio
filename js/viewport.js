// Viewport Management for Canvas AI Studio

class Viewport {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.minZoom = 0.1;
        this.maxZoom = 5.0;
        
        // Fixed zoom levels for precise control
        this.zoomLevels = [
            0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0
        ];
        this.currentZoomIndex = this.zoomLevels.indexOf(1.0); // Start at 100%
        
        // Animation properties
        this.targetX = 0;
        this.targetY = 0;
        this.targetZoom = 1;
        this.isAnimating = false;
        this.animationSpeed = 0.15;
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.x) / this.zoom,
            y: (screenY - this.y) / this.zoom
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.zoom + this.x,
            y: worldY * this.zoom + this.y
        };
    }

    /**
     * Pan the viewport by delta amounts
     */
    pan(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    /**
     * Zoom at a specific point (screen coordinates)
     */
    zoomAt(screenX, screenY, zoomFactor) {
        const oldZoom = this.zoom;
        const newZoom = clamp(this.zoom * zoomFactor, this.minZoom, this.maxZoom);
        
        if (newZoom === this.zoom) return; // No change needed
        
        // Calculate world position of zoom center
        const worldPos = this.screenToWorld(screenX, screenY);
        
        // Update zoom
        this.zoom = newZoom;
        this.targetZoom = newZoom;
        
        // Update zoom index to match new zoom level
        this.updateZoomIndex();
        
        // Adjust position to keep the zoom center in the same place
        const newScreenPos = this.worldToScreen(worldPos.x, worldPos.y);
        this.x += screenX - newScreenPos.x;
        this.y += screenY - newScreenPos.y;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    /**
     * Set zoom level (0.1 to 5.0)
     */
    setZoom(zoom, centerX = 0, centerY = 0) {
        this.zoomAt(centerX, centerY, zoom / this.zoom);
    }

    /**
     * Zoom to next level up
     */
    zoomIn(centerX = 0, centerY = 0) {
        if (this.currentZoomIndex < this.zoomLevels.length - 1) {
            this.currentZoomIndex++;
            const newZoom = this.zoomLevels[this.currentZoomIndex];
            this.setZoom(newZoom, centerX, centerY);
        }
    }

    /**
     * Zoom to next level down
     */
    zoomOut(centerX = 0, centerY = 0) {
        if (this.currentZoomIndex > 0) {
            this.currentZoomIndex--;
            const newZoom = this.zoomLevels[this.currentZoomIndex];
            this.setZoom(newZoom, centerX, centerY);
        }
    }

    /**
     * Get current zoom as percentage string
     */
    getZoomPercentage() {
        return Math.round(this.zoom * 100) + '%';
    }

    /**
     * Find closest zoom level and update index
     */
    updateZoomIndex() {
        let closestIndex = 0;
        let closestDiff = Math.abs(this.zoom - this.zoomLevels[0]);
        
        for (let i = 1; i < this.zoomLevels.length; i++) {
            const diff = Math.abs(this.zoom - this.zoomLevels[i]);
            if (diff < closestDiff) {
                closestDiff = diff;
                closestIndex = i;
            }
        }
        
        this.currentZoomIndex = closestIndex;
    }

    /**
     * Animate to target position and zoom
     */
    animateTo(targetX, targetY, targetZoom = this.zoom) {
        this.targetX = targetX;
        this.targetY = targetY;
        this.targetZoom = clamp(targetZoom, this.minZoom, this.maxZoom);
        this.isAnimating = true;
    }

    /**
     * Update animation (call in render loop)
     */
    update() {
        if (!this.isAnimating) return false;
        
        let hasChanged = false;
        
        // Animate position
        if (Math.abs(this.x - this.targetX) > 0.1 || Math.abs(this.y - this.targetY) > 0.1) {
            this.x = lerp(this.x, this.targetX, this.animationSpeed);
            this.y = lerp(this.y, this.targetY, this.animationSpeed);
            hasChanged = true;
        }
        
        // Animate zoom
        if (Math.abs(this.zoom - this.targetZoom) > 0.001) {
            this.zoom = lerp(this.zoom, this.targetZoom, this.animationSpeed);
            hasChanged = true;
        }
        
        // Stop animation if close enough to target
        if (!hasChanged) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.zoom = this.targetZoom;
            this.isAnimating = false;
        }
        
        return hasChanged;
    }

    /**
     * Fit all elements to screen
     */
    fitToScreen(elements, canvasWidth, canvasHeight, padding = 50) {
        if (!elements || elements.length === 0) {
            // Reset to center if no elements
            this.animateTo(canvasWidth / 2, canvasHeight / 2, 1);
            return;
        }

        // Calculate bounding box of all elements
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        elements.forEach(element => {
            const bounds = element.getBounds();
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        // Calculate required zoom to fit all elements
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const availableWidth = canvasWidth - padding * 2;
        const availableHeight = canvasHeight - padding * 2;
        
        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        const calculatedZoom = Math.min(scaleX, scaleY, this.maxZoom);
        
        // Find closest zoom level that fits
        let targetZoom = this.zoomLevels[0];
        for (const level of this.zoomLevels) {
            if (level <= calculatedZoom) {
                targetZoom = level;
            } else {
                break;
            }
        }
        
        // Update zoom index
        this.currentZoomIndex = this.zoomLevels.indexOf(targetZoom);
        
        // Calculate center position
        const contentCenterX = (minX + maxX) / 2;
        const contentCenterY = (minY + maxY) / 2;
        const targetX = canvasWidth / 2 - contentCenterX * targetZoom;
        const targetY = canvasHeight / 2 - contentCenterY * targetZoom;
        
        this.animateTo(targetX, targetY, targetZoom);
    }

    /**
     * Reset zoom to 100%
     */
    resetZoom(canvasWidth, canvasHeight) {
        const targetX = canvasWidth / 2;
        const targetY = canvasHeight / 2;
        this.currentZoomIndex = this.zoomLevels.indexOf(1.0);
        this.animateTo(targetX, targetY, 1);
    }

    /**
     * Get viewport bounds in world coordinates
     */
    getWorldBounds(canvasWidth, canvasHeight) {
        const topLeft = this.screenToWorld(0, 0);
        const bottomRight = this.screenToWorld(canvasWidth, canvasHeight);
        
        return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    /**
     * Check if a world rectangle is visible in viewport
     */
    isRectVisible(x, y, width, height, canvasWidth, canvasHeight) {
        const viewBounds = this.getWorldBounds(canvasWidth, canvasHeight);
        
        return !(x + width < viewBounds.x || 
                x > viewBounds.x + viewBounds.width ||
                y + height < viewBounds.y || 
                y > viewBounds.y + viewBounds.height);
    }

    /**
     * Serialize viewport state
     */
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom
        };
    }

    /**
     * Restore viewport state
     */
    fromJSON(data) {
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.zoom = clamp(data.zoom || 1, this.minZoom, this.maxZoom);
        this.targetX = this.x;
        this.targetY = this.y;
        this.targetZoom = this.zoom;
        
        // Update zoom index to match restored zoom
        this.updateZoomIndex();
    }
}