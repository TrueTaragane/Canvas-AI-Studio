# Canvas AI Studio - Complete Technical Specification

## Project Overview

**Application Name:** Canvas AI Studio  
**Type:** Web-based AI-powered design tool  
**Primary Language:** JavaScript (ES6+)  
**UI Language:** Russian  
**Target Platform:** Modern web browsers  
**AI Integration:** Google Gemini API

## Architecture Overview

### Core Components

1. **Main Application Class** (`CanvasAIStudio`)
2. **Canvas Engine** (`CanvasEngine`)
3. **Viewport Management** (`Viewport`)
4. **Element System** (`CanvasElement`, `ImageElement`, `TextElement`)
5. **Advanced API Client** (`AdvancedAPIClient`)
6. **Utility Functions** (`utils.js`)

### File Structure

```
/
├── index.html
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── canvas-engine.js
    ├── viewport.js
    ├── elements.js
    ├── advanced-api-client.js
    └── utils.js
```

## User Interface Specification

### 1. Header Section

**Position:** Top of the screen, fixed  
**Height:** 60px  
**Background:** White (#ffffff)  
**Border:** 1px solid #e1e5e9 (bottom)

#### Left Section:

- **Back Button:** 32x32px, arrow-left icon, hover effect
- **Project Title Input:**
  - Placeholder: "Проект без названия"
  - Default value: "Проект без названия"
  - Font: 16px, weight 500
  - Min-width: 200px
  - Editable inline
  - Auto-save on change

#### Right Section:

- **Zoom Controls Group:**

  - Background: #f8f9fa
  - Border-radius: 6px
  - Padding: 4px
  - Contains 5 buttons (28x28px each):
    1. Reset to 100% (home icon) - Ctrl+0
    2. Zoom out (minus icon) - Ctrl+↓
    3. Zoom display (clickable, shows current %)
    4. Zoom in (plus icon) - Ctrl+↑
    5. Fit to screen (expand icon) - Ctrl+1

- **Share Button:**
  - Background: #3498db
  - Color: white
  - Padding: 8px 16px
  - Border-radius: 6px
  - Text: "Поделиться"

#### Zoom Dropdown (Hidden by default):

- **Position:** Absolute, below zoom display
- **Content:** 14 zoom levels from 10% to 500%
- **Levels:** 10%, 25%, 33%, 50%, 67%, 75%, 100%, 125%, 150%, 200%, 250%, 300%, 400%, 500%
- **Behavior:** Click zoom display to toggle, click outside to close

### 2. Main Container

**Position:** Below header  
**Height:** calc(100vh - 60px)  
**Layout:** Relative positioning

### 3. Left Toolbar

**Position:** Absolute, left: 16px, top: 50% (centered vertically)  
**Width:** 60px  
**Background:** #f8f9fa  
**Border:** 1px solid #e1e5e9  
**Border-radius:** 8px  
**Shadow:** 0 4px 12px rgba(0,0,0,0.15)  
**Hover effect:** Slight translation and enhanced shadow

#### Tool Buttons (44x44px each):

1. **Select Tool (V):**

   - Icon: mouse-pointer
   - Default: Active state
   - Tooltip: "Выбрать (V)"

2. **Image Tool:**

   - Icon: image
   - Tooltip: "Добавить изображение"
   - Action: Opens file picker

3. **Text Tool (T):**
   - Icon: font
   - Tooltip: "Добавить текст (T)"
   - Action: Adds text element at center

**Divider:** 1px line, margin 8px

4. **AI Image Generation:**

   - Icon: magic wand
   - Tooltip: "Генерировать изображение с ИИ"
   - Action: Opens generation modal

5. **Settings:**
   - Icon: cog
   - Tooltip: "Настройки API"
   - Action: Opens API settings modal

### 4. Canvas Container

**Position:** Full width and height of main container  
**Background:** White  
**Cursor:** Default crosshair, changes based on tool/hover state

#### Canvas Element:

- **Type:** HTML5 Canvas
- **Position:** Absolute, top: 0, left: 0
- **Background:** Transparent
- **High DPI Support:** Automatic scaling for Retina displays
- **Grid:** Adaptive dotted grid, spacing adjusts with zoom

#### Canvas States:

- **Default:** crosshair cursor
- **Panning:** grabbing cursor (Ctrl+drag)
- **Dragging:** move cursor
- **Resizing:** resize cursors (nw-resize, ne-resize, etc.)
- **Drag-over:** Blue dashed border with "Drop images here" message

### 5. AI Input Overlay

**Position:** Absolute, bottom: 20px, centered horizontally  
**Width:** 95%, max-width: 800px  
**Z-index:** 60

#### Selected Images Area (Hidden by default):

- **Background:** rgba(255, 255, 255, 0.95)
- **Border:** 1px solid #e1e5e9
- **Border-radius:** 12px
- **Padding:** 12px
- **Max-height:** 200px, scrollable

**Header:**

- **Title:** "Выбранные изображения" (12px, uppercase, #6c757d)
- **Clear Button:** X icon, hover effect

**Images Grid:**

- **Layout:** Flex wrap
- **Gap:** 8px
- **Image Items:** 80x80px, border-radius: 8px
- **Hover:** Scale 1.05, blue border
- **Remove Button:** Red circle with X, appears on hover

#### Input Container:

- **Background:** rgba(255, 255, 255, 0.95)
- **Border:** 1px solid #e1e5e9
- **Border-radius:** 12px
- **Padding:** 12px
- **Shadow:** 0 4px 12px rgba(0,0,0,0.15)
- **Backdrop-filter:** blur(10px)

**Textarea:**

- **Min-height:** 60px
- **Max-height:** 150px
- **Padding:** 12px 16px
- **Font-size:** 15px
- **Line-height:** 1.5
- **Border:** None
- **Background:** Transparent
- **Resize:** None (auto-resize on input)
- **Placeholder:** Multi-line with examples

**Send Button:**

- **Size:** 48x48px
- **Background:** #3498db
- **Color:** White
- **Border-radius:** 8px
- **Icon:** paper-plane
- **Position:** Bottom-right of container
- **Hover:** Scale 1.05, darker blue
- **Disabled state:** Gray background

#### Status Indicator:

- **Position:** Above input container
- **Font-size:** 12px
- **States:**
  - Hidden (opacity: 0)
  - Generating (blue, "Генерация...")
  - Success (green, "Успешно сгенерировано!")
  - Error (red, error message)

### 6. Image Context Menu

**Position:** Absolute, appears above selected images  
**Background:** rgba(44, 62, 80, 0.95)  
**Border:** 1px solid rgba(255, 255, 255, 0.2)  
**Border-radius:** 8px  
**Padding:** 6px  
**Layout:** Horizontal flex  
**Gap:** 4px  
**Backdrop-filter:** blur(10px)

#### Menu Items (36x36px each):

1. **Remove Background:**

   - Icon: magic wand
   - Tooltip: "Убрать фон"

2. **Regenerate:**

   - Icon: sync-alt
   - Tooltip: "Перегенерировать на основе этого"

3. **Copy:**
   - Icon: copy
   - Tooltip: "Копировать (клонировать)"

**Hover Effects:** White background overlay, scale 1.1

## Modal Windows Specification

### 1. API Settings Modal

#### Structure:

- **Overlay:** Full screen, rgba(0, 0, 0, 0.5)
- **Content:** Centered, max-width: 500px, white background
- **Border-radius:** 8px
- **Shadow:** 0 4px 20px rgba(0, 0, 0, 0.15)

#### Header:

- **Title:** "Настройки API" (h3, #2c3e50)
- **Close Button:** × (24px, top-right)

#### Body:

- **API Key Input:**

  - Label: "Ключ Gemini API:"
  - Type: Password (toggleable to text)
  - Placeholder: "Введите ваш ключ Gemini API"
  - Help text: Link to Google AI Studio
  - Warning: Quota limitations notice

- **Show API Key Checkbox:**
  - Label: "Показать API ключ"
  - Toggles input type

#### Footer:

- **Cancel Button:** Gray, "Отмена"
- **Check Quota Button:** Blue, "Проверить квоту" (opens external link)
- **Save Button:** Blue, "Сохранить"

### 2. Image Generation Modal

#### Structure:

- **Max-width:** 600px
- **Width:** 95%

#### Header:

- **Title:** "Генерация изображения с ИИ"
- **Close Button:** ×

#### Body:

**Prompt Input:**

- **Label:** "Опишите изображение, которое хотите создать:"
- **Type:** Textarea, 3 rows
- **Placeholder:** "Фотореалистичный портрет кота в шляпе волшебника..."

**Generation Options:**

- **Background:** #f8f9fa
- **Border:** 1px solid #e1e5e9
- **Border-radius:** 8px
- **Padding:** 15px

**Option Rows:**
Row 1:

- **Style Select:**
  - Options: Общий, Фотореалистичный, Художественный, Минималистичный, Драматичный
- **Quality Select:**
  - Options: Стандартное, Высокое, Ультра

Row 2:

- **Batch Count Select:**
  - Options: 1 изображение, 2 варианта, 4 варианта

**Generation Status (Hidden by default):**

- **Progress Bar:** Animated blue bar
- **Status Text:** Centered, #6c757d

#### Footer:

- **Cancel Button:** Gray, "Отмена"
- **Generate Button:** Blue, "Генерировать"

## Element System Specification

### Base Element Class (`CanvasElement`)

#### Properties:

- `id`: Unique identifier (generated)
- `type`: Element type string
- `x, y`: Position coordinates
- `width, height`: Dimensions
- `rotation`: Rotation angle (radians)
- `selected`: Boolean selection state
- `visible`: Boolean visibility
- `locked`: Boolean lock state
- `zIndex`: Layer order
- `createdAt`: Timestamp

#### Methods:

- `render(ctx, viewport)`: Abstract rendering method
- `getBounds()`: Returns bounding rectangle
- `hitTest(x, y)`: Point collision detection
- `move(deltaX, deltaY)`: Relative positioning
- `setPosition(x, y)`: Absolute positioning
- `resize(width, height)`: Dimension changes
- `clone()`: Create duplicate with offset
- `toJSON()`: Serialization
- `fromJSON(data)`: Deserialization

### Image Element Class (`ImageElement`)

#### Additional Properties:

- `image`: HTMLImageElement reference
- `aspectRatio`: Width/height ratio
- `opacity`: Alpha transparency (0-1)
- `filters`: Object with brightness, contrast, saturation

#### Rendering Features:

- **Selection Outline:** Blue dashed border (2px, 5px dash)
- **Resize Handles:** 8x8px blue squares at corners
- **Handle Cursors:** nw-resize, ne-resize, se-resize, sw-resize
- **Aspect Ratio:** Maintained during resize
- **Minimum Size:** 20px width/height

#### Interaction:

- **Click:** Select element
- **Drag:** Move element
- **Handle Drag:** Resize with aspect ratio
- **Context Menu:** Appears on selection

### Text Element Class (`TextElement`)

#### Additional Properties:

- `text`: String content
- `fontSize`: Size in pixels (8-200 range)
- `fontFamily`: Font family string
- `color`: Text color (hex)
- `bold, italic, underline`: Boolean styles
- `align`: Text alignment (left, center, right)
- `lineHeight`: Line spacing multiplier

#### Auto-sizing:

- **Width:** Based on longest line + 20px padding
- **Height:** Based on line count × fontSize × lineHeight + 10px padding
- **Updates:** Automatic on text or style changes

#### Rendering Features:

- **Multi-line Support:** \n character handling
- **Selection Background:** Light blue overlay
- **Selection Outline:** Blue dashed border
- **Font Rendering:** Canvas text API with full styling

## Viewport System Specification

### Viewport Class Properties:

- `x, y`: Pan offset coordinates
- `zoom`: Scale factor (0.1 to 5.0)
- `minZoom, maxZoom`: Zoom limits
- `zoomLevels`: Array of 14 fixed zoom levels
- `currentZoomIndex`: Current level index

### Coordinate Systems:

- **Screen Coordinates:** Pixel positions on canvas
- **World Coordinates:** Logical positions in design space
- **Conversion Methods:** `screenToWorld()`, `worldToScreen()`

### Zoom Behavior:

- **Fixed Levels:** Discrete zoom steps for consistency
- **Zoom Center:** Maintains point under cursor
- **Animation:** Smooth transitions with easing
- **Keyboard:** Ctrl+↑/↓ for zoom, Ctrl+0 for reset, Ctrl+1 for fit

### Pan Behavior:

- **Mouse:** Ctrl+drag for panning
- **Cursor:** Changes to grabbing during pan
- **Boundaries:** No artificial limits
- **Animation:** Smooth movement transitions

### Grid System:

- **Type:** Dotted grid pattern
- **Spacing:** Adaptive based on zoom (20px base)
- **Density:** Adjusts to maintain 10-100px screen spacing
- **Dots:** 1-3px radius based on zoom
- **Color:** #e1e5e9

## AI Integration Specification

### API Client Configuration:

- **Base URL:** https://generativelanguage.googleapis.com/v1
- **Model:** models/gemini-1.5-flash
- **Authentication:** API key in query parameter
- **Content-Type:** application/json

### Generation Config:

```javascript
{
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 4096
}
```

### Safety Settings:

- HARM_CATEGORY_HARASSMENT: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_HATE_SPEECH: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_SEXUALLY_EXPLICIT: BLOCK_MEDIUM_AND_ABOVE
- HARM_CATEGORY_DANGEROUS_CONTENT: BLOCK_MEDIUM_AND_ABOVE

### AI Chat System:

#### Input Processing:

1. **Context Gathering:**

   - Total elements count
   - Selected elements count
   - Element types array
   - Canvas dimensions
   - Selected images count

2. **Prompt Construction:**

   - User request in Russian
   - Simple JSON response format
   - Action types: addText, generateImage
   - Fallback to text addition

3. **Response Parsing:**
   - JSON extraction from response
   - Markdown code block handling
   - Fallback to plain text (300 char limit)

#### Action Types:

1. **addText:**

   - Properties: text, x, y, fontSize, color
   - Default position: (100, 100)
   - Default style: 16px, #2c3e50

2. **generateImage:**
   - Properties: prompt, style, aspectRatio, quality
   - Creates text description instead of actual image
   - Adds as text element with "Описание изображения:" prefix

### Image Context Actions:

#### Remove Background:

- **Prompt:** "Remove the background from this image, keeping only the main subject..."
- **Result:** New image element with offset position
- **Fallback:** Text description of background removal

#### Regenerate Image:

- **Process:** Analyze → Generate variations prompt → Create new element
- **Analysis Prompt:** "Describe this image in detail including style, colors..."
- **Variation Prompt:** "Create a similar image with variations..."
- **Offset:** +30px x and y from original

#### Copy Image:

- **Action:** Clone element with +20px offset
- **Selection:** Auto-select new element
- **Auto-save:** Triggers project save

## Keyboard Shortcuts Specification

### Tool Selection:

- **V:** Select tool (default)
- **T:** Text tool

### File Operations:

- **Ctrl+S:** Save project (JSON download)
- **Ctrl+O:** Open project (file picker)

### Selection:

- **Ctrl+A:** Select all elements
- **Escape:** Clear selection
- **Delete/Backspace:** Delete selected elements

### Zoom:

- **Ctrl+0:** Reset to 100%
- **Ctrl+1:** Fit to screen
- **Ctrl+↑:** Zoom in
- **Ctrl+↓:** Zoom out

### AI Chat:

- **Ctrl+Enter:** Send prompt (when textarea focused)
- **/:** Focus AI chat input

### Element Manipulation:

- **Shift+Click:** Multi-select
- **Ctrl+Drag:** Pan canvas

## Data Persistence Specification

### Auto-save System:

- **Frequency:** Every 30 seconds
- **Trigger:** On element changes
- **Storage:** localStorage
- **Key:** 'canvas_ai_studio_project'

### Project Data Structure:

```javascript
{
    projectName: string,
    canvas: {
        viewport: {x, y, zoom},
        elements: [elementData...]
    },
    lastSaved: timestamp
}
```

### Element Serialization:

- **Base Properties:** id, type, position, dimensions, styles
- **Image Elements:** src URL, aspectRatio, opacity, filters
- **Text Elements:** content, font properties, alignment

### API Key Storage:

- **Key:** 'canvas_ai_api_key'
- **Type:** localStorage
- **Security:** Client-side only, not transmitted

## Error Handling Specification

### Network Errors:

- **Failed to fetch:** Network connectivity message
- **CORS errors:** Browser security policy message
- **API key errors:** Invalid key guidance

### API Response Errors:

- **Quota exceeded:** Billing/limits guidance with external links
- **Model not found:** Available models suggestion
- **Safety blocks:** Content policy explanation

### User Input Validation:

- **Empty prompts:** Warning notification
- **Missing API key:** Settings modal auto-open
- **File type validation:** Image files only

### Graceful Degradation:

- **AI unavailable:** Manual text input still works
- **Image generation fails:** Text descriptions as fallback
- **Parse errors:** Raw response as text element

## Performance Specifications

### Rendering Optimization:

- **Viewport Culling:** Only render visible elements
- **Dirty Flagging:** Redraw only when needed
- **Animation Loop:** 60 FPS target with requestAnimationFrame
- **High DPI:** Automatic device pixel ratio handling

### Memory Management:

- **Image Loading:** Async with error handling
- **Element Cleanup:** Proper disposal on deletion
- **Event Listeners:** Cleanup on component destruction

### Responsive Design:

- **Mobile Breakpoint:** 768px
- **Toolbar Scaling:** Smaller buttons on mobile
- **Touch Support:** Touch events for mobile interaction
- **Font Size:** Minimum 16px on mobile (prevents zoom)

## Browser Compatibility

### Minimum Requirements:

- **Canvas API:** Full 2D context support
- **ES6+:** Modern JavaScript features
- **Fetch API:** Network requests
- **LocalStorage:** Data persistence
- **CSS Grid/Flexbox:** Layout support

### Tested Browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Feature Detection:

- **Canvas Support:** Graceful error message
- **API Availability:** Feature availability checks
- **Storage Quota:** Fallback for storage limits

## Accessibility Considerations

### Keyboard Navigation:

- **Tab Order:** Logical focus sequence
- **Keyboard Shortcuts:** Full keyboard operation
- **Focus Indicators:** Visible focus states

### Screen Reader Support:

- **Alt Text:** Image descriptions
- **ARIA Labels:** Button and input labels
- **Semantic HTML:** Proper heading structure

### Visual Accessibility:

- **Color Contrast:** WCAG AA compliance
- **Focus Indicators:** High contrast outlines
- **Text Scaling:** Responsive to browser zoom

## Security Considerations

### API Key Handling:

- **Client-side Storage:** localStorage only
- **No Transmission:** Key not sent to non-Google servers
- **User Control:** User manages their own keys

### Content Security:

- **Input Sanitization:** Text content escaping
- **File Validation:** Image file type checking
- **CORS Compliance:** Proper cross-origin handling

### Data Privacy:

- **Local Storage:** All data stays client-side
- **No Analytics:** No user tracking
- **API Calls:** Direct to Google only

## Testing Requirements

### Unit Tests:

- **Element System:** Creation, manipulation, serialization
- **Viewport:** Coordinate transformations, zoom calculations
- **Utilities:** Helper function validation

### Integration Tests:

- **Canvas Rendering:** Element display and interaction
- **AI Integration:** API communication and response handling
- **File Operations:** Save/load functionality

### User Acceptance Tests:

- **Core Workflows:** Create, edit, save projects
- **AI Features:** Chat interaction and image generation
- **Cross-browser:** Functionality across supported browsers

## Deployment Specifications

### Build Process:

- **No Build Step:** Direct file serving
- **Asset Optimization:** Manual CSS/JS minification optional
- **CDN Dependencies:** Font Awesome from CDN

### Hosting Requirements:

- **Static Hosting:** Any web server
- **HTTPS:** Required for API calls
- **CORS:** No special server configuration needed

### Environment Variables:

- **None Required:** All configuration client-side
- **API Keys:** User-provided through UI

This specification provides complete technical requirements for recreating the Canvas AI Studio application with identical functionality, appearance, and behavior.
