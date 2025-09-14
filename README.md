# Helix IDE

## 🚀 Overview

Helix IDE is a powerful, modern in-browser development environment built with Next.js 14, featuring AI-powered assistance, real-time collaboration, and live preview capabilities. Inspired by the aesthetic of Bolt.new, it provides a seamless coding experience directly in your browser.

## ✨ Features

### 🔐 Authentication
- **Firebase Authentication**: Secure user authentication with email/password
- **Clean UI**: Minimalist dark theme with gradient accents
- **User Management**: Sign up, sign in, and profile management

### 📁 Project Management
- **Dashboard**: Clean project overview with creation capabilities
- **Project Creation**: Easy project setup with name and description
- **Project Organization**: Visual project cards with metadata

### 🛠️ In-Browser IDE
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **File Explorer**: Interactive file and folder management
- **Live Preview**: Real-time HTML/CSS/JavaScript preview pane
- **Multi-language Support**: JavaScript, TypeScript, HTML, CSS, JSON, Markdown, and more

### 🤖 AI-Powered Features
- **AI Chat Interface**: Integrated AI assistant for coding help
- **Multiple AI Models**: Support for OpenAI GPT models and Google Gemini
- **Context-Aware**: AI understands your project structure and files
- **Code Generation**: Automatic file creation from AI responses
- **Debugging Assistant**: AI-powered error analysis and fixes

### 📥 File Management
- **Download Projects**: Export entire projects as ZIP files
- **Individual File Download**: Download specific files
- **JSON Export**: Export project structure as JSON
- **Auto-save**: Real-time file saving and synchronization

### 🎨 User Experience
- **Dark Theme**: Eye-friendly dark theme inspired by Bolt.new
- **Responsive Design**: Works seamlessly on desktop and tablet
- **Real-time Updates**: Live preview updates as you type
- **Intuitive UI**: Clean, modern interface with Lucide icons

## 🛠️ Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code's editor in the browser
- **Lucide React**: Beautiful icons

### Backend & Services
- **Firebase**: Authentication and real-time database
- **OpenAI API**: GPT models for AI assistance
- **Google Generative AI**: Gemini models support
- **Next.js API Routes**: Serverless API endpoints

### Build & Development
- **TypeScript**: Static type checking
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- OpenAI API key (optional)
- Google AI API key (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/helix-ide.git
cd helix-ide
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

🎉 **Good news!** The Firebase configuration and Google AI API key are already integrated into the code, so you don't need to set up environment variables for basic functionality.

The following values are already configured:
- **Firebase**: All authentication and database settings
- **Google AI**: Gemini API key for AI assistance

If you want to use your own API keys later, you can create a `.env.local` file:

```env
# Optional: Override with your own keys
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Add OpenAI support
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
```

4. **Firebase Setup**

✅ **Already Done!** The Firebase project is already configured and ready to use with:
- **Project ID**: helix-ide
- **Authentication**: Email/Password enabled
- **Firestore**: Database ready for use

Your app will work immediately with the provided configuration. If you want to use your own Firebase project later, you can:
- Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
- Enable Authentication with Email/Password
- Enable Firestore Database
- Update the configuration in `src/lib/firebase.ts`

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating Your First Project

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Create Project**: Click "New Project" on the dashboard
3. **Enter Details**: Provide a project name and optional description
4. **Start Coding**: Click "Open Project" to enter the IDE

### Using the IDE

#### File Management
- **Create File**: Click the "+" icon in the file explorer
- **Create Folder**: Click the folder icon in the file explorer
- **Edit Files**: Click on any file to open it in the editor
- **Delete Files**: Hover over a file and click the trash icon

#### Live Preview
- Create an `index.html` file to see live preview
- CSS and JavaScript files are automatically injected
- Preview updates in real-time as you type

#### AI Assistant
- Click "AI Chat" in the toolbar to open the assistant
- Ask questions about your code
- Request code generation or debugging help
- AI has full context of your project files

#### Downloading Projects
- **Full Project**: Click "Download" to get a ZIP file
- **Individual Files**: Right-click on files for download options
- **JSON Export**: Export project structure as JSON

### AI Features

#### Supported AI Models
- **OpenAI**: gpt-3.5-turbo, gpt-4, gpt-4-turbo
- **Google**: gemini-pro, gemini-2.5-flash-preview

#### AI Capabilities
- Code review and suggestions
- Bug fixing and debugging
- Code generation from descriptions
- Architecture recommendations
- Best practices guidance

## 🔧 Configuration

### Customizing AI Models

To add support for additional AI models, modify the API route at `src/app/api/ai/chat/route.ts`:

```typescript
// Add new model support
if (model.startsWith('claude-')) {
  // Anthropic Claude integration
}
```

### Theming

Customize the dark theme in `src/app/globals.css`:

```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* Modify other CSS variables */
}
```

### Editor Settings

Customize Monaco Editor in `src/components/editor/CodeEditor.tsx`:

```typescript
options={{
  fontSize: 14,
  fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
  // Add more options
}}
```

## 🔌 API Reference

### AI Chat Endpoint

**POST** `/api/ai/chat`

```typescript
{
  "message": "How do I create a React component?",
  "context": {
    "files": [{ "name": "index.html", "content": "..." }],
    "projectName": "My Project"
  },
  "model": "gpt-3.5-turbo"
}
```

**Response:**
```typescript
{
  "response": "Here's how to create a React component...",
  "codeBlocks": [
    {
      "language": "javascript",
      "code": "const MyComponent = () => { return <div>Hello</div>; }"
    }
  ],
  "model": "gpt-3.5-turbo"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the amazing code editor
- [Bolt.new](https://bolt.new) for design inspiration
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Firebase](https://firebase.google.com/) for authentication and database
- [OpenAI](https://openai.com/) and [Google AI](https://ai.google/) for AI capabilities

## 🐛 Known Issues

- Large files may impact performance in the Monaco editor
- Preview pane sandbox has limitations with certain JavaScript features
- AI responses may occasionally timeout for complex requests

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Git integration
- [ ] Plugin system
- [ ] More AI model providers
- [ ] Mobile responsive improvements
- [ ] Terminal integration
- [ ] Version control
- [ ] Code formatting and linting
- [ ] Debugging tools
- [ ] Performance monitoring

## 📞 Support

For support, please:
1. Check the [Issues](https://github.com/yourusername/helix-ide/issues) page
2. Create a new issue with detailed information
3. Join our [Discord](https://discord.gg/your-server) community

---

**Made with ❤️ by the Helix IDE team**