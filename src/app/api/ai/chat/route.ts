import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// NVIDIA API configuration
const NVIDIA_API_KEY = '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';
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export async function POST(request: NextRequest) {
  try {
    const { message, context, model = 'auto', conversationHistory = [], projectId, chatMode = 'ask' } = await request.json();

    // Auto model selection logic
    let selectedModel = model;
    if (model === 'auto') {
      // Smart model selection based on context
      const isCodeRelated = /\b(code|function|class|import|export|const|let|var|if|for|while|return)\b/i.test(message);
      const isLongTask = message.length > 200 || /\b(build|create|implement|develop|design)\b/i.test(message);
      
      if (isCodeRelated) {
        selectedModel = 'qwen/qwen3-coder-480b-a35b-instruct';
      } else if (isLongTask) {
        selectedModel = 'nvidia/llama-3.3-nemotron-super-49b-v1.5';
      } else {
        selectedModel = 'meta/llama-3.2-3b-instruct';
      }
    }

    // Content filtering - only allow coding related questions
    const codingKeywords = [
      'code', 'programming', 'javascript', 'typescript', 'html', 'css', 'react', 'next',
      'component', 'function', 'variable', 'api', 'database', 'frontend', 'backend',
      'debug', 'error', 'bug', 'fix', 'build', 'deploy', 'git', 'npm', 'yarn',
      'algorithm', 'data structure', 'class', 'object', 'array', 'string', 'number',
      'boolean', 'async', 'await', 'promise', 'callback', 'event', 'dom', 'json',
      'xml', 'http', 'https', 'rest', 'graphql', 'sql', 'nosql', 'mongodb', 'firebase',
      'auth', 'login', 'register', 'session', 'token', 'jwt', 'oauth', 'security',
      'performance', 'optimization', 'responsive', 'mobile', 'desktop', 'browser',
      'server', 'client', 'framework', 'library', 'package', 'module', 'import',
      'export', 'interface', 'type', 'enum', 'generic', 'inheritance', 'polymorphism',
      'encapsulation', 'abstraction', 'design pattern', 'mvc', 'mvvm', 'crud',
      'game', 'animation', 'graphics', 'canvas', 'webgl', 'three.js', 'socket',
      'websocket', 'real-time', 'live', 'stream', 'video', 'audio', 'media',
      'style', 'styling', 'layout', 'responsive', 'flexbox', 'grid', 'bootstrap',
      'tailwind', 'sass', 'scss', 'less', 'webpack', 'vite', 'rollup', 'babel',
      'eslint', 'prettier', 'typescript', 'testing', 'jest', 'cypress', 'playwright',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify'
    ];
    
    const isCodingRelated = codingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    ) || /\b(create|build|make|develop|implement|design|write|generate)\b.*\b(app|website|game|component|function|script|program|software|system|file|folder|page|route|api|database|ui|interface)\b/i.test(message)
    || /\b(how to|how do I|how can I)\b.*\b(code|program|build|create|implement|design|develop)\b/i.test(message)
    || /\b(what is|explain|tutorial|learn)\b.*\b(javascript|typescript|react|html|css|programming|coding|development)\b/i.test(message)
    || /\b(help|assist|support)\b.*\b(code|coding|programming|development|debug|error|bug)\b/i.test(message);
    
    if (!isCodingRelated && chatMode !== 'agent') {
      return NextResponse.json({
        response: "I'm your coding assistant! I specialize in helping with programming, web development, software engineering, and technical implementation. Please ask me questions related to:\n\n• Programming languages (JavaScript, TypeScript, Python, etc.)\n• Web development (HTML, CSS, React, Next.js, etc.)\n• Software engineering and architecture\n• Debugging and troubleshooting\n• Code optimization and best practices\n• Development tools and workflows\n• Building apps, websites, and games\n\nWhat would you like to code today?",
        codeBlocks: [],
        filesToCreate: [],
        filesToUpdate: [],
        fileReadResults: [],
        fileUpdateResults: [],
        fileDeletionResults: [],
        folderCreationResults: [],
        terminalResults: [],
        previewRequests: [],
        userQuestions: [],
        model: selectedModel,
      });
    }

    // Generate system prompt based on project context and chat mode
    let systemPrompt = '';
    
    if (chatMode === 'agent') {
      systemPrompt = `You are Helix AI Agent, a direct coding assistant that builds what users ask for.

SIMPLE RULES:
- Be conversational and direct
- Build complete, working solutions
- Create multiple files for games/apps (HTML, CSS, JS separately)
- Use modern JavaScript and best practices
- Make functional code that actually works

CREATE FILES:
\`\`\`html
// [filepath].html
[complete HTML]
\`\`\`

\`\`\`css
// [filepath].css
[complete CSS]
\`\`\`

\`\`\`javascript
// [filepath].js
[complete JavaScript]
\`\`\`

\`\`\`tsx
// [filepath].tsx
[React component]
\`\`\`

PROJECT: Next.js 15.5.3, TypeScript, Tailwind CSS, Firebase Auth
FILES: ${context?.files?.map(f => `${f.name}`).join(', ') || 'None'}

Build it now!`;
    } else {
      systemPrompt = `You are Helix AI, a helpful coding assistant that talks like a developer friend.

BE HELPFUL:
- Answer questions clearly
- Provide working code examples
- Explain concepts simply
- Suggest best practices
- Be conversational and friendly

PROJECT: Next.js 15.5.3, TypeScript, Tailwind CSS, Firebase Auth
FILES: ${context?.files?.map(f => `${f.name}`).join(', ') || 'None'}

Help the developer succeed!`;
    }

    let response = '';

    try {
      // Use NVIDIA API
      const requestBody = {
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...conversationHistory.slice(-5),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: selectedModel.includes('nemotron') ? 0.6 : 0.7,
        top_p: selectedModel.includes('nemotron') ? 0.95 : 0.8,
        max_tokens: selectedModel.includes('nemotron') ? 65536 : 4096,
        stream: false
      };

      const nvidiaResponse = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!nvidiaResponse.ok) {
        throw new Error(`NVIDIA API Error: ${nvidiaResponse.status} ${nvidiaResponse.statusText}`);
      }

      const nvidiaData = await nvidiaResponse.json();
      response = nvidiaData.choices?.[0]?.message?.content || 'No response generated';
      
      // Remove any formal structure and robotic language
      response = response.replace(/<think>[\s\S]*?<\/think>/gi, '');
      response = response.replace(/\*\*Reasoning:\*\*[\s\S]*?(?=\n\n|$)/gi, '');
      response = response.replace(/^.*?thinking.*?$/gmi, '');
      response = response.replace(/💻\s*CODING\s*MODE\s*ACTIVATED/gi, '');
      response = response.replace(/🗣️\s*CONVERSATION\s*MODE/gi, '');
      response = response.replace(/\*\*Explanation:\*\*/gi, '');
      response = response.replace(/\*\*Next Steps:\*\*/gi, '');
      response = response.replace(/^\s*-\s*.*$/gm, (match) => {
        // Only remove bullet points that look like formal explanations
        if (match.includes('file') || match.includes('HTML') || match.includes('CSS') || match.includes('JavaScript')) {
          return '';
        }
        return match;
      });
      response = response.trim();
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      response = 'I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.';
    }

    // Extract code blocks and commands
    const codeBlockRegex = /```(?:(\w+)\s*)?(?:\n|\r\n)?([\s\S]*?)```/g;
    const codeBlocks: Array<{ language: string; code: string }> = [];
    const filesToCreate: Array<{ path: string; content: string; language: string }> = [];
    const filesToUpdate: Array<{ path: string; content: string; language: string }> = [];
    const filesToRead: Array<string> = [];
    const filesToDelete: Array<string> = [];
    const foldersToCreate: Array<string> = [];
    const terminalCommands: Array<{ command: string; language: string }> = [];
    const previewRequests: Array<string> = [];
    const userQuestions: Array<string> = [];
    let match;

    // Extract code blocks
    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      // Check if it's a terminal command
      if (language === 'terminal' || language === 'bash' || language === 'cmd') {
        terminalCommands.push({
          command: code,
          language
        });
      } else if (language === 'read-file') {
        // File reading request
        filesToRead.push(code);
      } else if (language === 'delete-file') {
        // File deletion request
        filesToDelete.push(code);
      } else if (language === 'create-folder') {
        // Folder creation request
        foldersToCreate.push(code);
      } else if (language === 'preview') {
        // Preview request
        previewRequests.push(code);
      } else if (language === 'question') {
        // User question
        userQuestions.push(code);
      } else {
        codeBlocks.push({
          language,
          code,
        });
      }
    }

    // Enhanced file creation and update instructions parsing
    const fileInstructionPatterns = [
      /(?:I'll create|I'll make|Creating|Let me create|I'll add|I'll build).*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:at|in|to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:I'll update|I'll modify|I'll edit|Updating|Modifying).*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:at|in|to)?\s*([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:Here's|Here is)\s+(?:the|a|an)\s+.*?(?:file|component|function|class|interface|hook|util|page|api|route).*?(?:for|at|in|to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi,
      /(?:Save this as|Put this in|Add this to)\s+([^\s`"']+\.[a-zA-Z0-9]+)/gi
    ];
    
    fileInstructionPatterns.forEach(pattern => {
      const fileMatches = response.matchAll(pattern);
      for (const fileMatch of fileMatches) {
        const filePath = fileMatch[1];
        const isUpdate = /(?:I'll update|I'll modify|I'll edit|Updating|Modifying)/i.test(fileMatch[0]);
        
        // Find the next code block after this instruction
        const instructionIndex = response.indexOf(fileMatch[0]);
        const nextCodeBlockStart = response.indexOf('```', instructionIndex);
        if (nextCodeBlockStart !== -1) {
          const correspondingCodeBlock = codeBlocks.find(block => {
            const blockIndex = response.indexOf('```' + block.language);
            return blockIndex >= nextCodeBlockStart;
          });
          
          if (correspondingCodeBlock) {
            if (isUpdate && !filesToUpdate.some(f => f.path === filePath)) {
              filesToUpdate.push({
                path: filePath,
                content: correspondingCodeBlock.code,
                language: correspondingCodeBlock.language
              });
            } else if (!isUpdate && !filesToCreate.some(f => f.path === filePath)) {
              filesToCreate.push({
                path: filePath,
                content: correspondingCodeBlock.code,
                language: correspondingCodeBlock.language
              });
            }
          }
        }
      }
    });

    // Auto-detect files from code blocks with common patterns
    codeBlocks.forEach((block, index) => {
      // Look for file path comments or JSX/component patterns
      const lines = block.code.split('\n');
      const firstLine = lines[0]?.trim();
      
      // Check for file path comments like // src/components/MyComponent.tsx
      const pathComment = firstLine?.match(/\/\/\s*([^\s]+\.[a-zA-Z0-9]+)/);
      if (pathComment && !filesToCreate.some(f => f.path === pathComment[1]) && !filesToUpdate.some(f => f.path === pathComment[1])) {
        filesToCreate.push({
          path: pathComment[1],
          content: block.code.replace(firstLine, '').trim(),
          language: block.language
        });
        return;
      }
      
      // Auto-detect based on language and content patterns
      let suggestedPath = '';
      if (block.language === 'tsx' || block.language === 'jsx') {
        const componentMatch = block.code.match(/(?:export\s+(?:default\s+)?(?:function|const)\s+([A-Z][A-Za-z0-9]+))|(?:function\s+([A-Z][A-Za-z0-9]+))/);;
        if (componentMatch) {
          const componentName = componentMatch[1] || componentMatch[2];
          suggestedPath = `src/components/${componentName}.${block.language}`;
        }
      } else if (block.language === 'ts' || block.language === 'js') {
        if (block.code.includes('export')) {
          // Try to extract meaningful name from exports
          const exportMatch = block.code.match(/export\s+(?:const|function)\s+([a-zA-Z][a-zA-Z0-9]+)/);
          if (exportMatch) {
            suggestedPath = `src/lib/${exportMatch[1]}.${block.language}`;
          } else {
            suggestedPath = `src/lib/utils.${block.language}`;
          }
        }
      } else if (block.language === 'css') {
        suggestedPath = `src/styles/generated.css`;
      } else if (block.language === 'json') {
        // Check if it's package.json content
        if (block.code.includes('\"dependencies\"') || block.code.includes('\"scripts\"')) {
          suggestedPath = 'package.json';
        } else if (block.code.includes('\"compilerOptions\"')) {
          suggestedPath = 'tsconfig.json';
        } else {
          suggestedPath = 'config.json';
        }
      } else if (block.language === 'html') {
        suggestedPath = 'index.html';
      } else if (block.language === 'md' || block.language === 'markdown') {
        suggestedPath = 'README.md';
      }
      
      if (suggestedPath && !filesToCreate.some(f => f.path === suggestedPath) && !filesToUpdate.some(f => f.path === suggestedPath)) {
        filesToCreate.push({
          path: suggestedPath,
          content: block.code,
          language: block.language
        });
      }
    });

    // Execute terminal commands if any
    const terminalResults: Array<{ command: string; output: string; success: boolean }> = [];
    for (const terminalCmd of terminalCommands) {
      try {
        const { stdout, stderr } = await execAsync(terminalCmd.command, {
          timeout: 30000, // 30 second timeout
          cwd: process.cwd(),
          env: { ...process.env, NODE_ENV: 'development' }
        });
        
        terminalResults.push({
          command: terminalCmd.command,
          output: stdout || stderr || 'Command executed successfully',
          success: true
        });
      } catch (execError: any) {
        terminalResults.push({
          command: terminalCmd.command,
          output: execError.message || 'Command execution failed',
          success: false
        });
      }
    }

    // Handle file reading requests
    const fileReadResults: Array<{ path: string; content: string; success: boolean; error?: string }> = [];
    for (const filePath of filesToRead) {
      try {
        const { readFile } = await import('fs/promises');
        const { join } = await import('path');
        const { existsSync } = await import('fs');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, filePath);
        
        if (existsSync(fullPath)) {
          const content = await readFile(fullPath, 'utf8');
          fileReadResults.push({
            path: filePath,
            content,
            success: true
          });
        } else {
          fileReadResults.push({
            path: filePath,
            content: '',
            success: false,
            error: 'File not found'
          });
        }
      } catch (error) {
        fileReadResults.push({
          path: filePath,
          content: '',
          success: false,
          error: 'Failed to read file'
        });
      }
    }

    // Handle file update requests
    const fileUpdateResults: Array<{ path: string; success: boolean; error?: string; message?: string }> = [];
    for (const fileUpdate of filesToUpdate) {
      try {
        const { writeFile } = await import('fs/promises');
        const { join } = await import('path');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, fileUpdate.path);
        
        await writeFile(fullPath, fileUpdate.content, 'utf8');
        
        fileUpdateResults.push({
          path: fileUpdate.path,
          success: true,
          message: 'File updated successfully'
        });
      } catch (error) {
        fileUpdateResults.push({
          path: fileUpdate.path,
          success: false,
          error: 'Failed to update file'
        });
      }
    }

    // Handle file deletion requests
    const fileDeletionResults: Array<{ path: string; success: boolean; error?: string; message?: string }> = [];
    for (const filePath of filesToDelete) {
      try {
        const { unlink } = await import('fs/promises');
        const { join } = await import('path');
        const { existsSync } = await import('fs');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, filePath);
        
        if (existsSync(fullPath)) {
          await unlink(fullPath);
          fileDeletionResults.push({
            path: filePath,
            success: true,
            message: 'File deleted successfully'
          });
        } else {
          fileDeletionResults.push({
            path: filePath,
            success: false,
            error: 'File not found'
          });
        }
      } catch (error) {
        fileDeletionResults.push({
          path: filePath,
          success: false,
          error: 'Failed to delete file'
        });
      }
    }

    // Handle folder creation requests
    const folderCreationResults: Array<{ path: string; success: boolean; error?: string; message?: string }> = [];
    for (const folderPath of foldersToCreate) {
      try {
        const { mkdir } = await import('fs/promises');
        const { join } = await import('path');
        
        const projectRoot = process.cwd();
        const fullPath = join(projectRoot, folderPath);
        
        await mkdir(fullPath, { recursive: true });
        
        folderCreationResults.push({
          path: folderPath,
          success: true,
          message: 'Folder created successfully'
        });
      } catch (error) {
        folderCreationResults.push({
          path: folderPath,
          success: false,
          error: 'Failed to create folder'
        });
      }
    }

    return NextResponse.json({
      response,
      codeBlocks,
      filesToCreate,
      filesToUpdate,
      fileReadResults,
      fileUpdateResults,
      fileDeletionResults,
      folderCreationResults,
      terminalResults,
      previewRequests,
      userQuestions,
      model: selectedModel,
    });

  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request. Please try again.' },
      { status: 500 }
    );
  }
}