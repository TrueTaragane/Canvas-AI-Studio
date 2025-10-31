# Contributing to Canvas AI Studio

Thank you for your interest in contributing to Canvas AI Studio! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Browser and version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. **Check the roadmap** in README.md
2. **Open a discussion** before creating an issue
3. **Describe the use case** and benefits
4. **Consider implementation complexity**

### Code Contributions

#### Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/canvas-ai-studio.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Guidelines

##### Code Style

- **JavaScript**: ES6+ features preferred
- **Naming**: camelCase for variables and functions
- **Comments**: JSDoc style for functions
- **Indentation**: 4 spaces
- **Line length**: 100 characters max

##### File Organization

```
js/
├── app.js              # Main application logic
├── canvas-engine.js    # Canvas rendering system
├── elements.js         # Element classes
├── viewport.js         # Viewport management
├── advanced-api-client.js # AI integration
└── utils.js           # Utility functions
```

##### Coding Standards

```javascript
/**
 * Example function with proper documentation
 * @param {string} prompt - User input prompt
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} API response
 */
async function generateContent(prompt, options = {}) {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  // Implementation here
}
```

#### Testing

- **Manual testing** in multiple browsers
- **Test all interactive features**
- **Verify responsive design**
- **Check AI integration** (if API key available)

#### Pull Request Process

1. **Update documentation** if needed
2. **Test thoroughly** across browsers
3. **Write clear commit messages**:
   ```
   feat: add undo/redo functionality
   fix: resolve canvas rendering issue on Safari
   docs: update API integration guide
   ```
4. **Create pull request** with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing notes

## 🏗️ Architecture Overview

### Core Components

#### Main Application (`app.js`)

- UI event handling
- Project management
- AI chat coordination
- Modal management

#### Canvas Engine (`canvas-engine.js`)

- Element rendering
- Interaction handling
- Selection management
- Viewport integration

#### Element System (`elements.js`)

- Base element class
- Image element implementation
- Text element implementation
- Serialization/deserialization

#### Viewport (`viewport.js`)

- Zoom management
- Pan operations
- Coordinate transformations
- Animation system

#### AI Client (`advanced-api-client.js`)

- Google Gemini API integration
- Request/response handling
- Error management
- Model adaptation

### Data Flow

```
User Input → App → Canvas Engine → Elements → Rendering
     ↓
AI Chat → API Client → Gemini API → Response Processing
```

## 🎯 Priority Areas

### High Priority

- **Performance optimization** - Canvas rendering improvements
- **Mobile experience** - Touch interaction refinements
- **Accessibility** - Screen reader and keyboard navigation
- **Error handling** - Better user feedback and recovery

### Medium Priority

- **New tools** - Shape tools, drawing tools
- **Export features** - PNG, SVG, PDF export
- **Template system** - Pre-made design templates
- **Collaboration** - Real-time collaboration features

### Low Priority

- **Plugins** - Third-party extension system
- **Advanced AI** - More AI model integrations
- **Cloud sync** - Optional cloud storage
- **Analytics** - Usage analytics (privacy-focused)

## 🐛 Bug Reports

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**

- Browser: [e.g. Chrome 91]
- OS: [e.g. Windows 10]
- Canvas AI Studio version: [e.g. 1.0.0]

**Additional context**
Any other context about the problem.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Other solutions you've considered.

**Additional context**
Screenshots, mockups, or examples.
```

## 🔧 Development Setup

### Prerequisites

- Modern web browser
- Text editor or IDE
- Basic knowledge of JavaScript, HTML, CSS
- Optional: Google Gemini API key for AI features

### Local Development

1. **No build process required** - direct file editing
2. **Use local web server** for testing:

   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve .

   # PHP
   php -S localhost:8000
   ```

3. **Open browser** to `http://localhost:8000`

### Debugging

- **Browser DevTools** - Primary debugging tool
- **Console logging** - Extensive logging available
- **Network tab** - Monitor API requests
- **Application tab** - Check localStorage data

## 📚 Documentation

### Code Documentation

- **JSDoc comments** for all public functions
- **Inline comments** for complex logic
- **README updates** for new features
- **API documentation** for integrations

### User Documentation

- **Feature guides** in README.md
- **Keyboard shortcuts** reference
- **Troubleshooting** common issues
- **API setup** instructions

## 🌍 Internationalization

### Current Status

- **Primary language**: Russian (UI)
- **Code comments**: English
- **Documentation**: English

### Adding Languages

1. **Create language files** in `i18n/` directory
2. **Update UI strings** to use translation keys
3. **Add language selector** to settings
4. **Test RTL languages** if applicable

## 🚀 Release Process

### Version Numbering

- **Major** (1.0.0): Breaking changes
- **Minor** (1.1.0): New features
- **Patch** (1.0.1): Bug fixes

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Browser compatibility verified

## 📞 Getting Help

### Resources

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Technical Specification** - Detailed implementation guide
- **Code Comments** - Inline documentation

### Community Guidelines

- **Be respectful** and inclusive
- **Help others** when possible
- **Stay on topic** in discussions
- **Follow code of conduct**

## 🏆 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

Thank you for contributing to Canvas AI Studio! 🎨✨
