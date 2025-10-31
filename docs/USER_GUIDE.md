# Canvas AI Studio User Guide

Welcome to Canvas AI Studio! This comprehensive guide will help you master all the features and capabilities of this AI-powered design tool.

## 🎯 Getting Started

### First Launch

1. Open `index.html` in your web browser
2. You'll see a clean interface with:
   - Header with project title and zoom controls
   - Left toolbar with design tools
   - Main canvas area
   - AI chat at the bottom

### Basic Navigation

- **Pan**: Hold Ctrl and drag to move around the canvas
- **Zoom**: Use Ctrl+↑/↓ or the zoom controls in the header
- **Select**: Click elements to select them
- **Multi-select**: Hold Shift and click multiple elements

## 🛠️ Tools Overview

### Select Tool (V)

**Default tool for interacting with elements**

**Functions:**

- Click to select elements
- Drag to move selected elements
- Drag handles to resize images
- Shift+click for multi-selection

**Visual Feedback:**

- Selected elements show blue dashed outline
- Image elements display resize handles at corners
- Context menu appears for selected images

### Image Tool

**Add images to your canvas**

**How to Use:**

1. Click the image icon in toolbar
2. Select image files from your computer
3. Images appear at canvas center
4. Drag to reposition, use handles to resize

**Supported Formats:**

- PNG, JPEG, WebP
- Multiple files can be selected at once
- Drag & drop also supported

**Features:**

- Automatic aspect ratio preservation
- Smart initial sizing (max 300px)
- High-quality rendering

### Text Tool (T)

**Create and edit text elements**

**How to Use:**

1. Click the text icon or press T
2. Text element appears at canvas center
3. Click to select and edit properties
4. Use AI chat for content generation

**Text Properties:**

- Font size (8-200px)
- Font family
- Color (any hex color)
- Bold, italic, underline
- Text alignment (left, center, right)
- Line height

### AI Image Generation (✨)

**Generate image descriptions with AI**

**How to Use:**

1. Click the magic wand icon
2. Enter your image description
3. Choose style and quality options
4. Click "Генерировать"

**Options:**

- **Style**: General, Photorealistic, Artistic, Minimalist, Dramatic
- **Quality**: Standard, High, Ultra
- **Batch**: 1, 2, or 4 variations

**Note**: Currently creates detailed text descriptions instead of actual images due to API limitations.

### Settings (⚙️)

**Configure your AI integration**

**Setup:**

