# 🎨 Canvas AI Studio

**AI-powered design tool for creative professionals**

Canvas AI Studio is a modern web-based design application that combines traditional canvas editing capabilities with cutting-edge AI assistance. Create, edit, and enhance your designs with the power of Google Gemini AI.

![Canvas AI Studio Screenshot](https://via.placeholder.com/800x400/3498db/ffffff?text=Canvas+AI+Studio)

## ✨ Features

### 🎯 Core Design Tools

- **Interactive Canvas** - Professional-grade HTML5 canvas with smooth rendering
- **Element System** - Images and text elements with full manipulation
- **Precision Controls** - Pixel-perfect positioning and sizing
- **Multi-selection** - Work with multiple elements simultaneously
- **Undo/Redo** - Complete history management (coming soon)

### 🤖 AI-Powered Assistance

- **Smart Chat** - Context-aware AI assistant that understands your project
- **Image Generation** - Create detailed image descriptions with AI
- **Content Creation** - Generate text, layouts, and design suggestions
- **Image Analysis** - AI-powered image understanding and editing suggestions
- **Background Removal** - Intelligent background removal with AI

### 🖼️ Image Management

- **Drag & Drop** - Easy image import from your computer
- **Multiple Formats** - Support for PNG, JPEG, WebP
- **Smart Resizing** - Automatic aspect ratio preservation
- **Context Menu** - Quick actions for selected images
- **Batch Operations** - Work with multiple images at once

### 📝 Text Editing

- **Rich Typography** - Full font control with multiple styles
- **Multi-line Support** - Create complex text layouts
- **Auto-sizing** - Dynamic text box sizing
- **Color Customization** - Complete color control
- **Alignment Options** - Left, center, right alignment

### 🔍 Advanced Viewport

- **Smooth Zooming** - 14 precision zoom levels (10% - 500%)
- **Pan & Navigate** - Intuitive canvas navigation
- **Fit to Screen** - Automatic content fitting
- **Grid System** - Adaptive dotted grid for alignment
- **Keyboard Shortcuts** - Professional workflow shortcuts

### 💾 Project Management

- **Auto-save** - Never lose your work
- **Export/Import** - JSON-based project files
- **Local Storage** - Client-side data persistence
- **Project History** - Automatic backup and recovery

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/canvas-ai-studio.git
cd canvas-ai-studio
```

### 2. Open in Browser

Simply open `index.html` in your web browser. No build process required!

### 3. Configure AI (Optional)

1. Click the settings icon (⚙️) in the toolbar
2. Get your free API key from [Google AI Studio](https://ai.google.dev/)
3. Enter your API key and save

### 4. Start Creating!

- Use **V** to select elements
- Use **T** to add text
- Click the image icon to add images
- Use the AI chat at the bottom for assistance

## 🎮 Controls & Shortcuts

### Keyboard Shortcuts

| Shortcut     | Action          |
| ------------ | --------------- |
| `V`          | Select tool     |
| `T`          | Text tool       |
| `Ctrl+S`     | Save project    |
| `Ctrl+O`     | Open project    |
| `Ctrl+A`     | Select all      |
| `Ctrl+0`     | Reset zoom      |
| `Ctrl+1`     | Fit to screen   |
| `Ctrl+↑/↓`   | Zoom in/out     |
| `Ctrl+Enter` | Send AI prompt  |
| `Delete`     | Delete selected |
| `Escape`     | Clear selection |
| `/`          | Focus AI chat   |

### Mouse Controls

- **Click** - Select elements
- **Drag** - Move elements
- **Ctrl+Drag** - Pan canvas
- **Shift+Click** - Multi-select
- **Handle Drag** - Resize elements

## 🤖 AI Integration

Canvas AI Studio integrates with Google Gemini AI to provide intelligent assistance:

### Supported AI Features

- **Contextual Chat** - AI understands your current project
- **Image Descriptions** - Detailed visual descriptions
- **Content Generation** - Text and layout suggestions
- **Design Assistance** - Creative suggestions and improvements
- **Smart Actions** - Automated design operations

### API Configuration

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Create a new API key
3. Enable Gemini API access
4. Enter the key in Canvas AI Studio settings

**Note:** The application adapts to available API models automatically. If image generation is not available, it creates detailed text descriptions instead.

## 🏗️ Architecture

### Core Components

- **`app.js`** - Main application logic and UI management
- **`canvas-engine.js`** - Canvas rendering and element management
- **`elements.js`** - Element classes (Image, Text, Base)
- **`viewport.js`** - Zoom, pan, and coordinate management
- **`advanced-api-client.js`** - AI integration and API communication
- **`utils.js`** - Utility functions and helpers

### Technology Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3
- **AI Integration:** Google Gemini API
- **Storage:** Browser LocalStorage
- **Dependencies:** Font Awesome (CDN)

## 🌐 Browser Support

### Minimum Requirements

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Required Features

- HTML5 Canvas API
- ES6+ JavaScript
- Fetch API
- LocalStorage
- CSS Grid/Flexbox

## 📱 Responsive Design

Canvas AI Studio works on various screen sizes:

- **Desktop** - Full feature set
- **Tablet** - Optimized touch interface
- **Mobile** - Core functionality with adapted UI

## 🔒 Privacy & Security

- **Local-first** - All data stays on your device
- **No tracking** - No analytics or user tracking
- **API keys** - Managed entirely by you
- **Open source** - Full transparency

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features and tools
- 🎨 UI/UX enhancements
- 📚 Documentation improvements
- 🌍 Internationalization
- 🧪 Testing and quality assurance

### Code Style

- Use ES6+ features
- Follow existing naming conventions
- Add comments for complex logic
- Maintain responsive design principles

## 📋 Roadmap

### Version 2.0 (Planned)

- [ ] Real image generation (when API access available)
- [ ] Advanced text formatting
- [ ] Layer management system
- [ ] Shape tools (rectangles, circles, lines)
- [ ] Color picker and palette management
- [ ] Template system
- [ ] Collaboration features
- [ ] Plugin architecture

### Version 1.5 (In Progress)

- [ ] Undo/Redo system
- [ ] Keyboard shortcuts help
- [ ] Export to PNG/SVG
- [ ] Grid snapping
- [ ] Alignment tools
- [ ] Performance optimizations

## 🐛 Known Issues

- Image generation creates text descriptions (API limitation)
- Large images may impact performance
- Mobile touch interactions need refinement
- Undo/Redo not yet implemented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI capabilities
- **Font Awesome** - For beautiful icons
- **Open Source Community** - For inspiration and tools

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/canvas-ai-studio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/canvas-ai-studio/discussions)
- **Documentation:** [Technical Specification](Canvas_AI_Studio_Technical_Specification.md)

---

**Made with ❤️ for the creative community**

_Canvas AI Studio - Where creativity meets artificial intelligence_