1. Get API key from [Google AI Studio](https://ai.google.dev/)
2. Click settings icon
3. Enter your API key
4. Click "Сохранить"

## 🎨 Working with Elements

### Image Elements

#### Selection and Manipulation

- **Click** to select
- **Drag** to move
- **Drag handles** to resize (maintains aspect ratio)
- **Right-click** for context menu (coming soon)

#### Context Menu Actions

When an image is selected, a floating menu appears with:

1. **Remove Background (🪄)**

   - Uses AI to remove image background
   - Creates new image with transparent/white background
   - Original image remains unchanged

2. **Regenerate (🔄)**

   - AI analyzes the image
   - Creates variations with similar style
   - Generates new image offset from original

3. **Copy (📋)**
   - Creates exact duplicate
   - New image offset by 20px
   - Automatically selected

#### Properties

- Position (x, y coordinates)
- Size (width, height with aspect ratio)
- Opacity (0-1, future feature)
- Filters (brightness, contrast, saturation - future)

### Text Elements

#### Creating Text

- Use Text tool (T) or AI chat
- Default text: "Добавьте ваш текст"
- Appears at canvas center
- Auto-sizes based on content

#### Editing Text

- Select element to see properties
- Text automatically reflows
- Supports multi-line text with \n
- Dynamic bounding box

#### Styling Options

- **Font Size**: 8-200px range
- **Font Family**: System fonts
- **Color**: Full color picker
- **Weight**: Bold toggle
- **Style**: Italic toggle
- **Decoration**: Underline toggle
- **Alignment**: Left, center, right

## 🤖 AI Assistant

### AI Chat Interface

**Located at bottom of screen**

**Features:**

- Context-aware responses
- Understands your current project
- Supports Russian language
- Real-time interaction

### Using AI Chat

#### Basic Interaction

1. Type your request in the text area
2. Press Ctrl+Enter or click send button
3. AI processes your request
4. Actions are applied to canvas

#### Example Requests

```
"Добавь заголовок для этого дизайна"
"Создай описание продукта"
"Сделай этот текст более привлекательным"
"Создай изображение кота в шляпе"
"Предложи цветовую схему"
```

#### AI Actions

The AI can perform various actions:

1. **Add Text** - Creates text elements
2. **Generate Images** - Creates image descriptions
3. **Modify Elements** - Changes existing elements
4. **Layout Suggestions** - Arranges elements
5. **Style Applications** - Applies styling

### Image Context for AI

**Select images to provide context to AI**

**How it Works:**

1. Select image elements on canvas
2. They appear in "Selected Images" area above chat
3. AI analyzes these images when responding
4. Provides more relevant suggestions

**Use Cases:**

- "Make this image more colorful"
- "Create similar image with different colors"
- "Remove background from this image"
- "Generate text that matches this image style"

## 🔍 Viewport and Navigation

### Zoom System

**14 precision zoom levels from 10% to 500%**

**Zoom Controls:**

- **Zoom In**: Ctrl+↑ or zoom button
- **Zoom Out**: Ctrl+↓ or zoom button
- **Reset**: Ctrl+0 or home button
- **Fit Screen**: Ctrl+1 or expand button
- **Custom**: Click zoom percentage for dropdown

**Zoom Levels:**
10%, 25%, 33%, 50%, 67%, 75%, 100%, 125%, 150%, 200%, 250%, 300%, 400%, 500%

### Pan and Navigation

- **Pan**: Ctrl+drag anywhere on canvas
- **Cursor**: Changes to grabbing hand during pan
- **Smooth**: Animated transitions
- **Unlimited**: No artificial boundaries

### Grid System

**Adaptive dotted grid for alignment**

**Features:**

- Spacing adjusts with zoom level
- Maintains 10-100px screen spacing
- Subtle dots for minimal distraction
- Helps with element alignment

## 💾 Project Management

### Auto-Save

**Automatic project preservation**

**Features:**

- Saves every 30 seconds
- Saves on element changes
- Stores in browser localStorage
- Automatic recovery on restart

### Manual Save/Load

**Export and import projects**

**Save Project (Ctrl+S):**

1. Press Ctrl+S or use menu
2. Downloads JSON file
3. Contains all project data
4. Filename based on project name

**Open Project (Ctrl+O):**

1. Press Ctrl+O or use menu
2. Select JSON project file
3. Loads all elements and settings
4. Replaces current project

### Project Data

**What's saved in projects:**

- All canvas elements (images, text)
- Element properties and styling
- Viewport position and zoom
- Project name and metadata
- Creation and modification dates

## ⌨️ Keyboard Shortcuts

### Essential Shortcuts

| Shortcut | Action              |
| -------- | ------------------- |
| `V`      | Select tool         |
| `T`      | Text tool           |
| `Ctrl+S` | Save project        |
| `Ctrl+O` | Open project        |
| `Ctrl+A` | Select all elements |
| `Delete` | Delete selected     |
| `Escape` | Clear selection     |

### Zoom and Navigation

| Shortcut    | Action                     |
| ----------- | -------------------------- |
| `Ctrl+0`    | Reset zoom to 100%         |
| `Ctrl+1`    | Fit all elements to screen |
| `Ctrl+↑`    | Zoom in                    |
| `Ctrl+↓`    | Zoom out                   |
| `Ctrl+Drag` | Pan canvas                 |

### AI and Chat

| Shortcut     | Action              |
| ------------ | ------------------- |
| `Ctrl+Enter` | Send AI prompt      |
| `/`          | Focus AI chat input |

### Selection and Editing

| Shortcut      | Action                |
| ------------- | --------------------- |
| `Shift+Click` | Multi-select elements |
| `Ctrl+A`      | Select all            |
| `Escape`      | Clear selection       |
| `Delete`      | Delete selected       |
| `Backspace`   | Delete selected       |

## 🎨 Design Workflows

### Creating a Simple Design

1. **Start with background**

   - Add background image if needed
   - Or work on transparent canvas

2. **Add main elements**

   - Use Image tool for visuals
   - Use Text tool for headings

3. **Arrange and style**

   - Position elements with drag
   - Resize with handles
   - Use AI for styling suggestions

4. **Refine with AI**
   - Ask AI for improvements
   - Generate additional content
   - Get color and layout suggestions

### Working with AI Assistance

1. **Describe your goal**

   - "Create a product showcase"
   - "Design a social media post"
   - "Make a presentation slide"

2. **Provide context**

   - Select relevant images
   - Describe your brand/style
   - Mention target audience

3. **Iterate and refine**
   - Ask for variations
   - Request specific changes
   - Build on AI suggestions

### Image Editing Workflow

1. **Import images**

   - Drag & drop or use Image tool
   - Position and size appropriately

2. **Select for context**

   - Click images to select
   - They appear in AI context area

3. **Use AI actions**

   - Remove backgrounds
   - Generate variations
   - Get style suggestions

4. **Refine results**
   - Adjust positioning
   - Combine with text
   - Create compositions

## 🔧 Troubleshooting

### Common Issues

#### AI Not Working

**Symptoms**: No response from AI chat
**Solutions**:

1. Check API key in settings
2. Verify internet connection
3. Check browser console for errors
4. Try refreshing the page

#### Images Not Loading

**Symptoms**: Images don't appear after upload
**Solutions**:

1. Check file format (PNG, JPEG, WebP only)
2. Verify file size (very large files may fail)
3. Try different images
4. Check browser console for errors

#### Performance Issues

**Symptoms**: Slow rendering or interaction
**Solutions**:

1. Reduce number of elements
2. Use smaller image files
3. Close other browser tabs
4. Restart browser

#### Canvas Not Responding

**Symptoms**: Can't interact with elements
**Solutions**:

1. Check if correct tool is selected
2. Try clicking different areas
3. Press Escape to clear selection
4. Refresh the page

### Browser Compatibility

**Supported Browsers:**

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**

- HTML5 Canvas
- ES6+ JavaScript
- Fetch API
- LocalStorage

### Getting Help

1. **Check browser console** (F12) for error messages
2. **Try in different browser** to isolate issues
3. **Clear browser cache** if problems persist
4. **Report issues** on GitHub with details

## 🚀 Advanced Tips

### Productivity Tips

1. **Use keyboard shortcuts** for faster workflow
2. **Master the AI chat** for quick content generation
3. **Organize with layers** (select order matters)
4. **Save frequently** even with auto-save
5. **Use zoom levels** strategically for precision

### AI Best Practices

1. **Be specific** in your requests
2. **Provide context** with selected images
3. **Iterate gradually** rather than big changes
4. **Experiment** with different phrasings
5. **Combine AI suggestions** with manual editing

### Design Best Practices

1. **Start with wireframes** using text elements
2. **Use consistent spacing** with grid guidance
3. **Maintain visual hierarchy** with sizing
4. **Consider color harmony** in your palette
5. **Test at different zoom levels** for clarity

---

**Happy designing with Canvas AI Studio!** 🎨✨

_For technical details, see the [Technical Specification](../Canvas_AI_Studio_Technical_Specification.md)_
